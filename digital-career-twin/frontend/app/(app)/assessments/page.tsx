'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Loader2, Trophy, Clock, ChevronDown, ChevronUp, Play } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Assessment {
  id: string;
  category: string;
  score: number;
  timeTaken: number;
  aiFeedback: string | null;
  takenAt: string;
  questions: { question: string; correct: boolean }[];
}

export default function AssessmentsPage() {
  const [history, setHistory] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/api/assessments/history');
        setHistory(data.history || []);
      } catch {
        setError('Failed to load assessment history');
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
    return (
      <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>
        <p>{error}</p>
      </div>
    );
  }

  const avgScore = history.length > 0 ? Math.round(history.reduce((a, h) => a + h.score, 0) / history.length) : 0;
  const bestScore = history.length > 0 ? Math.max(...history.map(h => h.score)) : 0;
  const totalTests = history.length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#E8E8F0' }}>Assessment History</h1>
          <p style={{ color: '#6B6B85', fontSize: '0.85rem', marginTop: '0.25rem' }}>Track your progress across all skill tests</p>
        </div>
        <Link href="/assess">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{ padding: '0.7rem 1.5rem', background: '#5B4FE8', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 0 20px rgba(91,79,232,0.35)' }}>
            <Play size={16} /> Take New Test
          </motion.button>
        </Link>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Assessments', value: totalTests, icon: <BarChart3 size={20} />, color: '#5B4FE8' },
          { label: 'Average Score', value: `${avgScore}%`, icon: <Trophy size={20} />, color: '#00C896' },
          { label: 'Best Score', value: `${bestScore}%`, icon: <Trophy size={20} />, color: '#fbbf24' },
        ].map((stat, i) => (
          <motion.div key={i} className="glass" style={{ padding: '1.25rem', textAlign: 'center' }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div style={{ color: stat.color, marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#E8E8F0' }}>{stat.value}</div>
            <div style={{ color: '#6B6B85', fontSize: '0.75rem', marginTop: '0.25rem' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
          <BarChart3 size={40} style={{ color: '#2A2A40', margin: '0 auto 1rem' }} />
          <p style={{ color: '#6B6B85', marginBottom: '1rem' }}>No assessments taken yet</p>
          <Link href="/assess" style={{ padding: '0.5rem 1.25rem', background: '#5B4FE8', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
            Start Your First Test
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {history.map((h, i) => {
            const scoreColor = h.score >= 70 ? '#34d399' : h.score >= 40 ? '#fbbf24' : '#f87171';
            return (
              <motion.div key={h.id} className="glass" style={{ overflow: 'hidden' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <button onClick={() => setExpanded(p => ({ ...p, [i]: !p[i] }))}
                  style={{ width: '100%', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${scoreColor}15`, border: `1px solid ${scoreColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: scoreColor, fontSize: '1rem' }}>{h.score}%</span>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ color: '#E8E8F0', fontWeight: 600, fontSize: '0.95rem' }}>{h.category}</div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                        <span style={{ color: '#6B6B85', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {Math.floor(h.timeTaken / 60)}m {h.timeTaken % 60}s
                        </span>
                        <span style={{ color: '#6B6B85', fontSize: '0.75rem' }}>
                          {new Date(h.takenAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {expanded[i] ? <ChevronUp size={16} style={{ color: '#6B6B85' }} /> : <ChevronDown size={16} style={{ color: '#6B6B85' }} />}
                </button>
                <AnimatePresence>
                  {expanded[i] && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #2A2A40' }}>
                        {h.aiFeedback && (
                          <div style={{ margin: '0.875rem 0', padding: '0.875rem', background: 'rgba(91,79,232,0.1)', border: '1px solid rgba(91,79,232,0.3)', borderRadius: '8px' }}>
                            <div style={{ color: '#7B72FF', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.25rem' }}>AI Feedback</div>
                            <div style={{ color: '#E8E8F0', fontSize: '0.85rem', lineHeight: 1.5 }}>{h.aiFeedback}</div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
