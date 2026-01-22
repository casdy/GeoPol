'use client';

import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface CrisisToggleProps {
    isActive: boolean;
    onToggle: () => void;
}

export default function CrisisToggle({ isActive, onToggle }: CrisisToggleProps) {
    return (
        <button
            onClick={onToggle}
            className={`
        relative overflow-hidden group flex items-center gap-2 px-3 py-1.5 border transition-all duration-300
        ${isActive
                    ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-500 hover:border-orange-500 hover:text-orange-500'}
      `}
        >
            {/* Background Strips for "Warning" effect */}
            {isActive && (
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#000_5px,#000_10px)]" />
            )}

            <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {isActive ? <AlertTriangle className="w-3.5 h-3.5 fill-white" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            </div>

            <span className="font-bold tracking-widest text-[10px] uppercase z-10 whitespace-nowrap font-mono">
                {isActive ? 'CRISIS ACTIVE' : 'Monitor Mode'}
            </span>
        </button>
    );
}
