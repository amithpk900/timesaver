'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AddChapterPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [error, setError] = useState('');

  // Form State
  const [subjectId, setSubjectId] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [topics, setTopics] = useState<any[]>([
    {
      title: '',
      sort_order: 1,
      materials: [
        { type: 'notes', title: '', body: '', file_url: '' }
      ]
    }
  ]);

  useEffect(() => {
    async function loadSubjects() {
      const { data } = await (supabase.from('subjects') as any).select('id, name').order('name');
      if (data) setSubjects(data);
    }
    loadSubjects();
  }, [supabase]);

  const handleAddTopic = () => {
    setTopics([
      ...topics,
      { title: '', sort_order: topics.length + 1, materials: [] }
    ]);
  };

  const handleAddMaterial = (topicIndex: number) => {
    const newTopics = [...topics];
    newTopics[topicIndex].materials.push({ type: 'notes', title: '', body: '', file_url: '' });
    setTopics(newTopics);
  };

  const handleTopicChange = (index: number, field: string, value: any) => {
    const newTopics = [...topics];
    newTopics[index][field] = value;
    setTopics(newTopics);
  };

  const handleMaterialChange = (topicIndex: number, matIndex: number, field: string, value: any) => {
    const newTopics = [...topics];
    newTopics[topicIndex].materials[matIndex][field] = value;
    setTopics(newTopics);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!subjectId || !chapterTitle || !chapterNumber) {
      setError('Please fill in chapter details.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Chapter
      const { data: chapter, error: chapErr } = await (supabase
        .from('chapters') as any)
        .insert({ subject_id: subjectId, title: chapterTitle, chapter_number: chapterNumber })
        .select().single();
      
      if (chapErr) throw chapErr;

      // 2. Create Topics & Materials
      for (const topic of topics) {
        if (!topic.title) continue;
        
        const { data: newTopic, error: topErr } = await (supabase
          .from('topics') as any)
          .insert({ chapter_id: chapter.id, title: topic.title, sort_order: topic.sort_order })
          .select().single();
          
        if (topErr) throw topErr;

        // 3. Materials
        for (const mat of topic.materials) {
          if (!mat.title) continue;
          const { error: matErr } = await (supabase
            .from('study_materials') as any)
            .insert({
              topic_id: newTopic.id,
              type: mat.type,
              title: mat.title,
              body: mat.body || null,
              file_url: mat.file_url || null
            });
          if (matErr) throw matErr;
        }
      }

      router.push('/admin');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text)' }}>
        Add New Chapter Flow
      </h1>

      {error && <div style={{ color: 'var(--error)', background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Chapter Section */}
        <div style={sectionStyle}>
          <h2 style={sectionHeaderStyle}>1. Chapter Details</h2>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Subject</label>
            <select value={subjectId} onChange={e => setSubjectId(e.target.value)} style={inputStyle} required>
              <option value="">Select Subject</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Chapter #</label>
              <input type="number" value={chapterNumber} onChange={e => setChapterNumber(parseInt(e.target.value))} style={inputStyle} required min="1" />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Chapter Title</label>
              <input type="text" value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} style={inputStyle} required placeholder="e.g. Current Electricity" />
            </div>
          </div>
        </div>

        {/* Topics Section */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ ...sectionHeaderStyle, marginBottom: 0 }}>2. Topics & Materials</h2>
            <button type="button" onClick={handleAddTopic} style={btnSecondaryStyle}>+ Add Topic</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {topics.map((topic, tIdx) => (
              <div key={tIdx} style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Topic Title</label>
                  <input type="text" value={topic.title} onChange={e => handleTopicChange(tIdx, 'title', e.target.value)} style={inputStyle} placeholder="e.g. Ohm's Law" required />
                </div>

                <div style={{ marginTop: '1.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border)' }}>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1rem', letterSpacing: '0.05em' }}>Study Materials</h4>
                  
                  {topic.materials.map((mat: any, mIdx: number) => (
                    <div key={mIdx} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1rem', marginBottom: '1rem', alignItems: 'start' }}>
                      <select value={mat.type} onChange={e => handleMaterialChange(tIdx, mIdx, 'type', e.target.value)} style={inputStyle}>
                        <option value="notes">Notes</option>
                        <option value="summary">Summary</option>
                        <option value="formula_sheet">Formula Sheet</option>
                        <option value="pdf">PDF Link</option>
                      </select>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input type="text" value={mat.title} onChange={e => handleMaterialChange(tIdx, mIdx, 'title', e.target.value)} style={inputStyle} placeholder="Material Title" required />
                        {mat.type === 'pdf' ? (
                          <input type="text" value={mat.file_url} onChange={e => handleMaterialChange(tIdx, mIdx, 'file_url', e.target.value)} style={inputStyle} placeholder="https://..." required />
                        ) : (
                          <textarea value={mat.body} onChange={e => handleMaterialChange(tIdx, mIdx, 'body', e.target.value)} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Markdown content..." required />
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <button type="button" onClick={() => handleAddMaterial(tIdx)} style={{ ...btnSecondaryStyle, fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>+ Add Material</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ ...btnPrimaryStyle, width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
          {loading ? 'Saving Chapter...' : 'Save Entire Chapter'}
        </button>

      </form>
    </div>
  );
}

// Reusable inline styles for the form
const sectionStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '2rem',
};
const sectionHeaderStyle = {
  fontSize: '1.25rem',
  fontWeight: 700,
  color: 'var(--text)',
  marginBottom: '1.5rem',
};
const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.5rem',
  marginBottom: '1rem'
};
const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--text-dim)',
};
const inputStyle = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '0.75rem',
  color: 'var(--text)',
  fontSize: '0.95rem',
  outline: 'none',
};
const btnPrimaryStyle = {
  background: 'var(--accent)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '0.75rem 1.5rem',
  fontWeight: 600,
  cursor: 'pointer',
};
const btnSecondaryStyle = {
  background: 'var(--surface-2)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '0.6rem 1.25rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '0.9rem',
};
