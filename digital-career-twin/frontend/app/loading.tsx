export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F0F1A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid #2A2A40', borderTopColor: '#5B4FE8', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#6B6B85', fontSize: '0.875rem' }}>Loading...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
