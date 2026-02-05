import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, CreditCard, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
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
        // Mock payment processing delay
        setTimeout(() => {
            setIsProcessing(false);
            onSubscribe();
        }, 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-neutral-900 border border-orange-500/30 rounded-lg shadow-[0_0_50px_rgba(234,88,12,0.15)] overflow-hidden"
                    >
                        {/* Decorative Top Line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600" />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 text-center relative">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
                                    <Lock className="w-12 h-12 text-orange-500 relative z-10" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-white italic tracking-tighter mb-2">
                                UNLOCK <span className="text-orange-500">AI ANALYST</span>
                            </h2>
                            <p className="text-neutral-400 text-sm mb-8 font-mono">
                                PREMIUM INTELLIGENCE BRIEFING ACCESS REQUIRED
                            </p>

                            <div className="space-y-4 mb-8 text-left">
                                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-md border border-neutral-800">
                                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase">Instant Summaries</h4>
                                        <p className="text-xs text-neutral-500">AI-generated executive briefs of complex geopolitical events.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-md border border-neutral-800">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase">Verified Sources</h4>
                                        <p className="text-xs text-neutral-500">Cross-reference analysis from multiple intelligence streams.</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSubscribe}
                                disabled={isProcessing}
                                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-black font-bold uppercase tracking-widest rounded-sm transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4" /> Subscribe for $10/mo
                                    </>
                                )}
                            </button>

                            <p className="mt-4 text-[10px] text-neutral-600 font-mono">
                                SECURE ENCRYPTED TRANSACTION // CANCEL ANYTIME
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
