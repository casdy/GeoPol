'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Calendar, ArrowRight, Bot, Sparkles, Loader2, FileText } from 'lucide-react';
import { summarizeArticle, fetchArticleContent } from '@/app/actions';
import { PulseItem } from '@/lib/types';

interface NewsModalProps {
    article: PulseItem | null;
    onClose: () => void;
}

import PaywallModal from './PaywallModal';

export default function NewsModal({ article, onClose }: NewsModalProps) {
    const [summary, setSummary] = useState<string | null>(null);
    const [fullContent, setFullContent] = useState<string | null>(null);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Paywall State
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        const loadContent = async () => {
            if (article) {
                document.body.style.overflow = 'hidden';
                setSummary(null);
                setFullContent(null);
                setError(null);
                // Reset Paywall Access on new article? 
                // For demo purposes, maybe we keep access if paid once, or reset.
                // Let's reset to force the demo experience every time or per session?
                // setHasAccess(false); 

                // Content Fetch
                setIsLoadingContent(true);
                const res = await fetchArticleContent(article.url);
                if (res.content) {
                    setFullContent(res.content);
                }
                setIsLoadingContent(false);
            } else {
                document.body.style.overflow = 'auto';
            }
        };
        loadContent();
        return () => { document.body.style.overflow = 'auto'; };
    }, [article]);

    const handleSummarizeRequest = () => {
        if (hasAccess) {
            generateSummary();
        } else {
            setIsPaywallOpen(true);
        }
    };

    const handlePaymentSuccess = () => {
        setIsPaywallOpen(false);
        setHasAccess(true);
        generateSummary();
    };

    const generateSummary = async () => {
        if (!article) return;
        setIsSummarizing(true);
        setError(null);

        try {
            const result = await summarizeArticle(article.url);
            if (result.error) {
                setError(result.error);
            } else if (result.summary) {
                setSummary(result.summary);
            }
        } catch (err) {
            setError('An unexpected error occurred while generating the briefing.');
        } finally {
            setIsSummarizing(false);
        }
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
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                >
                    <PaywallModal
                        isOpen={isPaywallOpen}
                        onClose={() => setIsPaywallOpen(false)}
                        onSubscribe={handlePaymentSuccess}
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 10, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-neutral-900 border border-neutral-700 w-full max-w-3xl rounded-sm shadow-2xl flex flex-col overflow-hidden relative max-h-[90vh]"
                    >

                        {/* Close Button (Absolute) */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-orange-600/90 text-white p-2 rounded-sm backdrop-blur-sm transition-all border border-white/10 hover:border-orange-500/50"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Hero Image Section */}
                        <div className="relative h-64 w-full bg-neutral-950 shrink-0">
                            {article.imageUrl ? (
                                <>
                                    <img
                                        src={article.imageUrl}
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
                        <div className="p-6 md:p-8 flex flex-col flex-1 overflow-y-auto bg-neutral-900 custom-scrollbar">

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {article.tags.map(tag => (
                                    <span key={tag} className="text-[9px] text-neutral-400 bg-neutral-800 px-2 py-[2px] border border-neutral-700 uppercase tracking-widest">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Title */}
                            <h2 className="text-xl md:text-2xl font-black text-white leading-none mb-6 font-mono uppercase tracking-tight">
                                {article.title}
                            </h2>

                            {/* Metadata */}
                            <div className="flex items-center gap-4 text-neutral-500 text-[10px] uppercase tracking-widest mb-8 border-b border-neutral-800 pb-4 font-mono">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3 text-neutral-600" />
                                    <span>{new Date(article.publishedAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            </div>

                            {/* Article Body Content */}
                            <div className="mb-8 space-y-4">
                                <div className="prose prose-invert prose-sm max-w-none">
                                    {fullContent ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="whitespace-pre-wrap leading-relaxed text-neutral-300 font-serif text-base tracking-wide"
                                        >
                                            {fullContent}
                                        </motion.div>
                                    ) : isLoadingContent ? (
                                        <div className="flex flex-col items-center justify-center py-10 space-y-4 text-neutral-500 animate-pulse">
                                            <div className="w-full h-4 bg-neutral-800 rounded"></div>
                                            <div className="w-3/4 h-4 bg-neutral-800 rounded"></div>
                                            <div className="w-5/6 h-4 bg-neutral-800 rounded"></div>
                                            <div className="flex items-center gap-2 text-xs font-mono mt-4">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                DECRYPTING SIGNAL...
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-neutral-400 italic border-l-2 border-neutral-700 pl-4">
                                            {article.description || "No preview available."}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* AI Intelligence Briefing Section */}
                            <div className="mb-8 border-t border-neutral-800 pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-neutral-300 flex items-center gap-2 uppercase tracking-wide">
                                        <Bot className="w-4 h-4 text-orange-500" />
                                        AI Intelligence Briefing {hasAccess && <span className="text-xs text-green-500 font-mono">[UNLOCKED]</span>}
                                    </h3>
                                    {!summary && !isSummarizing && (
                                        <button
                                            onClick={handleSummarizeRequest}
                                            className="flex items-center gap-1.5 text-[10px] font-bold bg-orange-900/10 hover:bg-orange-600 hover:text-black text-orange-500 border border-orange-500/50 px-3 py-1 transition-all uppercase tracking-widest"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            {hasAccess ? 'Generate Summary' : 'Unlock Analysis'}
                                        </button>
                                    )}
                                </div>

                                {(summary || isSummarizing || error) && (
                                    <div className="bg-black/30 border border-dashed border-neutral-700 rounded-sm p-4 min-h-[100px] animate-in slide-in-from-top-2">
                                        {isSummarizing ? (
                                            <div className="h-full flex flex-col items-center justify-center gap-3 text-neutral-500 py-4 font-mono text-xs">
                                                <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                                                <span className="animate-pulse">ANALYZING CONTENT...</span>
                                            </div>
                                        ) : error ? (
                                            <div className="text-red-500 text-xs font-mono text-center py-2">
                                        // ERROR: {error}
                                            </div>
                                        ) : (
                                            <div className="prose prose-invert prose-sm max-w-none">
                                                <div className="whitespace-pre-wrap leading-relaxed text-orange-200/90 font-mono text-xs">
                                                    {summary}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Area */}
                            <div className="mt-auto space-y-4">
                                <div className="p-3 bg-neutral-950 rounded-sm border-l-2 border-orange-500 text-xs text-neutral-500 font-mono flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-orange-600" />
                                    <p>
                                // FULL REPORT FETCHED FROM {article.source.toUpperCase()}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 rounded-sm font-bold text-xs uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors border border-neutral-800"
                                    >
                                        Cancel
                                    </button>

                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group w-full py-3 rounded-sm font-bold text-xs uppercase tracking-widest bg-orange-600 hover:bg-orange-500 text-black flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)]"
                                    >
                                        Access Source <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </a>
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