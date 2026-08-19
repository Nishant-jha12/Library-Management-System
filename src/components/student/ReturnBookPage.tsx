import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, BookOpen, CheckCircle } from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';

import { MorphButton } from '../ui/MorphButton';

export const ReturnBookPage: React.FC = () => {
  const { loggedInStudentId, students, books, getStudentIssuedRecords, initiateReturn, payFine } = useLibraryStore();

  const student = students.find(s => s.id === loggedInStudentId);
  
  if (!student) return null;

  const activeRecords = loggedInStudentId ? getStudentIssuedRecords(loggedInStudentId) : [];

  const calculateFine = (dueDate: number) => {
    const now = Date.now();
    if (now <= dueDate) return 0;
    const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
    return daysOverdue * 10;
  };

  const handleReturn = async (bookId: string) => {
    await initiateReturn(bookId, student.id);
  };

  const handlePayFine = async () => {
    if (student.fines > 0) {
      await payFine(student.id, student.fines);
    }
  };

  return (
    <div className="site-container section-py" style={{ minHeight: '100vh', padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{
          background: 'var(--surface)',
          padding: '2rem',
          borderRadius: '1rem',
          border: '1px solid var(--border)',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="display-lg" style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>My Books</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage your borrowed books and fines.</p>
          </div>
          {student.fines > 0 && (
            <div style={{ 
              background: 'var(--crimson)',
              color: 'white',
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              alignItems: 'flex-end'
            }}>
              <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>Unpaid Fines: ${student.fines}</span>
              <div style={{ width: '120px' }}>
                <MorphButton 
                  label="Pay Fines" 
                  variant="ghost" 
                  size="sm" 
                  onAction={handlePayFine} 
                />
              </div>
            </div>
          )}
        </div>

        {student.fineWarnings >= 3 && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid var(--crimson)', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            marginBottom: '2rem',
            color: 'var(--crimson)'
          }}>
            <AlertTriangle />
            <div>
              <h4 style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>Account Warning</h4>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>You have reached the maximum number of fine warnings. Your issuing privileges may be suspended.</p>
            </div>
          </div>
        )}

        <div className="books-grid-student" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {activeRecords.length === 0 ? (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '4rem 2rem', 
              color: 'var(--text-muted)' 
            }}>
              <CheckCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>You have no books currently issued.</p>
            </div>
          ) : (
            activeRecords.map(record => {
              const book = books.find(b => b.id === record.bookId);
              if (!book) return null;
              
              const isOverdue = Date.now() > record.dueDate;
              const currentFine = calculateFine(record.dueDate);

              return (
                <div key={record.id} style={{ 
                  background: 'var(--surface-raised)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '0.75rem', 
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ 
                      width: '3rem', 
                      height: '3rem', 
                      background: 'var(--obsidian)', 
                      borderRadius: '0.5rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'var(--text-primary)',
                      flexShrink: 0
                    }}>
                      <BookOpen size={24} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.125rem', margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.author}</p>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.5rem', 
                    fontSize: '0.875rem',
                    background: 'var(--surface)',
                    padding: '1rem',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Issued:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{new Date(record.issuedAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Due Date:</span>
                      <span style={{ color: isOverdue ? 'var(--crimson)' : 'var(--text-primary)', fontWeight: isOverdue ? 600 : 400 }}>
                        {new Date(record.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    {isOverdue && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--crimson)', fontWeight: 600, marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                        <span>Estimated Fine:</span>
                        <span>${currentFine}</span>
                      </div>
                    )}
                  </div>

                  {record.pendingReturn ? (
                    <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                      <div style={{ 
                        background: 'var(--amber-glow)', 
                        border: '1px solid var(--amber)', 
                        padding: '1rem', 
                        borderRadius: '0.5rem',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--amber)', fontWeight: 600 }}>RETURN PIN</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                          {record.returnPin}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Show this PIN to the librarian</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                      <MorphButton
                        label="Return Book"
                        loadingLabel="Initiating..."
                        variant="emerald"
                        onAction={() => handleReturn(record.bookId)}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
