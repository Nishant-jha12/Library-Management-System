import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, User, Lock, Moon, Sun, Shield } from 'lucide-react';
import { useLibraryStore } from '../../store/libraryStore';

export const LoginScreen: React.FC = () => {
  const { login, students, theme, toggleTheme } = useLibraryStore();
  const [role, setRole] = useState<'librarian' | 'student'>('student');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Simulate network
      await new Promise(resolve => setTimeout(resolve, 800));

      if (role === 'librarian') {
        if (userId === 'abc123' && password === 'abc@123') {
          login('librarian');
        } else {
          setError('Invalid librarian credentials');
        }
      } else {
        const student = students.find(s => s.studentId === userId);
        if (student && student.password === password) {
          login('student', student.id);
        } else {
          setError('Invalid student credentials');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="site-container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div className="noise" />
      <div style={{
        position: 'absolute',
        top: '-20%', left: '-10%',
        width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, var(--emerald) 0%, transparent 70%)',
        opacity: 0.05,
        borderRadius: '50%'
      }} />

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '3rem 2.5rem',
          position: 'relative',
          zIndex: 1
        }}
      >
        <button 
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            style={{
              width: '64px',
              height: '64px',
              background: 'var(--emerald)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: 'var(--obsidian)'
            }}
          >
            <BookOpen size={32} />
          </motion.div>
          <h1 className="display-md" style={{ marginBottom: '0.5rem' }}>Digital Sanctuary</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Enter your credentials to access the system</p>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          padding: '0.25rem',
          background: 'var(--surface)',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          {(['student', 'librarian'] as const).map(r => (
            <button
              key={r}
              onClick={() => { setRole(r); setError(''); setUserId(''); setPassword(''); }}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                borderRadius: '8px',
                background: role === r ? 'var(--surface-raised)' : 'transparent',
                color: role === r ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: role === r ? 500 : 400,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {r === 'student' ? <User size={16} /> : <Shield size={16} />}
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>
              {role === 'student' ? 'Student ID' : 'Librarian ID'}
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.75rem' }}
                placeholder={role === 'student' ? 'e.g. S12345' : 'Enter ID'}
                required
              />
            </div>
          </div>

          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.75rem' }}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ color: 'var(--crimson)', fontSize: '0.875rem', textAlign: 'center' }}
            >
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading || !userId || !password}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
