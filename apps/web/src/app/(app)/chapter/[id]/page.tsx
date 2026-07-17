import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

function getYouTubeThumbnail(url: string | null) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  const videoId = match ? match[1] : null;
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}

export default async function ChapterExperimentsPage(props: PageProps) {
  // In Next.js 15, params is a promise
  const params = await props.params;
  
  const supabase = await createClient();

  // Fetch chapter and subject to show breadcrumb or title
  const { data: chapter } = await (supabase.from('chapters') as any)
    .select('*, subject:subjects(name)')
    .eq('id', params.id)
    .single();

  if (!chapter) return notFound();

  // Fetch experiments
  const { data: experiments } = await (supabase.from('experiments') as any)
    .select('*')
    .eq('chapter_id', params.id)
    .order('created_at', { ascending: true });

  const subjectName = Array.isArray(chapter.subject) ? chapter.subject[0].name : chapter.subject?.name;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/browse" style={{ color: 'var(--text-dim)', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
          ← Back to Browse
        </Link>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>
          {subjectName ? `${subjectName} — ` : ''}Chapter {chapter.chapter_number}: {chapter.title}
        </h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
          {experiments?.length || 0} Experiment{(experiments?.length !== 1) ? 's' : ''} available
        </p>
      </div>

      {!experiments || experiments.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔬</div>
          <h3 style={{ color: 'var(--text)' }}>No experiments found</h3>
          <p style={{ color: 'var(--text-dim)' }}>Experiments for this chapter will be added soon.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {experiments.map((exp: any) => {
            const thumb = getYouTubeThumbnail(exp.video_url);
            
            // Map difficulty to color
            const diffColor = exp.difficulty === 'easy' ? '#10b981' : exp.difficulty === 'medium' ? '#f59e0b' : '#ef4444';

            return (
              <Link 
                href={`/experiment/${exp.id}`} 
                key={exp.id} 
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
                className="experiment-card"
              >
                {/* Thumbnail */}
                <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--surface-2)', position: 'relative' }}>
                  {thumb ? (
                    <img src={thumb} alt={exp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2rem', opacity: 0.5 }}>
                      🎬
                    </div>
                  )}
                  {/* Difficulty Badge */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    right: '12px', 
                    background: diffColor, 
                    color: '#fff', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    padding: '4px 10px', 
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    {exp.difficulty}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                    {exp.title}
                  </h3>
                  {exp.objective && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {exp.objective}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
      
      {/* Quick hover style injection for cards since we are using inline styles mostly */}
      <style>{`
        .experiment-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
          border-color: var(--accent) !important;
        }
      `}</style>
    </div>
  );
}
