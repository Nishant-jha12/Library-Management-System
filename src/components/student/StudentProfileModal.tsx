import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, User, Phone, BookOpen, AlertCircle } from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';
import { MorphButton } from '../ui/MorphButton';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ isOpen, onClose }) => {
  const { loggedInStudentId, students, getStudentIssuedRecords, updateStudentProfile } = useLibraryStore();
  
  const student = students.find(s => s.id === loggedInStudentId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [phone, setPhone] = useState(student?.phone || '');
  const [photoUrl, setPhotoUrl] = useState(student?.photoUrl || '');
  const [isHoveringPhoto, setIsHoveringPhoto] = useState(false);

  useEffect(() => {
    if (student) {
      setPhone(student.phone);
      setPhotoUrl(student.photoUrl);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const activeRecords = getStudentIssuedRecords(student.id);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    await updateStudentProfile(student.id, { phone, photoUrl });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop" style={{
          position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card"
            style={{
              background: 'var(--surface)',
              width: '100%',
              maxWidth: '500px',
              borderRadius: '1rem',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h2 className="display-md" style={{ margin: 0, color: 'var(--text-primary)' }}>Student Profile</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '2rem 1.5rem', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                <div 
                  style={{ 
                    position: 'relative', 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '50%', 
                    overflow: 'hidden',
                    background: 'var(--obsidian)',
                    border: '4px solid var(--border)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => setIsHoveringPhoto(true)}
                  onMouseLeave={() => setIsHoveringPhoto(false)}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={60} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-muted)' }} />
                  )}
                  
                  <AnimatePresence>
                    {isHoveringPhoto && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}
                      >
                        <Upload size={24} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
                <p className="label-sm" style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', margin: '0.75rem 0 0 0' }}>Click to update photo</p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1, background: 'var(--surface-raised)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--emerald)', marginBottom: '0.5rem' }}>
                    <BookOpen size={18} />
                    <span style={{ fontWeight: 600 }}>Issued Books</span>
                  </div>
                  <span className="display-md" style={{ color: 'var(--text-primary)' }}>{activeRecords.length}</span>
                </div>
                
                <div style={{ flex: 1, background: 'var(--surface-raised)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: student.fines > 0 ? 'var(--crimson)' : 'var(--emerald)', marginBottom: '0.5rem' }}>
                    <AlertCircle size={18} />
                    <span style={{ fontWeight: 600 }}>Unpaid Fines</span>
                  </div>
                  <span className="display-md" style={{ color: 'var(--text-primary)' }}>${student.fines}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={student.name} 
                    readOnly 
                    className="input-field" 
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text-primary)', opacity: 0.7 }} 
                  />
                </div>
                
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Student ID</label>
                  <input 
                    type="text" 
                    value={student.studentId} 
                    readOnly 
                    className="input-field" 
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text-primary)', opacity: 0.7 }} 
                  />
                </div>
                
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field" 
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'var(--surface)', border: '1px solid var(--border-bright)', borderRadius: '0.5rem', color: 'var(--text-primary)' }} 
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--surface-raised)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={onClose}
                className="btn btn-ghost"
                style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', color: 'var(--text-primary)', background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <div style={{ width: '140px' }}>
                <MorphButton 
                  label="Save Changes" 
                  variant="emerald" 
                  onAction={handleSave} 
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
