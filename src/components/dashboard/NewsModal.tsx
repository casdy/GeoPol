'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Calendar, ExternalLink, Bot, Sparkles, Loader2, FileText, Share2, Check, Shield } from 'lucide-react';
import { Article } from '@/lib/types';

interface NewsModalProps {
    article: Article | null;
    onClose: () => void;
}

import PaywallModal from './PaywallModal';
import PodcastPlayer from '@/components/shared/PodcastPlayer';
import NewsletterForm from '@/components/shared/NewsletterForm';

export default function NewsModal({ article, onClose }: NewsModalProps) {
    // Paywall State
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);

    // Share State
    const [isCopied, setIsCopied] = useState(false);

    // Programmatic Brief Generator (MoM style)
    const generateProgrammaticBrief = (art: Article) => {
        const sourceName = art.source.toUpperCase();
        const dateStr = art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'long', day: '2-digit' 
        }).toUpperCase() : 'PENDING VERIFICATION';
        
        const mainPoints = art.description || art.summary || "Current data stream provides limited descriptive metadata.";
        
        return (
            <div className="space-y-4">
                <div className="border border-orange-500/20 bg-black/40 p-3 rounded-sm mb-4">
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-neutral-500 uppercase tracking-tighter">
                    <div><span className="text-orange-500/70">REPORT_ID:</span> GP-{Math.floor(1000 + Math.random() * 9000)}</div>
                    <div><span className="text-orange-500/70">TIMESTAMP:</span> {dateStr}</div>
                    <div><span className="text-orange-500/70">SUBJECT:</span> {art.title.slice(0, 30)}...</div>
                    <div><span className="text-orange-500/70">SOURCE:</span> {sourceName}</div>
                  </div>
                </div>

                <p className="leading-relaxed">
                    <span className="text-orange-500/80 font-bold tracking-widest">[SUMMARY]</span> <br/>
                    Intelligence assets from <span className="text-white">{art.source}</span> have released a critical SITREP regarding <span className="text-white italic">"{art.title}"</span>. Initial data ingestion indicates that {mainPoints.charAt(0).toLowerCase() + mainPoints.slice(1)} This development marks a significant shift in current sector dynamics.
                </p>

                <p className="leading-relaxed border-t border-neutral-800 pt-3">
                    <span className="text-orange-500/80 font-bold tracking-widest">[STRATEGIC ASSESSMENT]</span> <br/>
                    The current vector suggests that the implications of this event extend beyond immediate news cycles. Analyst consensus identifies this as a high-priority intelligence stream requiring immediate tactical observation and cross-referencing with existing geopolitical baselines to determine long-term stability impact.
                </p>
            </div>
        );
    };

    const handleShare = async () => {
        if (!article) return;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: article.title,
                    text: article.description || article.title,
                    url: article.url,
                });
            } catch (_) {
                // User cancelled or share failed — fall through to clipboard
            }
        } else {
            // Fallback: copy URL to clipboard
            try {
                await navigator.clipboard.writeText(article.url);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2500);
            } catch (_) {
                // Clipboard not available
            }
        }
    };

    useEffect(() => {
        if (article) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [article]);

    const handlePaymentSuccess = () => {
        setIsPaywallOpen(false);
        setHasAccess(true);
    };

    if (!article) return null;

    return (
        <AnimatePresence>
            {article && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/90 backdrop-blur-md md:p-4 p-0"
                >
                    <PaywallModal
                        isOpen={isPaywallOpen}
                        onClose={() => setIsPaywallOpen(false)}
                        onSubscribe={handlePaymentSuccess}
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="bg-neutral-900 border-t md:border border-neutral-700 w-full max-w-4xl md:rounded-sm shadow-2xl flex flex-col overflow-hidden relative h-[100dvh] md:h-auto md:max-h-[90vh] pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
                    >

                        {/* Top Handle for Mobile Drag Hint */}
                        <div className="md:hidden w-12 h-1.5 bg-neutral-700 rounded-full mx-auto my-3 shrink-0" />

                        {/* Close Button (Absolute) */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-orange-600/90 text-white p-2.5 rounded-full md:rounded-sm backdrop-blur-sm transition-all border border-white/10 hover:border-orange-500/50 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Hero Image Section */}
                        <div className="relative h-40 md:h-64 w-full bg-neutral-950 shrink-0">
                            {article.image ? (
                                <>
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-full object-cover opacity-80 grayscale overflow-hidden"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                                    {/* Scanning Line Effect */}
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                                    <Globe className="w-16 h-16 text-neutral-600" />
                                </div>
                            )}

                            {/* Source Badge on Image */}
                            <div className="absolute bottom-0 left-0 flex items-center gap-2 px-4 py-2 bg-neutral-900 text-orange-500 text-xs font-bold uppercase tracking-widest border-t border-r border-neutral-700">
                                <Globe className="w-3 h-3" />
                                {article.source}
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-4 md:p-8 flex flex-col flex-1 overflow-y-auto min-h-0 bg-neutral-900 custom-scrollbar">

                            {/* Prominent Attribution Banner & Tags */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-400 font-semibold tracking-wide uppercase text-sm md:text-base">
                                            {article.source}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] uppercase tracking-widest font-mono">
                                        <Calendar className="w-3 h-3 text-neutral-600" />
                                        <span>{new Date(article.publishedAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    {article.tags?.map(tag => (
                                        <span key={tag} className="text-[10px] md:text-[9px] text-neutral-400 bg-neutral-800 px-3 py-1 md:px-2 md:py-[2px] border border-neutral-700 uppercase tracking-widest rounded-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl md:text-2xl font-black text-white leading-tight mb-6 md:mb-8 font-mono uppercase tracking-tight">
                                {article.title}
                            </h2>

                            {/* The Intelligence Brief (MoM Synthesized Narrative) */}
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-orange-500/80 uppercase tracking-[0.2em] mb-4 border-b border-neutral-800 pb-2 flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5" />
                                    Intelligence Briefing
                                </h3>
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <div className="text-neutral-300 font-mono text-sm tracking-tight py-1 bg-orange-500/[0.02]">
                                        {generateProgrammaticBrief(article)}
                                    </div>
                                </div>
                            </div>

                            {/* AI Intelligence Briefing Section - HIDDEN FOR REBRAND */}
                            <div className="mb-8 border-t border-neutral-800 pt-6">
                                {/* 
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-neutral-300 flex items-center gap-2 uppercase tracking-wide">
                                        <Bot className="w-4 h-4 text-orange-500" />
                                        AI Intelligence Briefing {hasAccess && <span className="text-xs text-green-500 font-mono">[UNLOCKED]</span>}
                                    </h3>
                                    {!summary && !isSummarizing && (
                                        <button
                                            onClick={handleSummarizeRequest}
                                            className="flex items-center gap-2 text-xs font-bold bg-orange-900/10 hover:bg-orange-600 hover:text-black text-orange-500 border border-orange-500/50 px-4 py-2.5 transition-all uppercase tracking-widest min-h-[44px]"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            {hasAccess ? 'Generate Summary' : 'Unlock Analysis'}
                                        </button>
                                    )}
                                </div>
                                */}

                                <div className="bg-black/30 border border-dashed border-neutral-800 rounded-sm p-4 text-center">
                                    <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-[0.2em]">
                                        Neural Analysis Module: Offline // Roadmap Phase 2
                                    </p>
                                </div>
                            </div>

                            {/* Deep Dive Podcast Player - HIDDEN FOR REBRAND */}
                            {/* 
                            <div className="mb-8">
                                <PodcastPlayer 
                                    type="deep-dive" 
                                    data={{ article, fullText: article.summary || article.description }} 
                                    isPremium={hasAccess}
                                    onSubscribeClick={() => setIsPaywallOpen(true)}
                                />
                                <p className="text-[10px] text-neutral-500 mt-3 italic font-mono text-center">
                                    "AI analysis is based on the publisher's provided summary."
                                </p>
                            </div>
                            */}

                            {/* Newsletter Subscription */}
                            <div className="mb-8 border-t border-neutral-800 pt-8">
                                <NewsletterForm />
                            </div>

                            {/* Action Area */}
                            <div className="mt-auto space-y-4 border-t border-neutral-800 pt-6">
                                {/* Primary CTA to Original Source */}
                                <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group w-full py-4 px-6 rounded-md font-bold text-sm md:text-base uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-between transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] min-h-[56px]"
                                >
                                    <span>Read Full Report on {article.source}</span>
                                    <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </a>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 rounded-sm font-bold text-xs uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors border border-neutral-800 min-h-[44px]"
                                    >
                                        Close
                                    </button>

                                    {/* Share Button */}
                                    <button
                                        onClick={handleShare}
                                        className="group w-full py-3 rounded-sm font-bold text-xs uppercase tracking-widest border border-neutral-700 text-neutral-300 hover:bg-neutral-800 flex items-center justify-center gap-2 transition-all min-h-[44px]"
                                        title={isCopied ? 'Link copied!' : 'Share article'}
                                    >
                                        {isCopied ? (
                                            <>
                                                <Check className="w-4 h-4 text-emerald-400" />
                                                <span className="text-emerald-400">Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Share2 className="w-4 h-4" />
                                                Share
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </motion.div>

                    {/* Backdrop Click Layer (Invisible, covers screen behind modal) */}
                    <div className="absolute inset-0 -z-10" onClick={onClose}></div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}