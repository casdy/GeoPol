'use client';

import React, { useState, useEffect } from 'react';
import { Radar, Twitter, Github } from 'lucide-react';

export default function Footer() {
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
    <footer className="fixed bottom-0 left-0 w-full bg-slate-950/80 backdrop-blur-md text-white border-t border-neutral-900 py-2 px-4 sm:px-8 z-50 flex items-center justify-between font-sans">
      
      {/* Left: Brand & Status */}
      <div className="flex items-center gap-4 sm:gap-8">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-orange-500" />
          <h2 className="text-sm font-black italic tracking-tighter text-white uppercase">
            GEO<span className="text-orange-500">POL</span>
          </h2>
          <span className="hidden sm:inline text-[9px] text-neutral-600 font-bold tracking-widest uppercase ml-2 pt-0.5">
            Terminal V4.2.0 • GLOBAL INTEL
          </span>
        </div>

        <div className="flex items-center gap-2 border-l border-neutral-800 pl-4 sm:pl-8">
           <span className="relative flex h-1.5 w-1.5">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
             <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
           </span>
           <span className="text-[9px] font-bold text-green-500/80 tabular-nums uppercase tracking-widest">
             {visitorCount.toLocaleString()} NODES ACTIVE
           </span>
        </div>
      </div>

      {/* Right: Copyright & Socials */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden md:block text-[9px] font-bold text-neutral-700 uppercase tracking-widest">
          © {currentYear} GEO POL INC.
        </div>
        
        <div className="h-4 w-[1px] bg-neutral-800 hidden md:block" />
        
        <div className="flex items-center gap-4">
          <a href="#" className="text-neutral-500 hover:text-orange-500 transition-colors">
            <Twitter className="w-3.5 h-3.5" />
          </a>
          <a href="#" className="text-neutral-500 hover:text-orange-500 transition-colors">
            <Github className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

    </footer>
  );
}
