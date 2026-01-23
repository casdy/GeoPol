'use client';

import { useEffect } from 'react';
import { X, Youtube, Share2, AlertTriangle } from 'lucide-react';
import { PulseItem } from '@/lib/types';

interface VideoModalProps {
    video: PulseItem | null;
    onClose: () => void;
}

export default function VideoModal({ video, onClose }: VideoModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (video) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [video]);

    if (!video) return null;

    // Extract ID if possible, otherwise rely on item logic.
    // NOTE: api.ts assigns the YouTube video ID to item.id for videos.
    // If it's a mock item, it might be 'mock-X'. We'll handle that gracefully or specific parsing.
    // For standard YouTube links: https://www.youtube.com/watch?v=VIDEO_ID

    let videoId = video.id;

    // Fallback parsing if ID doesn't look like a standard YouTube ID (mock ids are 'mock-...')
    // But for api.ts real data, id IS the videoId.
    // For mock data, we might not have a real video to embed.
    const isMock = video.id.startsWith('mock-') || video.id === '2'; // '2' was the mock video id in api.ts

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">

            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-4xl rounded-sm shadow-2xl flex flex-col relative overflow-hidden group">

                {/* Tech Decorations */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

                {/* Header / Close */}
                <div className="flex items-center justify-between p-4 bg-neutral-950/80 border-b border-neutral-800">
                    <div className="flex items-center gap-2 text-orange-500 font-mono text-sm uppercase tracking-widest">
                        <Youtube className="w-4 h-4" />
                        <span>Live Feed // {video.source}</span>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-neutral-500 hover:text-white hover:bg-neutral-800 p-1.5 rounded-sm transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Video Player Container */}
                <div className="relative w-full aspect-video bg-black">
                    {isMock ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 space-y-4">
                            <AlertTriangle className="w-16 h-16 text-orange-600 opacity-50" />
                            <div className="text-center font-mono text-xs uppercase tracking-widest">
                                <p className="mb-2">Signal Encrypted / Simulation Data</p>
                                <p className="text-neutral-700">Video feed unavailable for mock entity: {video.id}</p>
                            </div>
                        </div>
                    ) : (
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                            title={video.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-5 bg-neutral-900">
                    <h2 className="text-lg font-bold text-white mb-2 font-mono uppercase leading-tight line-clamp-2">
                        {video.title}
                    </h2>

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex gap-2">
                            {video.tags.map(tag => (
                                <span key={tag} className="text-[10px] text-neutral-400 border border-neutral-700 px-2 py-1 uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <a
                            href={video.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-xs font-bold text-orange-500 hover:text-orange-400 uppercase tracking-widest"
                        >
                            Open in YouTube <Share2 className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Backdrop Close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
}
