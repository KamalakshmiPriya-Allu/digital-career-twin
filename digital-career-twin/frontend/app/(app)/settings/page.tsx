'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { LogOut, User, Bell, Shield, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const toggleNotifications = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const newVal = !user.notificationsEnabled;
      await api.put('/api/users/profile', { notificationsEnabled: newVal });
      updateUser({ ...user, notificationsEnabled: newVal });
      toast.success(newVal ? 'Notifications enabled' : 'Notifications disabled');
    } catch {
      toast.error('Failed to update settings');
    }
    setSaving(false);
  };
  return (
    <div style={{ maxWidth: '560px' }}>
      <div className="glass" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <User size={18} style={{ color: '#5B4FE8' }} />
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0' }}>Account</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {[['Name', user?.name || '—'], ['Email', user?.email || '—']].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid #2A2A40' }}>
              <span style={{ color: '#6B6B85', fontSize: '0.875rem' }}>{label}</span>
              <span style={{ color: '#E8E8F0', fontSize: '0.875rem' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="glass" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Bell size={18} style={{ color: '#5B4FE8' }} />
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0' }}>Notifications</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#E8E8F0', fontSize: '0.95rem', fontWeight: 600 }}>Email and Push Notifications</p>
            <p style={{ color: '#6B6B85', fontSize: '0.8rem', marginTop: '0.2rem' }}>Receive updates about assessments and AI recommendations</p>
          </div>
          <button onClick={toggleNotifications} disabled={saving}
            style={{ position: 'relative', width: '48px', height: '26px', borderRadius: '13px', background: user?.notificationsEnabled ? '#00C896' : '#2A2A40', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.3s' }}>
            <div style={{ position: 'absolute', top: '3px', left: user?.notificationsEnabled ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {saving && <Loader2 size={12} className="animate-spin" style={{ color: '#00C896' }} />}
            </div>
          </button>
        </div>
      </div>
      <div className="glass" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Shield size={18} style={{ color: '#5B4FE8' }} />
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#E8E8F0' }}>Privacy</h2>
        </div>
        <p style={{ color: '#6B6B85', fontSize: '0.875rem' }}>Your data is encrypted and never shared with third parties.</p>
      </div>
      <button onClick={logout}
        style={{ width: '100%', padding: '0.875rem', background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '10px', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}
