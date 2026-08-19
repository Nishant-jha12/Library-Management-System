import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibraryStore } from '../../store/libraryStore';
import { BookCard } from './BookCard';
import { ReturnBookPage } from './ReturnBookPage';
import { StudentProfileModal } from './StudentProfileModal';
import {
  BookOpen, Search, Filter, X, User,
  Clock, BookMarked, Sparkles, Star, RotateCcw, Settings
} from 'lucide-react';

const GENRES = ['All','Science Fiction','Computer Science','Mathematics','Literature','History','Physics','Biology','Psychology','Philosophy','Art & Design'];

type StudentTab = 'browse' | 'returns';

export const StudentPortal: React.FC = () => {
  const {
    getFilteredBooks, searchQuery, selectedGenre,
    setSearchQuery, setSelectedGenre,
    loggedInStudentId, students,
    getStudentIssuedBooks,
    studentNotifications, dismissStudentNotification
  } = useLibraryStore();

  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<StudentTab>('browse');
  const [showProfile, setShowProfile] = useState(false);

  const student = students.find(s => s.id === loggedInStudentId);
  const books = getFilteredBooks();
  const issuedBooks = loggedInStudentId ? getStudentIssuedBooks(loggedInStudentId) : [];

  return (
    <div style={{ background: 'var(--obsidian)', minHeight: '100vh' }}>

      {/* ══════════ HERO HEADER ══════════ */}
      <section style={{ position: 'relative', background: 'var(--charcoal)', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.45 }} />
        <div style={{ position: 'absolute', top: '-60px', right: '5%', width: '550px', height: '550px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,232,122,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '0', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="site-container" style={{ position: 'relative', zIndex: 1, paddingTop: '4rem', paddingBottom: '4rem' }}>

          {/* Top Info Bar */}
          <motion.div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookMarked size={20} style={{ color: 'var(--emerald)' }} />
              </div>
              <span className="label-sm" style={{ color: 'var(--emerald)' }}>Student Portal</span>
            </div>

            {/* Clickable Student Info → opens profile */}
            <motion.button
              onClick={() => setShowProfile(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1.125rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer' }}
              whileHover={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(0,232,122,0.3)' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--emerald-dim), var(--emerald))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {student?.photoUrl ? (
                  <img src={student.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={15} color="#030a06" />
                )}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{student?.name}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{student?.studentId} · {issuedBooks.length} books issued</p>
              </div>
              <Settings size={14} style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }} />
            </motion.button>
          </motion.div>

          {/* Headline */}
          <div style={{ display: 'flex', gap: '4rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <motion.div style={{ flex: '1 1 400px' }} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                <Sparkles size={16} style={{ color: 'var(--emerald)' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Welcome back, <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>{student?.name.split(' ')[0]}</span>
                </span>
              </div>
              <h1 className="display-xl" style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Discover Your<br /><span style={{ color: 'var(--emerald)' }}>Next Read</span>
              </h1>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '460px' }}>
                Browse {books.length} titles across every genre. Issue books, track your loans, and manage returns.
              </p>
            </motion.div>

            {/* Stats mini */}
            <motion.div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingBottom: '0.25rem' }}
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              {[
                { label: 'Books Issued', value: issuedBooks.length, color: 'var(--violet)' },
                { label: 'Available', value: books.filter(b => b.availableCopies > 0).length, color: 'var(--emerald)' },
                { label: 'Unpaid Fines', value: `₹${student?.fines ?? 0}`, color: student?.fines ? 'var(--crimson)' : 'var(--emerald)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '16px', textAlign: 'center', minWidth: '110px' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '2rem', color, lineHeight: 1, letterSpacing: '-0.04em' }}>{value}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ TAB NAVIGATION ══════════ */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--charcoal)' }}>
        <div className="site-container" style={{ display: 'flex', gap: '0' }}>
          {[
            { id: 'browse' as const, label: 'Browse Collection', icon: BookOpen },
            { id: 'returns' as const, label: 'Return Books', icon: RotateCcw },
          ].map(tab => {
            const active = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                  background: 'transparent',
                  border: 'none', borderBottom: active ? '2px solid var(--emerald)' : '2px solid transparent',
                  color: active ? 'var(--emerald)' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}
                whileHover={{ color: active ? 'var(--emerald)' : 'var(--text-secondary)' }}
              >
                <tab.icon size={16} />
                {tab.label}
                {tab.id === 'returns' && issuedBooks.length > 0 && (
                  <span style={{ padding: '0.1rem 0.45rem', borderRadius: '99px', background: 'rgba(139,92,246,0.1)', color: 'var(--violet)', fontSize: '0.7rem', fontWeight: 700, border: '1px solid rgba(139,92,246,0.2)' }}>
                    {issuedBooks.length}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ══════════ TAB CONTENT ══════════ */}
      <AnimatePresence mode="wait">
        {activeTab === 'returns' ? (
          <motion.div key="returns" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
            <ReturnBookPage />
          </motion.div>
        ) : (
          <motion.div key="browse" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3 }}>

            {/* Issued Books Band */}
            {issuedBooks.length > 0 && (
              <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--charcoal)', padding: '2.5rem 0' }}>
                <div className="site-container">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <BookOpen size={17} style={{ color: 'var(--violet)' }} />
                      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-secondary)' }}>Currently in Your Hands</h2>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', background: 'rgba(139,92,246,0.1)', color: 'var(--violet)', border: '1px solid rgba(139,92,246,0.2)', fontSize: '0.75rem', fontWeight: 600 }}>{issuedBooks.length}</span>
                    </div>
                    <motion.button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('returns')} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <RotateCcw size={13} /> Return a Book
                    </motion.button>
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {issuedBooks.map((book, i) => (
                      <motion.div key={book.id} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        style={{ flexShrink: 0, minWidth: '280px', maxWidth: '320px', padding: '1.25rem 1.5rem', background: 'var(--surface)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                          <div className="avail-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--violet)', flexShrink: 0, marginTop: '5px' }} />
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{book.title}</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{book.author}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Clock size={12} style={{ color: 'var(--amber)' }} />
                              <span style={{ fontSize: '0.72rem', color: 'var(--amber)' }}>Due in 14 days</span>
                              <span style={{ marginLeft: 'auto', padding: '0.2rem 0.5rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{book.genre.split(' ')[0]}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Discovery Section */}
            <section className="section-py">
              <div className="site-container">
                <motion.div style={{ marginBottom: '2.5rem' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Star size={18} style={{ color: 'var(--amber)' }} />
                      <h2 className="display-md" style={{ color: 'var(--text-primary)' }}>Browse Collection</h2>
                    </div>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', background: 'var(--surface-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 600 }}>{books.length} titles</span>
                    <motion.button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowFilters(!showFilters)} whileTap={{ scale: 0.96 }}>
                      <Filter size={14} />{showFilters ? 'Hide Filters' : 'Show Filters'}
                    </motion.button>
                  </div>

                  {/* Search */}
                  <div style={{ position: 'relative', maxWidth: '600px', marginBottom: '1.25rem' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1.125rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input className="input-field" style={{ paddingLeft: '3.25rem', paddingRight: searchQuery ? '3.25rem' : '1.125rem', fontSize: '0.95rem' }}
                      placeholder="Search titles, authors…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <AnimatePresence>
                      {searchQuery && (
                        <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                          style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                          onClick={() => setSearchQuery('')}><X size={16} /></motion.button>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Genre filters */}
                  <AnimatePresence>
                    {showFilters && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
                          {GENRES.map(genre => {
                            const active = selectedGenre === genre;
                            return (
                              <motion.button key={genre} onClick={() => setSelectedGenre(genre as any)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                style={{ padding: '0.45rem 1rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                  border: active ? '1px solid rgba(0,232,122,0.4)' : '1px solid var(--border)',
                                  background: active ? 'rgba(0,232,122,0.1)' : 'transparent',
                                  color: active ? 'var(--emerald)' : 'var(--text-muted)', transition: 'all 0.2s ease' }}>
                                {genre}
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Book Grid */}
                <motion.div layout className="books-grid-student">
                  <AnimatePresence mode="popLayout">
                    {books.map((book, i) => <BookCard key={book.id} book={book} index={i} />)}
                  </AnimatePresence>
                </motion.div>

                {books.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '6rem 0' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '22px', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                      <Search size={32} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '0.625rem' }}>Nothing found</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Try a different search or reset your genre filter</p>
                    <button className="btn btn-ghost btn-md" style={{ marginTop: '1.5rem' }} onClick={() => { setSearchQuery(''); setSelectedGenre('All'); }}>Clear Search</button>
                  </motion.div>
                )}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <AnimatePresence>
          {studentNotifications.filter(n => n.studentId === loggedInStudentId).map(notification => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.3, type: 'spring', bounce: 0.4 }}
              style={{
                background: 'var(--emerald-dim)',
                border: '1px solid var(--emerald)',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                maxWidth: '400px'
              }}
            >
              <div style={{ background: 'var(--emerald)', padding: '0.4rem', borderRadius: '50%', color: 'var(--obsidian)' }}>
                <Sparkles size={16} />
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>{notification.message}</p>
              <button
                onClick={() => dismissStudentNotification(notification.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem', marginLeft: 'auto' }}
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Profile Modal */}
      <StudentProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
};
