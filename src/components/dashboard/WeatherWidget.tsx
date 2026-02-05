'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '@/lib/api';
import { Cloud, Radio, Droplets, Wind, Thermometer, Loader2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WeatherModal from './WeatherModal';
import { WeatherData } from '@/lib/api';

export default function WeatherWidget() {
    const [selectedCity, setSelectedCity] = useState<WeatherData | null>(null);

    const { data: weather, isLoading } = useQuery({
        queryKey: ['weatherStart'],
        queryFn: fetchWeather,
        refetchInterval: 60000, // Update every minute
    });

    if (isLoading && !weather) {
        return (
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-sm p-4 flex items-center justify-center h-48">
                <Loader2 className="w-5 h-5 text-neutral-600 animate-spin" />
            </div>
        );
    }

    if (!weather || weather.length === 0) return null;

    return (
        <>
            <WeatherModal data={selectedCity} onClose={() => setSelectedCity(null)} />

            <div className="bg-neutral-950 border border-neutral-700 rounded-sm overflow-hidden relative group shadow-lg">
                {/* Decor */}
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-orange-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-orange-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Header */}
                <div className="bg-black/40 p-3 border-b border-neutral-800 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-300 flex items-center gap-2">
                        <Cloud className="w-3 h-3 text-orange-500" />
                        Weather
                    </h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-neutral-900 rounded-full border border-neutral-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[9px] font-mono text-neutral-500">LIVE</span>
                    </div>
                </div>

                {/* List */}
                <div className="divide-y divide-neutral-800">
                    <AnimatePresence mode='wait'>
                        {weather.map((city, i) => (
                            <motion.div
                                key={`${city.id}-${city.temp}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => setSelectedCity(city)}
                                className="p-3 flex items-center justify-between hover:bg-neutral-800 cursor-pointer transition-colors group/item"
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-neutral-200 uppercase tracking-wide group-hover/item:text-orange-400 transition-colors">{city.name}</span>
                                        <span className="text-[9px] text-neutral-500 font-mono uppercase bg-neutral-900 px-1 rounded border border-neutral-800">{city.condition}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-neutral-600 font-mono">
                                        <span className="flex items-center gap-1"><Droplets className="w-2.5 h-2.5" /> {city.humidity}%</span>
                                        <span className="flex items-center gap-1"><Wind className="w-2.5 h-2.5" /> {city.windSpeed}m/s</span>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-lg font-black text-white">{city.temp}<span className="text-xs text-neutral-500 font-normal ml-0.5">°C</span></span>
                                    <Maximize2 className="w-3 h-3 text-neutral-700 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="bg-black/60 p-2 text-center border-t border-neutral-800">
                    <p className="text-[9px] text-neutral-600 font-mono uppercase tracking-widest hover:text-orange-500 cursor-help transition-colors">
                        // CLICK NODE FOR DETAILS //
                    </p>
                </div>
            </div>
        </>
    );
}
