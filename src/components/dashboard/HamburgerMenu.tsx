'use client';

import { useState } from 'react';
import { Menu, X, Newspaper, Briefcase, Cpu, Trophy, Activity, Globe, Scale, Film, FlaskRound, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HamburgerMenuProps {
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
    'general': Globe,
    'world': Globe,
    'nation': Scale,
    'business': Briefcase,
    'technology': Cpu,
    'entertainment': Film,
    'sports': Trophy,
    'science': FlaskRound,
    'health': Activity
};

export default function HamburgerMenu({ categories, selectedCategory, onSelectCategory }: HamburgerMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const menuVariants = {
        closed: {
            x: '-100%',
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        },
        open: {
            x: 0,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        }
    };

    const itemVariants = {
        closed: { opacity: 0, x: -20 },
        open: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: { delay: i * 0.05 + 0.1 }
        })
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-sm transition-colors border border-transparent hover:border-neutral-700"
                aria-label="Open Menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90]"
                        />

                        {/* Menu Drawer */}
                        <motion.div
                            variants={menuVariants as any}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="fixed left-0 top-0 bottom-0 w-80 bg-neutral-950 border-r border-neutral-800 z-[100] p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-neutral-800">
                                <h2 className="text-xl font-black italic tracking-tighter text-white">
                                    G<span className="text-orange-500">NEWS</span>
                                    <span className="text-[10px] ml-2 opacity-50 font-sans tracking-normal not-italic font-normal">CHANNELS</span>
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-neutral-800 rounded-sm text-neutral-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="space-y-1">
                                {categories.map((cat, i) => {
                                    const Icon = CATEGORY_ICONS[cat] || Zap;
                                    const isSelected = selectedCategory === cat;

                                    return (
                                        <motion.button
                                            key={cat}
                                            custom={i}
                                            variants={itemVariants as any}
                                            onClick={() => {
                                                onSelectCategory(cat);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-bold uppercase tracking-wider transition-all
                                                ${isSelected
                                                    ? 'bg-orange-600 text-black shadow-[0_0_15px_rgba(234,88,12,0.4)]'
                                                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800'
                                                }
                                            `}
                                        >
                                            <Icon className={`w-4 h-4 ${isSelected ? 'text-black' : 'text-neutral-600 group-hover:text-orange-500'}`} />
                                            {cat}
                                        </motion.button>
                                    );
                                })}
                            </nav>

                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-sm text-xs text-neutral-500 font-mono">
                                    STATUS: <span className="text-green-500">ONLINE</span>
                                    <br />
                                    SOURCE: GNEWS.IO
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence >
        </>
    );
}
