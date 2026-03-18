'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Bookmark, ExternalLink, PlayCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

interface Video { id: string; title: string; channel: string; thumbnail: string; url: string; }

const RESOURCES = [
  { title: 'CS50: Introduction to Computer Science', source: 'Harvard', skill: 'Programming', difficulty: 'Beginner', time: '12 weeks', url: 'https://cs50.harvard.edu' },
  { title: 'The Complete Web Developer Bootcamp', source: 'Udemy', skill: 'Web Dev', difficulty: 'Beginner', time: '65 hours', url: 'https://udemy.com' },
  { title: 'System Design Interview Prep', source: 'ByteByteGo', skill: 'System Design', difficulty: 'Advanced', time: '8 hours', url: 'https://bytebytego.com' },
  { title: 'LeetCode Daily Practice', source: 'LeetCode', skill: 'DSA', difficulty: 'Mixed', time: 'Ongoing', url: 'https://leetcode.com' },
  { title: 'Data Science Specialization', source: 'Coursera', skill: 'Data Science', difficulty: 'Intermediate', time: '4 months', url: 'https://coursera.org' },
  { title: 'AWS Certified Solutions Architect', source: 'AWS', skill: 'Cloud', difficulty: 'Advanced', time: '2 months', url: 'https://aws.amazon.com/training' },
];

export default function LearnPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('dct_bookmarks') || '[]'); } catch { return []; }
    }
    return [];
  });

  const filters = ['All', 'Programming', 'Web Dev', 'DSA', 'System Design', 'Data Science', 'Cloud'];

  useEffect(() => {
    if (!user?.targetRole) return;
    setLoadingVideos(true);
    api.get(`/api/ai/videos?topic=${encodeURIComponent(user.targetRole + ' tutorial')}`)
      .then(({ data }) => setVideos(data.videos || []))
      .catch(() => {})
      .finally(() => setLoadingVideos(false));
  }, [user?.targetRole]);

  const toggleBookmark = (title: string) => {
    setBookmarks((p) => {
      const n = p.includes(title) ? p.filter((b) => b !== title) : [...p, title];
      localStorage.setItem('dct_bookmarks', JSON.stringify(n));
      return n;
    });
  };

  const filtered = RESOURCES.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.skill.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || r.skill === filter;
    return matchesSearch && matchesFilter;
  });

  const diffColor = { Beginner: '#34d399', Intermediate: '#fbbf24', Advanced: '#f87171', Mixed: '#a78bfa' };

  return (
    <div>
      {/* Search */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#6B6B85' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search resources..."
            style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '10px', color: '#E8E8F0', fontSize: '0.875rem', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '0.5rem 0.875rem', borderRadius: '999px', border: `1px solid ${filter === f ? '#5B4FE8' : '#2A2A40'}`, background: filter === f ? 'rgba(91,79,232,0.2)' : '#23233A', color: filter === f ? '#7B72FF' : '#6B6B85', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {filtered.map((r, i) => (
          <motion.div key={i} className="glass" style={{ padding: '1.25rem' }}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ padding: '0.2rem 0.625rem', background: 'rgba(91,79,232,0.2)', borderRadius: '999px', color: '#7B72FF', fontSize: '0.7rem', fontWeight: 600 }}>{r.source}</span>
              <button onClick={() => toggleBookmark(r.title)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: bookmarks.includes(r.title) ? '#fbbf24' : '#2A2A40' }}>
                <Bookmark size={16} fill={bookmarks.includes(r.title) ? '#fbbf24' : 'none'} />
              </button>
            </div>
            <h3 style={{ fontWeight: 600, color: '#E8E8F0', fontSize: '0.9rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>{r.title}</h3>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
              <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(0,200,150,0.12)', color: '#00C896', fontSize: '0.7rem' }}>{r.skill}</span>
              <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', background: `${(diffColor as Record<string, string>)[r.difficulty]}15`, color: (diffColor as Record<string, string>)[r.difficulty], fontSize: '0.7rem' }}>{r.difficulty}</span>
              <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', background: '#23233A', color: '#6B6B85', fontSize: '0.7rem' }}>⏱ {r.time}</span>
            </div>
            <a href={r.url} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', background: '#5B4FE8', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, width: 'fit-content' }}>
              <ExternalLink size={14} /> Open Resource
            </a>
          </motion.div>
        ))}
      </div>

      {/* Videos from YouTube / API */}
      {(videos.length > 0 || loadingVideos) && (
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#E8E8F0', marginBottom: '1rem' }}>
            Videos for {user?.targetRole || 'Your Career'}
          </h2>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {loadingVideos ? (
              [1, 2, 3].map((i) => (
                <div key={i} style={{ minWidth: '240px', height: '160px', background: '#23233A', borderRadius: '12px', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
              ))
            ) : videos.map((v, i) => (
              <motion.a key={i} href={v.url} target="_blank" rel="noreferrer"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                style={{ minWidth: '240px', flexShrink: 0, textDecoration: 'none', cursor: 'pointer', borderRadius: '12px', overflow: 'hidden', background: '#1A1A2E', border: '1px solid #2A2A40' }}>
                <div style={{ position: 'relative' }}>
                  <img src={v.thumbnail} alt={v.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlayCircle size={36} style={{ color: '#fff', opacity: 0.9 }} />
                  </div>
                </div>
                <div style={{ padding: '0.75rem' }}>
                  <p style={{ color: '#E8E8F0', fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.4, marginBottom: '0.25rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{v.title}</p>
                  <p style={{ color: '#6B6B85', fontSize: '0.72rem' }}>{v.channel}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      )}
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
