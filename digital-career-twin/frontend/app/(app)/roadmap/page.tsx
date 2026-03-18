'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Loader2, RefreshCw, ChevronRight, BookOpen, Code, Brain, MessageSquare, Briefcase } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface RoadmapStep {
  week: string;
  title: string;
  description: string;
  skills: string[];
  status: 'completed' | 'current' | 'upcoming';
}

interface CareerPath {
  role: string;
  matchPercent: number;
  timeToReady: string;
  keySkills: string[];
  nextStep: string;
}

const STEP_ICONS = [BookOpen, Code, Brain, MessageSquare, Briefcase];

export default function RoadmapPage() {
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPaths, setLoadingPaths] = useState(false);

  const loadPaths = async () => {
    setLoadingPaths(true);
    try {
      const { data } = await api.post('/api/ai/career-predict');
      setPaths(data.paths || []);
      if (data.paths?.length > 0) {
        generateRoadmap(data.paths[0]);
      }
    } catch {
      toast.error('Failed to load career paths');
    }
    setLoadingPaths(false);
  };

  const generateRoadmap = (path: CareerPath) => {
    setSelectedPath(path);
    setLoading(true);

    // Generate structured roadmap based on career path
    const roadmap: RoadmapStep[] = [
      {
        week: 'Weeks 1-2',
        title: 'Foundation & Assessment',
        description: `Assess your current skill level for ${path.role}. Complete daily assessments and identify core gaps.`,
        skills: [path.keySkills[0] || 'Fundamentals'],
        status: 'current',
      },
      {
        week: 'Weeks 3-4',
        title: 'Core Skills Development',
        description: `Deep dive into the core technical skills required. Build small projects to reinforce learning.`,
        skills: path.keySkills.slice(0, 2),
        status: 'upcoming',
      },
      {
        week: 'Weeks 5-6',
        title: 'Advanced Concepts',
        description: `Master advanced topics and design patterns relevant to ${path.role}.`,
        skills: path.keySkills.slice(1, 3),
        status: 'upcoming',
      },
      {
        week: 'Weeks 7-8',
        title: 'Project Building',
        description: `Build a portfolio-worthy project demonstrating your ${path.role} capabilities.`,
        skills: ['Project Management', ...path.keySkills.slice(0, 2)],
        status: 'upcoming',
      },
      {
        week: 'Weeks 9-10',
        title: 'Interview Preparation',
        description: `Practice technical interviews, system design rounds, and behavioral questions for ${path.role} positions.`,
        skills: ['Interview Skills', 'Problem Solving'],
        status: 'upcoming',
      },
      {
        week: 'Weeks 11-12',
        title: 'Application & Networking',
        description: `${path.nextStep}. Apply to companies and leverage your network.`,
        skills: ['Networking', 'Resume Polish'],
        status: 'upcoming',
      },
    ];

    setTimeout(() => {
      setSteps(roadmap);
      setLoading(false);
    }, 500);
  };

  const statusColors = {
    completed: { bg: 'rgba(0,200,150,0.15)', border: '#00C896', dot: '#00C896' },
    current: { bg: 'rgba(91,79,232,0.15)', border: '#5B4FE8', dot: '#5B4FE8' },
    upcoming: { bg: 'rgba(42,42,64,0.5)', border: '#2A2A40', dot: '#6B6B85' },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Map size={24} color="#5B4FE8" /> AI Career Roadmap
          </h1>
          <p style={{ color: '#6B6B85', fontSize: '0.85rem', marginTop: '0.25rem' }}>Your personalized path to career success</p>
        </div>
        <motion.button onClick={loadPaths} disabled={loadingPaths} whileHover={{ scale: 1.05 }}
          style={{ padding: '0.65rem 1.25rem', background: '#5B4FE8', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: loadingPaths ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: loadingPaths ? 0.7 : 1, boxShadow: '0 0 20px rgba(91,79,232,0.35)' }}>
          {loadingPaths ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={16} />}
          {steps.length ? 'Regenerate' : 'Generate Roadmap'}
        </motion.button>
      </div>

      {/* Career Path Selector */}
      {paths.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
          {paths.map((p, i) => (
            <button key={i} onClick={() => generateRoadmap(p)}
              style={{ padding: '0.75rem 1.25rem', borderRadius: '10px', border: `1px solid ${selectedPath?.role === p.role ? '#5B4FE8' : '#2A2A40'}`, background: selectedPath?.role === p.role ? 'rgba(91,79,232,0.2)' : '#23233A', color: selectedPath?.role === p.role ? '#E8E8F0' : '#6B6B85', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {p.role}
              <span style={{ padding: '0.1rem 0.4rem', borderRadius: '999px', background: `${p.matchPercent >= 70 ? '#34d399' : '#fbbf24'}15`, color: p.matchPercent >= 70 ? '#34d399' : '#fbbf24', fontSize: '0.7rem', fontWeight: 700 }}>{p.matchPercent}%</span>
            </button>
          ))}
        </div>
      )}

      {/* Roadmap Timeline */}
      {steps.length === 0 && !loading ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
          <Map size={40} style={{ color: '#2A2A40', margin: '0 auto 1rem' }} />
          <p style={{ color: '#6B6B85' }}>Click "Generate Roadmap" to get your AI-powered career path</p>
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <Loader2 size={32} style={{ color: '#5B4FE8', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
          {/* Timeline line */}
          <div style={{ position: 'absolute', left: '15px', top: '20px', bottom: '20px', width: '2px', background: 'linear-gradient(180deg, #5B4FE8, #00C896, #2A2A40)' }} />

          {steps.map((step, i) => {
            const colors = statusColors[step.status];
            const Icon = STEP_ICONS[i % STEP_ICONS.length];
            return (
              <motion.div key={i} style={{ position: 'relative', marginBottom: '1.5rem' }}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}>
                {/* Dot */}
                <div style={{ position: 'absolute', left: '-22px', top: '1.5rem', width: '16px', height: '16px', borderRadius: '50%', background: colors.dot, border: `3px solid #1A1A2E`, zIndex: 1 }} />

                <div className="glass" style={{ padding: '1.5rem', borderLeft: `3px solid ${colors.border}`, background: colors.bg }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.dot, padding: '0.15rem 0.5rem', background: `${colors.dot}20`, borderRadius: '999px' }}>{step.week}</span>
                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', fontSize: '1.1rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Icon size={18} style={{ color: colors.dot }} /> {step.title}
                      </h3>
                    </div>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '999px', background: `${colors.dot}20`, color: colors.dot, fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize' }}>{step.status}</span>
                  </div>
                  <p style={{ color: '#A0A0B8', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>{step.description}</p>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {step.skills.map((s, j) => (
                      <span key={j} style={{ padding: '0.2rem 0.625rem', background: 'rgba(91,79,232,0.15)', border: '1px solid rgba(91,79,232,0.3)', borderRadius: '999px', color: '#7B72FF', fontSize: '0.7rem' }}>{s}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
