'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, CalendarDays } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface CalendarEvent { id: string; title: string; type: string; date: string; }

const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  exam: { bg: 'rgba(248,113,113,0.15)', text: '#f87171', dot: '#f87171' },
  assignment: { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24', dot: '#fbbf24' },
  holiday: { bg: 'rgba(52,211,153,0.15)', text: '#34d399', dot: '#34d399' },
  deadline: { bg: 'rgba(251,146,60,0.15)', text: '#fb923c', dot: '#fb923c' },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'exam', date: '' });
  const [loading, setLoading] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = new Date();

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/api/calendar/events');
      setEvents(data.events || []);
    } catch {}
  };

  useEffect(() => { fetchEvents(); }, []);

  const eventsOnDate = (d: number) => {
    return events.filter((e) => {
      const ed = new Date(e.date);
      return ed.getFullYear() === year && ed.getMonth() === month && ed.getDate() === d;
    });
  };

  const selectedDayEvents = selectedDate
    ? events.filter((e) => {
        const ed = new Date(e.date);
        return ed.getFullYear() === selectedDate.getFullYear() && ed.getMonth() === selectedDate.getMonth() && ed.getDate() === selectedDate.getDate();
      })
    : [];

  const addEvent = async () => {
    if (!form.title || !form.date) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      await api.post('/api/calendar/events', form);
      await fetchEvents();
      setForm({ title: '', type: 'exam', date: '' });
      setShowForm(false);
      toast.success('Event added!');
    } catch { toast.error('Failed to add event'); }
    setLoading(false);
  };

  const deleteEvent = async (id: string) => {
    try {
      await api.delete(`/api/calendar/events/${id}`);
      setEvents((p) => p.filter((e) => e.id !== id));
      toast.success('Event deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
      {/* Calendar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#E8E8F0' }}>
            {MONTHS[month]} {year}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} style={{ padding: '0.4rem 0.75rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '8px', color: '#E8E8F0', cursor: 'pointer' }}>‹</button>
            <button onClick={() => setViewDate(new Date())} style={{ padding: '0.4rem 0.75rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '8px', color: '#E8E8F0', cursor: 'pointer', fontSize: '0.8rem' }}>Today</button>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))} style={{ padding: '0.4rem 0.75rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '8px', color: '#E8E8F0', cursor: 'pointer' }}>›</button>
          </div>
        </div>

        <div className="glass" style={{ padding: '1rem', overflow: 'hidden' }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.5rem' }}>
            {DAYS.map((d) => (
              <div key={d} style={{ textAlign: 'center', color: '#6B6B85', fontSize: '0.75rem', fontWeight: 600, padding: '0.5rem 0' }}>{d}</div>
            ))}
          </div>
          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;
              const dayEvents = eventsOnDate(day);
              return (
                <div key={day} onClick={() => setSelectedDate(new Date(year, month, day))}
                  style={{ minHeight: '64px', padding: '4px', borderRadius: '8px', cursor: 'pointer', background: isSelected ? 'rgba(91,79,232,0.2)' : isToday ? 'rgba(91,79,232,0.1)' : 'transparent', border: isToday ? '1px solid rgba(91,79,232,0.4)' : '1px solid transparent', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: isToday ? 700 : 400, color: isToday ? '#7B72FF' : '#A0A0B8', textAlign: 'right', marginBottom: '2px' }}>{day}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                    {dayEvents.slice(0, 2).map((e) => (
                      <div key={e.id} style={{ width: '100%', padding: '1px 4px', borderRadius: '3px', background: TYPE_COLORS[e.type]?.bg, fontSize: '0.65rem', color: TYPE_COLORS[e.type]?.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                    ))}
                    {dayEvents.length > 2 && <div style={{ fontSize: '0.6rem', color: '#6B6B85' }}>+{dayEvents.length - 2}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ width: '100%', padding: '0.75rem', background: '#5B4FE8', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', boxShadow: '0 0 20px rgba(91,79,232,0.35)' }}>
          <Plus size={18} /> Add Event
        </button>

        {showForm && (
          <motion.div className="glass" style={{ padding: '1.25rem', marginBottom: '1rem' }}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title"
                style={{ padding: '0.6rem 0.875rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '8px', color: '#E8E8F0', fontSize: '0.875rem', outline: 'none' }} />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={{ padding: '0.6rem 0.875rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '8px', color: '#E8E8F0', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}>
                <option value="exam">Exam</option>
                <option value="assignment">Assignment</option>
                <option value="holiday">Holiday</option>
                <option value="deadline">Deadline</option>
              </select>
              <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={{ padding: '0.6rem 0.875rem', background: '#23233A', border: '1px solid #2A2A40', borderRadius: '8px', color: '#E8E8F0', fontSize: '0.875rem', outline: 'none' }} />
              <button onClick={addEvent} disabled={loading}
                style={{ padding: '0.65rem', background: '#5B4FE8', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontSize: '0.875rem' }}>
                {loading ? 'Adding...' : 'Add Event'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Selected Date Events */}
        {selectedDate && (
          <div className="glass" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <CalendarDays size={16} style={{ color: '#5B4FE8' }} />
              <span style={{ color: '#E8E8F0', fontSize: '0.875rem', fontWeight: 600 }}>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            {selectedDayEvents.length === 0 ? (
              <p style={{ color: '#6B6B85', fontSize: '0.8rem' }}>No events on this day</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedDayEvents.map((e) => (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem', background: TYPE_COLORS[e.type]?.bg, borderRadius: '8px', border: `1px solid ${TYPE_COLORS[e.type]?.dot}30` }}>
                    <div>
                      <div style={{ color: TYPE_COLORS[e.type]?.text, fontWeight: 600, fontSize: '0.85rem' }}>{e.title}</div>
                      <div style={{ color: '#6B6B85', fontSize: '0.7rem' }}>{e.type} · {new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <button onClick={() => deleteEvent(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B85' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
