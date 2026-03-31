'use client';

import React from 'react';
import { Radar, Globe } from 'lucide-react';
import CommandCenterLayout from '../layout/CommandCenterLayout';
import { ItemCardSkeleton } from './ItemCardSkeleton';

export default function DashboardSkeleton() {
  return (
    <div className="w-full animate-in fade-in duration-500">
      <CommandCenterLayout
        mapSlot={
          <div className="w-full h-full bg-neutral-900/40 relative overflow-hidden flex items-center justify-center border border-neutral-800/50">
            {/* Map Grid Pattern Pseudo-Pulse */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <Radar className="w-12 h-12 text-neutral-800" />
                <div className="text-[10px] font-mono text-neutral-700 tracking-[0.4em] uppercase">Initializing Theater...</div>
            </div>
            
            {/* HUD Mock Skeletons */}
            <div className="absolute top-4 left-4 space-y-2">
                <div className="h-2 w-32 bg-neutral-800/40 rounded animate-pulse" />
                <div className="h-2 w-24 bg-neutral-800/20 rounded animate-pulse" />
            </div>
          </div>
        }
        slotMapping={{ LB: 'intel', RT: 'video', RB: 'metrics' }}
        onSwap={() => {}}
        intelComponent={
          <div className="flex flex-col h-full bg-[#050505] p-3">
             <div className="flex items-center gap-2 mb-4">
                <Radar className="w-3 h-3 text-neutral-800 animate-pulse" />
                <div className="h-3 w-40 bg-neutral-900 rounded-sm animate-pulse" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <ItemCardSkeleton key={i} variant="tactical-image" />
                ))}
             </div>
          </div>
        }
        videoComponent={
          <div className="aspect-video w-full bg-neutral-900/60 flex items-center justify-center relative border-b border-neutral-800">
             <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-neutral-800" />
                <div className="text-[8px] font-mono text-neutral-700">LINKING STREAM...</div>
             </div>
          </div>
        }
        metricsComponent={
          <div className="flex flex-col bg-black/40 h-full">
            <div className="px-3 py-4 border-b border-neutral-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-neutral-800" />
                  <div className="h-3 w-24 bg-neutral-900 rounded animate-pulse" />
                </div>
            </div>
            <div className="p-3 space-y-4">
               {[1, 2, 3, 4, 5, 6].map(i => (
                 <div key={i} className="space-y-2 pb-4 border-b border-white/5">
                    <div className="h-2 w-16 bg-orange-950/20 rounded animate-pulse" />
                    <div className="h-4 w-full bg-neutral-900 rounded animate-pulse" />
                    <div className="h-2 w-2/3 bg-neutral-800/40 rounded animate-pulse" />
                 </div>
               ))}
            </div>
          </div>
        }
      />
    </div>
  );
}
