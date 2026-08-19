import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';
import { IssueReturnFlow } from './IssueReturnFlow';
import { useLibraryStore } from '../../store/libraryStore';
import { BookOpen, Star, Eye } from 'lucide-react';

interface BookCardProps {
  book: Book;
  index: number;
}

function generateBookCover(hue: number, title: string, author: string) {
  const words = title.split(' ').slice(0, 4);
  const w = 220, h = 310;
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs>
        <linearGradient id="m${hue}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${hue},55%,13%)"/>
          <stop offset="50%" stop-color="hsl(${(hue+30)%360},45%,9%)"/>
          <stop offset="100%" stop-color="hsl(${(hue+60)%360},35%,6%)"/>
        </linearGradient>
        <linearGradient id="sp${hue}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="hsl(${hue},80%,55%)" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="hsl(${hue},80%,38%)" stop-opacity="0.6"/>
        </linearGradient>
        <linearGradient id="ov${hue}" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="hsl(${hue},70%,60%)" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="transparent"/>
        </linearGradient>
        <filter id="bl${hue}"><feGaussianBlur stdDeviation="16"/></filter>
        <filter id="bl2${hue}"><feGaussianBlur stdDeviation="6"/></filter>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#m${hue})" rx="8"/>
      <!-- Atmospheric orbs -->
      <circle cx="${w*0.75}" cy="${h*0.25}" r="72" fill="hsl(${hue},80%,55%)" opacity="0.13" filter="url(#bl${hue})"/>
      <circle cx="${w*0.2}" cy="${h*0.75}" r="50" fill="hsl(${(hue+120)%360},70%,50%)" opacity="0.08" filter="url(#bl${hue})"/>
      <!-- Spine -->
      <rect x="0" y="0" width="9" height="${h}" fill="url(#sp${hue})" rx="4"/>
      <!-- Decorative rings -->
      <circle cx="${w/2}" cy="${h*0.42}" r="60" fill="none" stroke="hsl(${hue},60%,55%)" stroke-width="1" opacity="0.15"/>
      <circle cx="${w/2}" cy="${h*0.42}" r="44" fill="none" stroke="hsl(${hue},60%,55%)" stroke-width="0.6" opacity="0.1"/>
      <!-- Horizontal rules -->
      <line x1="22" y1="48" x2="${w-22}" y2="48" stroke="hsl(${hue},50%,55%)" stroke-width="0.6" opacity="0.22"/>
      <line x1="22" y1="${h-52}" x2="${w-22}" y2="${h-52}" stroke="hsl(${hue},50%,55%)" stroke-width="0.6" opacity="0.22"/>
      <!-- Top gradient wash -->
      <rect width="${w}" height="80" fill="url(#ov${hue})"/>
      <!-- Title words -->
      ${words.map((word, i) => `
        <text x="${w/2}" y="${h*0.42 - (words.length * 12) + i * 24 - 10}"
          text-anchor="middle" font-size="16" font-weight="700"
          fill="hsl(${hue},70%,83%)" font-family="Georgia,serif" letter-spacing="0.3"
        >${word.slice(0,12)}</text>
      `).join('')}
      <!-- Author -->
      <text x="${w/2}" y="${h-62}" text-anchor="middle" font-size="10"
        fill="hsl(${hue},40%,60%)" font-family="sans-serif" letter-spacing="1.5"
        font-weight="500">${author.toUpperCase().slice(0,20)}</text>
      <!-- Bottom deco bar -->
      <rect x="${w/2-28}" y="${h-48}" width="56" height="1.5" fill="hsl(${hue},65%,55%)" opacity="0.35" rx="1"/>
    </svg>
  `)}`;
}

export const BookCard: React.FC<BookCardProps> = ({ book, index }) => {
  const { loggedInStudentId, students } = useLibraryStore();
  const [showFlow, setShowFlow] = useState(false);
  const [hovered, setHovered] = useState(false);

  const student = students.find(s => s.id === loggedInStudentId);
  const isIssued = student?.issuedBooks.includes(book.id) ?? false;
  const isAvailable = book.availableCopies > 0;

  const statusColor = isIssued ? 'var(--violet)' : isAvailable ? 'var(--emerald)' : 'var(--crimson)';
  const btnLabel   = isIssued ? 'Return Book' : isAvailable ? 'Issue Book' : 'Unavailable';
  const btnClass   = isIssued ? 'btn-violet' : isAvailable ? 'btn-emerald' : '';

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 36, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.88 }}
        transition={{ duration: 0.48, delay: Math.min(index * 0.045, 0.6), ease: [0.16, 1, 0.3, 1] }}
        style={{ cursor: 'pointer' }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => setShowFlow(true)}
      >
        <motion.div
          className="card noise"
          style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
          whileHover={{ y: -8, scale: 1.02, boxShadow: `0 0 40px ${statusColor}25, 0 20px 50px rgba(0,0,0,0.4)`, borderColor: `${statusColor}35` }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        >
          {/* ── COVER ── */}
          <div style={{ position: 'relative', overflow: 'hidden', height: '240px', flexShrink: 0 }}>
            <motion.img
              src={generateBookCover(book.coverHue, book.title, book.author)}
              alt={book.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              animate={{ scale: hovered ? 1.06 : 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Gradient overlay always */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(8,10,15,0.9) 0%, rgba(8,10,15,0.15) 50%, transparent 100%)',
            }} />

            {/* Hover: expand info overlay */}
            <motion.div
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: '1.25rem',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <ProgressBar value={book.availableCopies} max={book.totalCopies} height={5} label="Availability" />
              <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.625rem', lineHeight: 1.5 }}>
                {book.description.slice(0, 90)}…
              </p>
            </motion.div>

            {/* Status badge */}
            <div style={{ position: 'absolute', top: '0.875rem', right: '0.875rem' }}>
              <span className={`badge ${isIssued ? 'badge-violet' : isAvailable ? 'badge-emerald' : 'badge-crimson'}`}>
                <span className="avail-pulse" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
                {isIssued ? 'Issued' : isAvailable ? `${book.availableCopies} left` : 'Out'}
              </span>
            </div>

            {/* Genre top-left */}
            <div style={{ position: 'absolute', top: '0.875rem', left: '0.875rem' }}>
              <span style={{
                fontSize: '0.68rem', fontFamily: 'var(--font-mono)',
                color: 'rgba(255,255,255,0.5)',
                background: 'rgba(8,10,15,0.65)',
                padding: '0.2rem 0.5rem', borderRadius: '6px',
                backdropFilter: 'blur(4px)',
              }}>
                {book.genre.split(' ')[0]}
              </span>
            </div>

            {/* Eye icon center on hover */}
            <motion.div
              style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.6 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Eye size={18} style={{ color: 'white' }} />
            </motion.div>
          </div>

          {/* ── BOOK INFO ── */}
          <div style={{ padding: '1rem 1.125rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: '0.3rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {book.title}
            </h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{book.author}</p>

            {/* Action button */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
              <motion.button
                className={`btn btn-sm ${btnClass || 'btn-ghost'}`}
                style={{
                  flex: 1,
                  opacity: !isIssued && !isAvailable ? 0.45 : 1,
                  cursor: !isIssued && !isAvailable ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                }}
                onClick={(e) => { e.stopPropagation(); setShowFlow(true); }}
                whileTap={isAvailable || isIssued ? { scale: 0.95 } : {}}
              >
                <BookOpen size={12} />
                {btnLabel}
              </motion.button>
              <motion.button
                style={{
                  width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
                whileHover={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', color: 'var(--amber)' }}
                whileTap={{ scale: 0.85 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Star size={12} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <IssueReturnFlow
        book={book}
        isOpen={showFlow}
        onClose={() => setShowFlow(false)}
        isIssued={isIssued}
      />
    </>
  );
};
