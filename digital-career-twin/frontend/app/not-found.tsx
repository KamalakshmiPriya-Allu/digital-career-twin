import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#E8E8F0', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '6rem', fontWeight: 800, background: 'linear-gradient(135deg, #5B4FE8, #00C896)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>404</div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.75rem', fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem' }}>Page not found</h1>
      <p style={{ color: '#6B6B85', marginBottom: '2rem', fontSize: '1rem' }}>This page doesn&apos;t exist or has been moved.</p>
      <Link href="/" style={{ padding: '0.75rem 1.75rem', background: '#5B4FE8', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: 600, boxShadow: '0 0 24px rgba(91,79,232,0.4)' }}>
        Go Home
      </Link>
    </div>
  );
}
