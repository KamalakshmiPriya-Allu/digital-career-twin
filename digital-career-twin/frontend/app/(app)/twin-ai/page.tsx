'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { BrainCircuit, RefreshCw, Loader2, AlertTriangle, TrendingUp, Zap, PlayCircle } from 'lucide-react';
import api from '@/lib/api';

interface TwinData {
  career_probability: number;
  skill_gaps: string[];
  strengths_weaknesses: { strong: string; weak: string };
  future_prediction: string;
  radar_data: { subject: string; A: number; fullMark: number }[];
  progress_trend: { name: string; score: number }[];
}

interface Video { title: string; channel: string; thumbnail: string; link: string; }

const clampStyle: React.CSSProperties = {
  color: '#A0A0B8', fontSize: '0.65rem', marginTop: '0.3rem',
  overflow: 'hidden', display: '-webkit-box',
  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
};

export default function TwinAIPage() {
  const [twin, setTwin] = useState<TwinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [videos, setVideos] = useState<Record<string, Video[]>>({});

  const fetchTwin = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/ai/twin-analysis');
      setTwin(data);

      // Fetch YouTube videos for skill gaps
      if (data.skill_gaps?.length > 0) {
        const videoData: Record<string, Video[]> = {};
        for (const gap of data.skill_gaps.slice(0, 3)) {
          try {
            const { data: vData } = await api.get(`/api/ai/learning/youtube?topic=${encodeURIComponent(gap + ' tutorial')}`);
            videoData[gap] = vData.videos || [];
          } catch {}
        }
        setVideos(videoData);
      }
    } catch {
      setError('Failed to load Twin AI analysis');
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchTwin(); }, []);

  const probColor = (score: number) => score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171';

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
        <Loader2 size={40} style={{ color: '#5B4FE8', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6B6B85', fontSize: '0.9rem' }}>Generating your Digital Twin analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
        <AlertTriangle size={40} style={{ color: '#f87171', margin: '0 auto 1rem' }} />
        <p style={{ color: '#f87171', marginBottom: '1rem' }}>{error}</p>
        <button onClick={() => fetchTwin()} style={{ padding: '0.5rem 1.25rem', background: '#5B4FE8', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Retry</button>
      </div>
    );
  }

  if (!twin) return null;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BrainCircuit size={24} color="#5B4FE8" /> Twin AI Analysis
          </h1>
          <p style={{ color: '#6B6B85', fontSize: '0.85rem', marginTop: '0.25rem' }}>Your AI-powered career digital twin</p>
        </div>
        <button onClick={() => fetchTwin(true)} disabled={refreshing}
          style={{ padding: '0.65rem 1.25rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '10px', color: '#E8E8F0', cursor: refreshing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> Refresh Analysis
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem' }}>

        {/* Career Probability Gauge */}
        <motion.div className="glass" style={{ gridColumn: 'span 4', padding: '1.5rem', textAlign: 'center' }}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Career Probability</h3>
          <div style={{ position: 'relative', margin: '0 auto', width: '160px', height: '100px' }}>
            <svg width="160" height="100" viewBox="0 0 160 110" style={{ overflow: 'visible' }}>
              <path d="M 20 90 A 60 60 0 0 1 140 90" fill="none" stroke="#2A2A40" strokeWidth="12" strokeLinecap="round" />
              <path d={`M 20 90 A 60 60 0 0 1 ${80 + 60 * Math.cos(((twin.career_probability / 100) * 180 - 90) * (Math.PI / 180))} ${90 + 60 * Math.sin(((twin.career_probability / 100) * 180 - 90) * (Math.PI / 180))}`}
                fill="none" stroke={probColor(twin.career_probability)} strokeWidth="12" strokeLinecap="round" style={{ transition: 'all 1s ease' }} />
              <text x="80" y="95" textAnchor="middle" fontSize="28" fontWeight="800" fill={probColor(twin.career_probability)} fontFamily="Syne, sans-serif">
                {twin.career_probability}%
              </text>
            </svg>
          </div>
          <div style={{ height: '6px', background: '#2A2A40', borderRadius: '3px', marginTop: '1rem', overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${twin.career_probability}%` }} transition={{ duration: 1 }}
              style={{ height: '100%', background: probColor(twin.career_probability), borderRadius: '3px' }} />
          </div>
        </motion.div>

        {/* Future Prediction */}
        <motion.div className="glass" style={{ gridColumn: 'span 8', padding: '1.5rem' }}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="#00C896" /> Future Prediction
          </h3>
          <div style={{ background: 'rgba(91,79,232,0.1)', padding: '1.25rem', borderRadius: '12px', borderLeft: '3px solid #5B4FE8' }}>
            <p style={{ color: '#E8E8F0', fontSize: '1rem', lineHeight: 1.7, fontStyle: 'italic' }}>"{twin.future_prediction}"</p>
          </div>
        </motion.div>

        {/* Strengths & Weaknesses */}
        <motion.div className="glass" style={{ gridColumn: 'span 6', padding: '1.5rem' }}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1rem', fontSize: '0.95rem' }}>Strengths</h3>
          <div style={{ background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.3)', padding: '1.25rem', borderRadius: '10px' }}>
            <div style={{ color: '#00C896', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>✦ Top Strength</div>
            <p style={{ color: '#E8E8F0', fontSize: '0.9rem', lineHeight: 1.6 }}>{twin.strengths_weaknesses?.strong}</p>
          </div>
        </motion.div>

        <motion.div className="glass" style={{ gridColumn: 'span 6', padding: '1.5rem' }}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1rem', fontSize: '0.95rem' }}>Weaknesses</h3>
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', padding: '1.25rem', borderRadius: '10px' }}>
            <div style={{ color: '#f87171', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>⚠ Critical Weakness</div>
            <p style={{ color: '#E8E8F0', fontSize: '0.9rem', lineHeight: 1.6 }}>{twin.strengths_weaknesses?.weak}</p>
          </div>
        </motion.div>

        {/* Skill Radar */}
        <motion.div className="glass" style={{ gridColumn: 'span 5', padding: '1.5rem' }}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1rem', fontSize: '0.95rem' }}>Skill Radar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={twin.radar_data || []}>
              <PolarGrid stroke="#2A2A40" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B6B85', fontSize: 10 }} />
              <Radar dataKey="A" stroke="#5B4FE8" fill="#5B4FE8" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Progress Trend */}
        <motion.div className="glass" style={{ gridColumn: 'span 7', padding: '1.5rem' }}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="#00C896" /> Progress Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={twin.progress_trend || []}>
              <XAxis dataKey="name" stroke="#6B6B85" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#6B6B85" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', borderColor: '#2A2A40', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              <Line type="monotone" dataKey="score" stroke="#00C896" strokeWidth={3} dot={{ r: 4, fill: '#00C896' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Skill Gaps & Improvement Suggestions */}
        <motion.div className="glass" style={{ gridColumn: 'span 12', padding: '1.5rem' }}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} color="#fbbf24" /> Skill Gaps & Improvement Areas
          </h3>

          {/* Risk Analysis Alert */}
          <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={18} style={{ color: '#f87171', flexShrink: 0 }} />
            <div>
              <div style={{ color: '#f87171', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Risk Analysis</div>
              <p style={{ color: '#E8E8F0', fontSize: '0.85rem' }}>
                {twin.skill_gaps?.length > 0 ? `You have ${twin.skill_gaps.length} critical skill gaps: ${twin.skill_gaps.join(', ')}. Focus on these to improve your career probability.` : 'No major skill gaps detected. Keep progressing!'}
              </p>
            </div>
          </div>

          {/* Improvement suggestions with YouTube cards */}
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
            {twin.skill_gaps?.map((gap, i) => (
              <div key={i} style={{ background: '#23233A', borderRadius: '12px', padding: '1.25rem', border: '1px solid #2A2A40' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#5B4FE8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ color: '#E8E8F0', fontWeight: 600, fontSize: '0.95rem' }}>{gap}</span>
                </div>
                <p style={{ color: '#A0A0B8', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  Consider studying {gap.toLowerCase()} fundamentals and practicing with real-world projects.
                </p>

                {/* YouTube Videos for this gap */}
                {videos[gap]?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                    {videos[gap].slice(0, 3).map((v, j) => (
                      <a key={j} href={v.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', flexShrink: 0, width: '140px' }}>
                        <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '16/9', background: '#1A1A2E' }}>
                          <img src={v.thumbnail} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PlayCircle size={24} style={{ color: '#fff', opacity: 0.9 }} />
                          </div>
                        </div>
                        <p style={clampStyle}>{v.title}</p>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
