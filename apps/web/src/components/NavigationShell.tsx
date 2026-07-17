'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  userFullName: string;
  gradeName: string;
  streamName?: string;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Materials', href: '/materials', icon: 'menu_book' },
  { label: 'Lab', href: '/equipment', icon: 'biotech' },
  { label: 'Profile', href: '/profile', icon: 'person' },
];

export default function NavigationShell({ userFullName, gradeName, streamName, children }: Props) {
  const pathname = usePathname();

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-inter">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 w-[256px] bg-surface-container-lowest border-r border-[#e5e7eb] flex flex-col z-20">
        
        {/* Top Section */}
        <div className="px-6 py-8 flex flex-col">
          <div className="font-montserrat font-bold text-[20px] text-primary">
            EduPortal
          </div>
          <div className="font-inter text-[11px] text-on-surface-variant opacity-70 mt-1">
            Karnataka Study Hub
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 flex flex-col gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative
                  ${isActive 
                    ? 'bg-primary-fixed/20 text-primary font-bold' 
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                  }
                `}
              >
                {/* Active right border indicator (using absolute positioning inside the link) */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-[4px] bg-primary rounded-l-full" />
                )}
                
                <span 
                  className="material-symbols-outlined" 
                  style={{ 
                    fontSize: '22px', 
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" 
                  }}
                >
                  {item.icon}
                </span>
                <span className="text-[15px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-4 pb-8 mt-auto">
          <button 
            className="w-full bg-primary text-white rounded-xl p-3 font-semibold text-[14px] flex items-center justify-center gap-2 transition-transform hover:-translate-y-[2px]"
            style={{ boxShadow: '0 4px 12px rgba(0, 63, 177, 0.25)' }}
          >
            <span className="material-symbols-outlined text-[18px]">group_add</span>
            Join Study Group
          </button>
        </div>
      </aside>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-[256px] right-0 h-[64px] bg-surface border-b border-outline-variant flex items-center justify-between px-6 z-10">
        
        {/* Left: Search Bar */}
        <div className="relative w-[360px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input 
            type="text" 
            placeholder="Search curriculum topics..." 
            className="w-full bg-surface-container-low rounded-full pl-10 pr-4 py-2 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/70"
          />
        </div>

        {/* Right: User actions */}
        <div className="flex items-center gap-3">
          
          <button className="relative p-2 rounded-full hover:bg-surface-container-highest transition-colors flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            {/* Error-colored dot indicator */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-surface"></span>
          </button>

          <button className="p-2 rounded-full hover:bg-surface-container-highest transition-colors flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[24px]">help</span>
          </button>

          {/* Divider */}
          <div className="w-[1px] h-8 bg-outline-variant mx-2"></div>

          {/* User Info */}
          <div className="flex items-center gap-3 cursor-pointer p-1 pr-2 rounded-full hover:bg-surface-container-highest transition-colors">
            <div className="flex flex-col items-end">
              <span className="text-label-md text-on-surface font-bold leading-tight">
                {userFullName}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold mt-[2px]">
                {gradeName} {streamName ? `• ${streamName}` : ''}
              </span>
            </div>
            
            {/* Avatar */}
            <div 
              className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-primary-container font-montserrat font-bold text-[14px]"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-fixed), var(--color-primary-fixed-dim))' }}
            >
              {getInitials(userFullName)}
            </div>
          </div>
          
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 ml-[256px] mt-[64px] overflow-auto relative bg-background">
        {children}
      </main>
    </div>
  );
}
