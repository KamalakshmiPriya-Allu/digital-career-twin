'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      document.cookie = `dct_token=${data.token}; path=/; max-age=${7 * 86400}`;
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push(data.user.onboardingDone ? '/dashboard' : '/onboarding');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
          Welcome back
        </h1>
        <p style={{ color: '#6B6B85', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Sign in to your AI career mentor
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#A0A0B8', marginBottom: '0.4rem' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: '#23233A',
              border: '1px solid #2A2A40',
              borderRadius: '12px',
              color: '#E8E8F0',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#5B4FE8')}
            onBlur={(e) => (e.target.style.borderColor = '#2A2A40')}
          />
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
              placeholder="••••••••"
              required
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%',
                padding: '0.75rem 3rem 0.75rem 1rem',
                background: '#23233A',
                border: '1px solid #2A2A40',
                borderRadius: '12px',
                color: '#E8E8F0',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#5B4FE8')}
              onBlur={(e) => (e.target.style.borderColor = '#2A2A40')}
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
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '-0.25rem' }}
          >
            {error}
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
            background: loading ? '#4B3FD8' : '#5B4FE8',
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
          }}
        >
          {loading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </motion.button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6B6B85', fontSize: '0.9rem' }}>
        Don&apos;t have an account?{' '}
        <Link href="/register" style={{ color: '#5B4FE8', fontWeight: 600, textDecoration: 'none' }}>
          Create account
        </Link>
      </p>

    </motion.div>
  );
}
