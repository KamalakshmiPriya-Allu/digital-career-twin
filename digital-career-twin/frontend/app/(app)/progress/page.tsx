'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { TrendingUp, Loader2, BarChart3, Activity } from 'lucide-react';
import api from '@/lib/api';

interface Assessment {
  id: string;
  category: string;
  score: number;
  timeTaken: number;
  takenAt: string;
}

export default function ProgressPage() {
  const [history, setHistory] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/api/assessments/history');
        setHistory(data.history || []);
      } catch {
        setError('Failed to load progress data');
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader2 size={32} style={{ color: '#5B4FE8', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>{error}</div>;
  }

  // Score trend (chronological)
  const sortedHistory = [...history].reverse();
  const scoreTrend = sortedHistory.map((h, i) => ({
    name: new Date(h.takenAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: h.score,
    index: i + 1,
  }));

  // Rolling average
  const rollingAvg = scoreTrend.map((item, i) => {
    const window = scoreTrend.slice(Math.max(0, i - 2), i + 1);
    const avg = Math.round(window.reduce((a, b) => a + b.score, 0) / window.length);
    return { ...item, avg };
  });

  // Category growth over time
  const categoryGrowth: Record<string, { scores: number[]; dates: string[] }> = {};
  sortedHistory.forEach(h => {
    if (!categoryGrowth[h.category]) categoryGrowth[h.category] = { scores: [], dates: [] };
    categoryGrowth[h.category].scores.push(h.score);
    categoryGrowth[h.category].dates.push(new Date(h.takenAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  });

  // Time efficiency trend
  const timeTrend = sortedHistory.map((h, i) => ({
    name: `Test ${i + 1}`,
    time: Math.round(h.timeTaken / 60),
    score: h.score,
  }));

  // Stats
  const totalTests = history.length;
  const latestScore = history.length > 0 ? history[0].score : 0;
  const firstScore = sortedHistory.length > 0 ? sortedHistory[0].score : 0;
  const improvement = latestScore - firstScore;

  return (
    <div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#E8E8F0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <TrendingUp size={24} color="#00C896" /> Progress Tracker
      </h1>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Tests Taken', value: totalTests, color: '#5B4FE8' },
          { label: 'Latest Score', value: `${latestScore}%`, color: '#00C896' },
          { label: 'First Score', value: `${firstScore}%`, color: '#fbbf24' },
          { label: 'Improvement', value: `${improvement >= 0 ? '+' : ''}${improvement}%`, color: improvement >= 0 ? '#34d399' : '#f87171' },
        ].map((stat, i) => (
          <motion.div key={i} className="glass" style={{ padding: '1rem', textAlign: 'center' }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ color: '#6B6B85', fontSize: '0.75rem' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {totalTests === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
          <BarChart3 size={40} style={{ color: '#2A2A40', margin: '0 auto 1rem' }} />
          <p style={{ color: '#6B6B85' }}>Take assessments to track your progress over time!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Score Trend with Rolling Average */}
          <motion.div className="glass" style={{ padding: '1.5rem', gridColumn: 'span 2' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="#00C896" /> Score History
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={rollingAvg}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A40" />
                <XAxis dataKey="name" stroke="#6B6B85" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B6B85" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', borderColor: '#2A2A40', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="score" stroke="#5B4FE8" fill="rgba(91,79,232,0.15)" strokeWidth={2} dot={{ r: 3, fill: '#5B4FE8' }} />
                <Line type="monotone" dataKey="avg" stroke="#00C896" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#6B6B85' }}>
                <div style={{ width: '12px', height: '3px', background: '#5B4FE8', borderRadius: '2px' }} /> Individual Scores
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#6B6B85' }}>
                <div style={{ width: '12px', height: '3px', background: '#00C896', borderRadius: '2px', borderStyle: 'dashed' }} /> Rolling Average
              </div>
            </div>
          </motion.div>

          {/* Time vs Score */}
          <motion.div className="glass" style={{ padding: '1.5rem' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="#fbbf24" /> Time Efficiency
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timeTrend}>
                <XAxis dataKey="name" stroke="#6B6B85" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B6B85" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', borderColor: '#2A2A40', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Line type="monotone" dataKey="time" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3, fill: '#fbbf24' }} name="Time (min)" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div className="glass" style={{ padding: '1.5rem' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1rem' }}>Category Scores</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(categoryGrowth).map(([cat, data], i) => {
                const latest = data.scores[data.scores.length - 1];
                const color = latest >= 70 ? '#34d399' : latest >= 40 ? '#fbbf24' : '#f87171';
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ color: '#A0A0B8', fontSize: '0.8rem' }}>{cat.length > 25 ? cat.slice(0, 25) + '...' : cat}</span>
                      <span style={{ color, fontWeight: 700, fontSize: '0.8rem', fontFamily: 'Syne, sans-serif' }}>{latest}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#2A2A40', borderRadius: '3px', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${latest}%` }} transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                        style={{ height: '100%', background: color, borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
