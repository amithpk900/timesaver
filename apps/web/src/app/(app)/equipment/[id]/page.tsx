import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ModelViewer from '@/components/ModelViewer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EquipmentDetailPage(props: PageProps) {
  const params = await props.params;
  const supabase = await createClient();

  const { data: equipment } = await (supabase.from('equipment') as any)
    .select('*')
    .eq('id', params.id)
    .single();

  if (!equipment) return notFound();

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link 
          href="/equipment" 
          style={{ color: 'var(--text-dim)', textDecoration: 'none', display: 'inline-block' }}
        >
          ← Back to Equipment Library
        </Link>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* 3D Viewer Area */}
        <div style={{ width: '100%', height: '500px', background: '#000', position: 'relative' }}>
          {equipment.model_glb_url ? (
            <ModelViewer src={equipment.model_glb_url} alt={equipment.name} poster={equipment.thumbnail_url} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', flexDirection: 'column' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <p>No 3D model available for this equipment.</p>
            </div>
          )}
        </div>

        {/* Details Area */}
        <div style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>
            {equipment.name}
          </h1>
          {equipment.description && (
            <p style={{ fontSize: '1.1rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
              {equipment.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
