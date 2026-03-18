'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, ChevronRight, PlayCircle, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Video { title: string; channel: string; thumbnail: string; link: string; }
interface StructuredResponse {
  explanation: string;
  improvement_advice: string;
  learning_strategy: string;
  recommended_topics: string[];
  next_actions: string;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
  structured?: StructuredResponse;
  videos?: Record<string, Video[]>;
}

function YouTubeCarousel({ topic, videos }: { topic: string, videos: Video[] }) {
  if (!videos || videos.length === 0) return null;
  return (
    <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', color: '#E8E8F0', fontSize: '0.85rem', fontWeight: 600 }}>
        <PlayCircle size={14} color="#f87171" /> <span>Recommended for: {topic}</span>
      </div>
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {videos.map((v, i) => (
          <a key={i} href={v.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flexShrink: 0, width: '200px' }}>
            <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '16/9', background: '#23233A' }}>
              <img src={v.thumbnail} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}>
                <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{v.title}</div>
                <div style={{ color: '#A0A0B8', fontSize: '0.65rem', marginTop: '0.2rem' }}>{v.channel}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function AIMentorPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hello! I'm your Twin AI Career Mentor. I've analyzed your profile and assessments. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const fetchVideos = async (topics: string[]) => {
    const videoData: Record<string, Video[]> = {};
    for (const t of topics) {
      try {
         const { data } = await api.get(`/api/learning/youtube?topic=${encodeURIComponent(t)}`);
         videoData[t] = data.videos || [];
      } catch { } // Ignore video fetch errors
    }
    return videoData;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const { data } = await api.post('/api/ai/mentor', { question: userMsg });
      
      let videos: Record<string, Video[]> = {};
      if (data.recommended_topics?.length > 0) {
        videos = await fetchVideos(data.recommended_topics);
      }

      setMessages(prev => [...prev, {
        role: 'ai',
        content: '',
        structured: data,
        videos
      }]);
    } catch (e: any) {
      toast.error('AI request failed');
      setMessages(p => p.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', background: '#1A1A2E', borderRadius: '16px', border: '1px solid #2A2A40', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(91,79,232,0.1)', borderBottom: '1px solid #2A2A40', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #5B4FE8, #00C896)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={20} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#E8E8F0', margin: 0 }}>AI Career Mentor</h2>
          <div style={{ color: '#00C896', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
             <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#00C896' }} /> Subsystem Online
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              
              {/* Avatar */}
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: m.role === 'user' ? '#7B72FF' : '#23233A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {m.role === 'user' ? <User size={18} color="#fff" /> : <Bot size={18} color="#00C896" />}
              </div>

              {/* Message Content */}
              <div style={{ maxWidth: '85%', background: m.role === 'user' ? '#5B4FE8' : '#23233A', padding: '1.25rem', borderRadius: '16px', border: m.role === 'user' ? 'none' : '1px solid #2A2A40', color: '#E8E8F0', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {m.content && <p style={{ margin: 0 }}>{m.content}</p>}
                
                {/* Structured AI Reply */}
                {m.structured && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    <div>
                      <h4 style={{ color: '#00C896', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 0 0.5rem 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}><Sparkles size={14} /> Explanation</h4>
                      <p style={{ margin: 0, color: '#E8E8F0' }}>{m.structured.explanation}</p>
                    </div>

                    {m.structured.improvement_advice && (
                      <div style={{ padding: '1rem', background: 'rgba(91,79,232,0.15)', borderRadius: '8px', borderLeft: '3px solid #5B4FE8' }}>
                         <h4 style={{ color: '#7B72FF', margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Improvement Advice</h4>
                         <p style={{ margin: 0, color: '#E8E8F0', fontSize: '0.9rem' }}>{m.structured.improvement_advice}</p>
                      </div>
                    )}

                    {m.structured.learning_strategy && (
                      <div>
                        <h4 style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 0 0.5rem 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}><AlertCircle size={14} /> Strategy</h4>
                        <p style={{ margin: 0, color: '#E8E8F0' }}>{m.structured.learning_strategy}</p>
                      </div>
                    )}

                    {m.structured.next_actions && (
                      <div style={{ padding: '0.75rem 1rem', background: '#1A1A2E', borderRadius: '8px', border: '1px solid #2A2A40' }}>
                        <span style={{ color: '#A0A0B8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Next Action: </span>
                        <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>{m.structured.next_actions}</span>
                      </div>
                    )}

                    {/* YouTube Carousels */}
                    {m.structured.recommended_topics?.map(topic => (
                       <YouTubeCarousel key={topic} topic={topic} videos={m.videos?.[topic] || []} />
                    ))}

                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
               <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#23233A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={18} color="#00C896" /></div>
               <div style={{ background: '#23233A', padding: '1.25rem', borderRadius: '16px', border: '1px solid #2A2A40', color: '#A0A0B8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Loader2 size={16} className="animate-spin" /> Analyzing your profile and generating recommendations...
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div style={{ padding: '1.5rem', background: '#1A1A2E', borderTop: '1px solid #2A2A40' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={loading}
            placeholder="Ask about careers, interview prep, or specific skills..."
            style={{ width: '100%', padding: '1rem 3.5rem 1rem 1.25rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '12px', color: '#E8E8F0', fontSize: '0.95rem', outline: 'none', transition: 'border 0.2s' }}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()}
            style={{ position: 'absolute', right: '0.5rem', width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: input.trim() ? '#5B4FE8' : 'transparent', border: 'none', borderRadius: '8px', cursor: input.trim() ? 'pointer' : 'default', transition: 'all 0.2s', opacity: input.trim() ? 1 : 0.5 }}>
            <Send size={18} color={input.trim() ? '#fff' : '#6B6B85'} />
          </button>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6B6B85', textAlign: 'center', marginTop: '0.75rem' }}>The AI Mentor has full context of your profile, assessments, and skills mapping.</div>
      </div>
    </div>
  );
}
