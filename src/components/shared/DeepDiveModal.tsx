'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Shield, Activity, Globe, Info } from 'lucide-react';

interface DeepDiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  category?: 'AVIATION' | 'INSTABILITY' | 'CYBER' | 'STRATEGIC';
  children: React.ReactNode;
}

export default function DeepDiveModal({
  isOpen,
  onClose,
  title,
  subtitle = "Granular Data Analysis",
  category = "STRATEGIC",
  children
}: DeepDiveModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-[#050505] border border-slate-800 rounded-sm shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/40">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`p-2 rounded-sm border ${
                    category === 'AVIATION' ? 'border-blue-500/50 bg-blue-500/10 text-blue-500' :
                    category === 'INSTABILITY' ? 'border-orange-500/50 bg-orange-500/10 text-orange-500' :
                    category === 'CYBER' ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500' :
                    'border-cyan-500/50 bg-cyan-500/10 text-cyan-500'
                  }`}>
                    {category === 'AVIATION' && <Activity className="w-5 h-5" />}
                    {category === 'INSTABILITY' && <Globe className="w-5 h-5" />}
                    {category === 'CYBER' && <Shield className="w-5 h-5" />}
                    {category === 'STRATEGIC' && <Info className="w-5 h-5" />}
                  </div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-widest uppercase italic">
                    {title}
                  </h2>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mt-0.5">
                    {subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end mr-4">
                  <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Analysis Engine</span>
                  <span className="text-[10px] font-mono text-emerald-500 font-bold tracking-widest">QUADCORE_ON_v4.2</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors rounded-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#020202]">
              {children}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[8px] font-mono text-slate-600 uppercase tracking-widest">
              <div className="flex items-center gap-4">
                <span>SECTOR: 0xFF142</span>
                <span className="text-emerald-900">|</span>
                <span>DATA_STREAM: ENCRYPTED_AES256</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                <span>TERMINAL_CONNECTED</span>
              </div>
            </div>

            {/* Scanning Line Animation */}
            <div className="absolute inset-x-0 h-[2px] bg-cyan-500/5 z-[60] pointer-events-none animate-scan" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
