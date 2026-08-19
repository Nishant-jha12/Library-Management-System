import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Plus, Minus, Search, Loader2, CheckCircle2 } from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';
import { BookGenre } from '../../types';
import { MorphButton } from '../ui/MorphButton';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GENRES: BookGenre[] = [
  'Science Fiction','Philosophy','Computer Science','Mathematics',
  'Literature','History','Physics','Biology','Psychology','Art & Design',
];

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
    {children}
  </label>
);

export const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose }) => {
  const { addBook } = useLibraryStore();
  const [form, setForm] = useState({
    title: '', author: '', isbn: '', genre: 'Science Fiction' as BookGenre,
    totalCopies: 3, publishYear: 2024, description: '', coverImageUrl: '',
  });
  const [isbnLoading, setIsbnLoading] = useState(false);
  const [isbnFound, setIsbnFound] = useState(false);
  const [isbnError, setIsbnError] = useState('');

  const set = (field: string, value: string | number) => setForm(p => ({ ...p, [field]: value }));

  const lookupISBN = async (isbn: string) => {
    if (!isbn || isbn.length < 10) return;
    setIsbnLoading(true);
    setIsbnError('');
    setIsbnFound(false);
    
    try {
      const cleanIsbn = isbn.replace(/[-\s]/g, '');
      const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
      const data = await res.json();
      const key = `ISBN:${cleanIsbn}`;
      
      if (data[key]) {
        const book = data[key];
        const coverUrl = book.cover?.large || book.cover?.medium || book.cover?.small || '';
        
        setForm(prev => ({
          ...prev,
          title: book.title || prev.title,
          author: book.authors?.[0]?.name || prev.author,
          publishYear: book.publish_date ? parseInt(book.publish_date) || prev.publishYear : prev.publishYear,
          description: book.notes || book.subtitle || prev.description,
          coverImageUrl: coverUrl,
        }));
        setIsbnFound(true);
      } else {
        setIsbnError('ISBN not found in database. Fill details manually.');
      }
    } catch {
      setIsbnError('Failed to lookup ISBN. Check your connection.');
    } finally {
      setIsbnLoading(false);
    }
  };

  const handleSubmit = async () => {
    await new Promise(r => setTimeout(r, 1000));
    addBook({
      ...form,
      availableCopies: form.totalCopies,
      coverHue: Math.floor(Math.random() * 360),
      tags: [],
    });
    onClose();
    setForm({ title: '', author: '', isbn: '', genre: 'Science Fiction', totalCopies: 3, publishYear: 2024, description: '', coverImageUrl: '' });
    setIsbnFound(false);
    setIsbnError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div
            className="card noise"
            initial={{ opacity: 0, scale: 0.87, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            style={{
              width: '100%', maxWidth: '640px',
              maxHeight: '90vh', overflowY: 'auto',
              borderColor: 'rgba(139,92,246,0.28)',
              boxShadow: '0 0 80px var(--violet-glow), 0 32px 64px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.75rem 2rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={20} style={{ color: 'var(--violet)' }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Add New Book</h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Enter ISBN to auto-fill details</p>
                </div>
              </div>
              <motion.button
                style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                onClick={onClose}
                whileHover={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)' }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Form body */}
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* ISBN with Auto-lookup */}
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 }}>
                <FieldLabel>ISBN (Auto-fill from database)</FieldLabel>
                <div style={{ display: 'flex', gap: '0.625rem' }}>
                  <input
                    className="input-field"
                    style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
                    placeholder="978-0-000-00000-0"
                    value={form.isbn}
                    onChange={e => set('isbn', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && lookupISBN(form.isbn)}
                  />
                  <motion.button
                    className="btn btn-violet btn-md"
                    style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                    onClick={() => lookupISBN(form.isbn)}
                    disabled={isbnLoading}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isbnLoading ? <Loader2 size={14} className="shimmer" /> : <Search size={14} />}
                    Lookup
                  </motion.button>
                </div>
                <AnimatePresence>
                  {isbnFound && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem', color: 'var(--emerald)', fontSize: '0.78rem' }}>
                      <CheckCircle2 size={13} /> Book details auto-filled from Open Library
                    </motion.div>
                  )}
                  {isbnError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: '0.5rem', color: 'var(--amber)', fontSize: '0.78rem' }}>
                      {isbnError}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Cover Image Preview */}
              {form.coverImageUrl && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <FieldLabel>Cover Preview</FieldLabel>
                  <img
                    src={form.coverImageUrl}
                    alt="Cover"
                    style={{ width: '100px', height: '150px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}
                  />
                </motion.div>
              )}

              {/* Title */}
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}>
                <FieldLabel>Book Title *</FieldLabel>
                <input className="input-field" placeholder="e.g. The Midnight Library" value={form.title} onChange={e => set('title', e.target.value)} />
              </motion.div>

              {/* Author + Year row */}
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <FieldLabel>Author *</FieldLabel>
                  <input className="input-field" placeholder="Author name" value={form.author} onChange={e => set('author', e.target.value)} />
                </div>
                <div>
                  <FieldLabel>Publish Year</FieldLabel>
                  <input type="number" className="input-field" value={form.publishYear} onChange={e => set('publishYear', parseInt(e.target.value) || 2024)} min={-3000} max={2030} />
                </div>
              </motion.div>

              {/* Genre */}
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.16 }}>
                <FieldLabel>Genre</FieldLabel>
                <select className="input-field" value={form.genre} onChange={e => set('genre', e.target.value as BookGenre)}>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </motion.div>

              {/* Copies stepper */}
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <FieldLabel>Total Copies</FieldLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <motion.button
                    style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    onClick={() => set('totalCopies', Math.max(1, form.totalCopies - 1))}
                    whileTap={{ scale: 0.85 }}
                  >
                    <Minus size={14} />
                  </motion.button>
                  <motion.span key={form.totalCopies} initial={{ scale: 1.4 }} animate={{ scale: 1 }}
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '2rem', color: 'var(--violet)', minWidth: '2.5ch', textAlign: 'center', lineHeight: 1 }}>
                    {form.totalCopies}
                  </motion.span>
                  <motion.button
                    style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    onClick={() => set('totalCopies', Math.min(50, form.totalCopies + 1))}
                    whileTap={{ scale: 0.85 }}
                  >
                    <Plus size={14} />
                  </motion.button>
                  <input
                    type="range" min={1} max={50} value={form.totalCopies}
                    onChange={e => set('totalCopies', parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--violet)' }}
                  />
                </div>
              </motion.div>

              {/* Description */}
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.24 }}>
                <FieldLabel>Description</FieldLabel>
                <textarea className="input-field" rows={3} placeholder="Brief synopsis or notes…" value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'none' }} />
              </motion.div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.875rem', padding: '1.5rem 2rem', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-ghost btn-md" onClick={onClose}>Cancel</button>
              <MorphButton
                label="Add to Collection"
                loadingLabel="Adding…"
                successLabel="Book Added!"
                variant="violet"
                size="md"
                onAction={handleSubmit}
                disabled={!form.title || !form.author}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
