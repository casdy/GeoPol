'use client';

import React, { useState, useEffect } from 'react';
import { Radar, Twitter, Linkedin, Github, Shield, Info, Eye } from 'lucide-react';
import NewsletterForm from '@/components/shared/NewsletterForm';



interface FooterProps {
  onRoadmapClick?: () => void;
}

export default function Footer({ onRoadmapClick }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // ── Persistent Visitor Counter ──────────────────────────────────────
  const [visitorCount, setVisitorCount] = useState(0);
  
  useEffect(() => {
    // Retrieve previous count or start at 49 (so the first visit counts to 50)
    const storedStr = localStorage.getItem('geopol_visitors');
    const prevCount = storedStr ? parseInt(storedStr, 10) : 49;
    
    // Increment for this visit
    const newCount = prevCount + 1;
    localStorage.setItem('geopol_visitors', newCount.toString());
    setVisitorCount(newCount);

    // Provide a slow simulated upward tick so it feels "live" while using the app
    const interval = setInterval(() => {
      setVisitorCount((current) => {
        const next = current + Math.floor(Math.random() * 3); // 0 to 2 visitors
        localStorage.setItem('geopol_visitors', next.toString());
        return next;
      });
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full bg-slate-950 text-white border-t border-neutral-900 py-6 font-sans relative z-10">
      <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-24">
        
        {/* Compact Footer Row */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-8">
          {/* Brand & Version */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-black italic tracking-tighter text-white">
                GEO<span className="text-orange-500">POL</span>
              </h2>
            </div>
            <div className="hidden sm:block h-4 w-[1px] bg-neutral-800" />
            <p className="text-[10px] text-neutral-500 font-sans tracking-widest uppercase">
              Terminal V4.2.0 • GLOBAL INTEL
            </p>
          </div>

          {/* Social & Legal Mix */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <a href="#" className="text-neutral-500 hover:text-orange-500 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="text-neutral-500 hover:text-orange-500 transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
            <div className="h-4 w-[1px] bg-neutral-800" />
            <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-neutral-600">
              <a href="#" className="hover:text-neutral-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-neutral-400 transition-colors">Terms</a>
              <button 
                onClick={onRoadmapClick}
                className="text-orange-500/80 hover:text-orange-500 transition-colors"
              >
                Roadmap
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="border-t border-neutral-900 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 text-[9px] uppercase font-bold tracking-[0.2em] text-neutral-700">
            <p>© {currentYear} GEO POL INC.</p>
            <div className="flex items-center gap-2 border-l border-neutral-900 pl-6">
               <span className="relative flex h-1.5 w-1.5">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                 <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
               </span>
               <span className="text-green-500/60 tabular-nums">
                 {visitorCount.toLocaleString()} NODES ACTIVE
               </span>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <NewsletterForm variant="minimal" />
          </div>
        </div>
      </div>
    </footer>
  );
}
