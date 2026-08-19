import React from 'react';
import { motion } from 'framer-motion';

interface NeonBadgeProps {
  variant: 'available' | 'unavailable' | 'overdue' | 'genre' | 'active';
  children: React.ReactNode;
  pulse?: boolean;
}

const styles: Record<NeonBadgeProps['variant'], React.CSSProperties> = {
  available:   { color: 'var(--emerald)', background: 'rgba(0,232,122,0.1)',  border: '1px solid rgba(0,232,122,0.22)' },
  unavailable: { color: 'var(--crimson)', background: 'rgba(239,68,68,0.1)',  border: '1px solid rgba(239,68,68,0.22)' },
  overdue:     { color: 'var(--amber)',   background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.22)' },
  genre:       { color: 'var(--violet)',  background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.22)' },
  active:      { color: 'var(--text-secondary)', background: 'var(--surface)', border: '1px solid var(--border)' },
};

export const NeonBadge: React.FC<NeonBadgeProps> = ({ variant, children, pulse = false }) => {
  return (
    <motion.span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
        padding: '0.3rem 0.75rem', borderRadius: '99px',
        fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-mono)',
        whiteSpace: 'nowrap',
        ...styles[variant],
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {pulse && (
        <span
          className="avail-pulse"
          style={{ width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
            background: variant === 'available' ? 'var(--emerald)' : variant === 'unavailable' ? 'var(--crimson)' : variant === 'overdue' ? 'var(--amber)' : 'var(--violet)',
          }}
        />
      )}
      {children}
    </motion.span>
  );
};
