import { PulseItem } from '@/lib/types';
import { ExternalLink, PlayCircle, Clock } from 'lucide-react';

interface ItemCardProps {
    item: PulseItem;
    onPlay?: (item: PulseItem) => void; // Used for both Video (Play) and Article (View)
}

export function ItemCard({ item, onPlay }: ItemCardProps) {
    const isVideo = item.type === 'video';

    const handleClick = (e: React.MouseEvent) => {
        if (onPlay) {
            e.preventDefault();
            onPlay(item);
        }
    };

    return (
        <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            onClick={handleClick}
            className="group relative bg-neutral-900/50 border border-neutral-800 hover:border-orange-500/50 overflow-hidden transition-all duration-300 flex flex-col h-full cursor-pointer hover:shadow-[0_0_30px_rgba(234,88,12,0.1)] hover:-translate-y-0.5"
        >
            {/* Tech Decoration Lines */}
            <div className="absolute top-0 left-0 w-2 h-[1px] bg-orange-500/0 group-hover:bg-orange-500 transition-all" />
            <div className="absolute top-0 left-0 w-[1px] h-2 bg-orange-500/0 group-hover:bg-orange-500 transition-all" />
            <div className="absolute bottom-0 right-0 w-2 h-[1px] bg-orange-500/0 group-hover:bg-orange-500 transition-all" />
            <div className="absolute bottom-0 right-0 w-[1px] h-2 bg-orange-500/0 group-hover:bg-orange-500 transition-all" />

            {/* Image Container */}
            <div className="relative h-44 w-full overflow-hidden bg-neutral-950 group-hover:border-b border-orange-500/20 transition-colors">
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 grayscale group-hover:grayscale-0 group-hover:scale-105"
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

            {/* Content Body */}
            <div className="p-4 flex flex-col flex-grow bg-neutral-900">
                <div className="flex gap-2 mb-3 flex-wrap">
                    {item.tags.slice(0, 3).map((tag, i) => (
                        <span key={tag} className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 border ${i === 0 ? 'text-orange-400 border-orange-500/30' : 'text-neutral-500 border-neutral-700'}`}>
                            {tag}
                        </span>
                    ))}
                </div>

                <h3 className="text-neutral-200 font-bold text-sm leading-snug mb-3 flex-grow line-clamp-2 group-hover:text-amber-500 transition-colors font-mono">
                    {item.title}
                </h3>

                <div className="flex items-center justify-between text-[10px] text-neutral-600 font-mono mt-auto pt-3 border-t border-neutral-800">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-neutral-700" />
                        <span>{new Date(item.publishedAt).toLocaleDateString()}</span> // {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500 uppercase tracking-widest font-bold">
                        {isVideo ? 'Play' : 'Read'} {isVideo ? <PlayCircle className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                    </div>
                </div>
            </div>
        </a>
    );
}
