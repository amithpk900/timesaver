import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>
        Admin Dashboard
      </h1>
      <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
        Manage curriculum content and laboratory experiments.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Fast Workflow 1 */}
        <div style={cardStyle}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</div>
          <h3 style={cardTitleStyle}>Add Chapter Flow</h3>
          <p style={cardTextStyle}>
            Create a chapter, its topics, and upload study materials all in one connected flow.
          </p>
          <Link href="/admin/chapters/new" style={btnStyle}>Start Flow →</Link>
        </div>

        {/* Fast Workflow 2 */}
        <div style={cardStyle}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔬</div>
          <h3 style={cardTitleStyle}>Add Experiment Flow</h3>
          <p style={cardTextStyle}>
            Create an experiment, link equipment, and upload new 3D equipment models directly.
          </p>
          <Link href="/admin/experiments/new" style={btnStyle}>Start Flow →</Link>
        </div>

      </div>
    </div>
  );
}

const cardStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start'
};

const cardTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: 700,
  color: 'var(--text)',
  marginBottom: '0.5rem'
};

const cardTextStyle = {
  color: 'var(--text-dim)',
  fontSize: '0.9rem',
  lineHeight: 1.5,
  marginBottom: '1.5rem',
  flex: 1
};

const btnStyle = {
  background: 'var(--accent)',
  color: 'var(--surface)',
  padding: '0.6rem 1.25rem',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.9rem',
  textDecoration: 'none'
};
