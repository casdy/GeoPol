'use client';

import { AlertTriangle } from 'lucide-react';

interface CountryData {
  country?: string;
  name?: string;
  score?: number;
  risk?: number;
  u: number;
  c: number;
  s: number;
  i: number;
  metrics?: string;
}

export default function CountryInstability({ 
  countries,
  onCountryClick
}: { 
  countries?: CountryData[],
  onCountryClick?: (iso: string) => void
}) {
  const displayCountries = (countries || []).map(c => ({
    name: c.country || c.name || '',
    risk: c.score ? c.score * 10 : (c.risk || 0),
    metrics: c.metrics || `U:${c.u} C:${c.c} S:${c.s} I:${c.i}`
  }));

  const data = displayCountries.length > 0 ? displayCountries : [
    { name: 'SUDAN', risk: 88, metrics: 'U:82 C:100 S:35 I:80' },
    { name: 'YEMEN', risk: 92, metrics: 'U:98 C:100 S:05 I:10' },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h3 className="uppercase font-sans text-xs text-slate-400 font-bold tracking-widest">
            Instability Matrix
        </h3>
        <AlertTriangle className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
      </div>

      <div className="space-y-4">
        {data.map((cty) => (
          <div 
            key={cty.name} 
            onClick={() => onCountryClick?.(cty.name)} // Assuming name is ISO for now or maps well
            className="space-y-1.5 group cursor-pointer hover:bg-slate-800/30 p-1 -m-1 rounded transition-colors"
          >
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-black font-sans text-white tracking-widest uppercase">
                    {cty.name}
                </span>
                <span className="text-[9px] font-sans text-orange-500 font-bold">
                    {Math.round(cty.risk)}% RISK
                </span>
            </div>
            
            <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800/30">
                <div 
                    style={{ width: `${cty.risk}%` }} 
                    className={`h-full transition-all duration-700 ${cty.risk > 80 ? 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]' : 'bg-orange-600'}`}
                />
            </div>

            <div className="text-[10px] font-sans text-slate-500 uppercase tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">
                {cty.metrics}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
