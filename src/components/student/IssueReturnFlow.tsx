import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, AlertTriangle, Camera, Upload, CheckCircle } from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';
import { Book } from '../../types';

interface IssueReturnFlowProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  isIssued: boolean;
}

export const IssueReturnFlow: React.FC<IssueReturnFlowProps> = ({ book, isOpen, onClose, isIssued }) => {
  const store = useLibraryStore();
  const studentId = store.loggedInStudentId;
  const student = store.students.find(s => s.id === studentId);
  
  const [step, setStep] = useState<'info' | 'loading' | 'success'>('info');
  const [pin, setPin] = useState<string>('');
  const [damageDesc, setDamageDesc] = useState('');
  const [damagePhoto, setDamagePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !student) return null;

  const canIssue = store.canIssueBook(student.id);

  const handleIssue = async () => {
    if (!canIssue) return;
    setStep('loading');
    
    const result = await store.issueBook(book.id, student.id);
    if (result) {
      setPin(result.pin);
      setStep('success');
    } else {
      setStep('info');
    }
  };

  const handleDamagePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDamagePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitDamage = () => {
    if (damageDesc && pin) {
      // Find the issued record to get its ID
      const records = store.getStudentIssuedRecords(student.id);
      const record = records.find(r => r.bookId === book.id);
      if (record) {
        store.submitDamageReport(record.id, {
          description: damageDesc,
          photoUrl: damagePhoto || '',
          submittedAt: Date.now(),
        });
      }
      setDamageDesc('');
      setDamagePhoto(null);
    }
  };

  const miniCover = (
    <div style={{ width: '80px', height: '120px', backgroundColor: 'var(--amber)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <BookOpen size={32} color="var(--surface)" />
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-backdrop"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="card"
            style={{
              backgroundColor: 'var(--surface)', width: '100%', maxWidth: '500px',
              borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh', display: 'flex', flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {step === 'info' ? 'Book Actions' : 'Issue Confirmed'}
              </h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              {step === 'info' && (
                <>
                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                    {miniCover}
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{book.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>By {book.author}</p>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--surface-raised)', borderRadius: '1rem', color: 'var(--text-secondary)' }}>
                          ISBN: {book.isbn}
                        </span>
                        <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--surface-raised)', borderRadius: '1rem', color: 'var(--text-secondary)' }}>
                          Copies: {book.availableCopies}/{book.totalCopies}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--surface-raised)', borderRadius: '0.75rem' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Issuing to</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{student.name}</div>
                      <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>ID: {student.id}</div>
                    </div>
                  </div>

                  {!canIssue && !isIssued && (
                    <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--crimson)', borderRadius: '0.75rem', color: 'var(--crimson)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      <AlertTriangle size={20} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Cannot issue book. You have outstanding fines or restrictions.</span>
                    </div>
                  )}

                  {!isIssued ? (
                    <motion.button
                      whileHover={canIssue ? { scale: 1.02 } : {}}
                      whileTap={canIssue ? { scale: 0.98 } : {}}
                      onClick={handleIssue}
                      disabled={!canIssue || book.availableCopies === 0}
                      style={{
                        width: '100%', padding: '1rem', borderRadius: '0.75rem', border: 'none',
                        backgroundColor: canIssue && book.availableCopies > 0 ? 'var(--obsidian)' : 'var(--text-muted)',
                        color: 'var(--surface)', fontWeight: 600, fontSize: '1rem', cursor: canIssue && book.availableCopies > 0 ? 'pointer' : 'not-allowed',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                      }}
                    >
                      <BookOpen size={20} /> Issue Book
                    </motion.button>
                  ) : (
                    <div style={{ padding: '1rem', backgroundColor: 'var(--surface-raised)', borderRadius: '0.75rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      This book is currently issued to you. You can return it from the Returns page.
                    </div>
                  )}
                </>
              )}

              {step === 'success' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ marginBottom: '1rem' }}
                  >
                    <CheckCircle size={64} color="var(--emerald)" />
                  </motion.div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Issue Successful!</h3>
                  
                  <div style={{ margin: '1.5rem 0', padding: '2rem', backgroundColor: 'var(--emerald)', borderRadius: '1rem', width: '100%', color: 'var(--surface)' }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 500 }}>Show this PIN to the librarian to collect your book</div>
                    <div style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '0.25rem', fontFamily: 'var(--font-mono)' }}>{pin}</div>
                  </div>

                  <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1rem', textAlign: 'left' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={18} color="var(--amber)" /> Inspect Book
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      Notice any existing damage? Report it now so you aren't held responsible later.
                    </p>
                    
                    <textarea
                      value={damageDesc}
                      onChange={e => setDamageDesc(e.target.value)}
                      placeholder="Describe the damage..."
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', minHeight: '80px', marginBottom: '1rem', resize: 'vertical' }}
                    />
                    
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: 'var(--surface-raised)', color: 'var(--text-primary)', cursor: 'pointer' }}
                      >
                        <Camera size={16} /> Add Photo
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleDamagePhotoChange} accept="image/*" style={{ display: 'none' }} />
                      
                      {damagePhoto && (
                        <div style={{ width: '60px', height: '60px', borderRadius: '0.25rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <img src={damagePhoto} alt="Damage" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitDamage}
                      disabled={!damageDesc}
                      style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: damageDesc ? 'var(--obsidian)' : 'var(--border)', color: damageDesc ? 'var(--surface)' : 'var(--text-muted)', fontWeight: 600, cursor: damageDesc ? 'pointer' : 'not-allowed' }}
                    >
                      Submit Report
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
            
            {step === 'success' && (
              <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--surface-raised)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                 <button 
                  onClick={onClose}
                  style={{ padding: '0.5rem 1.5rem', borderRadius: '2rem', border: 'none', backgroundColor: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500 }}
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
