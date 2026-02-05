'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cloud, Droplets, Wind, Thermometer, MapPin, Navigation, Orbit } from 'lucide-react';
import { WeatherData } from '@/lib/api';

interface WeatherModalProps {
    data: WeatherData | null;
    onClose: () => void;
}

export default function WeatherModal({ data, onClose }: WeatherModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {data && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 10, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-neutral-900 border border-neutral-700 w-full max-w-md rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative"
                    >
                        {/* Header Image / Map Placeholder */}
                        <div className="h-32 bg-neutral-950 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent"></div>

                            <div className="absolute top-4 left-4">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                    <MapPin className="w-6 h-6 text-orange-500" />
                                    {data.name}, {data.country}
                                </h2>
                                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 mt-1">
                                    <Orbit className="w-3 h-3" />
                                    <span>LAT: {data.coordinates.lat}</span>
                                    <span>LON: {data.coordinates.lon}</span>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Main Content */}
                        <div className="p-6 pt-2">
                            <div className="flex justify-between items-end mb-8 border-b border-neutral-800 pb-6">
                                <div>
                                    <div className="text-6xl font-black text-white tracking-tighter">
                                        {data.temp}°<span className="text-3xl text-neutral-500 font-bold">C</span>
                                    </div>
                                    <div className="text-orange-500 font-mono text-sm uppercase tracking-widest mt-1 font-bold">
                                        {data.description}
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="text-xs text-neutral-500 font-mono uppercase">Feels Like</div>
                                    <div className="text-xl font-bold text-neutral-300">{data.feelsLike}°C</div>
                                </div>
                            </div>

                            {/* Grid Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-neutral-950/50 p-3 rounded-sm border border-neutral-800/50 flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-full">
                                        <Droplets className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-neutral-500 uppercase font-bold">Humidity</div>
                                        <div className="text-sm font-mono text-neutral-200">{data.humidity}%</div>
                                    </div>
                                </div>
                                <div className="bg-neutral-950/50 p-3 rounded-sm border border-neutral-800/50 flex items-center gap-3">
                                    <div className="p-2 bg-cyan-500/10 rounded-full">
                                        <Wind className="w-4 h-4 text-cyan-500" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-neutral-500 uppercase font-bold">Wind Speed</div>
                                        <div className="text-sm font-mono text-neutral-200">{data.windSpeed} m/s</div>
                                    </div>
                                </div>
                                <div className="bg-neutral-950/50 p-3 rounded-sm border border-neutral-800/50 flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-full">
                                        <Navigation className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-neutral-500 uppercase font-bold">Pressure</div>
                                        <div className="text-sm font-mono text-neutral-200">{data.pressure} hPa</div>
                                    </div>
                                </div>
                                <div className="bg-neutral-950/50 p-3 rounded-sm border border-neutral-800/50 flex items-center gap-3">
                                    <div className="p-2 bg-yellow-500/10 rounded-full">
                                        <Cloud className="w-4 h-4 text-yellow-500" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-neutral-500 uppercase font-bold">Condition</div>
                                        <div className="text-sm font-mono text-neutral-200 capitalize">{data.condition}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer / Decor */}
                            <div className="text-center">
                                <p className="text-[9px] text-neutral-700 font-mono uppercase tracking-[0.2em]">
                                    // METEOROLOGICAL DATA NODE //
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
