'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { RefreshCw, CheckSquare, Square, Flame, Trophy, Target, Lightbulb, BrainCircuit, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

interface Task { title: string; duration: string; skill: string; description: string; }
interface CalendarEvent { id: string; title: string; type: string; date: string; }
interface UpcomingData { events: CalendarEvent[]; isExamSoon: boolean; examInDays: number | null; }

interface TwinData {
  career_probability: number;
  skill_gaps: string[];
  strengths_weaknesses: { strong: string; weak: string; };
  future_prediction: string;
  radar_data: any[];
  progress_trend: any[];
}

interface Suggestion { type: string; message: string; action: string; }

const cardVar = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

function GaugeChart({ score }: { score: number }) {
  const color = score < 40 ? '#f87171' : score < 70 ? '#fbbf24' : '#34d399';
  const angle = (score / 100) * 180;
  const rad = (angle - 90) * (Math.PI / 180);
  const cx = 80, cy = 80, r = 60;
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);
  return (
    <div style={{ position: 'relative', textAlign: 'center' }}>
      <svg width="160" height="100" viewBox="0 0 160 110" style={{ overflow: 'visible' }}>
        <path d={`M 20 90 A 60 60 0 0 1 140 90`} fill="none" stroke="#2A2A40" strokeWidth="12" strokeLinecap="round" />
        <path d={`M 20 90 A 60 60 0 0 1 ${x} ${y}`} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" style={{ transition: 'all 1s ease' }} />
        <circle cx={x} cy={y} r="7" fill={color} />
        <text x="80" y="95" textAnchor="middle" fontSize="22" fontWeight="800" fill={color} fontFamily="Syne, sans-serif">{Math.round(score)}%</text>
        <text x="80" y="110" textAnchor="middle" fontSize="10" fill="#6B6B85">Career Probability</text>
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingData>({ events: [], isExamSoon: false, examInDays: null });
  const [twin, setTwin] = useState<TwinData | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [done, setDone] = useState<Record<number, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('dct_tasks_done') || '{}'); } catch { return {}; }
    }
    return {};
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [taskRes, calRes, twinRes, suggRes] = await Promise.allSettled([
        api.post('/api/ai/suggest'),
        api.get('/api/calendar/upcoming'),
        api.get('/api/ai/twin-analysis'),
        api.get('/api/ai/suggestions')
      ]);
      if (taskRes.status === 'fulfilled') setTasks(taskRes.value.data.tasks || []);
      if (calRes.status === 'fulfilled') setUpcoming(calRes.value.data);
      if (twinRes.status === 'fulfilled') setTwin(twinRes.value.data);
      if (suggRes.status === 'fulfilled') setSuggestions(suggRes.value.data.suggestions || []);
    } catch {}
    setLoading(false);
  };

  const refreshTasks = async () => {
    setRefreshing(true);
    try {
      const { data } = await api.post('/api/ai/suggest');
      setTasks(data.tasks || []);
      setDone({});
      localStorage.removeItem('dct_tasks_done');
      toast.success('New tasks generated!');
    } catch { toast.error('Failed to refresh tasks'); }
    setRefreshing(false);
  };

  const toggleTask = (i: number) => {
    setDone((p) => {
      const n = { ...p, [i]: !p[i] };
      localStorage.setItem('dct_tasks_done', JSON.stringify(n));
      return n;
    });
  };

  useEffect(() => { fetchAll(); }, []);

  const typeColor: Record<string, string> = { exam: '#f87171', assignment: '#fbbf24', holiday: '#34d399', deadline: '#fb923c' };

  return (
    <div>
      {/* Exam Banner */}
      {upcoming.isExamSoon && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'linear-gradient(135deg, rgba(248,113,113,0.2), rgba(251,191,36,0.2))', border: '1px solid rgba(248,113,113,0.4)', borderRadius: '12px', padding: '0.875rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Trophy size={20} style={{ color: '#fbbf24', flexShrink: 0 }} />
          <span style={{ color: '#E8E8F0', fontWeight: 600 }}>⚡ Exam in {upcoming.examInDays} days — Focus Mode ON!</span>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem' }}>
        
        {/* Twin AI: Future Prediction & Readiness */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={cardVar} className="glass" style={{ gridColumn: 'span 4', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BrainCircuit size={20} color="#5B4FE8" />
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0' }}>Twin AI Prediction</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GaugeChart score={twin?.career_probability || 0} />
          </div>
          {twin?.future_prediction ? (
             <div style={{ background: 'rgba(91,79,232,0.1)', padding: '0.875rem', borderRadius: '8px', borderLeft: '3px solid #5B4FE8', color: '#E8E8F0', fontSize: '0.85rem', lineHeight: 1.5 }}>
               "{twin.future_prediction}"
             </div>
          ) : (
             <div style={{ height: '60px', background: '#23233A', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
          )}
        </motion.div>

        {/* AI Suggestions Engine */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVar} className="glass" style={{ gridColumn: 'span 8', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Lightbulb size={20} color="#fbbf24" />
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0' }}>AI Suggestions Engine</div>
          </div>
          {loading ? (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               {[1,2,3].map((i) => <div key={i} style={{ height: '45px', background: '#23233A', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />)}
             </div>
          ) : suggestions.length === 0 ? (
             <div style={{ color: '#6B6B85', textAlign: 'center', padding: '1rem' }}>No new suggestions from AI.</div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              {suggestions.map((s, i) => (
                <div key={i} style={{ background: '#23233A', borderRadius: '10px', padding: '1rem', border: '1px solid #2A2A40', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.type}</span>
                    <p style={{ color: '#E8E8F0', fontSize: '0.85rem', marginTop: '0.25rem', lineHeight: 1.4 }}>{s.message}</p>
                  </div>
                  <button style={{ alignSelf: 'flex-start', padding: '0.4rem 0.75rem', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    {s.action}
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Today's AI Tasks */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVar} className="glass" style={{ gridColumn: 'span 5', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0' }}>Today's AI Tasks</div>
            <button onClick={refreshTasks} disabled={refreshing}
              style={{ background: 'none', border: 'none', cursor: refreshing ? 'not-allowed' : 'pointer', color: '#5B4FE8' }}>
              <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
          {loading ? (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               {[1,2,3].map((i) => <div key={i} style={{ height: '60px', background: '#23233A', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />)}
             </div>
          ) : tasks.length === 0 ? (
             <div style={{ color: '#6B6B85', textAlign: 'center', padding: '1rem' }}>No tasks yet. Click refresh!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tasks.map((t, i) => (
                <div key={i} onClick={() => toggleTask(i)} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: '#23233A', borderRadius: '10px', cursor: 'pointer', opacity: done[i] ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                  {done[i] ? <CheckSquare size={18} style={{ color: '#00C896', flexShrink: 0, marginTop: '2px' }} /> : <Square size={18} style={{ color: '#5B4FE8', flexShrink: 0, marginTop: '2px' }} />}
                  <div>
                    <div style={{ color: '#E8E8F0', fontWeight: 600, fontSize: '0.875rem', textDecoration: done[i] ? 'line-through' : 'none' }}>{t.title}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span style={{ padding: '0.15rem 0.5rem', background: 'rgba(91,79,232,0.2)', borderRadius: '999px', color: '#7B72FF', fontSize: '0.7rem' }}>{t.duration}</span>
                      <span style={{ padding: '0.15rem 0.5rem', background: 'rgba(0,200,150,0.15)', borderRadius: '999px', color: '#00C896', fontSize: '0.7rem' }}>{t.skill}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Twin AI Skill Radar */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={cardVar} className="glass" style={{ gridColumn: 'span 3', padding: '1.5rem' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1rem' }}>Skill Radar</div>
          {!twin ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6B85' }}>Analyzing skills...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={twin.radar_data || []} margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
                <PolarGrid stroke="#2A2A40" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B6B85', fontSize: 10 }} />
                <Radar name="Skills" dataKey="A" stroke="#5B4FE8" fill="#5B4FE8" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Twin AI Progress Trend Graph */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={cardVar} className="glass" style={{ gridColumn: 'span 4', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <TrendingUp size={20} color="#00C896" />
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0' }}>Progress Trend</div>
          </div>
          {!twin ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6B85' }}>Generating trend...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={twin.progress_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#6B6B85" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B6B85" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', borderColor: '#2A2A40', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Line type="monotone" dataKey="score" stroke="#00C896" strokeWidth={3} dot={{ r: 4, fill: '#00C896', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Strengths & Weaknesses */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={cardVar} className="glass" style={{ gridColumn: 'span 8', padding: '1.5rem' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1rem' }}>Deep Analysis</div>
           {twin ? (
             <div style={{ display: 'flex', gap: '1rem' }}>
               <div style={{ flex: 1, background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.3)', padding: '1rem', borderRadius: '10px' }}>
                 <div style={{ color: '#00C896', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Top Strength</div>
                 <div style={{ color: '#E8E8F0', fontSize: '0.9rem', lineHeight: 1.5 }}>{twin.strengths_weaknesses?.strong || 'Take an assessment to uncover your top strengths.'}</div>
               </div>
               <div style={{ flex: 1, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', padding: '1rem', borderRadius: '10px' }}>
                 <div style={{ color: '#f87171', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Critical Weakness</div>
                 <div style={{ color: '#E8E8F0', fontSize: '0.9rem', lineHeight: 1.5 }}>{twin.strengths_weaknesses?.weak || 'Take an assessment to identify areas for growth.'}</div>
               </div>
             </div>
          ) : (
            <div style={{ height: '80px', background: '#23233A', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />
          )}
        </motion.div>

        {/* Upcoming Calendar */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={cardVar} className="glass" style={{ gridColumn: 'span 4', padding: '1.5rem' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1rem' }}>Upcoming Events</div>
          {upcoming.events.length === 0 ? (
            <div style={{ color: '#6B6B85', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No upcoming events this week</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {upcoming.events.map((e) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: typeColor[e.type] || '#6B6B85', flexShrink: 0 }} />
                  <div style={{ flex: 1, color: '#E8E8F0', fontSize: '0.85rem' }}>{e.title}</div>
                  <div style={{ color: '#6B6B85', fontSize: '0.75rem' }}>{new Date(e.date).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
