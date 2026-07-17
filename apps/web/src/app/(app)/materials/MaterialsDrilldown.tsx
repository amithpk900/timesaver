'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Grade { id: string; name: string; }
interface Stream { id: string; name: string; }
interface Subject { id: string; name: string; grade_id: string; stream_id: string | null; }
interface Chapter { id: string; subject_id: string; title: string; chapter_number: number; topics?: any[] }
interface Topic { id: string; chapter_id: string; title: string; }
interface StudyMaterial { id: string; topic_id: string; type: string; title: string; }

const SUBJECT_ICON_MAP: Record<string, string> = {
  'Physics': 'science',
  'Mathematics': 'calculate',
  'Chemistry': 'biotech',
  'Biology': 'psychiatry',
  'English': 'menu_book',
  'Kannada': 'language',
  'Hindi': 'translate',
  'Social Science': 'public'
};

const SUBJECT_COLOR_MAP: Record<string, string> = {
  'Physics': '#1e3a8a', // blue-900
  'Mathematics': '#0f766e', // teal-700
  'Chemistry': '#b45309', // amber-700
  'Biology': '#15803d', // green-700
};

function getShortGrade(name: string) {
  if (name.includes('SSLC')) return 'SSLC';
  if (name.includes('1st')) return '1st PUC';
  if (name.includes('2nd')) return '2nd PUC';
  return name;
}

export default function MaterialsDrilldown({ grades, streams }: { grades: Grade[], streams: Stream[] }) {
  const supabase = createClient();
  
  const [selectedGradeId, setSelectedGradeId] = useState<string>(grades[0]?.id || '');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);

  // Load Subjects when Grade changes
  useEffect(() => {
    if (!selectedGradeId) return;
    let isMounted = true;
    
    async function loadSubjects() {
      const { data } = await supabase.from('subjects').select('*').eq('grade_id', selectedGradeId);
      if (isMounted) {
        setSubjects(data ?? []);
        setSelectedSubject(null);
        setSelectedChapter(null);
      }
    }
    loadSubjects();
    return () => { isMounted = false; };
  }, [selectedGradeId, supabase]);

  // Load Chapters when Subject changes
  useEffect(() => {
    if (!selectedSubject) {
      setChapters([]);
      return;
    }
    let isMounted = true;
    async function loadChapters() {
      const { data } = await supabase.from('chapters')
        .select('*, topics(id)')
        .eq('subject_id', selectedSubject!.id)
        .order('chapter_number');
      if (isMounted) setChapters(data ?? []);
    }
    loadChapters();
    return () => { isMounted = false; };
  }, [selectedSubject, supabase]);

  // Load Topics & Materials when Chapter changes
  useEffect(() => {
    if (!selectedChapter) {
      setTopics([]);
      setMaterials([]);
      return;
    }
    let isMounted = true;
    async function loadMaterialData() {
      const { data: tData } = await supabase.from('topics').select('*').eq('chapter_id', selectedChapter!.id);
      const tList = tData ?? [];
      let mData: StudyMaterial[] = [];
      if (tList.length > 0) {
        const topicIds = tList.map((t: any) => t.id);
        const { data } = await supabase.from('study_materials').select('*').in('topic_id', topicIds);
        mData = data ?? [];
      }
      if (isMounted) {
        setTopics(tList);
        setMaterials(mData);
      }
    }
    loadMaterialData();
    return () => { isMounted = false; };
  }, [selectedChapter, supabase]);

  const activeGradeName = grades.find(g => g.id === selectedGradeId)?.name || '';
  const isPUC = activeGradeName.includes('PUC');

  return (
    <div className="flex flex-col h-full bg-background font-inter overflow-hidden">
      
      {/* Page header */}
      <header className="px-10 py-4 border-b border-outline-variant flex justify-between items-center bg-surface shrink-0">
        <div>
          <h1 className="font-montserrat font-semibold text-[28px] text-on-surface">Study Materials Library</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Access notes, previous year papers, and textbook PDFs.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="bg-[#dcfce7] text-secondary px-3 py-1 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span className="text-label-sm font-bold">2024–25 Curriculum</span>
          </div>
          
          {/* Grade filter pill group */}
          <div className="bg-surface-container rounded-lg p-1 flex">
            {grades.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGradeId(g.id)}
                className={`px-4 py-1.5 rounded-md text-label-sm transition-colors ${
                  selectedGradeId === g.id
                    ? 'bg-white shadow text-primary font-bold'
                    : 'bg-transparent text-on-surface-variant font-medium hover:text-on-surface'
                }`}
              >
                {getShortGrade(g.name)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Body Layout */}
      <div className="flex-1 grid grid-cols-[280px_1fr] gap-6 px-10 py-6 overflow-hidden">
        
        {/* LEFT COLUMN — Subject selector */}
        <div className="flex flex-col h-full overflow-y-auto pr-2">
          <div className="text-[11px] uppercase tracking-wide text-on-surface-variant font-bold mb-4">Subjects</div>
          
          <div className="flex flex-col gap-2">
            {subjects.map(sub => {
              const isActive = selectedSubject?.id === sub.id;
              const color = SUBJECT_COLOR_MAP[sub.name] || '#6366f1'; // fallback indigo
              
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub)}
                  className={`flex items-center gap-3 p-2 rounded-xl text-left transition-all ${
                    isActive 
                      ? 'border' 
                      : 'border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                  style={{
                    borderColor: isActive ? color : undefined,
                    backgroundColor: isActive ? `${color}33` : undefined, // 20% opacity approx
                    boxShadow: isActive ? `0 0 0 2px ${color}22` : 'none' // 13% opacity approx
                  }}
                >
                  <div 
                    className="w-[36px] h-[36px] rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}1a`, color: color }}
                  >
                    <span className="material-symbols-outlined text-[20px]">{SUBJECT_ICON_MAP[sub.name] || 'book'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-label-md ${isActive ? 'font-bold' : 'font-semibold'} text-on-surface`}>
                      {sub.name}
                    </span>
                    <span className="text-label-sm text-on-surface-variant mt-0.5">Chapters</span>
                  </div>
                </button>
              );
            })}
            
            {subjects.length === 0 && (
              <div className="text-sm text-on-surface-variant">No subjects found.</div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col h-full overflow-y-auto pl-2">
          
          {/* State 1: No subject selected */}
          {!selectedSubject && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">menu_book</span>
              <p className="text-[16px] text-on-surface-variant">Select a subject to explore chapters</p>
            </div>
          )}

          {/* State 2: Subject selected, no chapter */}
          {selectedSubject && !selectedChapter && (
            <div className="flex flex-col">
              <div className="mb-6">
                <h2 className="font-montserrat font-semibold text-[20px] text-on-surface">{selectedSubject.name}</h2>
                <p className="text-label-sm text-on-surface-variant mt-1">
                  {getShortGrade(activeGradeName)}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {chapters.length === 0 ? (
                  <div className="text-on-surface-variant text-sm py-4 border-t border-outline-variant">No chapters available.</div>
                ) : (
                  chapters.map(ch => {
                    const totalTopics = ch.topics ? ch.topics.length : 0;
                    const completedTopics = 0; // Mocked for now
                    const progressPercent = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
                    
                    let ringClass = "bg-surface-container-high";
                    if (progressPercent === 100) ringClass = "bg-secondary text-white";
                    else if (progressPercent > 0) ringClass = "bg-primary-fixed text-primary";
                    
                    return (
                      <div 
                        key={ch.id}
                        onClick={() => setSelectedChapter(ch)}
                        className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-outline-variant cursor-pointer transition-all hover:-translate-y-[2px] hover:shadow-md group"
                      >
                        <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 text-label-sm font-bold ${ringClass}`}>
                          {ch.chapter_number}
                        </div>
                        
                        <div className="flex-1">
                          <div className="text-label-md font-semibold text-on-surface mb-1">{ch.title}</div>
                          <div className="progress-track w-full max-w-[200px] h-[6px] !bg-surface-container-high">
                            <div className="progress-fill !bg-primary" style={{ width: `${progressPercent}%` }} />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-on-surface-variant group-hover:text-primary transition-colors">
                          <span className="text-label-sm">{totalTopics} topics</span>
                          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* State 3: Chapter selected */}
          {selectedSubject && selectedChapter && (
            <div className="flex flex-col">
              {/* Breadcrumb */}
              <button 
                onClick={() => setSelectedChapter(null)}
                className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface text-label-sm font-semibold w-fit mb-4 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                {selectedSubject.name}
              </button>
              
              <h2 className="font-montserrat font-semibold text-[20px] text-on-surface mb-6">
                Ch {selectedChapter.chapter_number}. {selectedChapter.title}
              </h2>

              {/* Material Type Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                
                {/* Notes */}
                <div className="tonal-card p-5 border border-outline-variant flex flex-col justify-between hover:border-primary/40 transition-colors h-[140px]">
                  <div className="flex items-start justify-between">
                    <div className="w-[48px] h-[48px] rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">description</span>
                    </div>
                    <span className="text-label-sm text-on-surface-variant">{materials.filter(m => m.type === 'notes').length} files</span>
                  </div>
                  <div>
                    <h3 className="text-label-md font-bold text-on-surface">Class Notes</h3>
                    <a href="#" className="text-primary text-label-sm font-bold flex items-center gap-1 mt-1">Open <span className="material-symbols-outlined text-[16px]">arrow_forward</span></a>
                  </div>
                </div>

                {/* Formula Sheets */}
                <div className="tonal-card p-5 border border-outline-variant flex flex-col justify-between hover:border-[#0f766e]/40 transition-colors h-[140px]">
                  <div className="flex items-start justify-between">
                    <div className="w-[48px] h-[48px] rounded-full bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">functions</span>
                    </div>
                    <span className="text-label-sm text-on-surface-variant">0 files</span>
                  </div>
                  <div>
                    <h3 className="text-label-md font-bold text-on-surface">Formula Sheets</h3>
                    <a href="#" className="text-[#0f766e] text-label-sm font-bold flex items-center gap-1 mt-1">Open <span className="material-symbols-outlined text-[16px]">arrow_forward</span></a>
                  </div>
                </div>

                {/* PDFs / Textbooks */}
                <div className="tonal-card p-5 border border-outline-variant flex flex-col justify-between hover:border-error/40 transition-colors h-[140px]">
                  <div className="flex items-start justify-between">
                    <div className="w-[48px] h-[48px] rounded-full bg-error/10 text-error flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                    </div>
                    <span className="text-label-sm text-on-surface-variant">{materials.filter(m => m.type === 'pdf').length} files</span>
                  </div>
                  <div>
                    <h3 className="text-label-md font-bold text-on-surface">Textbook PDFs</h3>
                    <a href="#" className="text-error text-label-sm font-bold flex items-center gap-1 mt-1">Open <span className="material-symbols-outlined text-[16px]">arrow_forward</span></a>
                  </div>
                </div>

                {/* Summaries */}
                <div className="tonal-card p-5 border border-outline-variant flex flex-col justify-between hover:border-tertiary/40 transition-colors h-[140px]">
                  <div className="flex items-start justify-between">
                    <div className="w-[48px] h-[48px] rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">summarize</span>
                    </div>
                    <span className="text-label-sm text-on-surface-variant">0 files</span>
                  </div>
                  <div>
                    <h3 className="text-label-md font-bold text-on-surface">Quick Summaries</h3>
                    <a href="#" className="text-tertiary text-label-sm font-bold flex items-center gap-1 mt-1">Open <span className="material-symbols-outlined text-[16px]">arrow_forward</span></a>
                  </div>
                </div>

              </div>

              {/* Topics section */}
              <div>
                <h4 className="text-[12px] uppercase tracking-wide text-on-surface-variant font-bold mb-3">Topics in this chapter</h4>
                <div className="flex flex-wrap gap-2">
                  {topics.length === 0 ? (
                    <span className="text-label-sm text-on-surface-variant">No topics found.</span>
                  ) : (
                    topics.map(t => (
                      <div key={t.id} className="bg-primary-fixed text-primary px-3 py-1.5 rounded-full text-label-sm font-medium border border-primary/20">
                        {t.title}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
