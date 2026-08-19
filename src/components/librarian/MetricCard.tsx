import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  subtext?: string;
  color: 'emerald' | 'violet' | 'amber' | 'crimson';
  delay?: number;
  active?: boolean;
}

const colorMap = {
  emerald: { text: 'var(--emerald)', glow: 'var(--emerald-glow)', bg: 'rgba(0,232,122,0.07)', border: 'rgba(0,232,122,0.18)' },
  violet:  { text: 'var(--violet)',  glow: 'var(--violet-glow)',  bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.22)' },
  amber:   { text: 'var(--amber)',   glow: 'var(--amber-glow)',   bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)' },
  crimson: { text: 'var(--crimson)', glow: 'var(--crimson-glow)', bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.17)' },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon, label, value, suffix = '', subtext, color, delay = 0, active = false,
}) => {
  const c = colorMap[color];
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!countRef.current) return;
    const duration = 1400;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(value * eased);
      if (countRef.current) countRef.current.textContent = `${current}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };

    const timeout = setTimeout(() => requestAnimationFrame(tick), delay * 1000);
    return () => clearTimeout(timeout);
  }, [value, suffix, delay]);

  return (
    <motion.div
      className="noise"
      style={{
        background: 'var(--charcoal)',
        border: `1px solid ${active ? c.text : c.border}`,
        borderRadius: '20px',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: active ? `0 0 30px ${c.glow}, 0 4px 20px rgba(0,0,0,0.2)` : 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, boxShadow: `0 0 40px ${c.glow}, 0 12px 40px rgba(0,0,0,0.3)` }}
    >
      {/* Background radial */}
      <div style={{
        position: 'absolute', top: '-40px', right: '-40px',
        width: '140px', height: '140px', borderRadius: '50%',
        background: `radial-gradient(circle, ${c.bg} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon */}
        <motion.div
          style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: c.bg, border: `1px solid ${c.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.5rem',
          }}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon size={24} style={{ color: c.text }} />
        </motion.div>

        {/* Label */}
        <p className="label-sm" style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{label}</p>

        {/* Value */}
        <p className="metric-number" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: c.text, marginBottom: '0.5rem' }}>
          <span ref={countRef}>0{suffix}</span>
        </p>

        {/* Subtext */}
        {subtext && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{subtext}</p>
        )}
      </div>

      {/* Bottom glow line */}
      <div style={{
        position: 'absolute', bottom: 0, left: '2rem', right: '2rem',
        height: '1px',
        background: `linear-gradient(90deg, transparent, ${c.text}40, transparent)`,
      }} />
    </motion.div>
  );
};
