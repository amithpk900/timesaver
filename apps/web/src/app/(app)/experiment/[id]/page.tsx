import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PageProps {
  params: Promise<{ id: string }>;
}

function getYouTubeEmbedUrl(url: string | null) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  const videoId = match ? match[1] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

export default async function ExperimentDetailPage(props: PageProps) {
  const params = await props.params;
  const supabase = await createClient();

  // Fetch experiment with its chapter details
  const { data: experiment } = await (supabase.from('experiments') as any)
    .select('*, chapter:chapters(id, title, chapter_number, subject:subjects(name))')
    .eq('id', params.id)
    .single();

  if (!experiment) return notFound();

  // Fetch linked equipment
  const { data: equipmentLinks } = await (supabase.from('experiment_equipment') as any)
    .select('equipment(*)')
    .eq('experiment_id', params.id);

  const equipmentList = equipmentLinks?.map((link: any) => link.equipment) || [];

  const chapterId = Array.isArray(experiment.chapter) ? experiment.chapter[0].id : experiment.chapter?.id;
  const embedUrl = getYouTubeEmbedUrl(experiment.video_url);

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      {/* Back button */}
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          href={`/chapter/${chapterId}`} 
          style={{ color: 'var(--text-dim)', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}
        >
          ← Back to Chapter
        </Link>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>
          {experiment.title}
        </h1>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
          <span style={{ 
            background: experiment.difficulty === 'easy' ? '#10b981' : experiment.difficulty === 'medium' ? '#f59e0b' : '#ef4444',
            color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            {experiment.difficulty}
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            Added on {new Date(experiment.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Video Embed */}
      {embedUrl && (
        <div style={{ 
          width: '100%', 
          aspectRatio: '16/9', 
          background: '#000', 
          borderRadius: '16px', 
          overflow: 'hidden',
          marginBottom: '3rem',
          boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
        }}>
          <iframe 
            src={embedUrl} 
            title="Experiment Video" 
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen 
          />
        </div>
      )}

      {/* Objective */}
      {experiment.objective && (
        <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', borderLeft: '4px solid var(--accent)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Objective
          </h3>
          <p style={{ fontSize: '1.1rem', color: 'var(--text)', lineHeight: 1.6 }}>
            {experiment.objective}
          </p>
        </div>
      )}

      {/* Equipment List */}
      {equipmentList.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
            Required Equipment
          </h3>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {equipmentList.map((eq: any) => (
              <Link 
                key={eq.id} 
                href={`/equipment/${eq.id}`}
                style={{ 
                  flex: '0 0 200px', 
                  background: 'var(--surface)', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.2s',
                  display: 'flex',
                  flexDirection: 'column'
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
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--accent)', color: 'var(--surface)', fontSize: '0.65rem', fontWeight: 800, padding: '4px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                      3D View
                    </div>
                  )}
                </div>
                <div style={{ padding: '1rem', flex: 1 }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                    {eq.name}
                  </h4>
                  {eq.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {eq.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Procedure */}
      {experiment.procedure && (
        <div className="experiment-procedure" style={{ marginBottom: '4rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            Procedure
          </h3>
          <div style={{ color: 'var(--text)', lineHeight: 1.7, fontSize: '1.05rem' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {experiment.procedure}
            </ReactMarkdown>
          </div>
        </div>
      )}

      <style>{`
        .equipment-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent) !important;
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        
        .experiment-procedure h1,
        .experiment-procedure h2,
        .experiment-procedure h3 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
          color: var(--text);
        }
        
        .experiment-procedure h1 { font-size: 1.8rem; }
        .experiment-procedure h2 { font-size: 1.5rem; }
        .experiment-procedure h3 { font-size: 1.25rem; }
        
        .experiment-procedure p {
          margin-bottom: 1.25rem;
        }
        
        .experiment-procedure ul,
        .experiment-procedure ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        
        .experiment-procedure li {
          margin-bottom: 0.5rem;
        }
        
        .experiment-procedure blockquote {
          border-left: 4px solid var(--accent);
          background: var(--surface-2);
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          border-radius: 0 8px 8px 0;
          font-style: italic;
        }
        .experiment-procedure blockquote p:last-child {
          margin-bottom: 0;
        }
        
        .experiment-procedure code {
          background: var(--surface-2);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
        }
        
        .experiment-procedure pre {
          background: var(--surface-2);
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin-bottom: 1.5rem;
        }
        
        .experiment-procedure pre code {
          background: transparent;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
