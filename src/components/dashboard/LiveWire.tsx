'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { PulseItem } from '@/lib/types';

interface LiveWireProps {
    items: PulseItem[];
    onItemClick: (item: PulseItem) => void;
}

const DEFAULT_HEADLINES = [
    { title: "WAITING FOR INTELLIGENCE FEED...", id: 'loading-1' },
    { title: "ESTABLISHING SECURE CONNECTION TO GLOBAL NEWS SERVERS...", id: 'loading-2' },
];

export default function LiveWire({ items, onItemClick }: LiveWireProps) {
    const [tickerIndex, setTickerIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Use passed items or fallback
    const displayItems = items.length > 0 ? items : DEFAULT_HEADLINES;

    // Rotate headlines every 4 seconds unless paused
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setTickerIndex((prev) => (prev + 1) % displayItems.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [isPaused, displayItems.length]); // Reset if items change length effectively

    const currentItem = displayItems[tickerIndex % displayItems.length];

    return (
        <div
            className="w-full bg-neutral-950 border-y border-neutral-800 h-10 flex items-center overflow-hidden relative group cursor-pointer"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onClick={() => {
                if (items.length > 0 && currentItem) {
                    onItemClick(currentItem as PulseItem);
                }
            }}
        >
            <div className="bg-orange-600 text-black px-4 py-1 text-xs font-black uppercase tracking-widest absolute left-0 h-full flex items-center z-20">
                LIVE
            </div>

            {/* Visual Indicator of Pause State */}
            <div className={`absolute right-4 z-20 transition-opacity duration-300 ${isPaused ? 'opacity-100' : 'opacity-0'}`}>
                <span className="text-[9px] uppercase font-bold text-orange-500 bg-neutral-900 px-2 py-0.5 border border-orange-500/50">Paused</span>
            </div>

            <div className="whitespace-nowrap animate-in fade-in slide-in-from-right-4 duration-500 pl-36 text-neutral-400 font-mono text-xs uppercase tracking-wide flex items-center min-w-full">
                <span className="mr-3 text-orange-500 animate-pulse">►</span>
                <span className="group-hover:text-orange-100 transition-colors truncate max-w-[80vw]">
                    {currentItem?.title}
                </span>
                {items.length > 0 && (
                    <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500 flex-shrink-0" />
                )}
            </div>
        </div>
    );
}
