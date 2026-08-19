import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, ArrowRight, ShieldCheck, CornerDownLeft } from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';

export const PendingVerifications: React.FC = () => {
  const { pendingNotifications, getPendingVerifications, books, students, verifyPin, verifyReturn } = useLibraryStore();
  const pendingRecords = getPendingVerifications();
  
  const [pinInputs, setPinInputs] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleVerify = (recordId: string, isReturn: boolean) => {
    const pin = pinInputs[recordId];
    if (!pin || pin.length !== 4) {
      setErrors(prev => ({ ...prev, [recordId]: 'PIN must be 4 digits' }));
      return;
    }

    const success = isReturn ? verifyReturn(recordId, pin) : verifyPin(recordId, pin);
    
    if (success) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[recordId];
        return newErrors;
      });
      setPinInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[recordId];
        return newInputs;
      });
    } else {
      setErrors(prev => ({ ...prev, [recordId]: 'Incorrect PIN' }));
    }
  };

  if (pendingNotifications.length === 0 && pendingRecords.length === 0) {
    return (
      <div className="site-container section-py" style={{ paddingTop: 0 }}>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <CheckCircle size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>No pending verifications or notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="site-container section-py" style={{ paddingTop: 0 }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <ShieldCheck size={24} color="var(--amber)" />
          <h2 className="display-md" style={{ margin: 0 }}>Pending Verifications</h2>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          
          {/* Notifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Activity Log</h3>
            <AnimatePresence>
              {pendingNotifications.map((notification, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{
                    padding: '1rem',
                    background: 'var(--surface-raised)',
                    borderRadius: '8px',
                    borderLeft: '3px solid var(--amber)'
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {typeof notification === 'string' ? notification : (notification as any).message}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Actionable Verifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Requires PIN</h3>
            <AnimatePresence>
              {pendingRecords.map((record) => {
                const student = students.find(s => s.id === record.studentId);
                const book = books.find(b => b.id === record.bookId);
                const isReturn = !!record.pendingReturn;

                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      padding: '1.25rem',
                      background: 'var(--surface)',
                      borderRadius: '12px',
                      border: `1px solid var(--${isReturn ? 'emerald' : 'violet'})`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: `var(--${isReturn ? 'emerald' : 'violet'})` }}>
                      {isReturn ? <CornerDownLeft size={16} /> : <ArrowRight size={16} />}
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {isReturn ? 'Pending Return' : 'Pending Issue'}
                      </span>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{book?.title}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{student?.name} ({student?.studentId})</div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="Enter PIN"
                          value={pinInputs[record.id] || ''}
                          onChange={(e) => setPinInputs({ ...pinInputs, [record.id]: e.target.value.replace(/\D/g, '') })}
                          className="input-field"
                          style={{ textAlign: 'center', letterSpacing: '0.2em', fontFamily: 'var(--font-mono)' }}
                        />
                        {errors[record.id] && (
                          <div style={{ color: 'var(--crimson)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {errors[record.id]}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleVerify(record.id, isReturn)}
                        className={`btn ${isReturn ? 'btn-emerald' : 'btn-violet'}`}
                        style={{ height: '42px', padding: '0 1.25rem' }}
                      >
                        Verify
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
