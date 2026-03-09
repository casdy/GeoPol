'use client';

import { motion } from 'framer-motion';
import { Radar } from 'lucide-react';
import { ItemCardSkeleton } from './ItemCardSkeleton';

export default function DashboardSkeleton() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-500">
            {/* Desktop Hero Section Skeleton */}
            <div className="hidden lg:flex flex-col space-y-8">
                {/* Hero Title Placeholder */}
                <div className="w-full text-center max-w-6xl mx-auto my-6 px-4 flex flex-col items-center space-y-4">
                    <div className="h-12 w-3/4 bg-neutral-900 rounded-md animate-pulse" />
                    <div className="h-12 w-1/2 bg-neutral-900 rounded-md animate-pulse" />
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left Column */}
                    <div className="col-span-3 flex flex-col space-y-6">
                        {[1, 2, 3, 4].map(i => (
                            <ItemCardSkeleton key={i} variant="compact" />
                        ))}
                    </div>

                    {/* Center Column */}
                    <div className="col-span-6 flex flex-col space-y-4">
                        <ItemCardSkeleton variant="hero" hideTitle={true} />
                        <div className="flex items-center gap-2 mt-4 px-2">
                            <div className="h-4 w-12 bg-red-900/20 rounded animate-pulse" />
                            <div className="h-[2px] bg-neutral-800 flex-grow rounded-full" />
                        </div>
                        <div className="flex flex-col space-y-1">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <ItemCardSkeleton key={i} variant="text-only" />
                            ))}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-span-3 flex flex-col space-y-6">
                        {[1, 2, 3, 4].map(i => (
                            <ItemCardSkeleton key={i} variant="compact" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile/Tablet Fallback Skeleton */}
            <div className="lg:hidden flex flex-col space-y-6">
                <div className="h-10 w-full bg-neutral-900 rounded-md animate-pulse mb-4" />
                <ItemCardSkeleton variant="hero" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="py-4 border-b border-neutral-800 space-y-2">
                            <div className="h-3 w-16 bg-orange-950/20 rounded animate-pulse" />
                            <div className="h-5 w-full bg-neutral-900 rounded animate-pulse" />
                            <div className="h-3 w-2/3 bg-neutral-900 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Separator */}
            <div className="w-full h-[1px] bg-neutral-800/60 my-12" />

            {/* Expanded Feed Header */}
            <div className="space-y-6">
                <div className="h-8 w-64 bg-neutral-900 border-b border-neutral-800 pb-4 mb-6 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <ItemCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
