'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Newspaper, Briefcase, Cpu, Trophy, Activity, Globe, Scale, Film, FlaskRound, Zap, Target } from 'lucide-react';
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

    // Auto-close menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1280) {
                setIsOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                className="w-11 h-11 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-sm transition-colors border border-transparent hover:border-neutral-700"
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
                                <h2 className="text-xl font-black italic tracking-tighter text-white flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                    GEO<span className="text-orange-500">POL</span>
                                    <span className="text-[10px] ml-1 px-1.5 py-0.5 border border-neutral-800 bg-neutral-900 rounded-[2px] font-mono tracking-widest text-neutral-400 not-italic font-normal">
                                        TERMINAL_V1.1
                                    </span>
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-neutral-800 rounded-sm text-neutral-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="space-y-1.5 mb-8">
                                {categories.map((cat, i) => {
                                    const Icon = cat === 'surveillance' ? Target : (CATEGORY_ICONS[cat] || Zap);
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
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-[13px] font-black uppercase tracking-[0.2em] transition-all group
                                                ${isSelected
                                                    ? 'bg-orange-600 text-black shadow-[0_0_20px_rgba(234,88,12,0.3)]'
                                                    : 'text-neutral-500 hover:text-white hover:bg-neutral-900/50 border border-transparent hover:border-neutral-800'
                                                }
                                            `}
                                        >
                                            <Icon className={`w-4 h-4 transition-colors ${isSelected ? 'text-black' : 'text-neutral-700 group-hover:text-orange-500'}`} />
                                            {cat}
                                        </motion.button>
                                    );
                                })}
                            </nav>

                            <div className="mt-auto pt-6 border-t border-neutral-900/50 space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 bg-neutral-900/30 border border-neutral-800/50 rounded-sm">
                                        <span className="block text-[8px] text-neutral-600 uppercase font-bold mb-1">Status</span>
                                        <span className="text-[10px] text-green-500 font-mono font-bold">ONLINE_SECURE</span>
                                    </div>
                                    <div className="p-3 bg-neutral-900/30 border border-neutral-800/50 rounded-sm">
                                        <span className="block text-[8px] text-neutral-600 uppercase font-bold mb-1">Encrypt</span>
                                        <span className="text-[10px] text-cyan-500 font-mono font-bold">AES_256_ACTIVE</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-black border border-neutral-900 rounded-sm flex items-center justify-between">
                                    <div className="space-y-1">
                                        <span className="block text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Master Node</span>
                                        <span className="block text-[8px] text-neutral-700 font-mono">B01_T_CMD_ALPHA</span>
                                    </div>
                                    <Activity className="w-4 h-4 text-orange-950" />
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence >
        </>
    );
}
