import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Get user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/auth/login');
  }

  // 2. Check if admin
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('is_admin, full_name')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.is_admin) {
    redirect('/browse');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Admin Sidebar */}
      <aside style={{ width: '250px', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>App Admin</h2>
        </div>
        
        <nav style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link href="/admin" style={navStyle}>Dashboard</Link>
          <div style={{ margin: '1rem 0 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Fast Workflows</div>
          <Link href="/admin/chapters/new" style={navStyle}>+ Add Chapter Flow</Link>
          <Link href="/admin/experiments/new" style={navStyle}>+ Add Experiment Flow</Link>
          <div style={{ margin: '1rem 0 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Data</div>
          {/* We'll add links to standard CRUD tables here later */}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <Link href="/browse" style={{ ...navStyle, background: 'var(--surface-2)' }}>
            ← Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>

      <style>{`
        .admin-nav-link:hover {
          background: var(--surface-2);
          color: var(--text);
        }
      `}</style>
    </div>
  );
}

const navStyle = {
  display: 'block',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  color: 'var(--text-muted)',
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: 600,
  transition: 'all 0.2s'
};
