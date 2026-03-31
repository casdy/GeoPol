'use client';

import { TrendingUp, Activity } from 'lucide-react';

export default function StrategicRiskGauge({ score = 63 }: { score?: number }) {
  // SVG Calculations for a proper arc path
  const width = 200;
  const height = 110;
  const cx = 100;
  const cy = 100;
  const r = 80;
  
  // Convert score to angle (0 to 180 degrees)
  const angle = (score / 100) * 180;
  const angleInRad = (angle * Math.PI) / 180;
  
  // Coordinates for the end of the arc
  const endX = cx - r * Math.cos(angleInRad);
  const endY = cy - r * Math.sin(angleInRad);
  
  // Path for the background (0 to 180 deg)
  const bgPath = `M 20 100 A 80 80 0 0 1 180 100`;
  // Path for the progress
  const progressPath = `M 20 100 A 80 80 0 0 1 ${endX + 80} ${endY}`; 
  // Wait, let's simplify the math for the arc.
  // We'll use a standard stroke-dasharray on an arc path for easier animation.
  
  const totalLength = Math.PI * r;
  const dashOffset = totalLength - (score / 100) * totalLength;

  const riskFactors = [
    { label: 'CONFLICT', value: '+12%', color: 'text-red-500' },
    { label: 'CYBER', value: '+5%', color: 'text-orange-500' },
    { label: 'ECON', value: '-2%', color: 'text-green-500' },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-sm p-2 shadow-2xl h-full flex flex-col relative overflow-hidden group max-h-[250px] overflow-y-auto custom-scrollbar">
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <h3 className="uppercase font-sans text-[10px] text-slate-500 font-bold tracking-[0.3em]">
              Strategic Risk Index
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] font-sans font-black ${score > 70 ? 'text-red-500' : 'text-orange-500'}`}>
                {score > 70 ? 'CRITICAL' : 'ELEVATED'}
            </span>
            <div className="h-1 w-1 bg-slate-700 rounded-full" />
            <span className="text-[8px] font-sans text-slate-500">V4.2 SIGINT</span>
          </div>
        </div>
        <TrendingUp className="w-3.5 h-3.5 text-red-500 animate-pulse" />
      </div>

      <div className="relative self-center mb-2">
        <svg width={width} height={height - 20} viewBox="0 0 200 90">
          {/* Background Arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            className="text-slate-800/50"
          />
          {/* Progress Arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={totalLength}
            strokeDashoffset={dashOffset}
            className={`transition-all duration-1000 ease-out ${score > 75 ? 'text-red-600' : 'text-orange-500'}`}
            style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
          />
        </svg>

        {/* Value Overlay */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
            <span className="text-4xl font-black text-white font-sans tracking-tighter leading-none">
                {score}
            </span>
            <span className="text-[7px] font-sans font-bold text-slate-600 uppercase tracking-[0.4em] mt-0.5">
                Risk Quotient
            </span>
        </div>
      </div>
      
      {/* Risk Vectors - Descriptive Interactivity */}
      <div className="grid grid-cols-3 gap-1 mt-auto border-t border-slate-800/50 pt-2 relative z-10">
        {riskFactors.map((f, i) => (
          <div key={i} className="flex flex-col items-center p-1 bg-black/40 border border-slate-800/50 rounded-sm">
            <span className="text-[7px] font-sans text-slate-500 font-bold tracking-widest">{f.label}</span>
            <span className={`text-[9px] font-sans font-black mt-0.5 ${f.color}`}>{f.value}</span>
          </div>
        ))}
      </div>

      {/* Dynamic Context Footer */}
      <div className="mt-2 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
        <div className="w-0.5 h-2.5 bg-red-600" />
        <p className="text-[8px] font-sans text-slate-400 leading-tight">
          Escalation detected in <span className="text-white">Nord Stream</span>. 
          Cyber nodes reporting <span className="text-red-500">APT-28</span>.
        </p>
      </div>
    </div>
  );
}
