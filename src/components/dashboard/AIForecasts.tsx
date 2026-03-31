'use client';

import { useState } from 'react';
import { Target } from 'lucide-react';

interface ForecastMetric {
  q?: string;
  question?: string;
  yes?: number;
  yesProb?: number;
  no?: number;
  noProb?: number;
  category: string;
}

const TABS = ['ALL', 'CONFLICT', 'MARKET', 'CYBER'];

export default function AIForecasts({ metrics }: { metrics?: ForecastMetric[] }) {
  const [activeTab, setActiveTab] = useState('ALL');
  
  const displayMetrics = (metrics || []).map(m => ({
    q: m.q || m.question || '',
    yes: m.yes ?? m.yesProb ?? 0,
    no: m.no ?? m.noProb ?? 0,
    category: m.category || 'ALL'
  }));

  const data = displayMetrics.length > 0 ? displayMetrics : [
    { q: 'Blockade of Hormuz in Q2?', yes: 68, no: 32, category: 'CONFLICT' },
    { q: 'Suez Canal shipping fees +20%?', yes: 45, no: 55, category: 'MARKET' },
    { q: 'NATO infrastructure breach?', yes: 12, no: 88, category: 'CYBER' },
  ];

  const filtered = activeTab === 'ALL' 
    ? data 
    : data.filter(f => f.category === activeTab);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h3 className="uppercase font-mono text-xs text-slate-400 font-bold tracking-widest">
            AI Probability Forecasts
        </h3>
        <Target className="w-3.5 h-3.5 text-slate-600" />
      </div>

      <div className="flex gap-1 mb-4">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[8px] px-2 py-0.5 font-black rounded-sm border transition-all ${
                activeTab === tab 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-black/40 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((item, idx) => (
          <div key={idx} className="space-y-1.5 group">
            <p className="text-[10px] font-mono text-slate-300 uppercase tracking-tight group-hover:text-emerald-400 transition-colors">
              {item.q}
            </p>
            <div className="h-1.5 w-full bg-slate-950/80 rounded-full overflow-hidden flex border border-slate-800/50">
                <div 
                    title={`YES: ${item.yes}%`}
                    style={{ width: `${item.yes}%` }} 
                    className="h-full bg-emerald-500 transition-all duration-1000"
                />
                <div 
                    title={`NO: ${item.no}%`}
                    style={{ width: `${item.no}%` }} 
                    className="h-full bg-red-500 transition-all duration-1000"
                />
            </div>
            <div className="flex justify-between font-mono text-[8px] font-black tracking-widest px-0.5">
                <span className="text-emerald-500 uppercase">YES {item.yes}%</span>
                <span className="text-red-500 uppercase">NO {item.no}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
