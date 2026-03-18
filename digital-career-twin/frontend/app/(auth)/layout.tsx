export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0F0F1A' }}>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(91,79,232,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  );
}
