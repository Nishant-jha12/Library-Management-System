import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, IndianRupee } from 'lucide-react';
import { useLibraryStore } from '../../../store/libraryStore';

export const OverdueReturnsView: React.FC = () => {
  const { getOverdueRecords } = useLibraryStore();
  const overdueRecords = getOverdueRecords();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--crimson)', borderRadius: '12px' }}>
          <AlertTriangle size={24} />
        </div>
        <div>
          <h2 className="display-sm" style={{ margin: 0 }}>Overdue Returns</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Books past their due date requiring action</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {overdueRecords.map((record, idx) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="card"
            style={{ 
              padding: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderLeft: '4px solid var(--crimson)',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ flex: '1 1 300px' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{record.bookTitle}</h3>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>
                Borrower: {record.studentName}
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Issued: {new Date(record.issuedAt).toLocaleDateString()}</span>
                <span>Due: {new Date(record.dueDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--crimson)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                  {record.daysOverdue} days late
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', color: 'var(--amber)', fontSize: '0.9rem' }}>
                  <IndianRupee size={14} />
                  <span>{record.fine} fine</span>
                </div>
              </div>
              <button className="btn" style={{ background: 'var(--surface-raised)', color: 'var(--text-primary)' }}>
                Send Reminder
              </button>
            </div>
          </motion.div>
        ))}

        {overdueRecords.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--emerald)' }}>
            <AlertTriangle size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
            <p style={{ fontSize: '1.1rem' }}>No overdue books! Everyone is on time.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
