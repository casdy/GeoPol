'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Maximize2, Camera, Shield, Radio } from 'lucide-react';
import { Webcam } from '@/hooks/useWebcams';

interface WebcamModalProps {
    cam: Webcam | null;
    onClose: () => void;
}

export default function WebcamModal({ cam, onClose }: WebcamModalProps) {
    if (!cam) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-6xl aspect-video bg-neutral-950 border border-neutral-800 rounded-sm shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header HUD */}
                    <div className="flex-none h-12 flex items-center justify-between px-6 border-b border-neutral-800 bg-black/40 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(255,255,255,0.1)_40px,rgba(255,255,255,0.1)_41px)]" />
                        
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                <h2 className="text-sm font-black italic tracking-tighter text-white uppercase font-sans">
                                    {cam.region} <span className="text-orange-500">//</span> {cam.city} <span className="text-neutral-500 not-italic font-normal ml-2 opacity-60">TACTICAL_STREAM_ACTIVE</span>
                                </h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono text-neutral-500 uppercase tracking-widest mr-4">
                                <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-cyan-500" /> ENCRYPTED</span>
                                <span className="flex items-center gap-1.5"><Radio className="w-3 h-3 text-orange-500 animate-pulse" /> 1080P_HD</span>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-neutral-800 rounded-sm text-neutral-400 hover:text-white transition-all border border-transparent hover:border-neutral-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Stream Content */}
                    <div className="flex-1 relative bg-black">
                        <iframe
                            key={cam.id}
                            src={`${cam.youtubeUrl}${cam.youtubeUrl.includes('?') ? '&' : '?'}autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`}
                            title={`${cam.title} Tactical Stream`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                        
                        {/* Stream Overlays */}
                        <div className="absolute top-6 left-6 pointer-events-none">
                            <div className="space-y-1">
                                <div className="px-2 py-0.5 bg-red-600 inline-block">
                                    <span className="text-[10px] font-black text-black uppercase tracking-tighter">SIGINT_INTERCEPT</span>
                                </div>
                                <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                                    ID: {cam.id.toUpperCase()}
                                    <br />
                                    COORD: {((Math.random() * 180) - 90).toFixed(4)}N / {((Math.random() * 360) - 180).toFixed(4)}E
                                </div>
                            </div>
                        </div>

                        {/* Tactical HUD Corners */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/20 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/20 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/20 pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/20 pointer-events-none" />
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="flex-none h-10 px-6 border-t border-neutral-800 bg-black/60 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Feed: <span className="text-white">{cam.title}</span></span>
                            <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest hidden sm:inline">Stream: <span className="text-orange-500">STABLE</span></span>
                        </div>
                        <div className="flex items-center gap-4 text-cyan-500/50">
                            <Camera className="w-3.5 h-3.5" />
                            <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                    </div>

                    {/* Scanline Effect Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.5)_2px,rgba(255,255,255,0.5)_4px)]" />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
