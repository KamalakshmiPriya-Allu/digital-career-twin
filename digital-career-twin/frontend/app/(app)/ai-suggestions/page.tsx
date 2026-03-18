'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Suggestion {
  type: string;
  message: string;
  action: string;
}

export default function AiSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchSuggestions = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/ai/suggestions');
      setSuggestions(data.suggestions || []);
    } catch {
      setError('Failed to load AI suggestions');
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchSuggestions(); }, []);

  const typeColors: Record<string, { bg: string; text: string; border: string }> = {
    'Skill Gap': { bg: 'rgba(248,113,113,0.1)', text: '#f87171', border: 'rgba(248,113,113,0.3)' },
    'Career Insight': { bg: 'rgba(91,79,232,0.1)', text: '#7B72FF', border: 'rgba(91,79,232,0.3)' },
    'Resume Tip': { bg: 'rgba(0,200,150,0.1)', text: '#00C896', border: 'rgba(0,200,150,0.3)' },
    'Daily Task': { bg: 'rgba(251,191,36,0.1)', text: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
    'Skill Tip': { bg: 'rgba(91,79,232,0.1)', text: '#7B72FF', border: 'rgba(91,79,232,0.3)' },
    'Goal Check': { bg: 'rgba(0,200,150,0.1)', text: '#00C896', border: 'rgba(0,200,150,0.3)' },
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader2 size={32} style={{ color: '#5B4FE8', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#f87171', marginBottom: '1rem' }}>{error}</p>
        <button onClick={() => fetchSuggestions()} style={{ padding: '0.5rem 1rem', background: '#5B4FE8', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lightbulb size={24} style={{ color: '#fbbf24' }} /> AI Suggestions
          </h1>
          <p style={{ color: '#6B6B85', fontSize: '0.85rem', marginTop: '0.25rem' }}>Personalized recommendations based on your profile and assessments</p>
        </div>
        <button onClick={() => fetchSuggestions(true)} disabled={refreshing}
          style={{ background: 'none', border: 'none', cursor: refreshing ? 'not-allowed' : 'pointer', color: '#5B4FE8' }}>
          <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {suggestions.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
          <Lightbulb size={40} style={{ color: '#2A2A40', margin: '0 auto 1rem' }} />
          <p style={{ color: '#6B6B85' }}>No suggestions available yet. Complete an assessment to get personalized recommendations.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {suggestions.map((s, i) => {
            const colors = typeColors[s.type] || { bg: 'rgba(91,79,232,0.1)', text: '#7B72FF', border: 'rgba(91,79,232,0.3)' };
            return (
              <motion.div key={i} className="glass" style={{ padding: '1.5rem', borderLeft: `3px solid ${colors.text}` }}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.text, padding: '0.2rem 0.5rem', background: colors.bg, borderRadius: '999px', border: `1px solid ${colors.border}` }}>{s.type}</span>
                <p style={{ color: '#E8E8F0', fontSize: '0.95rem', marginTop: '0.875rem', lineHeight: 1.6 }}>{s.message}</p>
                <button onClick={() => toast.success(`Action: ${s.action}`)}
                  style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.text, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                  {s.action}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
