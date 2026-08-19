import React from 'react';
import { motion } from 'framer-motion';
import { useLibraryStore } from '../../../store/libraryStore';
import { Database } from 'lucide-react';

export const TotalInventoryView: React.FC = () => {
  const { books } = useLibraryStore();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const totalCopies = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const totalAvailable = books.reduce((sum, b) => sum + b.availableCopies, 0);
  const totalIssued = totalCopies - totalAvailable;

  return (
    <div className="site-container section-py">
      <motion.div variants={container} initial="hidden" animate="show">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Database style={{ color: 'var(--violet)' }} size={32} />
          <h2 className="display-md" style={{ margin: 0, color: 'var(--text-primary)' }}>Total Inventory</h2>
        </div>

        <motion.div variants={item} className="card" style={{ 
          padding: '1.5rem', 
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-around',
          backgroundColor: 'var(--surface-raised)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="label-sm" style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>TOTAL BOOKS</div>
            <div className="metric-number" style={{ color: 'var(--text-primary)' }}>{books.length}</div>
          </div>
          <div style={{ width: '1px', backgroundColor: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div className="label-sm" style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>TOTAL COPIES</div>
            <div className="metric-number" style={{ color: 'var(--violet)' }}>{totalCopies}</div>
          </div>
          <div style={{ width: '1px', backgroundColor: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div className="label-sm" style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>AVAILABLE</div>
            <div className="metric-number" style={{ color: 'var(--emerald)' }}>{totalAvailable}</div>
          </div>
          <div style={{ width: '1px', backgroundColor: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div className="label-sm" style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ISSUED</div>
            <div className="metric-number" style={{ color: 'var(--amber)' }}>{totalIssued}</div>
          </div>
        </motion.div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', 
            padding: '1rem 1.5rem',
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            fontWeight: 600,
            color: 'var(--text-secondary)'
          }}>
            <div>Book Title</div>
            <div>Genre</div>
            <div style={{ textAlign: 'right' }}>Total Copies</div>
            <div style={{ textAlign: 'right' }}>Available</div>
            <div style={{ textAlign: 'right' }}>Issued</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {books.map((book, idx) => (
              <motion.div 
                key={book.id} 
                variants={item}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', 
                  padding: '1rem 1.5rem',
                  borderBottom: idx === books.length - 1 ? 'none' : '1px solid var(--border)',
                  backgroundColor: idx % 2 === 0 ? 'var(--obsidian)' : 'var(--surface)'
                }}
              >
                <div style={{ color: 'var(--text-primary)' }}>{book.title}</div>
                <div style={{ color: 'var(--text-muted)' }}>{book.genre}</div>
                <div style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{book.totalCopies}</div>
                <div style={{ textAlign: 'right', color: 'var(--emerald)' }}>{book.availableCopies}</div>
                <div style={{ textAlign: 'right', color: 'var(--amber)' }}>{book.totalCopies - book.availableCopies}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
