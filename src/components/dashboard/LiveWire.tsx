'use client';

import { useState } from 'react';
import { Article } from '@/lib/types';
import { motion } from 'framer-motion';

interface LiveWireProps {
    items: Article[];
    onItemClick: (item: Article) => void;
}

const DEFAULT_HEADLINES = [
    { title: "WAITING FOR INTELLIGENCE FEED...", id: 'loading-1' },
    { title: "ESTABLISHING SECURE CONNECTION TO GLOBAL NEWS SERVERS...", id: 'loading-2' },
];

export default function LiveWire({ items, onItemClick }: LiveWireProps) {
    const [isPaused, setIsPaused] = useState(false);

    // Use passed items or fallback
    const displayItems = items.length > 0 ? items : DEFAULT_HEADLINES;

    // Double the items for a seamless marquee loop
    const loopedItems = [...displayItems, ...displayItems];

    // Final speed adjustment: 35 seconds per headline for maximum tactical readability
    const duration = Math.max(100, displayItems.length * 35);

    return (
        <div
            className="w-full bg-[#0a0a0a] border-y border-neutral-800 h-10 flex items-center overflow-hidden relative group shadow-inner"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Animated Red Pulsing BREAKING Badge */}
            <div className="bg-red-800 text-white px-4 py-1 text-xs font-black uppercase tracking-widest absolute left-0 h-full flex items-center z-20 border-r border-red-950 shadow-[2px_0_10px_rgba(153,27,27,0.8)] pointer-events-none">
                <div className="relative flex items-center justify-center w-2 h-2 mr-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </div>
                BREAKING  
            </div>

            {/* Visual Indicator of Pause State */}
            <div className={`absolute right-4 z-20 transition-opacity duration-300 pointer-events-none ${isPaused ? 'opacity-100' : 'opacity-0'}`}>
                <span className="text-[9px] uppercase font-bold text-red-500 bg-neutral-900/90 px-2 py-0.5 border border-red-900/50 rounded-sm backdrop-blur-sm">Paused</span>
            </div>

            {/* Broadcast Ticker Feed (Horizontal Marquee) */}
            <div className="flex items-center w-full h-full">
                <motion.div
                    animate={isPaused ? {} : { x: ["0%", "-50%"] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: duration,
                            ease: "linear"
                        }
                    }}
                    className="flex items-center h-full whitespace-nowrap pl-[140px]"
                >
                    {loopedItems.map((item, idx) => (
                        <div 
                            key={`${item.id}-${idx}`}
                            onClick={() => items.length > 0 && onItemClick(item as Article)}
                            className="flex items-center group/item cursor-pointer px-8 h-full"
                        >
                            <span className="text-neutral-200 font-sans text-sm font-bold tracking-wide group-hover/item:text-white transition-colors">
                                {item.title}
                            </span>
                            <span className="mx-8 text-neutral-700 font-black opacity-40 select-none">
                                //
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
