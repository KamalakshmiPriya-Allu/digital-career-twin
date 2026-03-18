import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Digital Career Twin | AI Career Mentor',
  description: 'Personalized AI career guidance platform for students — track skills, get AI mentoring, predict career paths.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A2E',
              color: '#E8E8F0',
              border: '1px solid #2A2A40',
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#00C896', secondary: '#1A1A2E' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#1A1A2E' } },
          }}
        />
      </body>
    </html>
  );
}

