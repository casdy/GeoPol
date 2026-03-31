'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWeather, WeatherData } from '@/lib/api';
import { Cloud, Wind, Droplets, Thermometer, Orbit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WeatherInsightsSlideshow() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Engine 3: The Background Fetch (15-minute interval)
    const { data: weather, isLoading } = useQuery({
        queryKey: ['weatherSlideshow'],
        queryFn: fetchWeather,
        refetchInterval: 15 * 60 * 1000, 
    });

    // Engine 4: The Cycle (5-second transition)
    useEffect(() => {
        if (!weather || weather.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % weather.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [weather]);

    const current = (weather && weather.length > 0) ? weather[currentIndex] : null;

    if (isLoading || !weather || weather.length === 0 || !current) {
        return (
            <div className="h-14 w-48 bg-black/40 border border-white/5 flex items-center justify-center gap-2 px-3 animate-pulse">
                <Orbit className="w-3 h-3 text-cyan-500 animate-spin" />
                <span className="text-[8px] font-mono text-neutral-600 uppercase tracking-widest">MT_LINKING...</span>
            </div>
        );
    }

    // Map condition to monospace string
    const conditionTag = `[ ${current.condition.toUpperCase().replace(/\s/g, '_')} ]`;

    return (
        <div className="h-14 w-48 bg-black/40 border border-white/5 relative overflow-hidden group cursor-default backdrop-blur-sm">
            {/* Tactical Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px]" />
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0 flex flex-col justify-center px-3"
                >
                    <div className="flex justify-between items-start mb-0.5">
                        <span className="text-[9px] font-black text-white truncate max-w-[100px] uppercase tracking-tighter">
                            {current.name}
                        </span>
                        <span className="text-[8px] font-mono text-cyan-500 font-bold">
                            {conditionTag}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-2 items-center">
                            <span className="text-sm font-black text-neutral-200 tabular-nums">
                                {current.temp}°C
                            </span>
                            <div className="flex flex-col">
                                <span className="text-[7px] text-neutral-500 font-bold uppercase leading-none mb-0.5">TEMP</span>
                                <div className="h-[2px] w-8 bg-neutral-900 overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (current.temp + 10) * 2)}%` }}
                                        className="h-full bg-cyan-500/40"
                                     />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 items-center">
                            <div className="flex flex-col items-end">
                                <span className="text-[7px] text-neutral-500 font-bold uppercase leading-none">WIND</span>
                                <span className="text-[8px] font-mono text-neutral-400">{current.windSpeed}m/s</span>
                            </div>
                            <Wind className="w-2.5 h-2.5 text-neutral-600" />
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Scanning Line Animation */}
            <motion.div 
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[1px] bg-cyan-500/10 z-20 pointer-events-none"
            />
        </div>
    );
}
