'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Calendar, ExternalLink, Bot, Sparkles, Loader2, FileText, Share2, Check, Shield, Activity, Radar } from 'lucide-react';
import { Article } from '@/lib/types';

interface NewsModalProps {
    article: Article | null;
    onClose: () => void;
    isLiveInsight?: boolean;
}

import PaywallModal from './PaywallModal';
import NewsletterForm from '@/components/shared/NewsletterForm';

export default function NewsModal({ article, onClose, isLiveInsight = false }: NewsModalProps) {
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);

    const generateProgrammaticBrief = (art: Article) => {
        const sourceName = art.source.toUpperCase();
        const dateStr = art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'long', day: '2-digit' 
        }).toUpperCase() : 'PENDING VERIFICATION';
        
        const mainPoints = art.description || art.summary || "Current data stream provides limited descriptive metadata.";
        
        return (
            <div className="space-y-4">
                <div className="border border-slate-800 bg-slate-900/30 p-4 rounded-sm mb-4">
                  <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    <div><span className="text-cyan-500/50">REPORT_ID:</span> GP-{Math.floor(1000 + Math.random() * 9000)}</div>
                    <div><span className="text-cyan-500/50">TIMESTAMP:</span> {dateStr}</div>
                    <div><span className="text-cyan-500/50">SUBJECT:</span> {art.title.slice(0, 30)}...</div>
                    <div><span className="text-cyan-500/50">SOURCE:</span> {sourceName}</div>
                  </div>
                </div>

                <div className="space-y-4 text-slate-300 font-serif leading-relaxed text-[17px]">
                    <p>
                        <span className="text-cyan-500 font-mono font-black tracking-[0.3em] text-[11px] block mb-2">[SUMMARY]</span>
                        Intelligence assets from <span className="text-white border-b border-white/20">{art.source}</span> have released a critical SITREP regarding <span className="text-white italic">"{art.title}"</span>. Initial data ingestion indicates that {mainPoints.charAt(0).toLowerCase() + mainPoints.slice(1)} This development marks a significant shift in current sector dynamics.
                    </p>

                    <p className="pt-4 border-t border-slate-800/50">
                        <span className="text-orange-500 font-mono font-black tracking-[0.3em] text-[11px] block mb-2">[STRATEGIC ASSESSMENT]</span>
                        The current vector suggests that the implications of this event extend beyond immediate news cycles. Analyst consensus identifies this as a high-priority intelligence stream requiring immediate tactical observation and cross-referencing with existing geopolitical baselines to determine long-term stability impact.
                    </p>
                </div>
            </div>
        );
    };

    const handleShare = async () => {
        if (!article) return;
        if (navigator.share) {
            try {
                await navigator.share({ title: article.title, text: article.description || article.title, url: article.url });
            } catch (_) {}
        } else {
            try {
                await navigator.clipboard.writeText(article.url);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2500);
            } catch (_) {}
        }
    };

    useEffect(() => {
        if (!article || !isLiveInsight) {
            setSummary(null);
            setIsSummarizing(false);
            return;
        }

        const fetchSummary = async () => {
            setIsSummarizing(true);
            try {
                const res = await fetch('/api/summarize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: article.title, description: article.description || article.summary, source: article.source })
                });
                const data = await res.json();
                setSummary(data.summary || "Intelligence synthesis failed. Manual review recommended.");
            } catch (e) {
                setSummary("Autonomous summarization offline. Core data stream persists below.");
            } finally {
                setIsSummarizing(false);
            }
        };

        fetchSummary();
    }, [article, isLiveInsight]);

    useEffect(() => {
        if (article) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [article]);

    if (!article) return null;

    return (
        <AnimatePresence>
            {article && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-950/95 backdrop-blur-xl md:p-6 p-0"
                >
                    <PaywallModal
                        isOpen={isPaywallOpen}
                        onClose={() => setIsPaywallOpen(false)}
                        onSubscribe={() => { setIsPaywallOpen(false); setHasAccess(true); }}
                    />

                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="bg-slate-950 border-t md:border border-slate-800 w-full max-w-5xl md:rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col h-[100dvh] md:h-auto md:max-h-[92vh] overflow-hidden relative"
                    >
                        {/* CLOSE BUTTON */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 bg-slate-900/80 hover:bg-orange-600 text-white p-2.5 rounded-sm backdrop-blur-md transition-all border border-slate-700 hover:border-orange-500/50 min-w-[44px] min-h-[44px] flex items-center justify-center group"
                        >
                            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        </button>

                        <div className="flex flex-col md:flex-row h-full">
                            
                            {/* LEFT SIDE: MEDIA & META */}
                            <div className="w-full md:w-2/5 shrink-0 bg-slate-900/20 border-r border-slate-800/50 flex flex-col">
                                <div className="relative aspect-video md:aspect-square overflow-hidden bg-black">
                                    {article.image ? (
                                        <>
                                            <img
                                                src={article.image}
                                                alt={article.title}
                                                className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                                            {/* SCANNING OVERLAY */}
                                            <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none overflow-hidden">
                                                <div className="w-full h-[1px] bg-cyan-500/20 absolute top-0 left-0 animate-[scan_4s_linear_infinite]" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Globe className="w-16 h-16 text-slate-800 animate-pulse" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 flex flex-col gap-1">
                                        <div className="px-2 py-0.5 bg-cyan-600 text-white text-[8px] font-black uppercase tracking-[0.3em] rounded-[1px] shadow-lg">
                                            LIVE_FEED_STABLE
                                        </div>
                                        <div className="px-2 py-0.5 bg-black/60 text-slate-400 text-[8px] font-mono uppercase tracking-widest border border-slate-700/50 backdrop-blur-md">
                                            COORD: {Math.floor(Math.random()*90)}N / {Math.floor(Math.random()*180)}E
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6 flex-1 hidden md:block">
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.3em]">Attribution Domain</h4>
                                        <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-sm flex items-center gap-3">
                                            <div className="w-8 h-8 flex items-center justify-center bg-slate-800 text-cyan-400 rounded-sm">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white uppercase tracking-wider">{article.source}</div>
                                                <div className="text-[9px] text-slate-500 font-mono truncate max-w-[150px]">{article.url.split('/')[2]}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.3em]">Tactical Metadata</h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            <div className="flex items-center justify-between text-[10px] font-mono py-2 border-b border-slate-800/50">
                                                <span className="text-slate-600 uppercase">Timestamp</span>
                                                <span className="text-slate-400">{new Date(article.publishedAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] font-mono py-2 border-b border-slate-800/50">
                                                <span className="text-slate-600 uppercase">Security_Lv</span>
                                                <span className="text-emerald-500">PUBLIC_RELEASE</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] font-mono py-2">
                                                <span className="text-slate-600 uppercase">Sector_Analysis</span>
                                                <span className="text-cyan-500">COMPLETE</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <NewsletterForm />
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT SIDE: CORE INTEL CONTENT */}
                            <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto custom-scrollbar p-6 md:p-10">
                                
                                {/* TAGS */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest rounded-sm">
                                        PRI_INTEL_STREAM
                                    </span>
                                    {article.tags?.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-slate-900/40 border border-slate-800/50 text-[9px] font-mono text-slate-500 uppercase tracking-widest rounded-sm">
                                            #{tag.toUpperCase()}
                                        </span>
                                    ))}
                                </div>

                                {/* TITLE */}
                                <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter text-white uppercase leading-[0.95] mb-8">
                                    {article.title}
                                </h1>

                                {/* AI SYNTHESIS BOX */}
                                <div className="mb-10 relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-orange-500/20 rounded-sm blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                                    <div className="relative border border-cyan-500/30 bg-cyan-950/20 p-6 rounded-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Radar className="w-4 h-4 text-cyan-400 animate-pulse" />
                                                <h3 className="text-[10px] font-black font-mono text-cyan-400 uppercase tracking-[0.3em]">
                                                    Neural Synthesis Engine V4.2
                                                </h3>
                                            </div>
                                            {isSummarizing && (
                                                <div className="text-[9px] font-mono text-cyan-500/60 animate-pulse flex items-center gap-1">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    DECRYPTING...
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative">
                                            {isSummarizing ? (
                                                <div className="space-y-3">
                                                    <div className="h-4 bg-slate-800/80 rounded-sm w-full animate-pulse" />
                                                    <div className="h-4 bg-slate-800/80 rounded-sm w-5/6 animate-pulse" />
                                                    <div className="h-4 bg-slate-800/80 rounded-sm w-4/6 animate-pulse" />
                                                </div>
                                            ) : (
                                                <p className="text-[18px] text-slate-200 leading-relaxed font-serif">
                                                    {isLiveInsight ? (summary || "Awaiting neural synthesis...") : (article.summary || article.description || "Synthesizing deep-theater intelligence data nodes...")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* FIELD SITREP SECTION */}
                                <div className="mb-12">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Activity className="w-4 h-4 text-slate-700" />
                                        <h3 className="text-[10px] font-black font-mono text-slate-600 uppercase tracking-[0.3em] flex-1">
                                            Field Situation Report (SITREP)
                                        </h3>
                                        <div className="h-[1px] bg-slate-800/50 flex-1" />
                                    </div>
                                    {generateProgrammaticBrief(article)}
                                </div>

                                {/* ACTION BAR */}
                                <div className="mt-auto pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row gap-4">
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-between px-6 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] group"
                                    >
                                        <span>Read Full Source File</span>
                                        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </a>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleShare}
                                            className="px-6 py-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-2 uppercase font-black text-[10px] tracking-widest"
                                        >
                                            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                                            {isCopied ? 'Copied' : 'Share'}
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="px-6 py-4 bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300 transition-all uppercase font-black text-[10px] tracking-widest"
                                        >
                                            Abort
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </motion.div>

                    <div className="absolute inset-0 -z-10" onClick={onClose} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

<style jsx global>{`
    @keyframes scan {
        from { transform: translateY(0); opacity: 0; }
        50% { opacity: 0.5; }
        to { transform: translateY(100%); opacity: 0; }
    }
`}</style>
