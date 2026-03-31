'use client';

import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface CrisisToggleProps {
    isCrisis: boolean;
    isGoodNews: boolean;
    onCrisisToggle: () => void;
    onGoodNewsToggle: () => void;
}

export default function CrisisToggle({ isCrisis, isGoodNews, onCrisisToggle, onGoodNewsToggle }: CrisisToggleProps) {
    return (
        <div className="flex gap-1 sm:gap-2">
            {/* Crisis Toggle - The Classic Red Signal */}
            <button
                onClick={onCrisisToggle}
                className={`
                    relative overflow-hidden group flex items-center gap-2 px-2 sm:px-3 py-1.5 border transition-all duration-300
                    ${isCrisis
                        ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-500 hover:border-red-500 hover:text-red-500'}
                `}
            >
                {isCrisis && (
                    <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#000_5px,#000_10px)]" />
                )}
                <div className={`transition-transform duration-300 ${isCrisis ? 'scale-110' : ''}`}>
                    <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="font-bold tracking-widest text-[9px] sm:text-[10px] uppercase z-10 whitespace-nowrap font-sans hidden xs:block">
                    {isCrisis ? 'CRISIS' : 'Monitor'}
                </span>
            </button>

            {/* Good News Toggle - The New Neon Signal */}
            <button
                onClick={onGoodNewsToggle}
                className={`
                    relative overflow-hidden group flex items-center gap-2 px-2 sm:px-3 py-1.5 border transition-all duration-300
                    ${isGoodNews
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-500 hover:border-emerald-500 hover:text-emerald-500'}
                `}
            >
                <div className={`transition-transform duration-300 ${isGoodNews ? 'scale-110' : ''}`}>
                    <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="font-bold tracking-widest text-[9px] sm:text-[10px] uppercase z-10 whitespace-nowrap font-sans hidden xs:block">
                    {isGoodNews ? 'PROSPERITY' : 'Good News'}
                </span>
            </button>
        </div>
    );
}
