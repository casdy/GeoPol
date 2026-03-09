'use client';

import { motion } from 'framer-motion';

interface ItemCardSkeletonProps {
    variant?: 'default' | 'hero' | 'compact' | 'text-only';
    hideTitle?: boolean;
}

export function ItemCardSkeleton({ variant = 'default', hideTitle = false }: ItemCardSkeletonProps) {
    const isTextOnly = variant === 'text-only';

    const imageHeights = {
        default: 'h-44',
        hero: 'h-64 md:h-80 lg:h-[400px]',
        compact: 'h-32',
        'text-only': 'hidden'
    };

    return (
        <div 
            className={`relative ${!isTextOnly ? 'bg-neutral-900/50 border border-neutral-800 rounded-md' : 'bg-transparent border-b border-neutral-800/50 pb-3'} overflow-hidden h-full flex flex-col`}
        >
            {/* Shimmer Effect */}
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                }}
                className="absolute inset-0 z-10 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
            />

            {/* Image Skeleton */}
            {!isTextOnly && (
                <div className={`relative w-full overflow-hidden bg-neutral-950/50 ${imageHeights[variant]}`}>
                    <div className="w-full h-full bg-neutral-900/50 animate-pulse" />
                    
                    {/* Source Badge Skeleton */}
                    <div className="absolute top-0 right-0 w-16 h-5 bg-neutral-900 border-l border-b border-neutral-800 block" />
                </div>
            )}

            {/* Content Body */}
            <div className={`${!isTextOnly ? 'p-4 bg-neutral-900/30' : 'pt-2 px-2'} flex flex-col flex-grow`}>
                <div className="flex flex-col gap-1 mb-4">
                    <div className="flex items-center gap-2">
                        {/* Domain Skeleton */}
                        <div className="h-3 w-16 bg-blue-900/20 rounded animate-pulse" />
                        {/* Tag Skeleton */}
                        <div className="h-3 w-12 bg-neutral-800 rounded animate-pulse" />
                        <div className="h-3 w-12 bg-neutral-800 rounded animate-pulse" />
                    </div>
                </div>

                {!hideTitle && (
                    <div className="flex flex-col flex-grow space-y-3">
                        {/* Title Lines */}
                        <div className={`h-5 bg-neutral-800 rounded animate-pulse ${variant === 'hero' ? 'w-3/4 h-8' : 'w-full'}`} />
                        {variant === 'hero' && <div className="h-8 w-1/2 bg-neutral-800 rounded animate-pulse" />}
                        
                        {!isTextOnly && (
                            <div className="mt-1 mb-4 border-l-2 border-orange-500/10 pl-3 flex flex-col gap-1.5">
                                <div className="h-2 w-20 bg-orange-900/20 rounded animate-pulse" />
                                <div className="h-3 w-full bg-neutral-800/50 rounded animate-pulse" />
                                <div className="h-3 w-2/3 bg-neutral-800/50 rounded animate-pulse" />
                            </div>
                        )}
                    </div>
                )}

                <div className={`flex items-center justify-between mt-auto ${!isTextOnly ? 'pt-3 border-t border-neutral-800' : 'pt-2'}`}>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-neutral-800 animate-pulse" />
                        <div className="h-2 w-24 bg-neutral-800 rounded animate-pulse" />
                    </div>
                    <div className="w-12 h-3 bg-neutral-800 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
}
