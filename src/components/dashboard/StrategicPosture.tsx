'use client';

import { Anchor, Plane, ShieldAlert } from 'lucide-react';

const THEATERS = [
  { name: 'IRANIAN GULF', air: 24, sea: 12, status: 'CRIT', color: 'text-red-500' },
  { name: 'TAIWAN STRAIT', air: 32, sea: 18, status: 'ELEVATED', color: 'text-orange-500' },
  { name: 'BALTIC SEA', air: 12, sea: 6, status: 'STABLE', color: 'text-slate-500' },
  { name: 'RED SEA CORRIDOR', air: 8, sea: 14, status: 'CRIT', color: 'text-red-500' },
];

export default function StrategicPosture() {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-sm p-2 shadow-lg h-full flex flex-col max-h-[250px] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1.5">
        <h3 className="uppercase font-sans text-[10px] text-slate-400 font-bold tracking-widest">
            Strategic Posture
        </h3>
        <ShieldAlert className="w-3 h-3 text-slate-600" />
      </div>

      <div className="space-y-2 font-sans">
        {THEATERS.map((theater) => (
          <div key={theater.name} className="flex items-center justify-between group border-b border-slate-800/30 pb-1.5 last:border-0 last:pb-0">
            <div className="flex flex-col">
              <span className="text-[9px] text-white font-bold tracking-tight uppercase group-hover:text-blue-400 transition-colors">
                {theater.name}
              </span>
              <div className="flex items-center gap-2.5 mt-0.5">
                <div className="flex items-center gap-1 opacity-60">
                  <Plane className="w-2.5 h-2.5 text-slate-400" />
                  <span className="text-[8px] text-slate-300">{theater.air}</span>
                </div>
                <div className="flex items-center gap-1 opacity-60">
                  <Anchor className="w-2.5 h-2.5 text-slate-400" />
                  <span className="text-[8px] text-slate-300">{theater.sea}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-[8px] font-black uppercase tracking-tighter ${theater.color}`}>
                {theater.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
