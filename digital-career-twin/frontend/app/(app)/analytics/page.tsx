'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { Loader2, TrendingUp, Activity, Target } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

interface Assessment {
  id: string;
  category: string;
  score: number;
  timeTaken: number;
  takenAt: string;
}

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/api/assessments/history');
        setHistory(data.history || []);
      } catch {
        setError('Failed to load analytics data');
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

  // Compute stats
  const totalTests = history.length;
  const avgScore = totalTests > 0 ? Math.round(history.reduce((a, h) => a + h.score, 0) / totalTests) : 0;
  const avgTime = totalTests > 0 ? Math.round(history.reduce((a, h) => a + h.timeTaken, 0) / totalTests) : 0;

  // Category breakdown
  const categoryMap: Record<string, { total: number; count: number }> = {};
  history.forEach(h => {
    if (!categoryMap[h.category]) categoryMap[h.category] = { total: 0, count: 0 };
    categoryMap[h.category].total += h.score;
    categoryMap[h.category].count += 1;
  });
  const categoryData = Object.entries(categoryMap).map(([name, { total, count }]) => ({
    name: name.length > 15 ? name.slice(0, 15) + '...' : name,
    avg: Math.round(total / count),
    count,
  }));

  // Score trend over time
  const trendData = history.slice().reverse().map((h, i) => ({
    name: `Test ${i + 1}`,
    score: h.score,
    date: new Date(h.takenAt).toLocaleDateString(),
  }));

  // Skills radar from user profile
  const skills = user?.skills as Record<string, number> | undefined;
  const radarData = skills ? Object.entries(skills).map(([key, val]) => ({
    subject: key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase()).slice(0, 12),
    value: (val as number) * 10,
  })) : [];

  // Pie chart for category distribution
  const COLORS = ['#5B4FE8', '#00C896', '#fbbf24', '#f87171', '#a78bfa', '#fb923c'];

  return (
    <div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#E8E8F0', marginBottom: '1.5rem' }}>Performance Analytics</h1>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Assessments', value: totalTests, icon: <Activity size={20} />, color: '#5B4FE8' },
          { label: 'Average Score', value: `${avgScore}%`, icon: <TrendingUp size={20} />, color: '#00C896' },
          { label: 'Avg Time', value: `${Math.floor(avgTime / 60)}m ${avgTime % 60}s`, icon: <Target size={20} />, color: '#fbbf24' },
        ].map((stat, i) => (
          <motion.div key={i} className="glass" style={{ padding: '1.25rem', textAlign: 'center' }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div style={{ color: stat.color, marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#E8E8F0' }}>{stat.value}</div>
            <div style={{ color: '#6B6B85', fontSize: '0.75rem', marginTop: '0.25rem' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {totalTests === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
          <Activity size={40} style={{ color: '#2A2A40', margin: '0 auto 1rem' }} />
          <p style={{ color: '#6B6B85' }}>Take some assessments to see your analytics!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Score Trend */}
          <motion.div className="glass" style={{ padding: '1.5rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="#00C896" /> Score Trend
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <XAxis dataKey="name" stroke="#6B6B85" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B6B85" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', borderColor: '#2A2A40', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Line type="monotone" dataKey="score" stroke="#00C896" strokeWidth={3} dot={{ r: 4, fill: '#00C896', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Performance */}
          <motion.div className="glass" style={{ padding: '1.5rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1rem' }}>Category Performance</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData}>
                <XAxis dataKey="name" stroke="#6B6B85" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B6B85" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', borderColor: '#2A2A40', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="avg" fill="#5B4FE8" radius={[4, 4, 0, 0]}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Skill Radar */}
          {radarData.length > 0 && (
            <motion.div className="glass" style={{ padding: '1.5rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1rem' }}>Skill Profile</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#2A2A40" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B6B85', fontSize: 10 }} />
                  <Radar dataKey="value" stroke="#5B4FE8" fill="#5B4FE8" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Category Distribution */}
          <motion.div className="glass" style={{ padding: '1.5rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1rem' }}>Category Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', borderColor: '#2A2A40', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
