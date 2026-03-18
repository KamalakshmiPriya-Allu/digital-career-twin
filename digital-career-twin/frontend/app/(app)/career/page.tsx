'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Loader2, ChevronRight, Target, Clock, Zap } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface CareerPath {
  role: string;
  matchPercent: number;
  timeToReady: string;
  keySkills: string[];
  nextStep: string;
}

interface SkillGap {
  skill: string;
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
  resource: string;
}

export default function CareerPage() {
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [gaps, setGaps] = useState<SkillGap[]>([]);
  const [topFocus, setTopFocus] = useState('');
  const [loadingPaths, setLoadingPaths] = useState(false);
  const [loadingGaps, setLoadingGaps] = useState(false);
  const [roadmapModal, setRoadmapModal] = useState<CareerPath | null>(null);

  const loadPaths = async () => {
    setLoadingPaths(true);
    try {
      const { data } = await api.post('/api/ai/career-predict');
      setPaths(data.paths || []);
    } catch { toast.error('Career predict failed'); }
    setLoadingPaths(false);
  };

  const loadGaps = async () => {
    setLoadingGaps(true);
    try {
      const { data } = await api.post('/api/ai/skill-gap');
      setGaps(data.gaps || []);
      setTopFocus(data.topFocus || '');
    } catch { toast.error('Skill gap analysis failed'); }
    setLoadingGaps(false);
  };

  const severityColor = { high: '#f87171', medium: '#fbbf24', low: '#34d399' };

  return (
    <div>
      {/* Career Paths */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#E8E8F0' }}>Career Path Predictions</h2>
            <p style={{ color: '#6B6B85', fontSize: '0.85rem', marginTop: '0.25rem' }}>AI-powered analysis of your best career matches</p>
          </div>
          <motion.button onClick={loadPaths} disabled={loadingPaths} whileHover={{ scale: loadingPaths ? 1 : 1.05 }}
            style={{ padding: '0.65rem 1.25rem', background: '#5B4FE8', border: 'none', borderRadius: '10px', color: '#fff', cursor: loadingPaths ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: loadingPaths ? 0.7 : 1 }}>
            {loadingPaths ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={16} />}
            {paths.length ? 'Refresh' : 'Analyze Paths'}
          </motion.button>
        </div>

        {paths.length === 0 && !loadingPaths && (
          <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
            <TrendingUp size={40} style={{ color: '#2A2A40', margin: '0 auto 1rem' }} />
            <p style={{ color: '#6B6B85' }}>Click &quot;Analyze Paths&quot; to get your AI career predictions</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {paths.map((p, i) => (
            <motion.div key={i} className="glass" style={{ padding: '1.5rem' }}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#E8E8F0' }}>{p.role}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <Clock size={14} style={{ color: '#6B6B85' }} />
                    <span style={{ color: '#6B6B85', fontSize: '0.8rem' }}>{p.timeToReady} to be ready</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: p.matchPercent >= 70 ? '#34d399' : p.matchPercent >= 50 ? '#fbbf24' : '#f87171' }}>
                    {p.matchPercent}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#6B6B85' }}>match</div>
                </div>
              </div>
              <div style={{ height: '6px', background: '#2A2A40', borderRadius: '3px', marginBottom: '0.875rem', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${p.matchPercent}%` }} transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                  style={{ height: '100%', background: p.matchPercent >= 70 ? '#34d399' : p.matchPercent >= 50 ? '#fbbf24' : '#f87171', borderRadius: '3px' }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.875rem' }}>
                {p.keySkills.map((s, j) => (
                  <span key={j} style={{ padding: '0.2rem 0.625rem', background: 'rgba(91,79,232,0.15)', border: '1px solid rgba(91,79,232,0.3)', borderRadius: '999px', color: '#7B72FF', fontSize: '0.75rem' }}>{s}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#A0A0B8', fontSize: '0.8rem' }}>Next: {p.nextStep}</p>
                <button onClick={() => setRoadmapModal(p)}
                  style={{ padding: '0.45rem 0.875rem', background: 'rgba(91,79,232,0.2)', border: '1px solid rgba(91,79,232,0.4)', borderRadius: '8px', color: '#7B72FF', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                  Build Roadmap <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Skill Gap Analysis */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#E8E8F0' }}>Skill Gap Analysis</h2>
            <p style={{ color: '#6B6B85', fontSize: '0.85rem', marginTop: '0.25rem' }}>Gaps between your current skills and target role requirements</p>
          </div>
          <motion.button onClick={loadGaps} disabled={loadingGaps} whileHover={{ scale: loadingGaps ? 1 : 1.05 }}
            style={{ padding: '0.65rem 1.25rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '10px', color: '#E8E8F0', cursor: loadingGaps ? 'not-allowed' : 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {loadingGaps ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Target size={16} />}
            Analyze Gaps
          </motion.button>
        </div>

        {gaps.length > 0 && (
          <>
            {topFocus && (
              <div style={{ padding: '1rem 1.25rem', background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.3)', borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Zap size={18} style={{ color: '#00C896', flexShrink: 0 }} />
                <span style={{ color: '#E8E8F0', fontSize: '0.875rem' }}><strong style={{ color: '#00C896' }}>Top Focus:</strong> {topFocus}</span>
              </div>
            )}
            <div className="glass" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2A2A40' }}>
                    {['Skill', 'Severity', 'Suggestion', 'Resource'].map((h) => (
                      <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', color: '#6B6B85', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gaps.map((g, i) => (
                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                      style={{ borderBottom: '1px solid #2A2A40' }}>
                      <td style={{ padding: '0.875rem 1rem', color: '#E8E8F0', fontSize: '0.875rem', fontWeight: 600 }}>{g.skill}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ padding: '0.2rem 0.625rem', background: `${severityColor[g.severity]}20`, border: `1px solid ${severityColor[g.severity]}50`, borderRadius: '999px', color: severityColor[g.severity], fontSize: '0.75rem', fontWeight: 600 }}>
                          {g.severity}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: '#A0A0B8', fontSize: '0.8rem' }}>{g.suggestion}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <a href={`https://google.com/search?q=${encodeURIComponent(g.resource)}`} target="_blank" rel="noreferrer"
                          style={{ color: '#5B4FE8', fontSize: '0.8rem', textDecoration: 'none' }}>{g.resource}</a>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Roadmap Modal */}
      {roadmapModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1.5rem' }}>
          <motion.div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#E8E8F0', marginBottom: '0.5rem' }}>12-Week Roadmap: {roadmapModal.role}</h3>
            <p style={{ color: '#6B6B85', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Your personalized path to becoming a {roadmapModal.role}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {['Weeks 1-2: Foundation & Setup', 'Weeks 3-5: Core Skills Development', 'Weeks 6-8: Advanced Concepts', 'Weeks 9-10: Project Building', 'Weeks 11-12: Portfolio & Interview Prep'].map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#5B4FE8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ color: '#A0A0B8', fontSize: '0.875rem', paddingTop: '2px' }}>{w.replace(/^Weeks \d+-\d+: /, '')}: Focus on{' '}
                    <strong style={{ color: '#E8E8F0' }}>{roadmapModal.keySkills[i % roadmapModal.keySkills.length]}</strong>
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setRoadmapModal(null)} style={{ flex: 1, padding: '0.7rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '10px', color: '#E8E8F0', cursor: 'pointer' }}>Close</button>
              <a href="/calendar" style={{ flex: 1, padding: '0.7rem', background: '#5B4FE8', borderRadius: '10px', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem' }}>Add to Calendar →</a>
            </div>
          </motion.div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
