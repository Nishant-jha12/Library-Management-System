import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibraryStore } from '../../store/libraryStore';
import { MetricCard } from './MetricCard';
import { BookAdminCard } from './BookAdminCard';
import { AddBookModal } from './AddBookModal';
import { AddStudentModal } from './AddStudentModal';
import { PendingVerifications } from './PendingVerifications';
import { AvailableNowView } from './views/AvailableNowView';
import { CurrentlyIssuedView } from './views/CurrentlyIssuedView';
import { OverdueReturnsView } from './views/OverdueReturnsView';
import { TotalInventoryView } from './views/TotalInventoryView';
import {
  Library, BookOpen, Users, AlertTriangle, TrendingUp,
  Plus, Search, SlidersHorizontal, X, BookMarked, BarChart3,
  UserPlus, ShieldCheck
} from 'lucide-react';

const GENRES = ['All','Science Fiction','Philosophy','Computer Science','Mathematics','Literature','History','Physics','Biology','Psychology','Art & Design'];

type MetricView = 'available' | 'issued' | 'overdue' | 'inventory' | null;

export const LibrarianDashboard: React.FC = () => {
  const { getFilteredBooks, getMetrics, setSearchQuery, setSelectedGenre, searchQuery, selectedGenre } = useLibraryStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [activeGenreFilter, setActiveGenreFilter] = useState('All');
  const [activeMetricView, setActiveMetricView] = useState<MetricView>(null);

  const metrics = getMetrics();
  const books = getFilteredBooks();

  const handleGenre = (g: string) => {
    setActiveGenreFilter(g);
    setSelectedGenre(g as any);
  };

  const toggleMetric = (view: MetricView) => {
    setActiveMetricView(prev => prev === view ? null : view);
  };

  return (
    <div style={{ background: 'var(--obsidian)', minHeight: '100vh' }}>

      {/* ══════════ HERO HEADER ══════════ */}
      <section style={{ position: 'relative', background: 'var(--charcoal)', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.6 }} />
        <div className="diagonal-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, var(--violet-glow) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, var(--emerald-glow) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="site-container section-py" style={{ position: 'relative', zIndex: 1 }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Library size={20} style={{ color: 'var(--violet)' }} />
                </div>
                <span className="label-sm" style={{ color: 'var(--violet)' }}>Librarian Console</span>
              </div>
              <h1 className="display-xl" style={{ color: 'var(--text-primary)', marginBottom: '0.875rem' }}>Collection Overview</h1>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: 1.6 }}>
                Manage, curate, and track every title in the digital sanctuary.
              </p>
            </motion.div>

            <motion.div
              style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', flexWrap: 'wrap' }}
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.45 }}
            >
              <motion.button className="btn btn-violet btn-lg" onClick={() => setShowAddModal(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Plus size={18} /> Add New Book
              </motion.button>
              <motion.button className="btn btn-emerald btn-lg" onClick={() => setShowStudentModal(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <UserPlus size={18} /> Register Student
              </motion.button>
            </motion.div>
          </div>

          {/* CLICKABLE METRICS */}
          <div className="metrics-grid">
            <div onClick={() => toggleMetric('available')} style={{ cursor: 'pointer' }}>
              <MetricCard icon={BookOpen} label="Available Now" value={metrics.availableCount} subtext="Click to view by category" color="emerald" delay={0.08}
                active={activeMetricView === 'available'} />
            </div>
            <div onClick={() => toggleMetric('issued')} style={{ cursor: 'pointer' }}>
              <MetricCard icon={TrendingUp} label="Currently Issued" value={metrics.issuedCount} subtext="Click to view details" color="violet" delay={0.16}
                active={activeMetricView === 'issued'} />
            </div>
            <div onClick={() => toggleMetric('overdue')} style={{ cursor: 'pointer' }}>
              <MetricCard icon={AlertTriangle} label="Overdue Returns" value={metrics.overdueCount} subtext="Click to view overdue" color="amber" delay={0.24}
                active={activeMetricView === 'overdue'} />
            </div>
            <div onClick={() => toggleMetric('inventory')} style={{ cursor: 'pointer' }}>
              <MetricCard icon={Users} label="Total Inventory" value={metrics.totalBooks} subtext="Click to view full inventory" color="crimson" delay={0.32}
                active={activeMetricView === 'inventory'} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ METRIC DRILL-DOWN VIEW ══════════ */}
      <AnimatePresence mode="wait">
        {activeMetricView && (
          <motion.section
            key={activeMetricView}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden', borderBottom: '1px solid var(--border)', background: 'var(--charcoal)' }}
          >
            <div className="site-container section-py">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 className="display-md" style={{ color: 'var(--text-primary)' }}>
                  {activeMetricView === 'available' && '📚 Available Inventory by Category'}
                  {activeMetricView === 'issued' && '📖 Currently Issued Books'}
                  {activeMetricView === 'overdue' && '⚠️ Overdue Returns'}
                  {activeMetricView === 'inventory' && '🗄️ Full Inventory Breakdown'}
                </h2>
                <motion.button className="btn btn-ghost btn-sm" onClick={() => setActiveMetricView(null)} whileTap={{ scale: 0.95 }}>
                  <X size={14} /> Close
                </motion.button>
              </div>
              {activeMetricView === 'available' && <AvailableNowView />}
              {activeMetricView === 'issued' && <CurrentlyIssuedView />}
              {activeMetricView === 'overdue' && <OverdueReturnsView />}
              {activeMetricView === 'inventory' && <TotalInventoryView />}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ══════════ PENDING VERIFICATIONS ══════════ */}
      <PendingVerifications />

      {/* ══════════ CATALOGUE SECTION ══════════ */}
      <section className="section-py">
        <div className="site-container">
          <motion.div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.45 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <BookMarked size={20} style={{ color: 'var(--violet)' }} />
              <h2 className="display-md" style={{ color: 'var(--text-primary)' }}>Book Catalogue</h2>
              <motion.span key={books.length} initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="badge badge-violet">{books.length} titles</motion.span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{metrics.availableCount} of {metrics.totalBooks} copies available</span>
            </div>
          </motion.div>

          {/* Search & Filter */}
          <motion.div style={{ marginBottom: '2rem' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '0' }}>
                <Search size={17} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input className="input-field" style={{ paddingLeft: '3rem', paddingRight: searchQuery ? '3rem' : '1.125rem' }}
                  placeholder="Search by title, author, or ISBN..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                      style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                      onClick={() => setSearchQuery('')}><X size={15} /></motion.button>
                  )}
                </AnimatePresence>
              </div>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <SlidersHorizontal size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <select className="input-field" style={{ paddingLeft: '2.75rem', paddingRight: '2rem', minWidth: '180px', cursor: 'pointer' }}
                  value={selectedGenre} onChange={(e) => handleGenre(e.target.value)}>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              {GENRES.map(genre => {
                const active = activeGenreFilter === genre;
                return (
                  <motion.button key={genre} onClick={() => handleGenre(genre)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    style={{ padding: '0.4rem 0.9rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                      border: active ? '1px solid rgba(139,92,246,0.4)' : '1px solid var(--border)',
                      background: active ? 'rgba(139,92,246,0.12)' : 'transparent',
                      color: active ? 'var(--violet)' : 'var(--text-muted)', transition: 'all 0.2s ease' }}>
                    {genre}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Books Grid */}
          <motion.div layout className="books-grid-admin">
            <AnimatePresence mode="popLayout">
              {books.map((book, i) => <BookAdminCard key={book.id} book={book} index={i} />)}
            </AnimatePresence>
          </motion.div>

          {books.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '6rem 0' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Search size={28} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No books found</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Try adjusting your search or genre filter</p>
            </motion.div>
          )}
        </div>
      </section>

      <AddBookModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <AddStudentModal isOpen={showStudentModal} onClose={() => setShowStudentModal(false)} />
    </div>
  );
};
