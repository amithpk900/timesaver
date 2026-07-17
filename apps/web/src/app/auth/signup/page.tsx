'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // If email confirmation is disabled, session is live immediately
    if (data.session) {
      window.location.href = '/onboarding';
      return;
    }

    setSuccess(
      'Account created! Check your email for a confirmation link, then come back to sign in.'
    );
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

        <h1 style={styles.heading}>Create your account</h1>
        <p style={styles.subheading}>Free for all Karnataka Board students</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div style={styles.field}>
            <label style={styles.label} htmlFor="fullname">Your name</label>
            <input
              id="fullname"
              type="text"
              className="input"
              placeholder="Ravi Kumar"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">
              Password <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(min. 8 characters)</span>
            </label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            id="signup-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading || !!success}
          >
            {loading ? <span className="spinner" /> : 'Create account'}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link href="/auth/login" style={styles.link}>Sign in</Link>
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
  logo: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' },
  logoIcon: { fontSize: '2rem', lineHeight: 1 },
  logoTitle: { fontSize: '1rem', fontWeight: 700, color: 'var(--text)' },
  logoSub: { fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '1px' },
  heading: { fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.3rem' },
  subheading: { fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 1.75rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.45rem' },
  label: { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' },
  switchText: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' },
  link: { color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 },
};
