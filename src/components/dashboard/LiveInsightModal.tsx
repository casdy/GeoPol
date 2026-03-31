'use client';

import React from 'react';
import { X, ShieldAlert, Activity, Globe, Zap, AlertTriangle, ChevronRight, Info, Radar } from 'lucide-react';
import { CountryIntelligence } from '@/lib/intelligence-engine';

interface LiveInsightModalProps {
  intel: CountryIntelligence;
  onClose: () => void;
}

export default function LiveInsightModal({ intel, onClose }: LiveInsightModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'text-red-500';
      case 'VOLATILE': return 'text-orange-500';
      case 'UNSTABLE': return 'text-yellow-500';
      case 'STABLE': return 'text-green-500';
      default: return 'text-cyan-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'bg-red-950/40 border-red-500/30';
      case 'VOLATILE': return 'bg-orange-950/40 border-orange-500/30';
      case 'UNSTABLE': return 'bg-yellow-950/40 border-yellow-500/30';
      case 'STABLE': return 'bg-green-950/40 border-green-500/30';
      default: return 'bg-cyan-950/40 border-cyan-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8 md:p-12 pointer-events-none">
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md pointer-events-auto"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col pointer-events-auto animate-in fade-in zoom-in duration-300 overflow-hidden">
        
        {/* Header Section */}
        <div className={`p-6 border-b flex items-center justify-between ${getStatusBg(intel.status)}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 border border-current flex items-center justify-center ${getStatusColor(intel.status)} shadow-[0_0_15px_rgba(0,0,0,0.3)] bg-black/40`}>
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black font-sans tracking-tighter text-white uppercase italic">
                  {intel.name} <span className="text-slate-600 font-mono text-xs ml-2 opacity-50 not-italic font-normal">// {intel.isoCode}</span>
                </h2>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <span className={`text-[10px] font-mono font-black uppercase tracking-[0.2em] ${getStatusColor(intel.status)}`}>
                  STATUS: {intel.status}
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-cyan-500" />
                  RISK_INDEX: {intel.riskScore}%
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-900/50 hover:bg-orange-600 text-slate-400 hover:text-white border border-slate-800 transition-all rounded-sm group"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 max-h-[75vh] custom-scrollbar">
          
          {/* Primary Intelligence Briefing */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Radar className="w-4 h-4 text-cyan-500 animate-pulse" />
              <h4 className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-slate-500 flex-1">
                Strategic Intelligence Briefing
              </h4>
              <div className="h-[1px] bg-slate-800 flex-1" />
            </div>
            <div className="relative pl-6 border-l-2 border-cyan-500/30 py-1">
                <h3 className="text-xl font-bold font-sans text-white leading-tight mb-4">
                    "{intel.topHeadline}"
                </h3>
                <p className="text-slate-300 font-serif text-[17px] leading-relaxed max-w-[65ch]">
                    {intel.intelBrief}
                </p>
            </div>
          </section>

          {/* Tactical Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/30 border border-slate-800 p-5 space-y-4 group hover:border-orange-500/30 transition-colors">
                <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-slate-500">
                    <Zap className="w-3.5 h-3.5 text-orange-500" />
                    Kinetic Indicators
                </div>
                <div className="flex justify-between items-end">
                    <span className="text-3xl font-black text-white italic">{intel.kineticCount}</span>
                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-1">Active Signals</span>
                </div>
                <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-slate-800/50">
                    <div 
                        className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)] transition-all duration-1000" 
                        style={{ width: `${Math.min(intel.kineticCount * 10, 100)}%` }}
                    />
                </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-800 p-5 space-y-4 group hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-slate-500">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    Stability Markers
                </div>
                <div className="flex justify-between items-end">
                    <span className="text-3xl font-black text-white italic">{intel.stabilityCount}</span>
                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-1">Active Signals</span>
                </div>
                <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-slate-800/50">
                    <div 
                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all duration-1000" 
                        style={{ width: `${Math.min(intel.stabilityCount * 10, 100)}%` }}
                    />
                </div>
            </div>
          </div>

          {/* Verification Protocol */}
          <section className="bg-slate-900/50 border border-slate-800 p-5 rounded-sm flex gap-5 items-start">
            <div className="mt-1 bg-cyan-500/10 p-2 border border-cyan-500/20">
                <Info className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="space-y-2">
                <h4 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-slate-400">Tactical Verification Protocol</h4>
                <p className="text-[12px] text-slate-500 font-sans leading-relaxed italic">
                    All signals processed via the Unified Geopolitical Engine. Data is derived from live-polled open source intelligence across 12 strategic sectors. Cross-referencing active for secondary validation.
                </p>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-[8px] font-mono font-black text-slate-600 uppercase tracking-[0.3em]">Protocol</span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">INTEL_VOX_V4.2</span>
                </div>
                <div className="w-[1px] h-8 bg-slate-800" />
                <div className="flex flex-col">
                    <span className="text-[8px] font-mono font-black text-slate-600 uppercase tracking-[0.3em]">Vector</span>
                    <span className="text-[10px] font-mono font-bold text-cyan-500 italic animate-pulse">SYNC_LIVE</span>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="bg-white hover:bg-cyan-500 hover:text-white transition-all text-black text-[11px] font-black uppercase tracking-[0.2em] px-8 py-3 rounded-sm flex items-center gap-3 group active:scale-95 shadow-xl"
            >
                Acknowledge
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </div>
    </div>
  );
}
