'use client';

import { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { PulseItem } from '@/lib/types';

interface VideoModalProps {
    video: PulseItem | null;
    onClose: () => void;
}

export default function VideoModal({ video, onClose }: VideoModalProps) {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (video) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [video]);

    if (!video) return null;

    // Extract Video ID from URL (Assumes format: https://www.youtube.com/watch?v=ID)
    // Safety check for URL format
    const videoId = video.url.includes('v=') ? video.url.split('v=')[1] : null;

    if (!videoId) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">

            {/* Modal Container */}
            <div className="bg-neutral-900 border border-neutral-700 w-full max-w-4xl rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur">
                    <h3 className="text-lg font-bold text-neutral-200 truncate pr-4 font-mono tracking-tight uppercase">
                        {video.title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-orange-500/20 rounded-sm transition-colors text-neutral-500 hover:text-orange-500"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Video Player (16:9 Aspect Ratio) */}
                <div className="relative pt-[56.25%] bg-black border-y border-neutral-800">
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>

                {/* Footer / Metadata */}
                <div className="p-4 bg-neutral-950 flex justify-between items-center text-sm border-t border-neutral-800">
                    <div className="flex gap-2">
                        <span className="text-neutral-500 uppercase tracking-wider text-xs font-bold">Source:</span>
                        <span className="font-bold text-orange-500 uppercase tracking-wider text-xs">{video.source}</span>
                    </div>

                    <a
                        href={video.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors"
                    >
                        Open in YouTube <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>

            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
}
