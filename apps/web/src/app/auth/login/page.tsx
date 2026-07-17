'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>📚</div>
          <div>
            <div style={styles.logoTitle}>Karnataka Study App</div>
            <div style={styles.logoSub}>KSEAB · SSLC · PUC</div>
          </div>
        </div>

        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.subheading}>Sign in to continue studying</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div className="alert alert-error">{error}</div>}

          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className={`input ${error ? 'error' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Sign in'}
          </button>
        </form>

        <p style={styles.switchText}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" style={styles.link}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    background: 'radial-gradient(ellipse at 60% 0%, rgba(99,102,241,0.12) 0%, var(--bg) 60%)',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
  },
  logoIcon: {
    fontSize: '2rem',
    lineHeight: 1,
  },
  logoTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text)',
  },
  logoSub: {
    fontSize: '0.75rem',
    color: 'var(--text-dim)',
    marginTop: '1px',
  },
  heading: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: 'var(--text)',
    margin: '0 0 0.3rem',
  },
  subheading: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    margin: '0 0 1.75rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
  },
  switchText: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
  },
  link: {
    color: 'var(--accent)',
    textDecoration: 'none',
    fontWeight: 600,
  },
};
