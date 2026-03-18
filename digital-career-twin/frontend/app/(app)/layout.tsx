'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, Brain, BookOpen, TrendingUp,
  CalendarDays, FileText, Settings2, LogOut, Flame,
  MessageSquare, X, Send, ChevronRight, BarChart3,
  Target, FolderOpen, Map, Lightbulb, BrainCircuit, Activity,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/ai-mentor', icon: MessageSquare, label: 'AI Mentor' },
  { href: '/twin-ai', icon: BrainCircuit, label: 'Twin AI' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/assess', icon: Brain, label: 'Daily Test' },
  { href: '/assessments', icon: BarChart3, label: 'History' },
  { href: '/career', icon: TrendingUp, label: 'Career' },
  { href: '/roadmap', icon: Map, label: 'Roadmap' },
  { href: '/learn', icon: BookOpen, label: 'Learning' },
  { href: '/ai-suggestions', icon: Lightbulb, label: 'AI Tips' },
  { href: '/analytics', icon: Activity, label: 'Analytics' },
  { href: '/progress', icon: TrendingUp, label: 'Progress' },
  { href: '/goals', icon: Target, label: 'Goals' },
  { href: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { href: '/files', icon: FolderOpen, label: 'Files' },
  { href: '/resume', icon: FileText, label: 'Resume' },
  { href: '/settings', icon: Settings2, label: 'Settings' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      if (pathname !== '/login' && pathname !== '/register') {
        window.location.replace('/login');
      }
      return;
    }
    api.get('/api/users/me').then(({ data }) => {
      useAuthStore.getState().updateUser(data);
    }).catch(() => {
      // If /me fails, likely token is invalid
      logout();
    });
  }, [user, pathname, logout]);

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F0F1A' }}>
      {/* Sidebar */}
      <aside
        className="hidden lg:flex"
        style={{
          width: '240px',
          background: '#1A1A2E',
          borderRight: '1px solid #2A2A40',
          height: '100vh',
          position: 'sticky',
          top: 0,
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid #2A2A40' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(135deg, #5B4FE8, #00C896)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            DCT
          </div>
          <div style={{ fontSize: '0.7rem', color: '#6B6B85', marginTop: '2px' }}>Digital Career Twin</div>
        </div>

        {/* User */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #2A2A40' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#5B4FE8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#E8E8F0', fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
              <div style={{ color: '#6B6B85', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.targetRole || 'Setup profile'}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0.75rem', overflowY: 'auto' }}>
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem',
                  borderRadius: '10px', marginBottom: '2px',
                  background: active ? 'rgba(91,79,232,0.15)' : 'transparent',
                  borderLeft: active ? '3px solid #5B4FE8' : '3px solid transparent',
                  color: active ? '#7B72FF' : '#6B6B85',
                  fontSize: '0.875rem', fontWeight: active ? 600 : 400,
                  transition: 'all 0.2s', cursor: 'pointer',
                }}>
                  <Icon size={18} />
                  {label}
                  {active && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #2A2A40' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', background: '#23233A', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
            <Flame size={16} style={{ color: '#f97316' }} />
            <span style={{ color: '#E8E8F0', fontSize: '0.8rem', fontWeight: 600 }}>{user?.streakDays || 0} day streak</span>
          </div>
          <button onClick={logout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B85', fontSize: '0.85rem', borderRadius: '8px' }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <div style={{ padding: '1rem 1.5rem', background: '#1A1A2E', borderBottom: '1px solid #2A2A40', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.125rem', fontWeight: 700, color: '#E8E8F0', textTransform: 'capitalize' }}>
            {NAV.find((n) => pathname.startsWith(n.href))?.label || 'Dashboard'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/ai-mentor" style={{ textDecoration: 'none' }}>
              <button style={{ padding: '0.5rem 1rem', background: 'rgba(91,79,232,0.2)', border: '1px solid rgba(91,79,232,0.4)', borderRadius: '8px', color: '#7B72FF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                <MessageSquare size={16} /> Open AI Mentor
              </button>
            </Link>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#1A1A2E', borderTop: '1px solid #2A2A40', display: 'flex', zIndex: 50 }}>
        {NAV.slice(0, 5).map(({ href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{ flex: 1, textDecoration: 'none', display: 'flex', justifyContent: 'center', padding: '0.75rem 0', color: active ? '#5B4FE8' : '#6B6B85' }}>
              <Icon size={22} />
            </Link>
          );
        })}
      </div>


    </div>
  );
}
