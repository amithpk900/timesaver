'use client';

// Global styles injected once for responsive sidebar behaviour
const SIDEBAR_STYLES = `
  @media (min-width: 768px) {
    .app-sidebar { transform: translateX(0) !important; position: relative !important; z-index: auto !important; }
    .app-main    { margin-left: 0 !important; }
    .app-topbar-menu { display: none !important; }
  }
  @media (max-width: 767px) {
    .app-main { margin-left: 0 !important; }
  }
  .chapter-card:hover {
    border-color: var(--accent) !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  }
  .subject-item:hover:not(.subject-active) {
    background: var(--surface-2) !important;
    color: var(--text) !important;
  }
  .sign-out-btn:hover { color: var(--error) !important; }
  .tab-btn:hover:not(.tab-active) { background: var(--surface-2) !important; color: var(--text) !important; }
  .equipment-link:hover { background: var(--accent) !important; color: var(--surface) !important; border-color: var(--accent) !important; }
`;

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Grade, Stream, Profile, Subject, Chapter } from '@karnataka-study-app/shared';

interface User { id: string; email: string; fullName: string }

interface Props {
  user: User;
  profile: Profile;
  grades: Grade[];
  streams: Stream[];
  children: React.ReactNode;
}

const PUC_NAMES = ['1st PUC (11th)', '2nd PUC (12th)'];

export default function AppShell({ user, profile, grades, streams, children }: Props) {
  const router  = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // ── Navigation state ──────────────────────────────────────────
  const defaultGrade = grades.find(g => g.id === profile.grade_id) ?? grades[0];
  const defaultStream = streams.find(s => s.id === profile.stream_id) ?? null;

  const [selectedGrade,   setSelectedGrade]   = useState<Grade | null>(defaultGrade ?? null);
  const [selectedStream,  setSelectedStream]  = useState<Stream | null>(defaultStream);
  const [subjects,        setSubjects]        = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [chapters,        setChapters]        = useState<Chapter[]>([]);
  const [loadingSubs,     setLoadingSubs]      = useState(false);
  const [loadingChaps,    setLoadingChaps]     = useState(false);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);

  const isPUC = PUC_NAMES.includes(selectedGrade?.name ?? '');

  // ── Load subjects when grade/stream changes ───────────────────
  const loadSubjects = useCallback(async (grade: Grade, stream: Stream | null) => {
    setLoadingSubs(true);
    setSubjects([]);
    setSelectedSubject(null);
    setChapters([]);

    let query = supabase
      .from('subjects')
      .select('*')
      .eq('grade_id', grade.id)
      .order('name');

    if (PUC_NAMES.includes(grade.name) && stream) {
      query = query.eq('stream_id', stream.id);
    } else {
      query = query.is('stream_id', null);
    }

    const { data } = await query;
    setSubjects(data ?? []);
    setLoadingSubs(false);
  }, [supabase]);

  useEffect(() => {
    if (selectedGrade) loadSubjects(selectedGrade, selectedStream);
  }, [selectedGrade, selectedStream, loadSubjects]);

  // ── Load chapters when subject changes ───────────────────────
  async function loadChapters(subject: Subject) {
    setSelectedSubject(subject);
    setLoadingChaps(true);
    setChapters([]);

    const { data } = await supabase
      .from('chapters')
      .select('*')
      .eq('subject_id', subject.id)
      .order('sort_order');

    setChapters(data ?? []);
    setLoadingChaps(false);
  }

  // ── Sign out ─────────────────────────────────────────────────
  async function signOut() {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  }

  // ── Grade / stream helpers ────────────────────────────────────
  function gradeInitials(name: string) {
    if (name.includes('SSLC'))  return 'S';
    if (name.includes('1st'))   return '11';
    if (name.includes('2nd'))   return '12';
    return name[0];
  }

  function gradeShort(name: string) {
    if (name.includes('SSLC'))  return 'SSLC';
    if (name.includes('1st'))   return '1st PUC';
    if (name.includes('2nd'))   return '2nd PUC';
    return name;
  }

  return (
    <>
      <style>{SIDEBAR_STYLES}</style>
      <div style={styles.shell}>
        {/* ── Mobile overlay ─────────────────────────────────── */}
        {sidebarOpen && (
          <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
        )}

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className="app-sidebar"
        style={{ ...styles.sidebar, ...(sidebarOpen ? styles.sidebarOpen : {}) }}
      >
        {/* Logo */}
        <div style={styles.sidebarLogo}>
          <span style={styles.sidebarLogoIcon}>📚</span>
          <span style={styles.sidebarLogoText}>Study App</span>
        </div>

        {/* Grade tabs */}
        <div style={styles.sidebarSection}>
          <div style={styles.sidebarLabel}>Grade</div>
          <div style={styles.tabGroup}>
            {grades.map(g => (
              <button
                key={g.id}
                id={`nav-grade-${g.id}`}
                className={`tab-btn ${selectedGrade?.id === g.id ? 'tab-active' : ''}`}
                style={{
                  ...styles.tab,
                  ...(selectedGrade?.id === g.id ? styles.tabActive : {}),
                }}
                onClick={() => {
                  setSelectedGrade(g);
                  if (!PUC_NAMES.includes(g.name)) setSelectedStream(null);
                  else if (!selectedStream) setSelectedStream(streams[0] ?? null);
                }}
              >
                {gradeShort(g.name)}
              </button>
            ))}
          </div>
        </div>

        {/* Stream tabs — only for PUC */}
        {isPUC && (
          <div style={styles.sidebarSection}>
            <div style={styles.sidebarLabel}>Stream</div>
            <div style={styles.tabGroup}>
              {streams.map(s => (
                <button
                  key={s.id}
                  id={`nav-stream-${s.id}`}
                  className={`tab-btn ${selectedStream?.id === s.id ? 'tab-active' : ''}`}
                  style={{
                    ...styles.tab,
                    ...(selectedStream?.id === s.id ? styles.tabActive : {}),
                  }}
                  onClick={() => setSelectedStream(s)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subject list */}
        <div style={{ ...styles.sidebarSection, flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <div style={styles.sidebarLabel}>Subjects</div>
          {loadingSubs && (
            <div style={styles.loadingRow}>
              <span className="spinner" style={{ borderColor: 'rgba(99,102,241,0.3)', borderTopColor: 'var(--accent)' }} />
            </div>
          )}
          {!loadingSubs && subjects.length === 0 && (
            <div style={styles.emptyNote}>No subjects found</div>
          )}
          {subjects.map(sub => (
            <button
              key={sub.id}
              id={`nav-subject-${sub.id}`}
              className={`subject-item ${selectedSubject?.id === sub.id ? 'subject-active' : ''}`}
              style={{
                ...styles.subjectItem,
                ...(selectedSubject?.id === sub.id ? styles.subjectItemActive : {}),
              }}
              onClick={() => { loadChapters(sub); setSidebarOpen(false); }}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Equipment Library Link */}
        <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
          <Link href="/equipment" style={{ textDecoration: 'none' }}>
            <div 
              className="equipment-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'var(--surface-2)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: 'var(--text)',
                fontWeight: 600,
                fontSize: '0.95rem',
                transition: 'background 0.2s',
                border: '1px solid var(--border)'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🔬</span>
              Equipment Library
            </div>
          </Link>
        </div>

        {/* User area */}
        <div style={styles.userArea}>
          <div style={styles.avatar}>
            {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user.fullName || 'Student'}</div>
            <div style={styles.userGrade}>{gradeShort(defaultGrade?.name ?? '')}</div>
          </div>
          <button
            id="sign-out-btn"
            className="sign-out-btn"
            title="Sign out"
            onClick={signOut}
            style={styles.signOutBtn}
          >
            ↩
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────── */}
      <main className="app-main" style={styles.main}>
        {/* Mobile top bar */}
        <div style={styles.topBar}>
          <button
            id="mobile-menu-btn"
            className="menuBtn app-topbar-menu"
            onClick={() => setSidebarOpen(o => !o)}
            style={styles.menuBtn}
          >
            ☰
          </button>
          <span style={styles.topBarTitle}>
            {selectedSubject
              ? `${gradeShort(selectedGrade?.name ?? '')} › ${selectedSubject.name}`
              : gradeShort(selectedGrade?.name ?? '')}
          </span>
        </div>

        {/* Content area */}
        <div style={styles.content}>
          {pathname === '/browse' ? (
            <>
              {!selectedSubject && (
                <WelcomePlaceholder
                  gradeName={selectedGrade?.name ?? ''}
                  subjectCount={subjects.length}
                />
              )}

              {selectedSubject && (
                <ChapterView
                  subject={selectedSubject}
                  chapters={chapters}
                  loading={loadingChaps}
                  gradeName={selectedGrade?.name ?? ''}
                  streamName={selectedStream?.name}
                />
              )}
            </>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function WelcomePlaceholder({ gradeName, subjectCount }: { gradeName: string; subjectCount: number }) {
  return (
    <div style={styles.welcome}>
      <div style={styles.welcomeIcon}>📖</div>
      <h2 style={styles.welcomeHeading}>Ready to study?</h2>
      <p style={styles.welcomeText}>
        {subjectCount > 0
          ? `Select a subject from the sidebar to browse chapters for ${gradeName}.`
          : `Loading subjects for ${gradeName}…`}
      </p>
    </div>
  );
}

function ChapterView({
  subject, chapters, loading, gradeName, streamName,
}: {
  subject: Subject;
  chapters: Chapter[];
  loading: boolean;
  gradeName: string;
  streamName?: string;
}) {
  return (
    <div>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <span style={styles.crumb}>{gradeName}</span>
        {streamName && <><span style={styles.crumbSep}>›</span><span style={styles.crumb}>{streamName}</span></>}
        <span style={styles.crumbSep}>›</span>
        <span style={{ ...styles.crumb, color: 'var(--text)' }}>{subject.name}</span>
      </div>

      <h2 style={styles.chapterHeading}>{subject.name}</h2>
      <p style={styles.chapterSubtitle}>
        {loading ? 'Loading chapters…' : `${chapters.length} chapter${chapters.length !== 1 ? 's' : ''}`}
      </p>

      {loading && (
        <div style={styles.loadingRow}>
          <span className="spinner" style={{ width: '24px', height: '24px', borderColor: 'rgba(99,102,241,0.3)', borderTopColor: 'var(--accent)' }} />
        </div>
      )}

      {!loading && chapters.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>📭</div>
          <div>No chapters added yet</div>
        </div>
      )}

      <div style={styles.chapterGrid}>
        {chapters.map((ch, idx) => (
          <Link href={`/chapter/${ch.id}`} key={ch.id} id={`chapter-card-${ch.id}`} className="chapter-card" style={{...styles.chapterCard, textDecoration: 'none', color: 'inherit'}}>
            <div style={styles.chapterNum}>Ch. {ch.chapter_number}</div>
            <div style={styles.chapterTitle}>{ch.title}</div>
            <div style={{...styles.chapterBadge, background: 'var(--accent)', color: 'var(--surface)'}}>View Experiments →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────

const SIDEBAR_W = '280px';

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    background: 'var(--bg)',
    position: 'relative',
  },
  overlay: {
    position: 'fixed', inset: 0, zIndex: 10,
    background: 'rgba(0,0,0,0.5)',
  },
  sidebar: {
    width: SIDEBAR_W,
    minWidth: SIDEBAR_W,
    height: '100vh',
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    overflow: 'hidden',
    transition: 'transform 0.25s ease',
    // Mobile: hidden off-screen by default
    position: 'fixed',
    top: 0, left: 0, bottom: 0,
    zIndex: 20,
    transform: 'translateX(-100%)',
    // Desktop: always visible (overridden below with media query via JS)
  },
  // We'll override transform via sidebarOpen state + a media query class
  sidebarOpen: { transform: 'translateX(0)' },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '1.25rem 1.25rem 1rem',
    borderBottom: '1px solid var(--border)',
  },
  sidebarLogoIcon: { fontSize: '1.5rem' },
  sidebarLogoText: { fontSize: '1rem', fontWeight: 800, color: 'var(--text)' },
  sidebarSection: {
    padding: '1rem 1rem 0.5rem',
  },
  sidebarLabel: {
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-dim)',
    marginBottom: '0.6rem',
  },
  tabGroup: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '0.3rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-muted)',
    transition: 'all 0.12s',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    background: 'var(--accent)',
    border: '1px solid var(--accent)',
    color: '#fff',
  },
  subjectItem: {
    width: '100%',
    display: 'block',
    textAlign: 'left',
    padding: '0.6rem 0.75rem',
    borderRadius: '10px',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-muted)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.12s',
    marginBottom: '0.15rem',
  },
  subjectItemActive: {
    background: 'var(--accent-light)',
    color: 'var(--accent)',
    fontWeight: 600,
  },
  loadingRow: {
    display: 'flex', justifyContent: 'center', padding: '1.5rem',
  },
  emptyNote: { fontSize: '0.8rem', color: 'var(--text-dim)', padding: '0.5rem 0' },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    padding: '0.9rem 1.1rem',
    borderTop: '1px solid var(--border)',
    marginTop: 'auto',
  },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'var(--accent)',
    color: '#fff', fontWeight: 700, fontSize: '0.9rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: {
    fontSize: '0.875rem', fontWeight: 600,
    color: 'var(--text)', overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  userGrade: { fontSize: '0.75rem', color: 'var(--text-dim)' },
  signOutBtn: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: 'var(--text-dim)', fontSize: '1.1rem', padding: '4px',
    borderRadius: '6px', transition: 'color 0.12s',
    flexShrink: 0,
  },

  // Main
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    // On desktop, offset by sidebar width
    marginLeft: SIDEBAR_W,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.9rem 1.5rem',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
    flexShrink: 0,
  },
  menuBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text)',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.3rem 0.55rem',
  },
  topBarTitle: { fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' },

  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '2rem 2.5rem',
  },

  // Welcome
  welcome: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '60vh', textAlign: 'center', gap: '1rem',
  },
  welcomeIcon: { fontSize: '4rem' },
  welcomeHeading: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', margin: 0 },
  welcomeText: { fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '360px', margin: 0, lineHeight: 1.6 },

  // Chapters
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' },
  crumb: { fontSize: '0.8rem', color: 'var(--text-dim)' },
  crumbSep: { fontSize: '0.8rem', color: 'var(--border)' },
  chapterHeading: { fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.3rem' },
  chapterSubtitle: { fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 1.75rem' },
  chapterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
  },
  chapterCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '1.4rem',
    cursor: 'default',
    transition: 'border-color 0.15s, transform 0.15s',
  },
  chapterNum: {
    fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)',
    letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem',
  },
  chapterTitle: { fontSize: '0.975rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.45, marginBottom: '1rem' },
  chapterBadge: {
    display: 'inline-block',
    padding: '0.2rem 0.65rem',
    borderRadius: '100px',
    fontSize: '0.7rem',
    fontWeight: 600,
    background: 'rgba(99,102,241,0.1)',
    color: 'var(--accent)',
  },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '0.75rem', padding: '4rem', color: 'var(--text-dim)', fontSize: '0.925rem',
  },
  emptyStateIcon: { fontSize: '2.5rem' },
};
