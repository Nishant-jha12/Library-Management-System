import React from 'react';
import { motion } from 'framer-motion';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'emerald' | 'violet' | 'amber' | 'crimson' | 'none';
  onClick?: () => void;
  layoutId?: string;
}

const glowClasses = {
  emerald: 'hover:glow-emerald hover:border-[rgba(0,232,122,0.25)]',
  violet: 'hover:glow-violet hover:border-[rgba(139,92,246,0.3)]',
  amber: 'hover:glow-amber hover:border-[rgba(245,158,11,0.25)]',
  crimson: 'hover:glow-crimson hover:border-[rgba(239,68,68,0.25)]',
  none: '',
};

export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  glowColor = 'none',
  onClick,
  layoutId,
}) => {
  return (
    <motion.div
      layout
      layoutId={layoutId}
      className={`card noise transition-all duration-300 ${glowClasses[glowColor]} ${className}`}
      whileHover={glowColor !== 'none' ? { y: -2 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
    </motion.div>
  );
};
