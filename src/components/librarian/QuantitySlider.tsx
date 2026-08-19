import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface QuantitySliderProps {
  bookId: string;
  value: number;
  onChange: (val: number) => void;
}

export const QuantitySlider: React.FC<QuantitySliderProps> = ({ bookId: _bookId, value, onChange }) => {
  const MAX = 20;
  const pct = (value / MAX) * 100;
  const trackColor = pct <= 30 ? 'var(--amber)' : pct >= 65 ? 'var(--emerald)' : 'var(--violet)';
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(value));

  const commitInput = () => {
    const parsed = parseInt(inputVal);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= MAX) {
      onChange(parsed);
    }
    setInputVal(String(value));
    setEditing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Value display */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Copies</span>
        {editing ? (
          <input
            autoFocus
            type="number"
            min={1}
            max={MAX}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={commitInput}
            onKeyDown={(e) => { if (e.key === 'Enter') commitInput(); if (e.key === 'Escape') { setInputVal(String(value)); setEditing(false); } }}
            style={{
              width: '4ch', fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '2rem', color: trackColor, lineHeight: 1,
              background: 'var(--surface)', border: `1px solid ${trackColor}`,
              borderRadius: '8px', textAlign: 'center', outline: 'none',
              padding: '0.25rem',
            }}
          />
        ) : (
          <motion.span
            key={value}
            initial={{ scale: 1.5, color: 'var(--violet)' }}
            animate={{ scale: 1, color: trackColor }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '2rem', lineHeight: 1, cursor: 'pointer' }}
            onClick={() => { setInputVal(String(value)); setEditing(true); }}
            title="Click to type a number"
          >
            {value}
          </motion.span>
        )}
      </div>

      {/* Slider track visual */}
      <div style={{ position: 'relative' }}>
        <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--surface-raised)' }}>
          <motion.div
            animate={{ width: `${pct}%`, background: trackColor }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{ height: '100%', borderRadius: '3px', boxShadow: `0 0 10px ${trackColor}80` }}
          />
        </div>
        <input
          type="range" min={1} max={MAX} value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', height: '100%' }}
        />
        <motion.div
          animate={{ left: `calc(${pct}% - 11px)`, background: trackColor }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            width: '22px', height: '22px', borderRadius: '50%',
            border: '3px solid var(--obsidian)',
            boxShadow: `0 0 16px ${trackColor}`,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        <span>Min: 1</span>
        <span style={{ opacity: 0.55 }}>Drag slider or click number to type</span>
        <span>Max: {MAX}</span>
      </div>
    </div>
  );
};
