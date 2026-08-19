import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibraryStore } from '../../store/libraryStore';
import { Book } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';
import { QuantitySlider } from './QuantitySlider';
import { Trash2, Edit3, ChevronDown, BookOpen, Hash, Calendar } from 'lucide-react';

interface BookAdminCardProps {
  book: Book;
  index: number;
}

function bookSVG(hue: number, title: string): string {
  const words = title.split(' ').slice(0, 3);
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="180" viewBox="0 0 120 180">
      <defs>
        <linearGradient id="bg${hue}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${hue},60%,13%)"/>
          <stop offset="100%" stop-color="hsl(${(hue+45)%360},45%,7%)"/>
        </linearGradient>
        <linearGradient id="sp${hue}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="hsl(${hue},80%,55%)" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="hsl(${hue},80%,35%)" stop-opacity="0.5"/>
        </linearGradient>
        <filter id="gf${hue}"><feGaussianBlur stdDeviation="10"/></filter>
      </defs>
      <rect width="120" height="180" fill="url(#bg${hue})" rx="6"/>
      <rect x="0" y="0" width="7" height="180" fill="url(#sp${hue})"/>
      <circle cx="90" cy="35" r="40" fill="hsl(${hue},80%,50%)" opacity="0.1" filter="url(#gf${hue})"/>
      <line x1="18" y1="50" x2="108" y2="50" stroke="hsl(${hue},60%,50%)" stroke-width="0.5" opacity="0.25"/>
      <line x1="18" y1="140" x2="108" y2="140" stroke="hsl(${hue},60%,50%)" stroke-width="0.5" opacity="0.25"/>
      ${words.map((w, i) => `<text x="14" y="${80 + i * 20}" font-size="12" fill="hsl(${hue},65%,78%)" font-family="Georgia,serif" font-weight="600">${w.slice(0,10)}</text>`).join('')}
      <circle cx="94" cy="158" r="10" fill="hsl(${hue},80%,50%)" opacity="0.12"/>
    </svg>
  `)}`;
}

export const BookAdminCard: React.FC<BookAdminCardProps> = ({ book, index }) => {
  const { deleteBook, updateQuantity } = useLibraryStore();
  const [expanded, setExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isAvailable = book.availableCopies > 0;
  const availPct = book.totalCopies > 0 ? (book.availableCopies / book.totalCopies) * 100 : 0;
  const statusColor = availPct === 0 ? 'var(--crimson)' : availPct <= 40 ? 'var(--amber)' : 'var(--emerald)';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -12 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.5), ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="card noise"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        whileHover={{ y: -6, boxShadow: `0 0 40px ${statusColor}22, 0 16px 40px rgba(0,0,0,0.35)`, borderColor: `${statusColor}33` }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        {/* ── COVER + HEADER ── */}
        <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem 1.25rem 1rem' }}>
          <motion.img
            src={bookSVG(book.coverHue, book.title)}
            alt={book.title}
            style={{
              width: '58px', height: '88px', borderRadius: '8px',
              objectFit: 'cover', flexShrink: 0,
              boxShadow: `0 6px 24px hsl(${book.coverHue},50%,18%)`,
            }}
            whileHover={{ scale: 1.06, rotate: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '0.3rem' }}>
              {book.title}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.625rem' }}>{book.author}</p>

            {/* Availability badge */}
            <span className={`badge ${isAvailable ? 'badge-emerald' : 'badge-crimson'}`} style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
              <span className="avail-pulse" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
              {isAvailable ? `${book.availableCopies} of ${book.totalCopies} available` : 'All copies out'}
            </span>

            <ProgressBar value={book.availableCopies} max={book.totalCopies} height={4} showText={false} />
          </div>
        </div>

        {/* ── META ROW ── */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0 1.25rem 1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-violet">{book.genre}</span>
          <span className="badge badge-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar size={9} />{book.publishYear}
          </span>
          <span className="badge badge-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Hash size={9} />{book.isbn.slice(-6)}
          </span>
        </div>

        {/* ── DESCRIPTION ── */}
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55, padding: '0 1.25rem 1rem', flex: 1 }}>
          {book.description.slice(0, 100)}…
        </p>

        {/* ── ACTIONS ── */}
        <div style={{
          display: 'flex', gap: '0.5rem', padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border)', marginTop: 'auto',
        }}>
          <motion.button
            className="btn btn-ghost btn-sm"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}
            onClick={() => setExpanded(!expanded)}
            whileTap={{ scale: 0.95 }}
          >
            <Edit3 size={13} />
            Edit Inventory
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown size={12} />
            </motion.span>
          </motion.button>
          <motion.button
            style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
              color: 'var(--crimson)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setShowConfirm(true)}
            whileHover={{ background: 'rgba(239,68,68,0.18)', scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 size={14} />
          </motion.button>
        </div>

        {/* ── QUANTITY SLIDER ── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '1rem 1.25rem 1.25rem', borderTop: '1px solid var(--border)' }}>
                <p className="label-sm" style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Inventory Control</p>
                <QuantitySlider
                  bookId={book.id}
                  value={book.totalCopies}
                  onChange={(val) => updateQuantity(book.id, val)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── DELETE CONFIRM ── */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute', inset: 0, borderRadius: '20px',
                background: 'rgba(8,10,15,0.93)',
                backdropFilter: 'blur(8px)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '0.75rem', padding: '2rem', zIndex: 10,
              }}
            >
              <motion.div
                initial={{ scale: 0.8, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <Trash2 size={22} style={{ color: 'var(--crimson)' }} />
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Remove this book?</p>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  "{book.title}" will be permanently removed from the catalogue.
                </p>
                <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowConfirm(false)}>Cancel</button>
                  <button className="btn btn-crimson btn-sm" onClick={() => deleteBook(book.id)}>Remove Book</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
