import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showText?: boolean;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value, max, label, showText = true, height = 5,
}) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const barColor = pct === 0 ? 'var(--crimson)' : pct <= 35 ? 'var(--amber)' : 'var(--emerald)';
  const glowColor = pct === 0 ? 'rgba(239,68,68,0.5)' : pct <= 35 ? 'rgba(245,158,11,0.5)' : 'rgba(0,232,122,0.5)';

  return (
    <div style={{ width: '100%' }}>
      {(label || showText) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          {label && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</span>}
          {showText && (
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: barColor, marginLeft: 'auto' }}>
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div style={{ width: '100%', height, borderRadius: '99px', background: 'var(--surface-raised)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '100%', borderRadius: '99px',
            background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
            boxShadow: `0 0 8px ${glowColor}`,
          }}
        />
      </div>
    </div>
  );
};
