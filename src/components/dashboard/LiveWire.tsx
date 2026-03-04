'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Article } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveWireProps {
    items: Article[];
    onItemClick: (item: Article) => void;
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

    // Rotate headlines every 5 seconds unless paused
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setTickerIndex((prev) => (prev + 1) % displayItems.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isPaused, displayItems.length]); // Reset if items change length effectively

    const currentItem = displayItems[tickerIndex % displayItems.length];

    return (
        <div
            className="w-full bg-[#0a0a0a] border-y border-neutral-800 h-10 flex items-center overflow-hidden relative group cursor-pointer shadow-inner"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onClick={() => {
                if (items.length > 0 && currentItem) {
                    onItemClick(currentItem as Article);
                }
            }}
        >
            {/* Animated Red Pulsing LIVE Badge */}
            <div className="bg-red-800 text-white px-4 py-1 text-xs font-black uppercase tracking-widest absolute left-0 h-full flex items-center z-20 border-r border-red-950 shadow-[2px_0_10px_rgba(153,27,27,0.8)]">
                <div className="relative flex items-center justify-center w-2 h-2 mr-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </div>
                BREAKING  
            </div>

            {/* Visual Indicator of Pause State */}
            <div className={`absolute right-4 z-20 transition-opacity duration-300 ${isPaused ? 'opacity-100' : 'opacity-0'}`}>
                <span className="text-[9px] uppercase font-bold text-red-500 bg-neutral-900 px-2 py-0.5 border border-red-900/50 rounded-sm">Paused</span>
            </div>

            {/* Broadcast Ticker Feed */}
            <div className="pl-36 md:pl-40 flex items-center min-w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentItem?.id || tickerIndex}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="whitespace-nowrap text-neutral-200 font-sans text-sm font-bold tracking-wide flex items-center"
                    >
                        <span className="group-hover:text-white transition-colors truncate max-w-[80vw]">
                            {currentItem?.title}
                        </span>
                        {items.length > 0 && (
                            <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 flex-shrink-0" />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
