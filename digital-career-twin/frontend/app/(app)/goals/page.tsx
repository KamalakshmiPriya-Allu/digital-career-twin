'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Trash2, Loader2, CheckCircle, Circle } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  type: 'short' | 'long';
}

export default function GoalsPage() {
  const { user } = useAuthStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState('');
  const [newGoalType, setNewGoalType] = useState<'short' | 'long'>('short');
  const [showInput, setShowInput] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load goals from localStorage (persisted alongside profile)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dct_goals');
      if (saved) {
        setGoals(JSON.parse(saved));
      } else {
        // Initialize from profile interests/career goals
        const initial: Goal[] = [];
        if (user?.targetRole) initial.push({ id: '1', text: `Get hired as ${user.targetRole}`, completed: false, type: 'long' });
        if (user?.targetCompany) initial.push({ id: '2', text: `Apply to ${user.targetCompany}`, completed: false, type: 'long' });
        const interests = user?.interests as string[] | undefined;
        if (interests?.length) {
          interests.forEach((interest, i) => {
            initial.push({ id: `i${i}`, text: `Learn ${interest}`, completed: false, type: 'short' });
          });
        }
        setGoals(initial);
      }
    } catch {}
    setLoading(false);
  }, [user]);

  const persistGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem('dct_goals', JSON.stringify(newGoals));
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    const goal: Goal = { id: Date.now().toString(), text: newGoal.trim(), completed: false, type: newGoalType };
    persistGoals([...goals, goal]);
    setNewGoal('');
    setShowInput(false);
    toast.success('Goal added!');
  };

  const toggleGoal = (id: string) => {
    persistGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const deleteGoal = (id: string) => {
    persistGoals(goals.filter(g => g.id !== id));
    toast.success('Goal removed');
  };

  const shortGoals = goals.filter(g => g.type === 'short');
  const longGoals = goals.filter(g => g.type === 'long');
  const completedCount = goals.filter(g => g.completed).length;
  const progress = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader2 size={32} style={{ color: '#5B4FE8', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const GoalList = ({ title, items, type }: { title: string; items: Goal[]; type: 'short' | 'long' }) => (
    <div className="glass" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', fontSize: '1rem' }}>{title}</h3>
        <span style={{ color: '#6B6B85', fontSize: '0.75rem' }}>{items.filter(g => g.completed).length}/{items.length} done</span>
      </div>
      {items.length === 0 ? (
        <p style={{ color: '#6B6B85', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No {type}-term goals yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <AnimatePresence>
            {items.map(g => (
              <motion.div key={g.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#23233A', borderRadius: '10px', transition: 'opacity 0.2s' }}>
                <button onClick={() => toggleGoal(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                  {g.completed ? <CheckCircle size={20} style={{ color: '#00C896' }} /> : <Circle size={20} style={{ color: '#2A2A40' }} />}
                </button>
                <span style={{ flex: 1, color: g.completed ? '#6B6B85' : '#E8E8F0', fontSize: '0.9rem', textDecoration: g.completed ? 'line-through' : 'none', transition: 'all 0.2s' }}>{g.text}</span>
                <button onClick={() => deleteGoal(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2A2A40', padding: '0.2rem' }}
                  onMouseOver={e => (e.currentTarget.style.color = '#f87171')} onMouseOut={e => (e.currentTarget.style.color = '#2A2A40')}>
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={24} color="#5B4FE8" /> Goals & Milestones
          </h1>
          <p style={{ color: '#6B6B85', fontSize: '0.85rem', marginTop: '0.25rem' }}>Track your career objectives</p>
        </div>
        <motion.button onClick={() => setShowInput(!showInput)} whileHover={{ scale: 1.05 }}
          style={{ padding: '0.65rem 1.25rem', background: '#5B4FE8', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 0 20px rgba(91,79,232,0.35)' }}>
          <Plus size={16} /> Add Goal
        </motion.button>
      </div>

      {/* Progress Bar */}
      <div className="glass" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#E8E8F0', fontWeight: 600, fontSize: '0.9rem' }}>Overall Progress</span>
          <span style={{ color: '#00C896', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>{progress}%</span>
        </div>
        <div style={{ height: '8px', background: '#2A2A40', borderRadius: '4px', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #5B4FE8, #00C896)', borderRadius: '4px' }} />
        </div>
        <span style={{ color: '#6B6B85', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{completedCount} of {goals.length} goals completed</span>
      </div>

      {/* Add Goal Input */}
      <AnimatePresence>
        {showInput && (
          <motion.div className="glass" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input value={newGoal} onChange={e => setNewGoal(e.target.value)} placeholder="Enter your goal..."
                onKeyDown={e => e.key === 'Enter' && addGoal()}
                style={{ flex: 1, padding: '0.65rem 1rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '8px', color: '#E8E8F0', fontSize: '0.875rem', outline: 'none' }} />
              <select value={newGoalType} onChange={e => setNewGoalType(e.target.value as 'short' | 'long')}
                style={{ padding: '0.65rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '8px', color: '#E8E8F0', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}>
                <option value="short">Short Term</option>
                <option value="long">Long Term</option>
              </select>
              <button onClick={addGoal} style={{ padding: '0.65rem 1.25rem', background: '#5B4FE8', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Add</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <GoalList title="Short Term Goals" items={shortGoals} type="short" />
        <GoalList title="Long Term Goals" items={longGoals} type="long" />
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
