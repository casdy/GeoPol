'use client';

import { ListFilter, Radio } from 'lucide-react';

interface IntelItem {
  time?: string;
  source: string;
  text?: string;
  title?: string;
  type?: string;
  badge?: "ALERT" | "CONFLICT" | "CYBER" | "TECH" | "REPORT";
}

export default function IntelFeed({ 
  items, 
  onItemClick,
  onBriefing
}: { 
  items?: IntelItem[], 
  onItemClick?: (item: IntelItem) => void,
  onBriefing?: (iso: string) => void
}) {
  const data = (items || []).map(i => ({
    time: i.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    source: i.source,
    text: i.text || i.title || '',
    type: i.type || i.badge || 'REPORT'
  }));

  const headlines = data.length > 0 ? data : [
    { time: '14:02', source: 'REUTERS', text: 'Black Sea grain export corridor facing technical delays', type: 'CONFLICT' },
    { time: '13:58', source: 'AL JAZEERA', text: 'Red Sea port activity remains hampered by logistics disruption', type: 'ALERT' },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-sm p-2 shadow-lg h-full flex flex-col max-h-[250px] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1.5">
        <div className="flex items-center gap-2">
            <Radio className="w-3 h-3 text-blue-400 animate-pulse" />
            <h3 className="uppercase font-sans text-[10px] text-slate-400 font-bold tracking-widest">
                Raw Intelligence
            </h3>
        </div>
        <ListFilter className="w-3 h-3 text-slate-600" />
      </div>

      <div className="flex-1 pr-1 space-y-2">
        {headlines.map((h, i) => (
          <div 
            key={i} 
            onClick={() => onItemClick?.(h as IntelItem)}
            className="flex gap-2 text-[10px] font-sans group border-b border-slate-800/30 pb-1.5 last:border-0 hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            <span className="text-slate-600 whitespace-nowrap text-[9px]">{h.time}</span>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-black tracking-tight text-[9px]">{h.source}</span>
                {(h.type === 'ALERT' || h.type === 'CONFLICT' || h.type === 'CYBER' || h.type === 'TECH') && (
                    <span className={`border text-[8px] px-1 rounded font-black italic leading-none ${
                        h.type === 'ALERT' ? 'bg-red-950 text-red-500 border-red-900' :
                        h.type === 'CONFLICT' ? 'bg-orange-950 text-orange-500 border-orange-900' :
                        h.type === 'CYBER' ? 'bg-blue-950 text-blue-400 border-blue-900' :
                        'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}>{h.type}</span>
                )}
                {h.text.match(/usa|china|russia|ukraine|israel|iran|sudan|taiwan|korea|india|brazil|france|germany|venezuela|nigeria/i) && (
                  <span className="bg-emerald-950 text-emerald-500 border border-emerald-900 text-[8px] px-1 rounded font-black italic leading-none">INTEL</span>
                )}
              </div>
              <p className="text-slate-400 leading-tight group-hover:text-slate-200 transition-colors text-[10px]">
                {h.text}
              </p>
              <div className="flex items-center gap-2 mt-1">
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemClick?.(h as IntelItem);
                  }}
                  className="text-[8px] text-blue-400 font-bold hover:underline tracking-tighter"
                 >
                   [ DETAIL ]
                 </button>
                 <span className="text-slate-700">|</span>
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemClick?.(h as IntelItem);
                  }}
                  className="text-[8px] text-emerald-400 font-bold hover:underline tracking-tighter"
                 >
                   [ BRIEF ]
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
