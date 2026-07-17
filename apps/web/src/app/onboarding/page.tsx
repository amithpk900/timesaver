'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Grade, Stream } from '@karnataka-study-app/shared';

const PUC_NAMES = ['1st PUC (11th)', '2nd PUC (12th)'];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [grades,     setGrades]     = useState<Grade[]>([]);
  const [streams,    setStreams]     = useState<Stream[]>([]);
  const [gradeId,    setGradeId]    = useState('');
  const [streamId,   setStreamId]   = useState('');
  const [error,      setError]      = useState('');
  const [saving,     setSaving]     = useState(false);
  const [gradeName,  setGradeName]  = useState('');

  useEffect(() => {
    async function load() {
      const [{ data: g }, { data: s }] = await Promise.all([
        supabase.from('grades').select('*').order('sort_order'),
        supabase.from('streams').select('*').order('name'),
      ]);
      setGrades(g ?? []);
      setStreams(s ?? []);
    }
    load();
  }, []);

  const isPUC = PUC_NAMES.includes(gradeName);

  function selectGrade(grade: Grade) {
    setGradeId(grade.id);
    setGradeName(grade.name);
    setStreamId(''); // reset stream when grade changes
  }

  async function handleContinue() {
    if (!gradeId) { setError('Please select your grade.'); return; }
    if (isPUC && !streamId) { setError('Please select your stream.'); return; }
    setError('');
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const { error: updateErr } = await (supabase.from('profiles') as any)
      .update({ grade_id: gradeId, stream_id: isPUC ? streamId : null })
      .eq('id', user.id);

    setSaving(false);
    if (updateErr) { setError(updateErr.message); return; }

    router.push('/browse');
    router.refresh();
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.step}>Step 1 of 1</div>
          <h1 style={styles.heading}>Tell us about yourself</h1>
          <p style={styles.subheading}>
            We&apos;ll personalise your study materials based on your grade and stream.
            You can always browse other grades too.
          </p>
        </div>

        {/* Grade selection */}
        <section style={styles.section}>
          <div style={styles.sectionLabel}>Your grade</div>
          <div style={styles.gradeGrid}>
            {grades.map(g => (
              <button
                key={g.id}
                id={`grade-${g.id}`}
                onClick={() => selectGrade(g)}
                style={{
                  ...styles.gradeCard,
                  ...(gradeId === g.id ? styles.gradeCardActive : {}),
                }}
              >
                <div style={styles.gradeEmoji}>
                  {g.name.includes('SSLC') ? '🎓' : g.name.includes('1st') ? '📗' : '📘'}
                </div>
                <div style={styles.gradeName}>{g.name}</div>
                <div style={styles.gradeDesc}>
                  {g.name.includes('SSLC')
                    ? 'Class 10 — All subjects'
                    : g.name.includes('1st')
                    ? 'Class 11 — Choose stream'
                    : 'Class 12 — Choose stream'}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Stream selection (PUC only) */}
        {isPUC && (
          <section style={styles.section}>
            <div style={styles.sectionLabel}>Your stream</div>
            <div style={styles.streamGrid}>
              {streams.map(s => (
                <button
                  key={s.id}
                  id={`stream-${s.id}`}
                  onClick={() => setStreamId(s.id)}
                  style={{
                    ...styles.streamCard,
                    ...(streamId === s.id ? styles.streamCardActive : {}),
                  }}
                >
                  <span style={styles.streamEmoji}>
                    {s.name === 'Science' ? '🔬' : s.name === 'Commerce' ? '📈' : '🎭'}
                  </span>
                  <span style={styles.streamName}>{s.name}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {error && <div className="alert alert-error" style={{ marginTop: '0.5rem' }}>{error}</div>}

        <button
          id="onboarding-continue"
          className="btn btn-primary"
          style={{ marginTop: '2rem', padding: '0.85rem 2.5rem', fontSize: '1rem' }}
          onClick={handleContinue}
          disabled={saving || !gradeId || (isPUC && !streamId)}
        >
          {saving ? <span className="spinner" /> : 'Start studying →'}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '3rem 1.5rem',
    background: 'radial-gradient(ellipse at 30% 0%, rgba(99,102,241,0.1) 0%, var(--bg) 60%)',
  },
  container: { width: '100%', maxWidth: '640px' },
  header: { marginBottom: '2.5rem' },
  step: {
    display: 'inline-block',
    background: 'var(--accent-light)',
    color: 'var(--accent)',
    borderRadius: '100px',
    padding: '0.25rem 0.85rem',
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    marginBottom: '1rem',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 800,
    color: 'var(--text)',
    margin: '0 0 0.5rem',
  },
  subheading: {
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    margin: 0,
  },
  section: { marginBottom: '2rem' },
  sectionLabel: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '0.85rem',
  },
  gradeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' },
  gradeCard: {
    background: 'var(--surface)',
    border: '2px solid var(--border)',
    borderRadius: '16px',
    padding: '1.5rem 1rem',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
  },
  gradeCardActive: {
    border: '2px solid var(--accent)',
    background: 'var(--accent-light)',
    boxShadow: '0 0 0 4px rgba(99,102,241,0.1)',
  },
  gradeEmoji: { fontSize: '2rem', lineHeight: 1 },
  gradeName: { fontSize: '0.925rem', fontWeight: 700, color: 'var(--text)' },
  gradeDesc: { fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.4 },
  streamGrid: { display: 'flex', gap: '0.85rem' },
  streamCard: {
    flex: 1,
    background: 'var(--surface)',
    border: '2px solid var(--border)',
    borderRadius: '14px',
    padding: '1.1rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.15s ease',
  },
  streamCardActive: {
    border: '2px solid var(--accent)',
    background: 'var(--accent-light)',
  },
  streamEmoji: { fontSize: '1.5rem' },
  streamName: { fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' },
};
