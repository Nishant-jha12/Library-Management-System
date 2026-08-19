import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User } from 'lucide-react';
import { useLibraryStore } from '../../../store/libraryStore';

export const CurrentlyIssuedView: React.FC = () => {
  const { getCurrentlyIssuedDetails } = useLibraryStore();
  const issuedDetails = getCurrentlyIssuedDetails();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="display-sm">Currently Issued</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Books currently out with students</p>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {issuedDetails.map((detail, idx) => (
          <motion.div
            key={detail.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="card"
            style={{ 
              padding: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ flex: '1 1 300px' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{detail.bookTitle}</h3>
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={14} />
                  {detail.studentName} ({detail.studentSid})
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={14} />
                  Issued: {new Date(detail.issuedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className={`badge ${detail.daysLeft < 0 ? 'badge-crimson' : detail.daysLeft < 3 ? 'badge-amber' : 'badge-emerald'}`}>
                {detail.daysLeft < 0 
                  ? `${Math.abs(detail.daysLeft)} days overdue` 
                  : `${detail.daysLeft} days left`}
              </span>
            </div>
          </motion.div>
        ))}

        {issuedDetails.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <p>No books are currently issued.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
