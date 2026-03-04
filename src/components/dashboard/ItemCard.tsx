import { Article } from '@/lib/types';
import { ExternalLink, PlayCircle, Clock } from 'lucide-react';

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
        hero: 'h-64 md:h-80 lg:h-[400px]',
        compact: 'h-32',
        'text-only': 'hidden'
    };
    
    const titleSizes = {
        default: 'text-sm mb-3',
        hero: 'text-2xl md:text-3xl mb-4',
        compact: 'text-xs mb-2 leading-tight',
        'text-only': 'text-sm mb-2 font-bold hover:underline underline-offset-4'
    };

    const isTextOnly = variant === 'text-only';

    return (
        <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            onClick={handleClick}
            className={`group relative ${!isTextOnly ? 'bg-neutral-900/50 border border-neutral-800 hover:border-orange-500/50 hover:-translate-y-0.5' : 'bg-transparent border-b border-neutral-800/50 pb-3 hover:bg-neutral-900/20'} overflow-hidden transition-all duration-300 flex flex-col h-full cursor-pointer hover:shadow-[0_0_30px_rgba(234,88,12,0.1)]`}
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
                <div className="flex gap-2 mb-2 flex-wrap">
                    {item.tags?.slice(0, 3).map((tag, i) => (
                        <span key={tag} className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 ${!isTextOnly ? 'border' : ''} ${i === 0 ? 'text-orange-400 border-orange-500/30 font-bold' : 'text-neutral-500 border-neutral-700'}`}>
                            {tag}
                        </span>
                    ))}
                </div>

                {!hideTitle && (
                    <h3 className={`text-neutral-200 font-bold flex-grow line-clamp-3 group-hover:text-amber-500 transition-colors font-mono ${titleSizes[variant as keyof typeof titleSizes]}`}>
                        {item.title}
                    </h3>
                )}

                <div className={`flex items-center justify-between text-[10px] text-neutral-600 font-mono mt-auto ${!isTextOnly ? 'pt-3 border-t border-neutral-800' : 'pt-2'}`}>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-neutral-700" />
                        <span>{formatDate(item.publishedAt)}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500 uppercase tracking-widest font-bold">
                        {isVideo ? 'Play' : 'Read'} {isVideo ? <PlayCircle className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                    </div>
                </div>
            </div>
        </a>
    );
}
