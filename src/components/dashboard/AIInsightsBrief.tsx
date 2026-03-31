'use client';

import { motion } from 'framer-motion';

export default function AIInsightsBrief({ content }: { content?: string }) {
  const text = content || "Awaiting initial data fusion. The Governor engine is actively processing inputs.";
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
      },
    },
  };

  const charVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-sm p-2 shadow-lg h-full flex flex-col font-mono max-h-[250px] overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-1.5">
        <div className="animate-pulse bg-emerald-500 rounded-full w-1.5 h-1.5 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        <h3 className="uppercase text-[10px] text-slate-400 font-bold tracking-widest flex-1">
          AI Synthesis
        </h3>
        <span className="text-[9px] text-emerald-500 font-bold tracking-widest">LIVE</span>
      </div>
      
      <div className="flex-1 pr-1">
        <p className="text-xs text-slate-300 leading-tight break-words whitespace-pre-wrap">
          <motion.span
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={text}
          >
            {text.split('').map((char, index) => (
              <motion.span key={index} variants={charVariants}>
                {char}
              </motion.span>
            ))}
          </motion.span>
        </p>
      </div>
    </div>
  );
}
