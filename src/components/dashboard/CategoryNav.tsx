'use client';

import { motion } from 'framer-motion';

const CATEGORIES = ['general', 'world', 'business', 'technology', 'entertainment', 'science', 'health'];

export default function CategoryNav({ selectedCategory, onSelectCategory }: { selectedCategory: string, onSelectCategory: (c: string) => void }) {
  return (
    <nav className="hidden lg:flex items-center gap-4 xl:gap-8 overflow-hidden">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`relative text-[10px] font-bold uppercase tracking-widest px-1 py-4 transition-colors ${
            selectedCategory === cat ? 'text-orange-500' : 'text-neutral-400 hover:text-white'
          }`}
        >
          {cat}
          {selectedCategory === cat && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </nav>
  );
}
