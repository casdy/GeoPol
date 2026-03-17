import { Article } from '@/lib/types';
import { ExternalLink, PlayCircle, Clock, Share2 } from 'lucide-react';

interface ItemCardProps {
    item: Article;
    onPlay?: (item: Article) => void; 
    variant?: 'default' | 'hero' | 'compact' | 'text-only';
    hideTitle?: boolean;
}

export function ItemCard({ item, onPlay, variant = 'default', hideTitle = false }: ItemCardProps) {
    const isVideo = false; // Videos handled separately now

    const formatDate = (dateString?: string) => {
        if (!dateString) return "UNKNOWN DATE";
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return "INVALID DATE";
        return `${d.toLocaleDateString('en-US')} // ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    };

    const handleClick = (e: React.MouseEvent) => {
        if (onPlay) {
            e.preventDefault();
            onPlay(item);
        }
    };

    const imageHeights = {
        default: 'h-44',
        hero: 'flex-1 min-h-0',
        compact: 'h-32',
        'text-only': 'hidden'
    };
    
    const titleSizes = {
        default: 'text-lg md:text-sm mb-3', // 18px on mobile
        hero: 'text-3xl md:text-3xl lg:text-4xl mb-4 leading-tight', // 30px on mobile
        compact: 'text-base md:text-xs mb-2 leading-tight', // 16px on mobile
        'text-only': 'text-lg md:text-sm mb-2 font-bold hover:underline underline-offset-4' // 18px on mobile
    };

    const isTextOnly = variant === 'text-only';

    return (
        <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className={`group relative ${!isTextOnly ? 'bg-neutral-900/50 border border-neutral-800 hover:border-orange-500/50 hover:-translate-y-0.5 rounded-md' : 'bg-transparent border-b border-neutral-800/50 pb-3 hover:bg-neutral-900/20'} overflow-hidden transition-all duration-300 flex flex-col h-full cursor-pointer hover:shadow-[0_0_30px_rgba(234,88,12,0.1)] ${variant === 'hero' ? 'lg:h-[520px] md:h-[480px]' : ''}`}
        >
            {/* Tech Decoration Lines */}
            {!isTextOnly && (
                <>
                    <div className="absolute top-0 left-0 w-2 h-[1px] bg-orange-500/0 group-hover:bg-orange-500 transition-all" />
                    <div className="absolute top-0 left-0 w-[1px] h-2 bg-orange-500/0 group-hover:bg-orange-500 transition-all" />
                    <div className="absolute bottom-0 right-0 w-2 h-[1px] bg-orange-500/0 group-hover:bg-orange-500 transition-all" />
                    <div className="absolute bottom-0 right-0 w-[1px] h-2 bg-orange-500/0 group-hover:bg-orange-500 transition-all" />
                </>
            )}

            {/* Image Container */}
            {!isTextOnly && (
                <div className={`relative w-full overflow-hidden bg-neutral-950 group-hover:border-b border-orange-500/20 transition-colors ${imageHeights[variant as keyof typeof imageHeights]}`}>
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.title}
                            className={`w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 grayscale group-hover:grayscale-0 group-hover:scale-105 ${variant==='compact'?'object-top':''}`}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-800 font-mono text-xs uppercase bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 to-neutral-950">
                            Signal Lost
                        </div>
                    )}

                    {/* Source Badge - Tactical */}
                    <div className="absolute top-0 right-0 px-2 py-1 text-[9px] font-bold uppercase tracking-widest bg-neutral-950 text-orange-500 border-l border-b border-neutral-800">
                        {item.source}
                    </div>

                    {/* Play Button Overlay */}
                    {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-transparent transition-all">
                            <PlayCircle className="w-12 h-12 text-neutral-300 group-hover:text-orange-500 transition-all duration-300 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]" />
                        </div>
                    )}
                </div>
            )}

            {/* Content Body */}
            <div className={`${!isTextOnly ? 'p-4 bg-neutral-900' : 'pt-2 px-2'} flex flex-col flex-grow `}>
                <div className="flex flex-col gap-1 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400">
                            {item.source}
                        </span>
                        {item.tags?.slice(0, 3).map((tag, i) => (
                            <span key={tag} className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 ${!isTextOnly ? 'border' : ''} ${i === 0 ? 'text-orange-400 border-orange-500/30 font-bold' : 'text-neutral-500 border-neutral-700'}`}>
                                {tag}
                            </span>
                        ))}
                        {item.apiSource && !isTextOnly && (
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 border text-blue-400 border-blue-500/30 font-bold ml-auto" title="Provider API">
                                {item.apiSource}
                            </span>
                        )}
                    </div>
                </div>

                {!hideTitle && (
                    <div className="flex flex-col flex-grow">
                        <h3 className={`text-neutral-200 font-bold group-hover:text-amber-500 transition-colors font-mono ${titleSizes[variant as keyof typeof titleSizes]}`}>
                            {item.title}
                        </h3>
                        {!isTextOnly && item.description && (
                            <div className="mt-1 mb-4 border-l-2 border-orange-500/30 pl-3">
                                <span className="text-[9px] font-black uppercase tracking-widest text-orange-500/80 mb-1 block">Intelligence Briefing</span>
                                <p className="text-xs text-neutral-400 font-sans line-clamp-2 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <div className={`flex items-center justify-between text-[10px] text-neutral-600 font-mono mt-auto ${!isTextOnly ? 'pt-3 border-t border-neutral-800' : 'pt-2'}`}>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-neutral-700" />
                        <span>{formatDate(item.publishedAt)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Share Button */}
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const shareData = {
                                    title: item.title,
                                    text: `Read this GeoPolitical Pulse briefing:\n${item.title}`,
                                    url: item.url
                                };
                                if (navigator.share) {
                                    navigator.share(shareData).catch(console.error);
                                } else {
                                    navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                                    alert("Link copied to clipboard!");
                                }
                            }}
                            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-white uppercase tracking-widest font-bold z-10 relative"
                            title="Share Article"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500 uppercase tracking-widest font-bold">
                            {isVideo ? 'Play' : 'Read'} {isVideo ? <PlayCircle className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                        </div>
                    </div>
                </div>
            </div>
        </a>
    );
}
