import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { ButtonState } from '../../types';

interface MorphButtonProps {
  label: string;
  loadingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  variant?: 'emerald' | 'violet' | 'ghost' | 'crimson';
  size?: 'sm' | 'md' | 'lg';
  onAction: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const variantStyles: Record<string, React.CSSProperties> = {
  emerald: { background: 'linear-gradient(135deg, var(--emerald), var(--emerald-dim))', color: '#030a06', border: 'none' },
  violet:  { background: 'linear-gradient(135deg, var(--violet), var(--violet-dim))',   color: '#ffffff',  border: 'none' },
  ghost:   { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
  crimson: { background: 'var(--crimson)', color: '#ffffff', border: 'none' },
  success: { background: 'linear-gradient(135deg, var(--emerald), var(--emerald-dim))', color: '#030a06', border: 'none' },
  error:   { background: 'var(--crimson)', color: '#ffffff', border: 'none' },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '0.5rem 1rem',   fontSize: '0.8rem'  },
  md: { padding: '0.75rem 1.5rem', fontSize: '0.875rem' },
  lg: { padding: '1rem 2rem',     fontSize: '1rem'    },
};

export const MorphButton: React.FC<MorphButtonProps> = ({
  label, loadingLabel = 'Processing…', successLabel = 'Done!', errorLabel = 'Failed',
  variant = 'emerald', size = 'md', onAction, disabled = false, className = '',
}) => {
  const [state, setState] = useState<ButtonState>('idle');

  const handleClick = async () => {
    if (state !== 'idle' || disabled) return;
    setState('loading');
    try {
      await onAction();
      setState('success');
      setTimeout(() => setState('idle'), 2500);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2500);
    }
  };

  const currentVariant = state === 'success' ? 'success' : state === 'error' ? 'error' : variant;

  const content: Record<ButtonState, React.ReactNode> = {
    idle:    <span key="idle">{label}</span>,
    loading: <span key="loading" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ display: 'flex' }}>
                 <Loader2 size={14} />
               </motion.span>
               {loadingLabel}
             </span>,
    success: <span key="success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={14} strokeWidth={2.5} />{successLabel}</span>,
    error:   <span key="error"   style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={14} />{errorLabel}</span>,
  };

  return (
    <motion.button
      layout
      className={`btn ${className}`}
      style={{
        ...variantStyles[currentVariant],
        ...sizeStyles[size],
        fontWeight: 600,
        borderRadius: '12px',
        cursor: state !== 'idle' || disabled ? 'not-allowed' : 'pointer',
        opacity: disabled && state === 'idle' ? 0.45 : 1,
        transition: 'box-shadow 0.25s ease, transform 0.15s ease',
      }}
      onClick={handleClick}
      disabled={state !== 'idle' || disabled}
      whileTap={{ scale: 0.96 }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 8, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.88 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {content[state]}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};
