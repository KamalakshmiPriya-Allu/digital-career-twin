'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Save, X, Loader2 } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

const TABS = ['Academic', 'Career', 'Skills', 'Preferences'] as const;
type Tab = typeof TABS[number];

const SKILL_KEYS = ['programming', 'problemSolving', 'systemDesign', 'communication', 'aptitude', 'leadership'];
const SKILL_LABELS: Record<string, string> = { programming: 'Programming', problemSolving: 'DSA', systemDesign: 'System Design', communication: 'Communication', aptitude: 'Aptitude', leadership: 'Leadership' };

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState<Tab>('Academic');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    degree: user?.degree || '',
    year: user?.year || 1,
    college: user?.college || '',
    marks10th: user?.marks10th || '',
    marks12th: user?.marks12th || '',
    cgpa: user?.cgpa || '',
    targetRole: user?.targetRole || '',
    targetCompany: user?.targetCompany || '',
    expectedSalary: user?.expectedSalary || 8,
    skills: user?.skills || { programming: 5, problemSolving: 5, systemDesign: 5, communication: 5, aptitude: 5, leadership: 5 },
    learningPreference: user?.learningPreference || '',
    interests: user?.interests?.join(', ') || '',
  });

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        marks10th: form.marks10th ? Number(form.marks10th) : undefined,
        marks12th: form.marks12th ? Number(form.marks12th) : undefined,
        cgpa: form.cgpa ? Number(form.cgpa) : undefined,
        interests: form.interests ? form.interests.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      await api.put('/api/users/profile', payload);
      updateUser({ name: form.name, targetRole: form.targetRole, skills: form.skills as Record<string, number> });
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const skillRadarData = SKILL_KEYS.map((k) => ({
    skill: SKILL_LABELS[k].slice(0, 6),
    value: ((form.skills as Record<string, number>)[k] || 0) * 10,
  }));

  const inputStyle = {
    padding: '0.625rem 0.875rem',
    background: editing ? '#23233A' : 'transparent',
    border: editing ? '1px solid #2A2A40' : 'none',
    borderRadius: '8px',
    color: '#E8E8F0',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
  };

  const fieldRow = (label: string, key: string, type = 'text') => (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', borderBottom: '1px solid #2A2A40' }}>
      <span style={{ color: '#6B6B85', fontSize: '0.8rem' }}>{label}</span>
      {editing ? (
        <input type={type} value={(form as Record<string, unknown>)[key] as string}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} style={inputStyle} />
      ) : (
        <span style={{ color: '#E8E8F0', fontSize: '0.875rem' }}>{(form as Record<string, unknown>)[key] as string || '—'}</span>
      )}
    </div>
  );

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div style={{ display: 'flex', gap: '1.5rem' }}>
      {/* Left sidebar */}
      <div style={{ width: '200px', flexShrink: 0 }}>
        <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #5B4FE8, #00C896)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '0 auto 0.875rem', fontFamily: 'Syne, sans-serif' }}>
            {initials}
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0', marginBottom: '0.25rem' }}>{user?.name}</div>
          <div style={{ color: '#6B6B85', fontSize: '0.75rem', marginBottom: '0.25rem' }}>{user?.email}</div>
          {user?.targetRole && <div style={{ color: '#7B72FF', fontSize: '0.75rem', marginBottom: '0.875rem' }}>{user.targetRole}</div>}
          <div style={{ background: '#23233A', borderRadius: '8px', padding: '0.5rem', fontSize: '0.8rem', color: '#fbbf24' }}>
            🔥 {user?.streakDays || 0} day streak
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', background: '#1A1A2E', borderRadius: '10px', padding: '4px' }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', background: tab === t ? '#5B4FE8' : 'transparent', color: tab === t ? '#fff' : '#6B6B85', cursor: 'pointer', fontSize: '0.85rem', fontWeight: tab === t ? 600 : 400, transition: 'all 0.2s' }}>
              {t}
            </button>
          ))}
        </div>

        <div className="glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} style={{ padding: '0.5rem 0.875rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '8px', color: '#E8E8F0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                  <X size={14} /> Cancel
                </button>
                <button onClick={save} disabled={saving} style={{ padding: '0.5rem 0.875rem', background: '#5B4FE8', border: 'none', borderRadius: '8px', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}>
                  {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                  Save
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} style={{ padding: '0.5rem 0.875rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '8px', color: '#E8E8F0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                <Edit2 size={14} /> Edit
              </button>
            )}
          </div>

          {tab === 'Academic' && (
            <div>
              {fieldRow('Name', 'name')}
              {fieldRow('Degree', 'degree')}
              {fieldRow('Year', 'year', 'number')}
              {fieldRow('College', 'college')}
              {fieldRow('10th Marks %', 'marks10th', 'number')}
              {fieldRow('12th Marks %', 'marks12th', 'number')}
              {fieldRow('CGPA', 'cgpa', 'number')}
            </div>
          )}
          {tab === 'Career' && (
            <div>
              {fieldRow('Target Role', 'targetRole')}
              {fieldRow('Target Company', 'targetCompany')}
              <div style={{ padding: '0.625rem 0', borderBottom: '1px solid #2A2A40' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#6B6B85', fontSize: '0.8rem' }}>Expected Salary</span>
                  {editing ? (
                    <div>
                      <input type="range" min={3} max={50} value={form.expectedSalary} onChange={(e) => setForm((p) => ({ ...p, expectedSalary: Number(e.target.value) }))}
                        style={{ width: '100%', appearance: 'none', height: '6px', borderRadius: '3px', background: '#5B4FE8', cursor: 'pointer' }} />
                      <span style={{ color: '#00C896', fontSize: '0.85rem', fontWeight: 600 }}>{form.expectedSalary} LPA</span>
                    </div>
                  ) : <span style={{ color: '#E8E8F0', fontSize: '0.875rem' }}>{form.expectedSalary} LPA</span>}
                </div>
              </div>
            </div>
          )}
          {tab === 'Skills' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  {SKILL_KEYS.map((k) => {
                    const val = ((form.skills as Record<string, number>)[k] || 0);
                    const color = val <= 3 ? '#f87171' : val <= 6 ? '#fbbf24' : '#34d399';
                    return (
                      <div key={k} style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <span style={{ color: '#A0A0B8', fontSize: '0.85rem' }}>{SKILL_LABELS[k]}</span>
                          <span style={{ color, fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>{val}</span>
                        </div>
                        {editing ? (
                          <input type="range" min={0} max={10} value={val}
                            onChange={(e) => setForm((p) => ({ ...p, skills: { ...(p.skills as Record<string, number>), [k]: Number(e.target.value) } }))}
                            style={{ width: '100%', appearance: 'none', height: '6px', borderRadius: '3px', background: `linear-gradient(to right, ${color} ${val * 10}%, #2A2A40 ${val * 10}%)`, cursor: 'pointer' }} />
                        ) : (
                          <div style={{ height: '6px', background: '#2A2A40', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${val * 10}%`, height: '100%', background: color, borderRadius: '3px' }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={skillRadarData}>
                      <PolarGrid stroke="#2A2A40" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: '#6B6B85', fontSize: 10 }} />
                      <Radar dataKey="value" stroke="#5B4FE8" fill="#5B4FE8" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          {tab === 'Preferences' && (
            <div>
              <div style={{ padding: '0.625rem 0', borderBottom: '1px solid #2A2A40' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#6B6B85', fontSize: '0.8rem' }}>Learning Style</span>
                  {editing ? (
                    <select value={form.learningPreference} onChange={(e) => setForm((p) => ({ ...p, learningPreference: e.target.value }))}
                      style={{ padding: '0.6rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '8px', color: '#E8E8F0', outline: 'none', cursor: 'pointer' }}>
                      <option value="">Select...</option>
                      <option value="video">Video Learner 🎥</option>
                      <option value="reading">Book Reader 📚</option>
                      <option value="project">Project Builder 🛠️</option>
                    </select>
                  ) : <span style={{ color: '#E8E8F0', fontSize: '0.875rem' }}>{form.learningPreference || '—'}</span>}
                </div>
              </div>
              <div style={{ padding: '0.625rem 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#6B6B85', fontSize: '0.8rem' }}>Interests</span>
                  {editing ? (
                    <input value={form.interests} onChange={(e) => setForm((p) => ({ ...p, interests: e.target.value }))}
                      placeholder="AI/ML, Web Dev, Cloud..." style={{ ...inputStyle }} />
                  ) : <span style={{ color: '#E8E8F0', fontSize: '0.875rem' }}>{form.interests || '—'}</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } input[type=range] { -webkit-appearance: none; }`}</style>
    </div>
  );
}
