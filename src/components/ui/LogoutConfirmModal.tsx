import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div 
            className="card"
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{ width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}
          >
            <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', color: 'var(--crimson)', marginBottom: '1.5rem' }}>
              <LogOut size={32} />
            </div>
            
            <h2 className="display-md" style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Confirm Logout</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Do you really want to logout?
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <button 
                onClick={onConfirm}
                className="btn"
                style={{ background: 'var(--crimson)', color: '#fff', border: 'none', padding: '1rem', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer', width: '100%' }}
              >
                Yes, Logout
              </button>
              <button 
                onClick={onCancel}
                className="btn"
                style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer', width: '100%' }}
              >
                No, Stay
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
