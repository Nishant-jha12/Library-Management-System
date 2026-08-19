import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Phone, Lock, Hash } from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';
import { MorphButton } from '../ui/MorphButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStudentModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addStudent } = useLibraryStore();
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    phone: '',
    password: ''
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.studentId || !formData.password || !formData.phone) {
      throw new Error("All fields are required");
    }
    
    addStudent({
      name: formData.name,
      studentId: formData.studentId,
      phone: formData.phone,
      password: formData.password,
      photoUrl: '',
      issuedBooks: []
    });
    
    setTimeout(() => {
      onClose();
      setFormData({ name: '', studentId: '', phone: '', password: '' });
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="modal-backdrop"
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)'
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card"
            style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'var(--emerald)', borderRadius: '8px', color: 'var(--obsidian)' }}>
                  <UserPlus size={20} />
                </div>
                <h2 style={{ margin: 0 }}>Register Student</h2>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%' }}
                  placeholder="John Doe"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Student ID</label>
                  <div style={{ position: 'relative' }}>
                    <Hash size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="input-field"
                      value={formData.studentId}
                      onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                      style={{ width: '100%', paddingLeft: '2.25rem' }}
                      placeholder="S12345"
                    />
                  </div>
                </div>
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Phone</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="tel"
                      className="input-field"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', paddingLeft: '2.25rem' }}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    className="input-field"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    style={{ width: '100%', paddingLeft: '2.25rem' }}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem' }}>
              <button 
                onClick={onClose}
                className="btn"
                style={{ background: 'transparent', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <MorphButton
                label="Register Student"
                successLabel="Student Added!"
                errorLabel="Registration Failed"
                variant="emerald"
                onAction={handleSubmit}
                disabled={!formData.name || !formData.studentId || !formData.password || !formData.phone}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
