'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink, Globe, Calendar, ArrowRight, Bot, Sparkles, Loader2 } from 'lucide-react';
import { summarizeArticle } from '@/app/actions';
import { PulseItem } from '@/lib/types';

interface NewsModalProps {
    article: PulseItem | null;
    onClose: () => void;
}

export default function NewsModal({ article, onClose }: NewsModalProps) {
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (article) {
            document.body.style.overflow = 'hidden';
            setSummary(null);
            setError(null);
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [article]);

    const handleSummarize = async () => {
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">

            {/* Modal Container */}
            <div className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl rounded-sm shadow-2xl flex flex-col overflow-hidden relative max-h-[90vh]">

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

                    {/* AI Intelligence Briefing Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-neutral-300 flex items-center gap-2 uppercase tracking-wide">
                                <Bot className="w-4 h-4 text-orange-500" />
                                Intelligence Brief
                            </h3>
                            {!summary && !isSummarizing && (
                                <button
                                    onClick={handleSummarize}
                                    className="flex items-center gap-1.5 text-[10px] font-bold bg-orange-900/10 hover:bg-orange-600 hover:text-black text-orange-500 border border-orange-500/50 px-3 py-1 transition-all uppercase tracking-widest"
                                >
                                    <Sparkles className="w-3 h-3" /> Generate Report
                                </button>
                            )}
                        </div>

                        <div className="bg-black/30 border border-dashed border-neutral-700 rounded-sm p-4 min-h-[120px]">
                            {isSummarizing ? (
                                <div className="h-full flex flex-col items-center justify-center gap-3 text-neutral-500 py-4 font-mono text-xs">
                                    <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                                    <span className="animate-pulse">DECRYPTING CONTENT...</span>
                                </div>
                            ) : error ? (
                                <div className="text-red-500 text-xs font-mono text-center py-2">
                                    // ERROR: {error}
                                </div>
                            ) : summary ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <div className="whitespace-pre-wrap leading-relaxed text-neutral-300 font-mono text-xs">
                                        {summary}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-neutral-600 text-xs font-mono text-center py-6">
                                    // SYSTEM STANDBY: AWAITING GENERATION COMMAND
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="mt-auto space-y-4">
                        <div className="p-3 bg-neutral-950 rounded-sm border-l-2 border-orange-500 text-xs text-neutral-500 font-mono">
                            <p>
                                // RESTRICTED ACCESS: DIRECT EMBED UNAVAILABLE FOR {article.source.toUpperCase()}
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
            </div>

            {/* Backdrop Click to Close */}
            <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
}