'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Brain, TrendingUp, Target, BookOpen, FileText, Zap } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Career Mentor', desc: 'Get personalized career advice powered by Claude AI, available 24/7' },
  { icon: TrendingUp, title: 'Career Predictions', desc: 'AI analyzes your profile to predict best career paths with match percentages' },
  { icon: Target, title: 'Skill Tracking', desc: 'Dynamic skill radar updated in real-time based on daily assessments' },
  { icon: Zap, title: 'Daily Tasks', desc: 'Personalized 3-task daily plan generated fresh every day by AI' },
  { icon: BookOpen, title: 'Smart Learning', desc: 'Curated resources and YouTube videos matched to your career goals' },
  { icon: FileText, title: 'AI Resume', desc: 'Auto-populate your resume from profile, generate summaries with Claude' },
];

const statsData = [
  { value: '500+', label: 'Students Mentored' },
  { value: '10k+', label: 'Tasks Generated' },
  { value: '95%', label: 'Report Better Clarity' },
  { value: '5+', label: 'Skill Categories' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', color: '#E8E8F0' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid #2A2A40', position: 'sticky', top: 0, background: 'rgba(15,15,26,0.9)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.25rem', background: 'linear-gradient(135deg, #5B4FE8, #00C896)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DCT</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/login" style={{ padding: '0.5rem 1.25rem', border: '1px solid #2A2A40', borderRadius: '8px', color: '#E8E8F0', textDecoration: 'none', fontSize: '0.875rem' }}>Sign In</Link>
          <Link href="/register" style={{ padding: '0.5rem 1.25rem', background: '#5B4FE8', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '5rem 2rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(91,79,232,0.25) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', background: 'rgba(91,79,232,0.15)', border: '1px solid rgba(91,79,232,0.3)', borderRadius: '999px', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#7B72FF' }}>
            <Zap size={14} /> AI-Powered Career Guidance
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.25rem', maxWidth: '800px', margin: '0 auto 1rem' }}>
            Your{' '}
            <span style={{ background: 'linear-gradient(135deg, #5B4FE8, #00C896)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Digital Career Twin
            </span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#A0A0B8', maxWidth: '560px', margin: '1rem auto 2rem', lineHeight: 1.7 }}>
            AI career mentoring, skill tracking, daily tasks, and career predictions — all in one platform built for students.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', background: '#5B4FE8', borderRadius: '12px', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', boxShadow: '0 0 32px rgba(91,79,232,0.5)' }}>
                Start Free ✨
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', background: 'transparent', border: '1px solid #2A2A40', borderRadius: '12px', color: '#E8E8F0', textDecoration: 'none', fontSize: '1rem' }}>
                Sign In →
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section style={{ padding: '3rem 2rem', borderTop: '1px solid #2A2A40', borderBottom: '1px solid #2A2A40' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {statsData.map((s, i) => (
            <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #5B4FE8, #00C896)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ color: '#6B6B85', fontSize: '0.875rem' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Everything you need to succeed</h2>
            <p style={{ color: '#6B6B85' }}>Built by students, for students. Powered by Claude AI.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {features.map((f, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="glass" style={{ padding: '1.75rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(91,79,232,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <f.icon size={22} style={{ color: '#7B72FF' }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#E8E8F0', marginBottom: '0.4rem' }}>{f.title}</h3>
                <p style={{ color: '#6B6B85', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '4rem 2rem', borderTop: '1px solid #2A2A40' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: '2.5rem' }}>How it works</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { n: '1', t: 'Create your profile', d: 'Tell us your degree, skills, and career goals in our 5-step onboarding wizard.' },
              { n: '2', t: 'Get AI insights', d: 'Our AI analyzes your profile and generates personalized roadmaps, daily tasks, and skill gaps.' },
              { n: '3', t: 'Track and grow', d: 'Take daily assessments, complete AI tasks, and watch your career readiness score improve.' },
            ].map((step, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                style={{ display: 'flex', gap: '1.25rem', textAlign: 'left', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#5B4FE8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{step.n}</div>
                <div>
                  <h3 style={{ fontWeight: 700, color: '#E8E8F0', marginBottom: '0.3rem' }}>{step.t}</h3>
                  <p style={{ color: '#6B6B85', fontSize: '0.875rem', lineHeight: 1.6 }}>{step.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 2rem', textAlign: 'center', borderTop: '1px solid #2A2A40' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Ready to build your career?</h2>
        <p style={{ color: '#6B6B85', marginBottom: '2rem', fontSize: '1.05rem' }}>Join hundreds of students already using DCT</p>
        <Link href="/register" style={{ display: 'inline-block', padding: '1rem 2.5rem', background: '#5B4FE8', borderRadius: '12px', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem', boxShadow: '0 0 32px rgba(91,79,232,0.45)' }}>
          Get Started Free →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ padding: '1.5rem 2rem', borderTop: '1px solid #2A2A40', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, background: 'linear-gradient(135deg, #5B4FE8, #00C896)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DCT</div>
        <p style={{ color: '#6B6B85', fontSize: '0.8rem' }}>© 2025 Digital Career Twin. Built with ❤️ for students.</p>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <Link href="/login" style={{ color: '#6B6B85', textDecoration: 'none', fontSize: '0.8rem' }}>Sign In</Link>
          <Link href="/register" style={{ color: '#6B6B85', textDecoration: 'none', fontSize: '0.8rem' }}>Register</Link>
        </div>
      </footer>
    </div>
  );
}
