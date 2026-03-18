'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ResumePage() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateSummary = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('dct_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: `Write a professional 3-sentence resume summary for ${user?.name} targeting ${user?.targetRole || 'software engineering'}. Skills: ${JSON.stringify(user?.skills)}. Degree: ${user?.degree}. Make it ATS-friendly, concise, and impactful. Return only the summary text, no labels.` }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let text = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
          for (const line of lines) {
            const d = line.slice(6);
            if (d === '[DONE]') break;
            try { const p = JSON.parse(d); if (p.text) text += p.text; } catch {}
          }
        }
      }
      setSummary(text);
    } catch { toast.error('Failed to generate summary'); }
    setGenerating(false);
  };

  void api;
  const printResume = () => window.print();

  const skills = user?.skills as Record<string, number> | undefined;
  const skillList = skills ? Object.entries(skills).filter(([,v]) => v >= 5).map(([k]) => ({ programming: 'Programming', problemSolving: 'Data Structures', systemDesign: 'System Design', communication: 'Communication', aptitude: 'Problem Solving', leadership: 'Leadership' }[k] || k)) : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }}>
      {/* Resume Preview */}
      <div id="resume-preview" style={{ background: '#fff', borderRadius: '12px', padding: '3rem', color: '#1A1A1A', fontFamily: 'Georgia, serif', lineHeight: 1.6, minHeight: '800px' }}>
        {/* Header */}
        <div style={{ borderBottom: '2px solid #1A1A1A', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, fontFamily: 'Arial, sans-serif' }}>{user?.name || 'Your Name'}</h1>
          <p style={{ fontSize: '1.1rem', color: '#4B4B4B', margin: '0.25rem 0', fontFamily: 'Arial, sans-serif' }}>{user?.targetRole || 'Software Engineer'}</p>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: 0, fontFamily: 'Arial, sans-serif' }}>{user?.email}</p>
        </div>

        {/* Summary */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, fontFamily: 'Arial, sans-serif', marginBottom: '0.5rem' }}>Professional Summary</h2>
          <p style={{ fontSize: '0.9rem', color: '#333' }}>
            {summary || `Motivated ${user?.degree || 'engineering'} student in Year ${user?.year || 3} aspiring to become a ${user?.targetRole || 'software developer'}. Strong foundation in programming and problem-solving with a passion for building impactful solutions.`}
          </p>
        </div>

        {/* Skills */}
        {skillList.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, fontFamily: 'Arial, sans-serif', marginBottom: '0.5rem' }}>Technical Skills</h2>
            <p style={{ fontSize: '0.9rem', color: '#333' }}>{skillList.join(' · ')}</p>
          </div>
        )}

        {/* Education */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, fontFamily: 'Arial, sans-serif', marginBottom: '0.5rem' }}>Education</h2>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize: '0.95rem' }}>{user?.college || 'University Name'}</strong>
              <span style={{ fontSize: '0.8rem', color: '#666' }}>Year {user?.year || 3}</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#444', margin: '0.15rem 0' }}>{user?.degree || 'B.Tech'} · {user?.cgpa ? `CGPA: ${user.cgpa}` : ''}</p>
          </div>
        </div>

        {/* Career Goal */}
        {user?.targetCompany && (
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, fontFamily: 'Arial, sans-serif', marginBottom: '0.5rem' }}>Career Objective</h2>
            <p style={{ fontSize: '0.9rem', color: '#333' }}>Targeting a role at {user.targetCompany} with an expected compensation of {user.expectedSalary} LPA.</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="glass" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '1rem', fontSize: '0.95rem' }}>Resume Controls</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <motion.button onClick={generateSummary} disabled={generating} whileHover={{ scale: generating ? 1 : 1.02 }}
              style={{ padding: '0.7rem', background: 'rgba(91,79,232,0.2)', border: '1px solid rgba(91,79,232,0.4)', borderRadius: '8px', color: '#7B72FF', cursor: generating ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              {generating ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : '✨'}
              {generating ? 'Generating...' : 'Generate Summary'}
            </motion.button>
            <motion.button onClick={printResume} whileHover={{ scale: 1.02 }}
              style={{ padding: '0.7rem', background: '#5B4FE8', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 0 16px rgba(91,79,232,0.35)' }}>
              <Download size={15} /> Export PDF
            </motion.button>
          </div>
        </div>

        <div className="glass" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Tips</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['Use action verbs like "Built", "Designed", "Implemented"', 'Quantify achievements with numbers', 'Tailor to each job description', 'Keep it under 1 page'].map((tip, i) => (
              <li key={i} style={{ color: '#A0A0B8', fontSize: '0.78rem', display: 'flex', gap: '0.5rem', lineHeight: 1.4 }}>
                <span style={{ color: '#5B4FE8', flexShrink: 0 }}>✓</span>{tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media print { body { background: white !important; } .no-print { display: none !important; } #resume-preview { border-radius: 0; box-shadow: none; } }
      `}</style>
    </div>
  );
}
