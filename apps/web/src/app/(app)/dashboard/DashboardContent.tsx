'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Subject {
  id: string;
  name: string;
}

interface Experiment {
  id: string;
  title: string;
  video_url: string;
  chapter_id: any;
}

interface Props {
  firstName: string;
  subjects: Subject[];
  experiments: Experiment[];
}

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
  'Physics': '#1e3a8a',
  'Mathematics': '#0f766e',
  'Chemistry': '#b45309',
  'Biology': '#15803d',
};

function getIconForSubject(name: string) {
  return SUBJECT_ICON_MAP[name] || 'book';
}

function getColorForSubject(name: string) {
  return SUBJECT_COLOR_MAP[name] || '#334155';
}

export default function DashboardContent({ firstName, subjects, experiments }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const upcomingLessons = [
    { date: 'Jul 11', dateNum: '11', month: 'JUL', title: 'Calculus Fundamentals', time: '10:00 AM • Live Class', active: true },
    { date: 'Jul 12', dateNum: '12', month: 'JUL', title: 'Optics Lab Simulation', time: '2:30 PM • Virtual Lab', active: false },
    { date: 'Jul 14', dateNum: '14', month: 'JUL', title: 'Organic Chemistry Review', time: '11:00 AM • Study Group', active: false },
  ];

  return (
    <div className="p-10 pb-16">
      
      {/* Section 1: Welcome Header */}
      <section className="flex justify-between items-end mb-12">
        <div>
          <h1 className="font-montserrat font-semibold text-[32px] text-on-surface leading-tight">
            Welcome back, {firstName}.
          </h1>
          <p className="font-inter text-[18px] text-on-surface-variant mt-2">
            You're on track for your SSLC Board Exams. Ready to continue?
          </p>
        </div>
        <div className="bg-primary-container text-[#d4dcff] px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
          <span className="text-label-md font-bold tracking-wide">Current Rank: #1 Scholar</span>
        </div>
      </section>

      {/* Section 2: Bento Grid */}
      <section className="grid grid-cols-3 gap-6">
        
        {/* Card A: Academic Progress */}
        <div className="col-span-2 tonal-card p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-montserrat font-semibold text-[20px] text-on-surface">Academic Progress</h2>
            <span className="text-label-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
              Term 2 · Semester 1
            </span>
          </div>

          <div className="flex flex-col gap-6">
            {subjects.map(sub => {
              // Deterministic fake progress based on id length or char codes
              const hash = Array.from(sub.id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const completion = 25 + (hash % 60); // 25% to 85%
              
              return (
                <div key={sub.id} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">{getIconForSubject(sub.name)}</span>
                      </div>
                      <span className="text-label-md font-bold text-on-surface">{sub.name}</span>
                    </div>
                    <span className="text-label-md font-semibold text-secondary">{completion}% Complete</span>
                  </div>
                  
                  <div className="progress-track w-full">
                    <div 
                      className="progress-fill" 
                      style={{ width: mounted ? `${completion}%` : '0%' }}
                    />
                  </div>
                  
                  <span className="text-[12px] font-medium text-on-surface-variant ml-[52px]">
                    Current: Chapter {1 + (hash % 5)}
                  </span>
                </div>
              );
            })}
            
            {subjects.length === 0 && (
              <div className="text-on-surface-variant text-sm py-4">No subjects found for your profile.</div>
            )}
          </div>
        </div>

        {/* Card B: Upcoming Lessons */}
        <div className="col-span-1 tonal-card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-label-md font-bold text-on-surface">Upcoming Lessons</h2>
            <a href="#" className="text-primary text-label-sm font-bold hover:underline">View Calendar</a>
          </div>

          <div className="flex flex-col gap-4">
            {upcomingLessons.map((lesson, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 p-3 rounded-lg transition-colors hover:bg-surface-container-low border-l-4 ${lesson.active ? 'border-primary bg-primary-fixed/5' : 'border-outline-variant'}`}
              >
                {/* Date mini-card */}
                <div className="w-[42px] h-[48px] bg-surface-container rounded-md flex flex-col items-center justify-center shrink-0 border border-outline-variant/30">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">{lesson.month}</span>
                  <span className="text-[16px] font-bold text-on-surface leading-tight">{lesson.dateNum}</span>
                </div>
                {/* Info */}
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-label-md font-bold text-on-surface truncate">{lesson.title}</span>
                  <span className="text-label-sm text-on-surface-variant truncate mt-0.5">{lesson.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card C: Materials Quick Access */}
        <Link href="/materials" className="col-span-1 tonal-card p-6 cursor-pointer group hover:border-primary/30 transition-all flex flex-col justify-between h-[180px]">
          <div>
            <span className="material-symbols-outlined text-[36px] text-primary mb-3 transition-transform group-hover:scale-110">description</span>
            <h3 className="text-label-md font-bold text-on-surface">Study Materials Library</h3>
            <p className="text-label-sm text-on-surface-variant mt-1">Access notes, previous year papers, and textbook PDFs.</p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-primary text-label-sm font-bold group-hover:underline">Browse Materials →</span>
          </div>
        </Link>

        {/* Card D: Lab Quick Access */}
        <Link href="/equipment" className="col-span-1 tonal-card p-6 cursor-pointer group hover:border-primary/30 transition-all flex flex-col justify-between h-[180px]">
          <div>
            <span className="material-symbols-outlined text-[36px] text-primary mb-3 transition-transform group-hover:scale-110">deployed_code</span>
            <h3 className="text-label-md font-bold text-on-surface">Virtual Science Lab</h3>
            <p className="text-label-sm text-on-surface-variant mt-1">Next: Light – Reflection and Refraction Experiment</p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-primary text-label-sm font-bold group-hover:underline">Enter Lab →</span>
          </div>
        </Link>

        {/* Card E: New Experiments */}
        <div className="col-span-1 tonal-card p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-tertiary">movie</span>
            <h3 className="text-label-md font-bold text-on-surface">New Experiments</h3>
          </div>
          
          <div className="flex flex-col gap-4 flex-1">
            {experiments.length === 0 ? (
              <div className="text-on-surface-variant text-sm flex-1 flex items-center">No video experiments available yet.</div>
            ) : (
              experiments.map((exp, idx) => {
                // Safely extract subject name from the joined data if available
                const subjectObj = exp.chapter_id?.subject_id;
                const subjectName = subjectObj ? (Array.isArray(subjectObj) ? subjectObj[0]?.name : subjectObj.name) : 'Science';
                const bgColor = getColorForSubject(subjectName || 'Physics');
                
                return (
                  <div key={exp.id || idx} className="group cursor-pointer">
                    {/* 16:9 Thumbnail Placeholder */}
                    <div 
                      className="w-full aspect-video rounded-lg flex items-center justify-center relative overflow-hidden mb-2 shadow-sm"
                      style={{ backgroundColor: bgColor }}
                    >
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                      <span className="material-symbols-outlined text-white text-[48px] opacity-90 group-hover:scale-110 transition-transform z-10 drop-shadow-md">
                        play_circle
                      </span>
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        12:45
                      </div>
                    </div>
                    {/* Meta */}
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-on-surface leading-tight line-clamp-1">{exp.title}</span>
                      <span className="text-[11px] text-on-surface-variant mt-0.5">{subjectName} · 2 days ago</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {experiments.length > 0 && (
            <button className="w-full mt-4 py-2 border border-outline-variant rounded-lg text-label-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors">
              Browse All Videos
            </button>
          )}
        </div>

      </section>
    </div>
  );
}
