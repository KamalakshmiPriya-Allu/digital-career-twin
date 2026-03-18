'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

function getPasswordStrength(pw: string): { level: number; label: string; color: string } {
  if (pw.length === 0) return { level: 0, label: '', color: '#2A2A40' };
  if (pw.length < 6) return { level: 1, label: 'Weak', color: '#f87171' };
  if (pw.length < 10 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { level: 2, label: 'Medium', color: '#fbbf24' };
  return { level: 3, label: 'Strong', color: '#34d399' };
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const strength = getPasswordStrength(password);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    if (password.length < 6) e.password = 'Password must be at least 6 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', { name, email, password });
      document.cookie = `dct_token=${data.token}; path=/; max-age=${7 * 86400}`;
      setAuth(data.user, data.token);
      toast.success('Account created! Let\'s set up your profile.');
      router.push('/onboarding');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registration failed';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => ({
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#23233A',
    border: `1px solid ${errors[field] ? '#f87171' : '#2A2A40'}`,
    borderRadius: '12px',
    color: '#E8E8F0',
    fontSize: '0.95rem',
    outline: 'none',
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass w-full max-w-md p-8 relative z-10"
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <div
          className="text-3xl font-bold mb-2"
          style={{
            fontFamily: 'Syne, sans-serif',
            background: 'linear-gradient(135deg, #5B4FE8, #00C896)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          DCT
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#E8E8F0' }}>
          Create your account
        </h1>
        <p style={{ color: '#6B6B85', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Start your AI career journey
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#A0A0B8', marginBottom: '0.4rem' }}>
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Johnson"
            style={inputStyle('name')}
          />
          {errors.name && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.name}</p>}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#A0A0B8', marginBottom: '0.4rem' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle('email')}
          />
          {errors.email && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.email}</p>}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#A0A0B8', marginBottom: '0.4rem' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              style={{ ...inputStyle('password'), paddingRight: '3rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6B6B85',
              }}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {password && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      borderRadius: '2px',
                      background: i <= strength.level ? strength.color : '#2A2A40',
                      transition: 'background 0.3s',
                    }}
                  />
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: strength.color, marginTop: '0.25rem' }}>
                {strength.label}
              </p>
            </div>
          )}
          {errors.password && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.password}</p>}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#A0A0B8', marginBottom: '0.4rem' }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            style={inputStyle('confirm')}
          />
          {errors.confirm && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.confirm}</p>}
        </div>

        {errors.general && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: '#f87171', fontSize: '0.85rem' }}
          >
            {errors.general}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          style={{
            width: '100%',
            padding: '0.85rem',
            background: '#5B4FE8',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 0 24px rgba(91,79,232,0.4)',
            marginTop: '0.5rem',
            opacity: loading ? 0.8 : 1,
          }}
        >
          {loading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </motion.button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6B6B85', fontSize: '0.9rem' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#5B4FE8', fontWeight: 600, textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>

    </motion.div>
  );
}
