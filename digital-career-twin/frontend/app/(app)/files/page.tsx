'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Trash2, Loader2, FolderOpen, X } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface UserFile {
  id: string;
  filename: string;
  fileType: string;
  fileUrl: string;
  category: string;
  uploadedAt: string;
}

const CATEGORIES = [
  { value: 'certificate', label: 'Certificate', color: '#00C896' },
  { value: 'pdf', label: 'PDF / Resume', color: '#5B4FE8' },
  { value: 'other', label: 'Other', color: '#fbbf24' },
];

export default function FilesPage() {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('pdf');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      const { data } = await api.get('/api/files');
      setFiles(data.files || []);
    } catch {
      toast.error('Failed to load files');
    }
    setLoading(false);
  };

  useEffect(() => { fetchFiles(); }, []);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        await api.post('/api/files/upload', {
          filename: file.name,
          fileData: base64,
          category: selectedCategory,
        });
        toast.success('File uploaded!');
        fetchFiles();
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Upload failed');
    }
    setTimeout(() => setUploading(false), 1000);
  };

  const deleteFile = async (id: string) => {
    try {
      await api.delete(`/api/files/${id}`);
      setFiles(p => p.filter(f => f.id !== id));
      toast.success('File deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const catColor = (cat: string) => CATEGORIES.find(c => c.value === cat)?.color || '#6B6B85';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader2 size={32} style={{ color: '#5B4FE8', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#E8E8F0', marginBottom: '1.5rem' }}>Files & Documents</h1>

      {/* Category Selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setSelectedCategory(c.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '999px', border: `1px solid ${selectedCategory === c.value ? c.color : '#2A2A40'}`, background: selectedCategory === c.value ? `${c.color}20` : '#23233A', color: selectedCategory === c.value ? c.color : '#6B6B85', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onClick={() => inputRef.current?.click()}
        style={{ padding: '2.5rem', border: `2px dashed ${dragActive ? '#5B4FE8' : '#2A2A40'}`, borderRadius: '16px', textAlign: 'center', cursor: 'pointer', background: dragActive ? 'rgba(91,79,232,0.1)' : '#1A1A2E', transition: 'all 0.2s', marginBottom: '1.5rem' }}>
        <input ref={inputRef} type="file" onChange={handleChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt" />
        {uploading ? (
          <Loader2 size={40} style={{ color: '#5B4FE8', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        ) : (
          <>
            <Upload size={40} style={{ color: '#5B4FE8', margin: '0 auto 0.75rem' }} />
            <p style={{ color: '#E8E8F0', fontWeight: 600, fontSize: '1rem' }}>
              {dragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
            </p>
            <p style={{ color: '#6B6B85', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              PDF, DOC, images (max 50MB) · Category: {CATEGORIES.find(c => c.value === selectedCategory)?.label}
            </p>
          </>
        )}
      </div>

      {/* File List */}
      {files.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
          <FolderOpen size={40} style={{ color: '#2A2A40', margin: '0 auto 1rem' }} />
          <p style={{ color: '#6B6B85' }}>No files uploaded yet. Upload your first document above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {files.map((f, i) => (
            <motion.div key={f.id} className="glass" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${catColor(f.category)}15`, border: `1px solid ${catColor(f.category)}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} style={{ color: catColor(f.category) }} />
              </div>
              <div style={{ flex: 1 }}>
                <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${f.fileUrl}`} target="_blank" rel="noreferrer"
                  style={{ color: '#E8E8F0', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}
                  onMouseOver={e => (e.currentTarget.style.color = '#7B72FF')}
                  onMouseOut={e => (e.currentTarget.style.color = '#E8E8F0')}>
                  {f.filename}
                </a>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
                  <span style={{ padding: '0.1rem 0.4rem', borderRadius: '999px', background: `${catColor(f.category)}15`, color: catColor(f.category), fontSize: '0.7rem', fontWeight: 600 }}>{f.category}</span>
                  <span style={{ color: '#6B6B85', fontSize: '0.7rem' }}>{f.fileType.toUpperCase()}</span>
                  <span style={{ color: '#6B6B85', fontSize: '0.7rem' }}>{new Date(f.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => deleteFile(f.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B85', padding: '0.4rem' }}
                onMouseOver={e => (e.currentTarget.style.color = '#f87171')}
                onMouseOut={e => (e.currentTarget.style.color = '#6B6B85')}>
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
