'use client';

import React, { useState, useEffect, useRef, type ReactNode } from 'react';
import { useCommandCenterAnimation } from '@/hooks/useCommandCenterAnimation';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical } from 'lucide-react';

interface CommandCenterLayoutProps {
  mapSlot: ReactNode;
  slotMapping: Record<string, string>;
  onSwap: (from: string, to: string) => void;
  intelComponent: ReactNode;
  videoComponent: ReactNode;
  metricsComponent: ReactNode;
}

export default function CommandCenterLayout({
  mapSlot,
  slotMapping,
  onSwap,
  intelComponent,
  videoComponent,
  metricsComponent
}: CommandCenterLayoutProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const lbRef = useRef<HTMLDivElement>(null);
  const rtRef = useRef<HTMLDivElement>(null);
  const rbRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);

  // Animation hook (updated refs)
  useCommandCenterAnimation({ 
    mapRef, 
    leftFeedRef: lbRef, 
    rightPaneRef, 
    feedRef: rbRef 
  });

  // Vertical Resizer State
  const [rightSplit, setRightSplit] = useState(45); // % height for the top slot
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!rightPaneRef.current) return;
      const rect = rightPaneRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const percentage = (relativeY / rect.height) * 100;
      setRightSplit(Math.min(Math.max(percentage, 20), 80));
    };

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Component Resolver
  const getComponent = (id: string) => {
    switch (id) {
      case 'intel': return intelComponent;
      case 'video': return videoComponent;
      case 'metrics': return metricsComponent;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-2 p-2 lg:h-full w-full lg:overflow-hidden bg-[#050505]">
      
      {/* ── LEFT COLUMN (65%) ────────────────────────────────────── */}
      <div className="col-span-1 lg:col-span-8 flex flex-col lg:h-full lg:overflow-hidden gap-2">
        {/* Top: Fixed Map */}
        <div ref={mapRef} className="min-h-[50vh] lg:min-h-0 lg:h-[55%] relative border border-slate-800 rounded-sm overflow-hidden bg-black shadow-2xl">
          {mapSlot}
        </div>

        {/* Bottom Slot: LB */}
        <div 
          ref={lbRef} 
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            const from = window.__dragging_slot;
            if (from) onSwap(from, 'LB');
          }}
          className="flex-1 lg:overflow-y-auto custom-scrollbar border border-slate-800 bg-black rounded-sm min-h-[200px] relative transition-colors duration-300 hover:border-cyan-900/50"
        >
          <div 
            draggable 
            onDragStart={() => { window.__dragging_slot = 'LB'; }}
            className="absolute top-2 right-2 z-20 cursor-grab active:cursor-grabbing p-1 bg-black/40 border border-white/5 opacity-40 hover:opacity-100 hover:bg-cyan-500/20 transition-all"
          >
            <GripVertical className="w-3 h-3 text-cyan-500" />
          </div>
          {getComponent(slotMapping['LB'])}
        </div>
      </div>

      {/* ── RIGHT COLUMN (35%) ───────────────────────────────────── */}
      <div 
        ref={rightPaneRef} 
        className="col-span-1 lg:col-span-4 flex flex-col lg:h-full lg:overflow-hidden gap-2 relative"
      >
        {/* Top Slot: RT */}
        <div 
          ref={rtRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            const from = window.__dragging_slot;
            if (from) onSwap(from, 'RT');
          }}
          style={{ height: `calc(${rightSplit}% - 4px)` }}
          className="flex-shrink-0 lg:overflow-y-auto custom-scrollbar border border-slate-800 rounded-sm overflow-hidden bg-black flex flex-col relative transition-colors duration-300 hover:border-cyan-900/50"
        >
          <div 
            draggable 
            onDragStart={() => { window.__dragging_slot = 'RT'; }}
            className="absolute top-2 right-2 z-20 cursor-grab active:cursor-grabbing p-1 bg-black/40 border border-white/5 opacity-40 hover:opacity-100 hover:bg-cyan-500/20 transition-all"
          >
            <GripVertical className="w-3 h-3 text-cyan-500" />
          </div>
          {getComponent(slotMapping['RT'])}
        </div>

        {/* Resizer Handle */}
        <div 
          onMouseDown={startResizing}
          className={`h-1.5 w-full cursor-row-resize flex items-center justify-center transition-all ${isResizing ? 'bg-cyan-500' : 'bg-slate-800 hover:bg-cyan-500/50'}`}
        >
          <div className="w-8 h-0.5 bg-white/10 rounded-full" />
        </div>

        {/* Bottom Slot: RB */}
        <div
          ref={rbRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            const from = window.__dragging_slot;
            if (from) onSwap(from, 'RB');
          }}
          className="flex-1 lg:overflow-y-auto custom-scrollbar border border-slate-800 rounded-sm bg-black min-h-0 relative transition-colors duration-300 hover:border-cyan-900/50"
        >
          <div 
            draggable 
            onDragStart={() => { window.__dragging_slot = 'RB'; }}
            className="absolute top-2 right-2 z-20 cursor-grab active:cursor-grabbing p-1 bg-black/40 border border-white/5 opacity-40 hover:opacity-100 hover:bg-cyan-500/20 transition-all"
          >
            <GripVertical className="w-3 h-3 text-cyan-500" />
          </div>
          {getComponent(slotMapping['RB'])}
        </div>
      </div>
    </div>
  );
}

// Global declaration for simple DND state tracking across components
declare global {
  interface Window {
    __dragging_slot?: string;
  }
}
