'use client';

import { Zap, ShieldAlert, Cpu } from 'lucide-react';

export default function CyberThreatRadar() {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-sm p-2 shadow-lg h-full flex flex-col relative overflow-hidden max-h-[250px] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1.5">
        <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-yellow-500" />
            <h3 className="uppercase font-sans text-[10px] text-slate-400 font-bold tracking-widest">
                Cyber Threat Radar
            </h3>
        </div>
        <div className="flex gap-1">
            <span className="text-[8px] font-sans text-slate-500 font-black">SCR:</span>
            <span className="text-[8px] font-sans text-yellow-500 font-black">CRIT/72</span>
        </div>
      </div>

      <div className="space-y-3 font-sans">
        <div className="p-1.5 border border-yellow-500/20 bg-yellow-950/10 rounded group transition-all hover:bg-yellow-950/20">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3 h-3 text-[#eab308]" />
                    <span className="text-[9px] text-white font-bold uppercase tracking-tight">Active APTs</span>
                </div>
                <span className="text-[9px] text-[#eab308] font-black italic animate-pulse">DETECTED</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-0.5 text-[8px]">
                <span className="bg-black/60 px-1 py-0.5 border border-slate-800 text-slate-300">BEAR-29</span>
                <span className="bg-black/60 px-1 py-0.5 border border-slate-800 text-slate-300">PANDA-V2</span>
                <span className="bg-black/60 px-1 py-0.5 border border-slate-800 text-red-500 font-bold">STORM-02</span>
            </div>
        </div>

        <div className="space-y-2">
            <div className="flex items-center justify-between text-[9px]">
                <div className="flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 text-slate-600" />
                    <span className="text-slate-400 uppercase tracking-widest">BGP Anomalies</span>
                </div>
                <span className="text-white font-black bg-slate-800 px-1.5 rounded-sm">14</span>
            </div>
            
            <div className="relative h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-[#eab308] w-[45%] opacity-80" />
            </div>
            
            <div className="flex justify-between text-[8px] font-sans text-slate-500 uppercase font-black">
                <span>Infrastructure Load</span>
                <span className="text-[#eab308]">ELEVATED</span>
            </div>
        </div>
      </div>

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:16px_16px]" />
    </div>
  );
}
