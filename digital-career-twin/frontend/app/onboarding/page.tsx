'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

interface FormData {
  name: string;
  degree: string;
  year: number;
  college: string;
  marks10th: string;
  marks12th: string;
  cgpa: string;
  targetRole: string;
  targetCompany: string;
  expectedSalary: number;
  skills: Record<string, number>;
  learningPreference: string;
  interests: string[];
  strengths: string;
  weaknesses: string;
}

const DEGREES = ['B.Tech', 'BCA', 'MCA', 'MBA', 'BSc', 'B.Com', 'BBA', 'Other'];
const ROLE_SUGGESTIONS = ['Frontend Developer', 'Backend Developer', 'Data Scientist', 'ML Engineer', 'Full Stack Developer', 'DevOps Engineer', 'Product Manager', 'Mobile Developer', 'Cloud Engineer'];
const INTEREST_TAGS = ['AI/ML', 'Web Dev', 'Mobile', 'Cloud', 'DevOps', 'Data', 'Security', 'Blockchain', 'Game Dev', 'IoT'];
const SKILL_LABELS: Record<string, string> = {
  programming: 'Programming',
  problemSolving: 'Data Structures',
  systemDesign: 'System Design',
  communication: 'Communication',
  aptitude: 'Problem Solving',
  leadership: 'Leadership',
};

const STEPS = [
  { title: "Let's get started", subtitle: "Tell us who you are" },
  { title: "Academic Background", subtitle: "Share your educational details" },
  { title: "Career Goals", subtitle: "What do you want to achieve?" },
  { title: "Your Skills", subtitle: "Rate your current abilities (0-10)" },
  { title: "Learning Style", subtitle: "How do you learn best?" },
];

function SkillSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const color = value <= 3 ? '#f87171' : value <= 6 ? '#fbbf24' : '#34d399';
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ color: '#E8E8F0', fontSize: '0.9rem' }}>{label}</span>
        <span style={{ color, fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          appearance: 'none',
          height: '6px',
          borderRadius: '3px',
          background: `linear-gradient(to right, ${color} 0%, ${color} ${value * 10}%, #2A2A40 ${value * 10}%, #2A2A40 100%)`,
          cursor: 'pointer',
        }}
      />
    </div>
  );
}

export default function OnboardingPage() {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    degree: '',
    year: 1,
    college: '',
    marks10th: '',
    marks12th: '',
    cgpa: '',
    targetRole: '',
    targetCompany: '',
    expectedSalary: 8,
    skills: { programming: 5, problemSolving: 5, systemDesign: 5, communication: 5, aptitude: 5, leadership: 5 },
    learningPreference: '',
    interests: [],
    strengths: '',
    weaknesses: '',
  });

  const update = (key: keyof FormData, value: FormData[keyof FormData]) =>
    setFormData((p) => ({ ...p, [key]: value }));

  // Sync name from user store once loaded
  useEffect(() => {
    if (user?.name && !formData.name) {
      setFormData(p => ({ ...p, name: user.name }));
    }
  }, [user?.name, formData.name]);

  const toggleInterest = (tag: string) => {
    setFormData((p) => ({
      ...p,
      interests: p.interests.includes(tag) ? p.interests.filter((t) => t !== tag) : [...p.interests, tag],
    }));
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        marks10th: formData.marks10th ? Number(formData.marks10th) : undefined,
        marks12th: formData.marks12th ? Number(formData.marks12th) : undefined,
        cgpa: formData.cgpa ? Number(formData.cgpa) : undefined,
        strengths: formData.strengths ? [formData.strengths] : [],
        weaknesses: formData.weaknesses ? [formData.weaknesses] : [],
        onboardingDone: true,
      };
      await api.put('/api/users/profile', payload);
      updateUser({ onboardingDone: true, name: formData.name });
      document.cookie = `dct_token=${localStorage.getItem('dct_token')}; path=/; max-age=${7 * 86400}`;
      toast.success('Profile set up! Welcome to your Digital Career Twin 🚀');
      router.push('/dashboard');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 1rem',
    background: '#23233A',
    border: '1px solid #2A2A40',
    borderRadius: '10px',
    color: '#E8E8F0',
    fontSize: '0.9rem',
    outline: 'none',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const steps = [
    // Step 1: Basic Info
    <div key="s1">
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#A0A0B8', marginBottom: '0.4rem' }}>Full Name</label>
        <input type="text" value={formData.name} onChange={(e) => update('name', e.target.value)} style={inputStyle} placeholder="Your name" />
      </div>
    </div>,

    // Step 2: Academic
    <div key="s2" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#A0A0B8', marginBottom: '0.4rem' }}>Degree</label>
        <select value={formData.degree} onChange={(e) => update('degree', e.target.value)} style={selectStyle}>
          <option value="">Select degree</option>
          {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#A0A0B8', marginBottom: '0.4rem' }}>
          Year: <strong style={{ color: '#5B4FE8' }}>{formData.year}</strong>
        </label>
        <input type="range" min={1} max={4} value={formData.year} onChange={(e) => update('year', Number(e.target.value))}
          style={{ width: '100%', appearance: 'none', height: '6px', borderRadius: '3px', background: '#5B4FE8', cursor: 'pointer' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B6B85' }}>
          {[1,2,3,4].map(y => <span key={y}>Year {y}</span>)}
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#A0A0B8', marginBottom: '0.4rem' }}>College / University</label>
        <input type="text" value={formData.college} onChange={(e) => update('college', e.target.value)} style={inputStyle} placeholder="e.g. IIT Delhi" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#A0A0B8', marginBottom: '0.3rem' }}>10th %</label>
          <input type="number" value={formData.marks10th} onChange={(e) => update('marks10th', e.target.value)} style={inputStyle} placeholder="85" min={0} max={100} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#A0A0B8', marginBottom: '0.3rem' }}>12th %</label>
          <input type="number" value={formData.marks12th} onChange={(e) => update('marks12th', e.target.value)} style={inputStyle} placeholder="82" min={0} max={100} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#A0A0B8', marginBottom: '0.3rem' }}>CGPA</label>
          <input type="number" value={formData.cgpa} onChange={(e) => update('cgpa', e.target.value)} style={inputStyle} placeholder="8.5" min={0} max={10} step={0.1} />
        </div>
      </div>
    </div>,

    // Step 3: Career Goals
    <div key="s3" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#A0A0B8', marginBottom: '0.4rem' }}>Target Role</label>
        <input type="text" list="roles" value={formData.targetRole} onChange={(e) => update('targetRole', e.target.value)} style={inputStyle} placeholder="e.g. Frontend Developer" />
        <datalist id="roles">{ROLE_SUGGESTIONS.map((r) => <option key={r} value={r} />)}</datalist>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#A0A0B8', marginBottom: '0.4rem' }}>Target Company (optional)</label>
        <input type="text" value={formData.targetCompany} onChange={(e) => update('targetCompany', e.target.value)} style={inputStyle} placeholder="e.g. Google, Microsoft" />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#A0A0B8', marginBottom: '0.4rem' }}>
          Expected Salary: <strong style={{ color: '#00C896' }}>{formData.expectedSalary} LPA</strong>
        </label>
        <input type="range" min={3} max={50} value={formData.expectedSalary} onChange={(e) => update('expectedSalary', Number(e.target.value))}
          style={{ width: '100%', appearance: 'none', height: '6px', borderRadius: '3px', background: '#00C896', cursor: 'pointer' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B6B85' }}>
          <span>3 LPA</span><span>50 LPA</span>
        </div>
      </div>
    </div>,

    // Step 4: Skills
    <div key="s4">
      {Object.entries(SKILL_LABELS).map(([key, label]) => (
        <SkillSlider key={key} label={label} value={formData.skills[key] || 5}
          onChange={(v) => setFormData((p) => ({ ...p, skills: { ...p.skills, [key]: v } }))} />
      ))}
    </div>,

    // Step 5: Learning Style
    <div key="s5" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#A0A0B8', marginBottom: '0.75rem' }}>Learning Style</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          {[
            { id: 'video', icon: '🎥', label: 'Video Learner' },
            { id: 'reading', icon: '📚', label: 'Book Reader' },
            { id: 'project', icon: '🛠️', label: 'Project Builder' },
          ].map((opt) => (
            <button key={opt.id} type="button" onClick={() => update('learningPreference', opt.id)}
              style={{
                padding: '1rem 0.5rem',
                background: formData.learningPreference === opt.id ? 'rgba(91,79,232,0.3)' : '#23233A',
                border: `2px solid ${formData.learningPreference === opt.id ? '#5B4FE8' : '#2A2A40'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}>
              <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
              <span style={{ color: '#E8E8F0', fontSize: '0.8rem', textAlign: 'center' }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#A0A0B8', marginBottom: '0.75rem' }}>Interests (select all that apply)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {INTEREST_TAGS.map((tag) => (
            <button key={tag} type="button" onClick={() => toggleInterest(tag)}
              style={{
                padding: '0.35rem 0.875rem',
                borderRadius: '999px',
                border: `1px solid ${formData.interests.includes(tag) ? '#5B4FE8' : '#2A2A40'}`,
                background: formData.interests.includes(tag) ? 'rgba(91,79,232,0.25)' : '#23233A',
                color: formData.interests.includes(tag) ? '#7B72FF' : '#A0A0B8',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#A0A0B8', marginBottom: '0.4rem' }}>Key Strength</label>
        <textarea value={formData.strengths} onChange={(e) => update('strengths', e.target.value)}
          placeholder="e.g. Quick learner, good at problem solving..." rows={2}
          style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#A0A0B8', marginBottom: '0.4rem' }}>Area to Improve</label>
        <textarea value={formData.weaknesses} onChange={(e) => update('weaknesses', e.target.value)}
          placeholder="e.g. Need to practice DSA more..." rows={2}
          style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
    </div>,
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, rgba(91,79,232,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="glass" style={{ width: '100%', maxWidth: '560px', padding: '2.5rem', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontFamily: 'Syne, sans-serif', fontSize: '1.25rem', fontWeight: 800,
            background: 'linear-gradient(135deg, #5B4FE8, #00C896)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1.5rem',
          }}>DCT</div>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i < step ? '#5B4FE8' : i === step ? '#7B72FF' : '#2A2A40', transition: 'background 0.3s' }} />
            ))}
          </div>

          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#E8E8F0' }}>
            {STEPS[step].title}
          </h1>
          <p style={{ color: '#6B6B85', marginTop: '0.35rem', fontSize: '0.9rem' }}>{STEPS[step].subtitle}</p>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            style={{ minHeight: '240px' }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              style={{ flex: 1, padding: '0.8rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '10px', color: '#E8E8F0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <ChevronLeft size={18} /> Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)}
              style={{ flex: 1, padding: '0.8rem', background: '#5B4FE8', border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 600, boxShadow: '0 0 20px rgba(91,79,232,0.35)' }}>
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <motion.button onClick={handleFinish} disabled={saving}
              whileHover={{ scale: saving ? 1 : 1.02 }} whileTap={{ scale: saving ? 1 : 0.98 }}
              style={{ flex: 1, padding: '0.8rem', background: '#5B4FE8', border: 'none', borderRadius: '10px', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 600, opacity: saving ? 0.8 : 1, boxShadow: '0 0 20px rgba(91,79,232,0.35)' }}>
              {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={18} />}
              {saving ? 'Saving...' : 'Finish Setup'}
            </motion.button>
          )}
        </div>
      </div>
      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type=range] { -webkit-appearance: none; appearance: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; background: #5B4FE8; border-radius: 50%; cursor: pointer; }
        option { background: #23233A; color: #E8E8F0; }
      `}</style>
    </div>
  );
}
