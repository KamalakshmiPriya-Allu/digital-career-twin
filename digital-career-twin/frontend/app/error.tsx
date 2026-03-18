'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#E8E8F0', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Something went wrong</h1>
      <p style={{ color: '#6B6B85', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{error.message || 'An unexpected error occurred'}</p>
      <button onClick={reset} style={{ padding: '0.75rem 1.75rem', background: '#5B4FE8', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 24px rgba(91,79,232,0.4)' }}>
        Try Again
      </button>
    </div>
  );
}
