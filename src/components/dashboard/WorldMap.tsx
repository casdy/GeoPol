'use client';

import { Region } from '@/lib/types';
import { Globe2 } from 'lucide-react';

interface WorldMapProps {
    onRegionSelect: (region: Region) => void;
    selectedRegion: Region;
}

const REGIONS: Region[] = [
    'Global', 'Middle East', 'Eastern Europe', 'Asia Pacific',
    'Americas', 'Africa', 'Arctic', 'South Asia', 'Central Asia', 'Latin America'
];

export default function WorldMap({ onRegionSelect, selectedRegion }: WorldMapProps) {
    return (
        <div className="bg-neutral-950 border border-neutral-800 rounded-sm p-6 relative overflow-hidden flex flex-col items-center justify-center shadow-[0_10px_50px_-10px_rgba(0,0,0,0.8)]">

            {/* Header Label */}
            <div className="absolute top-0 left-0 bg-neutral-900 border-b border-r border-neutral-800 px-4 py-2 text-[10px] font-mono font-bold tracking-widest text-neutral-500 flex items-center gap-2 uppercase">
                <Globe2 className="w-3 h-3 text-orange-600" />
                Geo-Spatial Targeting
            </div>

            {/* Modern Filter Grid/List */}
            <div className="flex flex-wrap justify-center gap-2 w-full max-w-4xl mt-6 relative z-10">
                {REGIONS.map((region) => {
                    const isSelected = selectedRegion === region;
                    return (
                        <button
                            key={region}
                            onClick={() => onRegionSelect(region)}
                            className={`
                relative px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-200 border
                ${isSelected
                                    ? 'bg-orange-600 border-orange-500 text-black scale-105 shadow-[0_0_15px_rgba(234,88,12,0.4)]'
                                    : 'bg-neutral-950 border-neutral-800 text-neutral-600 hover:border-neutral-700 hover:text-neutral-400'}
              `}
                        >
                            {isSelected && (
                                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-400 animate-pulse" />
                            )}
                            {region}
                        </button>
                    );
                })}
            </div>

            {/* Background Decor */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/20 via-neutral-950/0 to-neutral-950/0 pointer-events-none" />
            <div className="absolute bottom-10 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-900/20 to-transparent" />

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
        </div>
    );
}
