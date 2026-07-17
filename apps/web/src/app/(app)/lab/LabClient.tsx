'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Script from 'next/script';

export default function LabClient({ experiments, equipmentMap, progress: initialProgress, userId }: any) {
  const [activeExpId, setActiveExpId] = useState<string>(experiments[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'procedure' | 'materials'>('procedure');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [progress, setProgress] = useState<any[]>(initialProgress || []);
  
  const supabase = createClient();

  const activeExp = experiments.find((e: any) => e.id === activeExpId);
  const equipment = activeExp ? (equipmentMap[activeExp.id] || []) : [];

  // Reset video state on experiment change
  useEffect(() => {
    setVideoPlaying(false);
    setActiveTab('procedure');
  }, [activeExpId]);

  const toggleStep = async (step: string, currentlyCompleted: boolean) => {
    if (!activeExp) return;
    
    if (currentlyCompleted) {
      await supabase.from('lab_progress').delete().match({ user_id: userId, experiment_id: activeExp.id, step });
      setProgress(prev => prev.filter(p => !(p.experiment_id === activeExp.id && p.step === step)));
    } else {
      const newRow = { user_id: userId, experiment_id: activeExp.id, step };
      await supabase.from('lab_progress').insert(newRow);
      setProgress(prev => [...prev, { ...newRow, completed_at: new Date().toISOString() }]);
    }
  };

  if (!activeExp) {
    return <div className="p-10 font-inter">No experiments available.</div>;
  }

  // Parse procedure simple markdown (assuming numbered list or separated by newlines)
  const procedureSteps = (activeExp.procedure || '')
    .split('\n')
    .filter((line: string) => line.trim().length > 0)
    .map((line: string) => line.replace(/^\d+[\.\)]\s*/, '').trim());

  // Progress calculations
  const stepsList = ['Setup & Introduction', 'Slide Preparation', 'Data Analysis Task'];
  const expProgress = progress.filter(p => p.experiment_id === activeExp.id);
  const completedStepsCount = stepsList.filter(s => expProgress.some(p => p.step === s)).length;
  const progressPercent = Math.round((completedStepsCount / stepsList.length) * 100);

  // Difficulty logic
  const difficulty = (activeExp.difficulty || 'medium').toLowerCase();
  let diffColor = 'bg-primary';
  let diffBars = [1, 0, 0];
  if (difficulty === 'easy') { diffBars = [1, 0, 0]; diffColor = 'bg-secondary'; }
  if (difficulty === 'medium') { diffBars = [1, 1, 0]; diffColor = 'bg-[#f59e0b]'; }
  if (difficulty === 'hard') { diffBars = [1, 1, 1]; diffColor = 'bg-error'; }

  // 3D Model logic
  const primaryEquipment = equipment.length > 0 ? equipment[0] : null;

  return (
    <div className="flex flex-col h-full bg-background font-inter overflow-hidden">
      
      {/* Script for model-viewer */}
      <Script src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js" type="module" strategy="lazyOnload" />

      {/* Experiment tabs */}
      <div className="px-10 pt-4 border-b border-outline-variant flex gap-6 shrink-0 overflow-x-auto bg-surface">
        {experiments.map((exp: any) => (
          <button
            key={exp.id}
            onClick={() => setActiveExpId(exp.id)}
            className={`pb-3 font-semibold text-[15px] whitespace-nowrap transition-colors border-b-2 ${
              activeExpId === exp.id
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {exp.title}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-10">
        
        {/* Header */}
        <div className="mb-8">
          <div className="text-label-sm text-outline font-bold mb-2 uppercase tracking-wider">
            {activeExp.chapter?.subject?.name || 'Subject'} / {activeExp.chapter?.title || 'Chapter'} / Lab
          </div>
          <h1 className="font-montserrat font-semibold text-[26px] text-on-surface mb-2">
            {activeExp.title}
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-2xl">
            {activeExp.objective || 'No objective provided.'}
          </p>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-[1fr_380px] gap-6">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6">
            
            {/* Video Player */}
            <div className="lab-viewport w-full aspect-video rounded-xl relative bg-[#000a1a] shadow-lg overflow-hidden group">
              
              {!videoPlaying && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
                  
                  {/* Top-left badge */}
                  <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-2 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_var(--color-secondary)]"></div>
                    <span className="text-white text-label-sm font-bold">Lecture Recording</span>
                  </div>

                  {/* Top-right button */}
                  <button className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-white/30 text-white hover:bg-white/20 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">close_fullscreen</span>
                    <span className="text-label-sm font-bold">Exit Focus</span>
                  </button>

                  {/* Play Button */}
                  <button 
                    onClick={() => {
                      if (activeExp.video_url) setVideoPlaying(true);
                      else alert('No video URL available for this experiment.');
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[72px] h-[72px] rounded-full bg-primary/80 backdrop-blur flex items-center justify-center transition-transform hover:scale-110"
                    style={{ boxShadow: '0 8px 32px rgba(0,63,177,0.5)' }}
                  >
                    <span className="material-symbols-outlined text-white text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  </button>

                  {/* Bottom Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col gap-3">
                    <div className="w-full h-[4px] bg-white/20 rounded-full overflow-hidden cursor-pointer">
                      <div className="h-full bg-primary w-1/3 rounded-full"></div>
                    </div>
                    <div className="flex justify-between items-center text-white">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined cursor-pointer" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                        <span className="material-symbols-outlined cursor-pointer" style={{ fontVariationSettings: "'FILL' 1" }}>volume_up</span>
                        <span className="text-[13px] font-medium opacity-90 tracking-wide">04:12 / 12:45</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined cursor-pointer">closed_caption</span>
                        <span className="material-symbols-outlined cursor-pointer">settings</span>
                        <span className="material-symbols-outlined cursor-pointer">fullscreen</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {videoPlaying && activeExp.video_url && (
                <iframe
                  src={`${activeExp.video_url.replace('watch?v=', 'embed/')}?autoplay=1`}
                  className="absolute inset-0 w-full h-full z-0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                ></iframe>
              )}
            </div>

            {/* Procedure / Material List tabs */}
            <div className="glass-card rounded-xl border border-outline-variant overflow-hidden">
              <div className="flex border-b border-outline-variant bg-surface-container-lowest">
                <button 
                  onClick={() => setActiveTab('procedure')}
                  className={`flex-1 py-3 text-center text-label-md font-bold transition-colors border-b-2 ${activeTab === 'procedure' ? 'border-primary bg-primary-fixed/20 text-primary' : 'border-transparent text-on-surface-variant hover:bg-surface-container-low'}`}
                >
                  Procedure
                </button>
                <button 
                  onClick={() => setActiveTab('materials')}
                  className={`flex-1 py-3 text-center text-label-md font-bold transition-colors border-b-2 ${activeTab === 'materials' ? 'border-primary bg-primary-fixed/20 text-primary' : 'border-transparent text-on-surface-variant hover:bg-surface-container-low'}`}
                >
                  Material List
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'procedure' && (
                  <div className="flex flex-col gap-6">
                    {procedureSteps.length === 0 && <span className="text-on-surface-variant text-sm">No procedure steps defined.</span>}
                    {procedureSteps.map((step: string, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 font-bold text-[14px] ${idx === 0 ? 'bg-primary-container text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                          {idx + 1}
                        </div>
                        <div className="flex flex-col pt-1">
                          <span className="text-label-md font-bold text-on-surface">Step {idx + 1}</span>
                          <span className="text-body-md text-on-surface-variant mt-1">{step}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'materials' && (
                  <div className="grid grid-cols-2 gap-4">
                    {equipment.length === 0 && <span className="text-on-surface-variant text-sm col-span-2">No materials linked to this experiment.</span>}
                    {equipment.map((eq: any) => (
                      <div key={eq.id} className="bg-surface-container rounded-lg p-3 flex items-center gap-3 border border-outline-variant/50">
                        <div className="w-[36px] h-[36px] rounded-md bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined">biotech</span>
                        </div>
                        <span className="text-label-md font-semibold text-on-surface">{eq.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">
            
            {/* Interactive 3D Viewer */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface">
                <h3 className="font-montserrat font-semibold text-[16px] text-on-surface">Interactive 3D</h3>
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">open_in_full</span>
                </button>
              </div>
              
              <div className="h-[300px] w-full relative" style={{ background: 'linear-gradient(to bottom, #0a0f1e, #1a1f2e)' }}>
                {primaryEquipment?.model_glb_url ? (
                  // @ts-ignore - model-viewer is a web component
                  <model-viewer
                    src={primaryEquipment.model_glb_url}
                    alt={primaryEquipment.name}
                    camera-controls
                    auto-rotate
                    ar
                    style={{ width: '100%', height: '100%' }}
                  ></model-viewer>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-white/20 text-[64px] mb-4">view_in_ar</span>
                    <span className="text-white/35 text-label-sm font-semibold tracking-wide">Drag to Rotate · Scroll to Zoom</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col">
                <div className="bg-surface-container-high rounded-lg p-4 min-h-[110px] mb-4 border border-outline-variant/30">
                  <div className="text-label-sm font-bold text-on-surface mb-1">Equipment Inspector</div>
                  <div className="text-[13px] text-on-surface-variant italic">Select a hotspot on the 3D model above to view component details and usage instructions here.</div>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 py-2 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary-fixed/20 transition-colors text-[14px]">
                    Take Quiz
                  </button>
                  <button className="flex-1 py-2 bg-secondary text-white font-bold rounded-lg hover:bg-secondary/90 transition-colors text-[14px] shadow-sm">
                    Start Sim
                  </button>
                </div>
              </div>
            </div>

            {/* Lab Progress */}
            <div className="glass-card p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-label-md font-bold text-on-surface">Lab Progress</h3>
                <span className="text-secondary font-bold text-[14px]">{progressPercent}% Complete</span>
              </div>
              <div className="progress-track w-full h-[6px] mb-5">
                <div className="progress-fill bg-secondary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
              
              <div className="flex flex-col gap-3">
                {stepsList.map((stepStr, i) => {
                  const isDone = expProgress.some(p => p.step === stepStr);
                  // Mock locking third step if first two aren't done
                  const isLocked = i === 2 && completedStepsCount < 2;
                  
                  return (
                    <div 
                      key={stepStr} 
                      onClick={() => !isLocked && toggleStep(stepStr, isDone)}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-surface-container-low'}`}
                    >
                      <span 
                        className={`material-symbols-outlined text-[22px] ${isDone ? 'text-secondary' : isLocked ? 'text-outline' : 'text-outline-variant'}`}
                        style={{ fontVariationSettings: isDone ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {isDone ? 'check_circle' : isLocked ? 'lock' : 'radio_button_unchecked'}
                      </span>
                      <span className={`text-[14px] font-medium ${isDone ? 'text-on-surface' : 'text-on-surface-variant'}`}>{stepStr}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Badge */}
            <div className="tonal-card p-5 rounded-xl border border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-[40px] h-[40px] rounded-full bg-surface flex items-center justify-center border border-outline-variant/30 text-on-surface`}>
                  <span className="material-symbols-outlined">bar_chart</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wide">Difficulty</span>
                  <span className="text-[15px] font-bold text-on-surface capitalize">{difficulty}</span>
                </div>
              </div>
              
              <div className="flex gap-1.5">
                {[0, 1, 2].map((idx) => (
                  <div 
                    key={idx} 
                    className={`w-[12px] h-[24px] rounded-sm transition-colors ${diffBars[idx] ? diffColor : 'bg-surface-container-highest'}`}
                  ></div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
