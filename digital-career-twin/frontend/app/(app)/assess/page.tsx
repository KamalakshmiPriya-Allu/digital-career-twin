'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Clock, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Question { id: string; question: string; options: string[]; }
interface Result { question: string; userAnswer: number; correctAnswer: number; correct: boolean; explanation: string; }

type State = 'idle' | 'taking' | 'results';

export default function AssessPage() {
  const [state, setState] = useState<State>('idle');
  const [category, setCategory] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLimit, setTimeLimit] = useState(600);
  const [timeLeft, setTimeLeft] = useState(600);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [score, setScore] = useState(0);
  const [aiFeedback, setAiFeedback] = useState('');
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(0);

  const submit = useCallback(async (ans: number[]) => {
    setSubmitting(true);
    const timeTaken = timeLimit - timeLeft;
    try {
      const { data } = await api.post('/api/assessments/submit', { category, answers: ans, timeTaken });
      setResults(data.results);
      setScore(data.score);
      setAiFeedback(data.aiFeedback);
      setState('results');
    } catch { toast.error('Failed to submit'); }
    setSubmitting(false);
  }, [category, timeLimit, timeLeft]);

  useEffect(() => {
    if (state !== 'taking') return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          submit([...answers, ...Array(questions.length - answers.length).fill(-1)]);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state, submit, answers, questions.length]);

  const startTest = async () => {
    try {
      const { data } = await api.get('/api/assessments/today');
      setCategory(data.category);
      setQuestions(data.questions);
      setTimeLimit(data.timeLimit);
      setTimeLeft(data.timeLimit);
      setAnswers([]);
      setSelected(null);
      setCurrentQ(0);
      setStartTime(Date.now());
      setState('taking');
    } catch { toast.error('Failed to load assessment'); }
  };

  const handleNext = () => {
    const newAnswers = [...answers, selected ?? -1];
    setAnswers(newAnswers);
    setSelected(null);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      submit(newAnswers);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const timeCritical = timeLeft < 60;
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
  void startTime;

  if (state === 'idle') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <motion.div className="glass" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧠</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#E8E8F0', marginBottom: '0.5rem' }}>Daily Assessment</h2>
          <p style={{ color: '#6B6B85', marginBottom: '1.5rem' }}>Test your skills with today&apos;s 5 questions. Results update your skill profile.</p>
          <motion.button onClick={startTest} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{ padding: '0.875rem 2rem', background: '#5B4FE8', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 0 24px rgba(91,79,232,0.4)' }}>
            Start Today&apos;s Test
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (state === 'taking') {
    const progress = ((currentQ) / questions.length) * 100;
    const q = questions[currentQ];
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Progress bar */}
        <div style={{ height: '4px', background: '#2A2A40', borderRadius: '2px', marginBottom: '1.5rem', overflow: 'hidden' }}>
          <motion.div animate={{ width: `${progress}%` }} style={{ height: '100%', background: '#5B4FE8', borderRadius: '2px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.85rem' }}>
          <span style={{ color: '#A0A0B8' }}>{categoryLabel} · Q{currentQ + 1}/{questions.length}</span>
          <span style={{ color: timeCritical ? '#f87171' : '#A0A0B8', fontWeight: timeCritical ? 700 : 400, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={14} />{formatTime(timeLeft)}
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#E8E8F0', marginBottom: '1.5rem', lineHeight: 1.5 }}>{q.question}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {q.options.map((opt, i) => (
                <motion.button key={i} onClick={() => setSelected(i)} whileHover={{ scale: 1.01 }}
                  style={{
                    padding: '0.875rem 1rem', textAlign: 'left', border: `2px solid ${selected === i ? '#5B4FE8' : '#2A2A40'}`,
                    borderRadius: '10px', background: selected === i ? 'rgba(91,79,232,0.2)' : '#23233A',
                    color: selected === i ? '#E8E8F0' : '#A0A0B8', cursor: 'pointer', fontSize: '0.925rem', transition: 'all 0.15s',
                  }}>
                  <span style={{ color: '#5B4FE8', fontWeight: 700, marginRight: '0.5rem' }}>{String.fromCharCode(65 + i)}.</span>{opt}
                </motion.button>
              ))}
            </div>
            <motion.button onClick={handleNext} disabled={selected === null || submitting} whileHover={{ scale: selected !== null ? 1.02 : 1 }}
              style={{ marginTop: '1.5rem', width: '100%', padding: '0.875rem', background: selected !== null ? '#5B4FE8' : '#2A2A40', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: selected !== null ? 'pointer' : 'not-allowed', fontSize: '0.95rem', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Submitting...' : currentQ < questions.length - 1 ? 'Next Question →' : 'Submit Test'}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Results
  const scoreColor = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171';
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <motion.div className="glass" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
          style={{ width: '100px', height: '100px', borderRadius: '50%', border: `4px solid ${scoreColor}`, background: `rgba(${score >= 70 ? '52,211,153' : score >= 40 ? '251,191,36' : '248,113,113'},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', flexDirection: 'column' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: scoreColor, fontFamily: 'Syne, sans-serif' }}>{score}%</span>
        </motion.div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#E8E8F0' }}>
          {score >= 70 ? '🎉 Great Job!' : score >= 40 ? '📈 Keep Going!' : '💪 Room to Grow'}
        </h2>
        {aiFeedback && (
          <div style={{ margin: '1rem 0', padding: '1rem', background: 'rgba(91,79,232,0.1)', border: '1px solid rgba(91,79,232,0.3)', borderRadius: '10px', color: '#A0A0B8', fontSize: '0.875rem', textAlign: 'left', lineHeight: 1.6 }}>
            <div style={{ color: '#7B72FF', fontWeight: 600, marginBottom: '0.4rem' }}>AI Feedback</div>
            {aiFeedback}
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.25rem' }}>
          <button onClick={() => { setState('idle'); setResults([]); }} style={{ padding: '0.65rem 1.25rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '10px', color: '#E8E8F0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
            <RotateCcw size={15} /> Retake
          </button>
          <Link href="/dashboard" style={{ padding: '0.65rem 1.25rem', background: '#5B4FE8', borderRadius: '10px', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600 }}>
            <Home size={15} /> Dashboard
          </Link>
        </div>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {results.map((r, i) => (
          <motion.div key={i} className="glass" style={{ padding: 0, overflow: 'hidden' }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <button onClick={() => setExpanded((p) => ({ ...p, [i]: !p[i] }))}
              style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              {r.correct ? <CheckCircle size={18} style={{ color: '#34d399', flexShrink: 0 }} /> : <XCircle size={18} style={{ color: '#f87171', flexShrink: 0 }} />}
              <span style={{ flex: 1, color: '#E8E8F0', fontSize: '0.875rem' }}>{r.question}</span>
              {expanded[i] ? <ChevronUp size={16} style={{ color: '#6B6B85' }} /> : <ChevronDown size={16} style={{ color: '#6B6B85' }} />}
            </button>
            <AnimatePresence>
              {expanded[i] && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '0 1rem 1rem', color: '#A0A0B8', fontSize: '0.8rem', borderTop: '1px solid #2A2A40' }}>
                    <p style={{ color: '#6B6B85', paddingTop: '0.75rem' }}>{r.explanation}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
