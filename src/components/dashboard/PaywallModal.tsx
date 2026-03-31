'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, CreditCard, Sparkles, CheckCircle, ShieldCheck, Headphones, Radar } from 'lucide-react';
import { useState } from 'react';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubscribe: () => void;
}

export default function PaywallModal({ isOpen, onClose, onSubscribe }: PaywallModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubscribe = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            onSubscribe();
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-slate-950 border border-orange-500/30 shadow-[0_0_50px_rgba(249,115,22,0.15)] overflow-hidden"
                    >
                        {/* Decorative HUD Elements */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
                        <div className="absolute top-2 left-2 flex gap-1 transform scale-75">
                            <div className="w-1.5 h-1.5 bg-orange-500/50" />
                            <div className="w-1.5 h-1.5 bg-orange-500/30" />
                            <div className="w-1.5 h-1.5 bg-orange-500/10" />
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-white hover:bg-orange-600 transition-all rounded-sm z-10 group"
                        >
                            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        </button>

                        <div className="p-10 text-center relative overflow-hidden">
                            {/* Scanning Line */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-orange-500/10 animate-[scan_6s_linear_infinite]" />

                            <div className="flex justify-center mb-10">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full animate-pulse" />
                                    <div className="w-16 h-16 bg-slate-900 border border-orange-500/50 flex items-center justify-center relative z-10 shadow-2xl">
                                        <Lock className="w-8 h-8 text-orange-500" />
                                    </div>
                                </div>
                            </div>

                             <h2 className="text-3xl font-black text-white italic tracking-tighter mb-2 uppercase">
                                UPCOMING <span className="text-orange-500">INTELLIGENCE</span>
                            </h2>
                            <p className="text-slate-500 text-[10px] font-mono font-black uppercase tracking-[0.4em] mb-10">
                                ROADMAP PHASE 2 // NEURAL_VECTORS
                            </p>

                            <div className="space-y-4 mb-10 text-left">
                                <section className="p-4 bg-slate-900/40 border border-slate-800 rounded-sm flex items-start gap-4 hover:border-orange-500/20 transition-colors group">
                                    <div className="mt-1 bg-slate-950 p-2 border border-slate-800 text-amber-500 group-hover:text-amber-400">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Neural Summarization</h4>
                                        <p className="text-[11px] text-slate-500 leading-snug font-sans">Next-gen AI context extraction for multi-sector events. [Phase 2 Deployment]</p>
                                    </div>
                                </section>

                                <section className="p-4 bg-slate-900/40 border border-slate-800 rounded-sm flex items-start gap-4 hover:border-orange-500/20 transition-colors group">
                                    <div className="mt-1 bg-slate-950 p-2 border border-slate-800 text-orange-500 group-hover:text-orange-400">
                                        <Headphones className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Tactical Voice Briefs</h4>
                                        <p className="text-[11px] text-slate-500 leading-snug font-sans">Immersive audio SITREPs for passive intelligence harvesting. [In Dev]</p>
                                    </div>
                                </section>

                                <section className="p-4 bg-slate-900/40 border border-slate-800 rounded-sm flex items-start gap-4 hover:border-emerald-500/20 transition-colors group">
                                    <div className="mt-1 bg-slate-950 p-2 border border-slate-800 text-emerald-500 group-hover:text-emerald-400">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Verified Ground Signals</h4>
                                        <p className="text-[11px] text-slate-500 leading-snug font-sans">Cross-verified intelligence streams via decentralized validation. [Planned]</p>
                                    </div>
                                </section>
                            </div>

                            <button
                                onClick={handleSubscribe}
                                disabled={isProcessing}
                                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase tracking-[0.3em] text-[11px] rounded-sm transition-all shadow-[0_0_30px_rgba(234,88,12,0.3)] flex items-center justify-center gap-3 disabled:opacity-70 disabled:grayscale active:scale-95"
                            >
                                {isProcessing ? (
                                    <>
                                        <Radar className="w-4 h-4 animate-spin" />
                                        SECURE_ENROLLMENT_IN_PROGRESS...
                                    </>
                                ) : (
                                    <>
                                        RESERVE_ALPHA_ACCESS
                                    </>
                                )}
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
                                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                                    ALPHA RESERVATION PROTOCOL // NO CREDENTIALS REQUIRED
                                </span>
                            </div>
                        </div>
                        
                        {/* Decorative HUD corners */}
                        <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-orange-500/30" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
