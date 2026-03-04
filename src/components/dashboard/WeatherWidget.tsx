'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '@/lib/api';
import { Cloud, Droplets, Wind, Maximize2, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WeatherModal from './WeatherModal';
import { WeatherData } from '@/lib/api';

export default function WeatherWidget() {
    const [selectedCity, setSelectedCity] = useState<WeatherData | null>(null);
    const [isWeatherOpen, setIsWeatherOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const { data: weather, isLoading } = useQuery({
        queryKey: ['weatherStart'],
        queryFn: fetchWeather,
        refetchInterval: 60000, // Update every minute
    });

    return (
        <>
            <WeatherModal data={selectedCity} onClose={() => setSelectedCity(null)} />

            {/* Navbar Button */}
            <button
                onClick={() => setIsWeatherOpen(true)}
                className="relative w-11 h-11 flex justify-center items-center text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-sm transition-colors border border-transparent hover:border-neutral-700"
                aria-label="Open Weather"
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Cloud className="w-5 h-5" />
                )}
                {weather && weather.length > 0 && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />}
            </button>

            {/* Weather List Modal */}
            {mounted && createPortal(
                <AnimatePresence mode="wait">
                    {isWeatherOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsWeatherOpen(false)}
                            style={{ willChange: 'opacity' }}
                        >
                            <motion.div
                                initial={{ scale: 0.96, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.96, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-neutral-950 border border-neutral-800 w-full max-w-sm rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden relative flex flex-col"
                                style={{ willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
                            >
                                {/* Modal Header */}
                                <div className="bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-200 flex items-center gap-2">
                                        <Cloud className="w-4 h-4 text-orange-500" />
                                        Global Weather
                                    </h3>
                                    <button 
                                        onClick={() => setIsWeatherOpen(false)} 
                                        className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                                    >
                                        <X className="w-5 h-5 md:w-4 md:h-4" />
                                    </button>
                                </div>

                                {/* List Container */}
                                <div className="divide-y divide-neutral-800/60 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                    {weather?.map((city, i) => (
                                        <div
                                            key={city.id}
                                            onClick={() => {
                                                setSelectedCity(city);
                                            }}
                                            className="p-4 flex items-center justify-between hover:bg-neutral-900 cursor-pointer transition-colors group/item"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-bold text-neutral-200 uppercase tracking-wide group-hover/item:text-orange-400 transition-colors">{city.name}</span>
                                                    <span className="text-[9px] text-neutral-500 font-mono uppercase bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">{city.condition}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-mono">
                                                    <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-400 flex-shrink-0" /> {city.humidity}%</span>
                                                    <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-cyan-400 flex-shrink-0" /> {city.windSpeed}m/s</span>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-3">
                                                <span className="text-xl font-black text-white">{city.temp}<span className="text-sm text-neutral-500 font-normal ml-0.5">°C</span></span>
                                                <Maximize2 className="w-4 h-4 text-neutral-600 group-hover/item:text-orange-500 opacity-50 group-hover/item:opacity-100 transition-all" />
                                            </div>
                                        </div>
                                    ))}

                                    {(!weather || weather.length === 0) && (
                                        <div className="p-8 text-center text-neutral-500 font-mono text-xs uppercase">
                                            No meteorological data available.
                                        </div>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="bg-black/60 p-3 text-center border-t border-neutral-900">
                                    <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-[0.2em]">
                                        // CLICK NODE FOR DETAILS //
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
