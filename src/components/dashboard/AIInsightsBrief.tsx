'use client';

import { Globe } from 'lucide-react';

export default function AIInsightsBrief({ content }: { content?: string }) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 shadow-lg h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
        <div className="relative">
          <Globe className="w-4 h-4 text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
          <div className="absolute inset-0 bg-blue-400 rounded-full blur-[4px] opacity-20 animate-pulse" />
        </div>
        <h3 className="uppercase font-sans text-xs text-slate-400 font-bold tracking-widest">
          AI Intelligence Synthesis
        </h3>
      </div>
      
      <div className="flex-1 space-y-3">
        <p className="font-sans text-sm text-slate-300 leading-relaxed">
          <span className="text-blue-400 font-bold mr-1">[NEURAL GEN-4]</span>
          {content || "Analyzing global situational awareness and logistics corridors. Ingesting AIS data and regional news nodes..."}
        </p>
        
        <div className="p-2 bg-black/40 border border-slate-800/50 rounded flex gap-3 mt-auto">
            <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 uppercase font-black">Confidence</span>
                <span className="text-[10px] text-green-500 font-sans font-bold uppercase tracking-tighter">94.2%</span>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 uppercase font-black">Vector</span>
                <span className="text-[10px] text-blue-400 font-sans font-bold uppercase tracking-tighter">Stability-Neg</span>
            </div>
        </div>
      </div>
    </div>
  );
}
