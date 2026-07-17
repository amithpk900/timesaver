'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AddExperimentPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [chapters, setChapters] = useState<any[]>([]);
  const [allEquipment, setAllEquipment] = useState<any[]>([]);
  const [error, setError] = useState('');

  // Experiment State
  const [chapterId, setChapterId] = useState('');
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [procedure, setProcedure] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  
  // Equipment Linking
  const [selectedEqIds, setSelectedEqIds] = useState<string[]>([]);
  
  // Inline New Equipment
  const [showNewEq, setShowNewEq] = useState(false);
  const [newEqName, setNewEqName] = useState('');
  const [newEqDesc, setNewEqDesc] = useState('');
  const [newEqFile, setNewEqFile] = useState<File | null>(null);
  const [newEqThumbnail, setNewEqThumbnail] = useState('');

  useEffect(() => {
    async function loadData() {
      const [chRes, eqRes] = await Promise.all([
        (supabase.from('chapters') as any).select('id, title, chapter_number, subject_id(name)').order('chapter_number'),
        (supabase.from('equipment') as any).select('id, name').order('name')
      ]);
      if (chRes.data) setChapters(chRes.data);
      if (eqRes.data) setAllEquipment(eqRes.data);
    }
    loadData();
  }, [supabase]);

  const toggleEqSelection = (id: string) => {
    setSelectedEqIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewEqFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!chapterId || !title) {
      setError('Please fill in required experiment details.');
      return;
    }

    setLoading(true);

    try {
      let finalEqIds = [...selectedEqIds];

      // 1. Handle New Equipment Creation + Upload if requested
      if (showNewEq && newEqName) {
        let modelGlbUrl = '';
        
        if (newEqFile) {
          // Upload to Supabase Storage bucket 'models'
          const fileExt = newEqFile.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('models')
            .upload(fileName, newEqFile, { cacheControl: '3600', upsert: false });

          if (uploadError) throw new Error('File upload failed: ' + uploadError.message);
          
          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('models')
            .getPublicUrl(uploadData.path);
            
          modelGlbUrl = publicUrlData.publicUrl;
        }

        // Insert into equipment table
        const { data: insertedEq, error: eqErr } = await (supabase
          .from('equipment') as any)
          .insert({
            name: newEqName,
            description: newEqDesc || null,
            model_glb_url: modelGlbUrl || null,
            thumbnail_url: newEqThumbnail || null
          })
          .select().single();
          
        if (eqErr) throw eqErr;
        
        finalEqIds.push(insertedEq.id);
      }

      // 2. Insert Experiment
      const { data: experiment, error: expErr } = await (supabase
        .from('experiments') as any)
        .insert({
          chapter_id: chapterId,
          title,
          objective,
          procedure,
          video_url: videoUrl || null,
          difficulty
        })
        .select().single();

      if (expErr) throw expErr;

      // 3. Link Equipment to Experiment
      if (finalEqIds.length > 0) {
        const joinRows = finalEqIds.map(eqId => ({
          experiment_id: experiment.id,
          equipment_id: eqId
        }));
        const { error: joinErr } = await (supabase.from('experiment_equipment') as any).insert(joinRows);
        if (joinErr) throw joinErr;
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
        Add New Experiment Flow
      </h1>

      {error && <div style={{ color: 'var(--error)', background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Experiment Details */}
        <div style={sectionStyle}>
          <h2 style={sectionHeaderStyle}>1. Experiment Details</h2>
          
          <div style={formGroupStyle}>
            <label style={labelStyle}>Chapter</label>
            <select value={chapterId} onChange={e => setChapterId(e.target.value)} style={inputStyle} required>
              <option value="">Select Chapter</option>
              {chapters.map(ch => (
                <option key={ch.id} value={ch.id}>
                  {(ch.subject_id as any)?.name} - Ch {ch.chapter_number}: {ch.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} required />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={inputStyle}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>YouTube Video URL (Optional)</label>
            <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} style={inputStyle} placeholder="https://www.youtube.com/watch?v=..." />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Objective</label>
            <textarea value={objective} onChange={e => setObjective(e.target.value)} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Procedure (Markdown)</label>
            <textarea value={procedure} onChange={e => setProcedure(e.target.value)} style={{ ...inputStyle, minHeight: '150px', resize: 'vertical', fontFamily: 'monospace' }} />
          </div>
        </div>

        {/* Equipment Selection */}
        <div style={sectionStyle}>
          <h2 style={sectionHeaderStyle}>2. Equipment Requirements</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>Select existing equipment required for this experiment.</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
            {allEquipment.map(eq => (
              <label key={eq.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: selectedEqIds.includes(eq.id) ? 'var(--accent-light)' : 'var(--surface-2)', padding: '0.5rem 1rem', borderRadius: '100px', cursor: 'pointer', border: `1px solid ${selectedEqIds.includes(eq.id) ? 'var(--accent)' : 'var(--border)'}`, color: selectedEqIds.includes(eq.id) ? 'var(--accent)' : 'var(--text)' }}>
                <input 
                  type="checkbox" 
                  checked={selectedEqIds.includes(eq.id)} 
                  onChange={() => toggleEqSelection(eq.id)}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '0.9rem', fontWeight: selectedEqIds.includes(eq.id) ? 700 : 500 }}>{eq.name}</span>
              </label>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, cursor: 'pointer', color: 'var(--text)' }}>
              <input type="checkbox" checked={showNewEq} onChange={e => setShowNewEq(e.target.checked)} />
              + Add New Equipment Inline
            </label>
            
            {showNewEq && (
              <div style={{ marginTop: '1rem', background: 'var(--bg)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Equipment Name *</label>
                  <input type="text" value={newEqName} onChange={e => setNewEqName(e.target.value)} style={inputStyle} required={showNewEq} />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Description</label>
                  <textarea value={newEqDesc} onChange={e => setNewEqDesc(e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>3D Model (.glb) Upload</label>
                  <input type="file" accept=".glb" onChange={handleFileChange} style={{ ...inputStyle, padding: '0.5rem' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>File will be uploaded to Supabase Storage 'models' bucket.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ ...btnPrimaryStyle, width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
          {loading ? 'Saving Experiment...' : 'Save Entire Experiment'}
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
