import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function EquipmentLibraryPage() {
  const supabase = await createClient();

  const { data: equipment } = await (supabase.from('equipment') as any)
    .select('*')
    .order('name', { ascending: true });

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>
          Equipment Library
        </h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
          Explore all lab equipment and view 3D models.
        </p>
      </div>

      {!equipment || equipment.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔬</div>
          <h3 style={{ color: 'var(--text)' }}>No equipment found</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {equipment.map((eq: any) => (
            <Link 
              href={`/equipment/${eq.id}`} 
              key={eq.id} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                background: 'var(--surface)', 
                borderRadius: '12px', 
                border: '1px solid var(--border)',
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              className="equipment-card"
            >
              <div style={{ width: '100%', aspectRatio: '1', background: 'var(--surface-2)', position: 'relative' }}>
                {eq.thumbnail_url ? (
                  <img src={eq.thumbnail_url} alt={eq.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem', opacity: 0.2 }}>
                    🔬
                  </div>
                )}
                {eq.model_glb_url && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--accent)', color: 'var(--surface)', fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                    3D AR
                  </div>
                )}
              </div>
              <div style={{ padding: '1.25rem', flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
                  {eq.name}
                </h3>
                {eq.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {eq.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .equipment-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
          border-color: var(--accent) !important;
        }
      `}</style>
    </div>
  );
}
