'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2, Radar } from 'lucide-react';
import { getAggregatedIntelligence } from '@/lib/api';
import { Article } from '@/lib/types';
import { ItemCard } from '@/components/dashboard/ItemCard';
import NewsModal from '@/components/dashboard/NewsModal';

interface TopicModalProps {
  topic: string | null;
  onClose: () => void;
}

export default function TopicModal({ topic, onClose }: TopicModalProps) {
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  // Fetch news for the specific topic
  const { data, isLoading } = useQuery({
    queryKey: ['topicFeed', topic],
    queryFn: () => getAggregatedIntelligence({ query: topic || '' }),
    enabled: !!topic,
    staleTime: 60000,
  });

  const articles = data?.news || [];

  if (!topic) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
      >
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-[#0E0E0E] border border-neutral-800 w-full max-w-6xl max-h-[90vh] rounded-md shadow-2xl flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-900 bg-black/50">
            <div className="flex items-center gap-3">
              <Radar className="w-5 h-5 text-orange-500 animate-pulse" />
              <div>
                <h2 className="text-xl font-black italic tracking-tighter text-white uppercase flex items-center gap-2">
                  TOPIC <span className="text-orange-500">//</span> {topic}
                </h2>
                <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-[0.2em]">
                  INTELLIGENCE GATHERING
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-sm transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-neutral-950/50">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-xs text-neutral-500 font-mono tracking-widest uppercase animate-pulse">
                  Decrypting signals for {topic}...
                </p>
              </div>
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {articles.map((article) => (
                  <ItemCard
                    key={article.id}
                    item={article}
                    onPlay={setActiveArticle}
                    variant="default"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Radar className="w-12 h-12 text-neutral-800 mb-4" />
                <p className="text-sm text-neutral-400 font-mono tracking-widest uppercase">
                  No direct intelligence found for this topic.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Render the inner Article Modal if an article is active */}
      <NewsModal
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
      />
    </AnimatePresence>
  );
}
