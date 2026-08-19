import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { useLibraryStore } from '../../../store/libraryStore';

export const AvailableNowView: React.FC = () => {
  const { getAvailableByGenre } = useLibraryStore();
  const genreGroups = getAvailableByGenre();
  const groupsArray = Object.values(genreGroups);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="section-py"
      style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}
    >
      {groupsArray.map((group, idx) => (
        <div key={group.genre}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 className="display-sm" style={{ margin: '0 0 0.25rem 0' }}>{group.genre}</h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                {group.totalAvailable} of {group.totalCopies} copies available
              </p>
            </div>
          </div>
          
          <div className="books-grid-admin">
            {group.books.map((book, bIdx) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: bIdx * 0.05 }}
                className="card"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ 
                  height: '160px', 
                  background: `hsl(${book.coverHue}, 70%, 15%)`,
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: `hsl(${book.coverHue}, 70%, 80%)`
                }}>
                  <BookOpen size={48} opacity={0.5} />
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{book.title}</h3>
                <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{book.author}</p>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-emerald">{book.availableCopies} available</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ISBN: {book.isbn}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {groupsArray.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
          <p>No books available at the moment.</p>
        </div>
      )}
    </motion.div>
  );
};
