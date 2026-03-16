import { Router, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../config/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

export const assessmentRouter = Router();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// In-memory cache for live assessments (since it's a local/personal app)
const activeExams = new Map<string, { id: string; q: string; opts: string[]; ans: number; exp: string; category: string }[]>();

const parseAI = (text: string): Record<string, unknown> => {
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
};

assessmentRouter.get('/today', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) { res.status(404).json({ error: 'Not found' }); return; }

    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      system: `You are the Twin AI Assessment Generator.
      The user is aspiring to be a: ${user.targetRole || 'Software Engineer'}.
      Their current skills: ${JSON.stringify(user.skills)}.
      
      Generate a completely unique 5-question multiple choice test evaluating a mix of their core technical requirements.
      You MUST return STRICT JSON:
      {
        "category": "Full Stack Engineering",
        "questions": [
          {
            "id": "q1",
            "q": "What is the primary purpose of a reverse proxy?",
            "opts": ["Caching", "Load Balancing", "Direct DB Access", "Both A and B"],
            "ans": 3,
            "exp": "A reverse proxy sits in front of web servers and provides load balancing, caching, and security."
          }
        ]
      }`,
      messages: [{ role: 'user', content: 'Generate my daily assessment' }]
    }).catch(e => {
      console.warn('AI Assessment failed, using fallback:', e.message);
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            category: "Full Stack Development",
            questions: [
              { id: "q1", q: "Which of the following describes React's reconciliation process?", opts: ["Updating the real DOM directly", "Syncing the virtual DOM with the real DOM", "Clearing the browser cache", "Generating server-side HTML"], ans: 1, exp: "Reconciliation is the process through which React updates the DOM by comparing virtual trees." },
              { id: "q2", q: "What is the complexity of searching for an element in a balanced BST?", opts: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], ans: 2, exp: "A balanced Binary Search Tree allows for logarithmic time complexity for search, insertion, and deletion." },
              { id: "q3", q: "In Node.js, what does the Event Loop handle?", opts: ["Direct disk access", "Asynchronous callbacks", "Compiling JavaScript to C++", "Managing HTTP headers"], ans: 1, exp: "The Event Loop is the heart of Node.js, allowing it to perform non-blocking I/O operations." },
              { id: "q4", q: "What is a primary advantage of using JWT for authentication?", opts: ["They are stateful", "They are always encrypted", "They are stateless and self-contained", "They cannot be decoded"], ans: 2, exp: "JSON Web Tokens are stateless, meaning the server doesn't need to store session data." },
              { id: "q5", q: "Which CSS property is used to create a flexbox layout?", opts: ["flex: row", "layout: flex", "display: flex", "align: center"], ans: 2, exp: "The display: flex property turns an element into a flex container." }
            ]
          }) 
        }] 
      } as any;
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    const payload = parseAI(text) as any;
    
    // Store exact correct answers in server memory mapping to the User ID
    activeExams.set(req.user!.userId, payload.questions.map((q: any) => ({ ...q, category: payload.category })));

    // Send sanitized version to the frontend
    const sanitized = payload.questions.map((q: any) => ({ id: q.id, question: q.q, options: q.opts }));
    
    res.json({ category: payload.category || 'Dynamic Assessment', questions: sanitized, timeLimit: 600 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Assessment generation failed' });
  }
});

assessmentRouter.post('/submit', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { category, answers, timeTaken } = req.body;
  const qs = activeExams.get(req.user!.userId);
  
  if (!qs || qs.length === 0) {
    res.status(400).json({ error: 'No active assessment found. Please start a new test.' });
    return;
  }

  let correct = 0;
  const results = qs.map((q, i) => {
    const userAns = answers[i] ?? -1;
    const ok = userAns === q.ans;
    if (ok) correct++;
    return {
      question: q.q,
      userAnswer: userAns,
      correctAnswer: q.ans,
      correct: ok,
      explanation: q.exp,
    };
  });
  
  const score = Math.round((correct / qs.length) * 100);
  activeExams.delete(req.user!.userId); // Clear memory

  try {
    const feedMsg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      system: `You are the Twin AI Grader. Provide 2 specific improvement tips in 2 short sentences based on their score of ${score}%. Pure text only.`,
      messages: [{ role: 'user', content: `Score: ${score}%. Subject: ${category}.` }],
    }).catch(e => {
      console.warn('AI Grading failed, using fallback:', e.message);
      return { content: [{ type: 'text', text: score >= 70 ? "Great job on the assessment! Focus on advanced patterns next." : "Keep practicing! Review the core concepts and try again tomorrow." }] } as any;
    });
    
    const aiFeedback = feedMsg.content[0].type === 'text' ? feedMsg.content[0].text : '';
    
    await prisma.assessment.create({
      data: {
        userId: req.user!.userId,
        category,
        score,
        timeTaken,
        questions: results,
        aiFeedback,
      },
    });
    
    // Update Readiness
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (user) {
      const newReadiness = Math.min(100, Math.max(0, user.careerReadiness + (score >= 70 ? 2 : -1)));
      await prisma.user.update({ where: { id: req.user!.userId }, data: { careerReadiness: newReadiness } });
    }
    
    res.json({ score, correct, total: qs.length, results, aiFeedback });
  } catch {
    res.status(500).json({ error: 'Submit failed' });
  }
});

assessmentRouter.get('/history', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const history = await prisma.assessment.findMany({
      where: { userId: req.user!.userId },
      orderBy: { takenAt: 'desc' },
      take: 30,
    });
    res.json({ history });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});
