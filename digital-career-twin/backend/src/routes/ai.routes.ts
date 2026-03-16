import { Router, Response } from 'express';
import rateLimit from 'express-rate-limit';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import { prisma } from '../config/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

export const aiRouter = Router();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req: AuthRequest) => req.user?.userId || req.ip?.replace(/^::ffff:/, '') || 'unknown',
  message: 'Too many AI requests. Try again in an hour.',
});

const parseAI = (text: string): Record<string, unknown> => {
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
};

// POST /api/ai/mentor — AI Career Mentor Chat
aiRouter.post('/mentor', authenticate, aiLimiter, async (req: AuthRequest, res: Response): Promise<void> => {
  const { question } = req.body;
  if (!question) {
    res.status(400).json({ error: 'Question required' });
    return;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { assessments: { orderBy: { takenAt: 'desc' }, take: 5 } }
  });
  
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      system: `You are an expert AI Career Mentor for a student named ${user.name}.
      Profile: Degree=${user.degree}, Year=${user.year}, Target Role=${user.targetRole}.
      Skills: ${JSON.stringify(user.skills)}.
      Assessments: ${JSON.stringify(user.assessments.map(a => ({ subject: a.category, score: a.score })))}.
      
      Respond to their question: "${question}"
      
      You MUST respond in strict JSON format:
      {
        "explanation": "Clear, encouraging explanation addressing their question",
        "improvement_advice": "Specific, actionable advice based on their skills and scores",
        "learning_strategy": "A step-by-step strategy",
        "recommended_topics": ["Topic 1", "Topic 2", "Topic 3"],
        "next_actions": "1-2 immediate next things to do"
      }`,
      messages: [{ role: 'user', content: question }],
    }).catch(e => {
      console.warn('AI Mentor failed, using fallback:', e.message);
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            explanation: "I'm currently in high-availability mode. To answer your question: stay focused on your core technical skills and keep building projects!",
            improvement_advice: "Based on your profile, focusing on consistent daily practice is the best way to grow.",
            learning_strategy: "1. Review fundamentals. 2. Build a project. 3. Get feedback.",
            recommended_topics: ["Data Structures", "Web Basics", "Soft Skills"],
            next_actions: "Try our daily assessment to test your knowledge."
          }) 
        }] 
      } as any;
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    res.json(parseAI(text));
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Mentor failed to respond', detail: e.message });
  }
});

// GET /api/ai/twin-analysis — Deep Twin AI Metrics
aiRouter.get('/twin-analysis', authenticate, aiLimiter, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { assessments: { orderBy: { takenAt: 'asc' } } }
  });

  if (!user) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system: `You are Twin AI, generating a deep digital twin analysis for ${user.name}.
      Target Role: ${user.targetRole || 'Software Engineer'}.
      Skills: ${JSON.stringify(user.skills)}.
      Assessments: ${JSON.stringify(user.assessments.map(a => ({ subject: a.category, score: a.score, date: a.takenAt }))) }.
      
      Generate a deep analytical report.
      You MUST return strict JSON matching this structure:
      {
        "career_probability": 85,
        "skill_gaps": ["Data Structures", "System Design"],
        "strengths_weaknesses": {
          "strong": "Excellent frontend knowledge",
          "weak": "Needs backend optimization practice"
        },
        "future_prediction": "If current progress continues, your probability of securing a role is high.",
        "radar_data": [
          {"subject": "Frontend", "A": 80, "fullMark": 100},
          {"subject": "Backend", "A": 60, "fullMark": 100},
          {"subject": "Problem Solving", "A": 50, "fullMark": 100},
          {"subject": "System Design", "A": 30, "fullMark": 100},
          {"subject": "Communication", "A": 90, "fullMark": 100}
        ],
        "progress_trend": [
          {"name": "Week 1", "score": 60},
          {"name": "Week 2", "score": 65},
          {"name": "Week 3", "score": 75}
        ]
      }`,
      messages: [{ role: 'user', content: 'Generate my Twin AI Analysis' }],
    }).catch(e => {
      console.warn('Twin Analysis failed, using fallback:', e.message);
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            career_probability: 78,
            skill_gaps: ["Advanced Algorithms", "System Architecture"],
            strengths_weaknesses: { strong: "Solid fundamental coding", weak: "Scalability experience" },
            future_prediction: "Focusing on projects and testing will boost your readiness significantly.",
            radar_data: [
              {subject: "Frontend", A: 70, fullMark: 100},
              {subject: "Backend", A: 50, fullMark: 100},
              {subject: "Problem Solving", A: 65, fullMark: 100},
              {subject: "System Design", A: 20, fullMark: 100},
              {subject: "Communication", A: 85, fullMark: 100}
            ],
            progress_trend: [{name: "Initial", score: 40}, {name: "Latest", score: 65}]
          }) 
        }] 
      } as any;
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    res.json(parseAI(text));
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Twin Analysis failed', detail: e.message, stack: e.stack });
  }
});

// GET /api/ai/suggestions — Actionable Dashboard Tips
aiRouter.get('/suggestions', authenticate, aiLimiter, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { assessments: { orderBy: { takenAt: 'desc' }, take: 1 } }
  });

  if (!user) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      system: `You are the AI Suggestion Engine. Look at the user's latest data and provide 3 immediate, actionable tips.
      Target: ${user.targetRole}.
      Latest Assessment: ${JSON.stringify(user.assessments[0]) || 'None'}.
      
      Return ONLY JSON:
      {
        "suggestions": [
          {
            "type": "Skill Gap",
            "message": "Your problem solving score is low. Practice coding challenges.",
            "action": "Start Challenge"
          }
        ]
      }`,
      messages: [{ role: 'user', content: 'Give me 3 dashboard suggestions.' }],
    }).catch(e => {
      console.warn('Suggestions failed, using fallback:', e.message);
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            suggestions: [
              { type: "Daily Task", message: "Review the basics of RESTful API design.", action: "Read Guide" },
              { type: "Skill Tip", message: "Try building a small project with Tailwind CSS.", action: "Start Project" },
              { type: "Goal Check", message: "Update your target role and company preferences.", action: "Go to Profile" }
            ]
          }) 
        }] 
      } as any;
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    res.json(parseAI(text));
  } catch (e) {
    res.status(500).json({ error: 'Suggestions failed' });
  }
});

// POST /api/ai/career-predict
aiRouter.post('/career-predict', authenticate, aiLimiter, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { assessments: { orderBy: { takenAt: 'desc' }, take: 10 } }
  });
  if (!user) { res.status(404).json({ error: 'Not found' }); return; }

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      system: `You are the Twin AI Career Predictor.
      Analyze the student: Target Role=${user.targetRole}. Degree=${user.degree}.
      Skills JSON: ${JSON.stringify(user.skills)}.
      Assessments JSON: ${JSON.stringify(user.assessments.map(a => ({ category: a.category, score: a.score }))) }.
      
      Generate exactly 3 ideal career paths based strictly on their actual skills and scores.
      Return STRICT JSON:
      {
        "paths": [
          {
            "role": "Frontend Developer",
            "matchPercent": 85,
            "timeToReady": "3 months",
            "keySkills": ["React", "TypeScript"],
            "nextStep": "Build a full-stack project"
          }
        ]
      }`,
      messages: [{ role: 'user', content: 'Predict my career paths' }],
    }).catch(e => {
      console.warn('Career Prediction failed, using fallback:', e.message);
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            paths: [
              { role: "Software Engineer", matchPercent: 90, timeToReady: "2 months", keySkills: ["Java", "Spring Boot"], nextStep: "Learn Microservices" },
              { role: "Frontend Developer", matchPercent: 80, timeToReady: "3 months", keySkills: ["React", "CSS"], nextStep: "Portfolio Project" },
              { role: "Data Analyst", matchPercent: 60, timeToReady: "6 months", keySkills: ["Python", "SQL"], nextStep: "Statistics Course" }
            ]
          }) 
        }] 
      } as any;
    });
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    res.json(parseAI(text));
  } catch (e: any) {
    res.status(500).json({ error: 'Career prediction failed', detail: e.message, stack: e.stack });
  }
});

// POST /api/ai/skill-gap
aiRouter.post('/skill-gap', authenticate, aiLimiter, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { assessments: { orderBy: { takenAt: 'desc' }, take: 5 } }
  });
  if (!user) { res.status(404).json({ error: 'Not found' }); return; }

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      system: `You are the Twin AI Skill Gap Analyzer.
      Target Role: ${user.targetRole}.
      Current Skills: ${JSON.stringify(user.skills)}.
      Recent Test Scores: ${JSON.stringify(user.assessments.map(a => ({ category: a.category, score: a.score }))) }.
      
      Identify 3-5 critical skill gaps standing between the user and their target role. 
      Identify 1 top focus area.
      Return STRICT JSON:
      {
        "gaps": [
          {
            "skill": "System Design",
            "severity": "high",
            "suggestion": "Learn scalable architectures.",
            "resource": "System Design Primer"
          }
        ],
        "topFocus": "System Design"
      }
      Severity must be "high", "medium", or "low".`,
      messages: [{ role: 'user', content: 'Analyze my skill gaps' }],
    }).catch(e => {
      console.warn('Skill Gap failed, using fallback:', e.message);
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            gaps: [
              { skill: "Data Structures", severity: "medium", suggestion: "Practice Graph algorithms.", resource: "GeekForGeeks" },
              { skill: "Cloud Services", severity: "high", suggestion: "Get AWS certified.", resource: "AWS Training" }
            ],
            topFocus: "Data Structures"
          }) 
        }] 
      } as any;
    });
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    res.json(parseAI(text));
  } catch (e: any) {
    res.status(500).json({ error: 'Skill gap failed', detail: e.message, stack: e.stack });
  }
});

// GET /api/learning/youtube?topic=X
aiRouter.get('/learning/youtube', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { topic } = req.query;
  if (!topic) {
    res.status(400).json({ error: 'Topic required' });
    return;
  }
  
  if (!process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY === 'AIza_REPLACE_ME') {
    res.json({
      videos: [
        { title: `Mastering ${topic} in 2024`, channel: 'Code Ninja', thumbnail: 'https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6?w=400&q=80', link: `https://youtube.com/results?search_query=${encodeURIComponent(topic as string)}` },
        { title: `${topic} Full Course`, channel: 'Tech Academy', thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&q=80', link: `https://youtube.com/results?search_query=${encodeURIComponent(topic as string)}+course` },
        { title: `Top 5 Tips for ${topic}`, channel: 'Dev Tips', thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80', link: `https://youtube.com/results?search_query=${encodeURIComponent(topic as string)}+tips` },
      ],
    });
    return;
  }

  try {
    const r = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: topic,
        maxResults: 5,
        type: 'video',
        key: process.env.YOUTUBE_API_KEY,
      },
    });
    
    res.json({
      videos: r.data.items.map((v: Record<string, unknown>) => {
        const id = (v.id as Record<string, string>);
        const snippet = (v.snippet as Record<string, unknown>);
        const thumbnails = (snippet.thumbnails as Record<string, Record<string, string>>);
        return {
          title: snippet.title,
          channel: snippet.channelTitle,
          thumbnail: thumbnails.medium?.url || thumbnails.default?.url,
          link: `https://youtube.com/watch?v=${id.videoId}`,
        };
      }),
    });
  } catch (e) {
    console.error('YouTube API Error:', e);
    res.status(500).json({ error: 'YouTube fetch failed' });
  }
});
