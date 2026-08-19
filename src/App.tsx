import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLibraryStore } from './store/libraryStore';
import { LibrarianDashboard } from './components/librarian/LibrarianDashboard';
import { StudentPortal } from './components/student/StudentPortal';
import { LoginScreen } from './components/auth/LoginScreen';
import { PageTransition } from './components/ui/PageTransition';
import { LogoutConfirmModal } from './components/ui/LogoutConfirmModal';
import { Zap, LogOut, User, Moon, Sun, Bell } from 'lucide-react';

function App() {
  const { isAuthenticated, userRole, loggedInStudentId, students, logout, theme, toggleTheme, pendingNotifications } = useLibraryStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-theme' : '';
  }, [theme]);

  if (!isAuthenticated) {
    return (
      <div>
        <LoginScreen />
      </div>
    );
  }

  const student = students.find(s => s.id === loggedInStudentId);
  const unreadCount = pendingNotifications.filter(n => !n.read).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--obsidian)' }}>

      {/* ── NAVIGATION BAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--obsidian)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="site-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>

          {/* Logo */}
          <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--violet), var(--emerald))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px var(--violet-glow)',
            }}>
              <Zap size={18} fill="white" color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                Digital Sanctuary
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginTop: '2px' }}>
                BST-POWERED LIBRARY SYSTEM
              </div>
            </div>
          </motion.div>

          {/* Right Side */}
          <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {/* User Info */}
            {userRole === 'student' && student && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', padding: '0.375rem 0.75rem', borderRadius: '99px', border: '1px solid var(--border)' }}>
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <User size={14} style={{ color: 'var(--emerald)' }} />
                )}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>{student.name}</span>
              </div>
            )}
            {userRole === 'librarian' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', padding: '0.375rem 0.75rem', borderRadius: '99px', border: '1px solid var(--border)' }}>
                <User size={14} style={{ color: 'var(--violet)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>Librarian</span>
              </div>
            )}

            {/* Notifications (librarian only) */}
            {userRole === 'librarian' && unreadCount > 0 && (
              <div style={{ position: 'relative' }}>
                <Bell size={18} style={{ color: 'var(--text-muted)' }} />
                <span style={{
                  position: 'absolute', top: '-5px', right: '-5px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: 'var(--crimson)', color: 'white',
                  fontSize: '0.6rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{unreadCount}</span>
              </div>
            )}

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)' }}
              whileHover={{ color: 'var(--text-primary)', background: 'var(--surface)' }}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>

            {/* System Live */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="avail-pulse" style={{ display: 'block', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--emerald)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Live</span>
            </div>
            
            <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />

            {/* Logout */}
            <motion.button
              onClick={() => setShowLogoutModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              whileHover={{ color: 'var(--crimson)' }}
            >
              <LogOut size={16} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Logout</span>
            </motion.button>
          </motion.div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          <PageTransition key={userRole} transitionKey={userRole || 'auth'}>
            {userRole === 'librarian' ? <LibrarianDashboard /> : <StudentPortal />}
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--charcoal)', padding: '2rem 0' }}>
        <div className="site-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '7px', background: 'linear-gradient(135deg, var(--violet), var(--emerald))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={12} fill="white" color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Digital Sanctuary</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Library Management System · Binary Search Tree Catalogue Engine
          </p>
        </div>
      </footer>

      {/* ── LOGOUT CONFIRMATION ── */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={() => { setShowLogoutModal(false); logout(); }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
}

export default App;
