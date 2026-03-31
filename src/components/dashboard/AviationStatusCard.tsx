'use client';

import { Plane, Radar, ShieldAlert, Activity } from 'lucide-react';

export default function AviationStatusCard() {
  return (
    <div className="group bg-slate-900/60 border border-slate-800 rounded-md p-3 hover:border-slate-700 transition-all duration-300 relative overflow-hidden h-full flex flex-col">
      {/* Tactical Glow */}
      <div className="absolute top-0 right-0 w-16 h-[1px] bg-blue-500/0 group-hover:bg-blue-500 transition-all" />
      <div className="absolute top-0 right-0 w-[1px] h-16 bg-blue-500/0 group-hover:bg-blue-500 transition-all" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform duration-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200 font-sans">
                Aviation & Logistics
            </h3>
        </div>
        <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
            <span className="text-[9px] font-sans font-bold text-green-500 tracking-widest uppercase">Live</span>
        </div>
      </div>

      {/* Data Metrics */}
      <div className="flex flex-col gap-3 font-sans">
        <div className="flex items-center justify-between group/metric">
            <div className="flex items-center gap-2">
                <Radar className="w-3 h-3 text-slate-500 group-hover/metric:text-blue-400 transition-colors" />
                <span className="text-[9px] text-slate-400 uppercase tracking-wider">Active Tracks</span>
            </div>
            <span className="text-xs font-bold text-white tabular-nums">14,203</span>
        </div>

        <div className="flex items-center justify-between group/metric">
            <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-slate-500 group-hover/metric:text-cyan-400 transition-colors" />
                <span className="text-[9px] text-slate-400 uppercase tracking-wider">Global Flight Flux</span>
            </div>
            <span className="text-xs font-bold text-white tabular-nums">+5.2%</span>
        </div>

        <div className="flex items-center justify-between group/metric">
            <div className="flex items-center gap-2">
                <ShieldAlert className="w-3 h-3 text-slate-500 group-hover/metric:text-amber-400 transition-colors" />
                <span className="text-[9px] text-slate-400 uppercase tracking-wider">FAA Ground Stops</span>
            </div>
            <span className="text-xs font-bold text-white tabular-nums">0</span>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-800/50">
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-tighter">Jamming Alert</span>
                    <span className="text-[8px] text-red-500 font-bold uppercase animate-pulse">Elevated Risk</span>
                </div>
                <p className="text-[9px] text-slate-400 leading-tight uppercase font-sans group-hover:text-amber-500/80 transition-colors">
                    GPS Jamming: Baltic Sea (Elevated)
                </p>
            </div>
        </div>
      </div>

      {/* Decorative Scanline */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] opacity-20 pointer-events-none" />
    </div>
  );
}
