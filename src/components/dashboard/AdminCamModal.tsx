'use client';

import { useState } from 'react';
import { X, Save, Globe, Video, Link as LinkIcon, AlertTriangle, MapPin } from 'lucide-react';
import { Webcam } from '@/hooks/useWebcams';

interface AdminCamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (cam: Omit<Webcam, 'id'>) => void;
}

const REGIONS = ['North America', 'Europe', 'Middle East', 'Asia', 'Conflict Zone', 'Custom'];

export default function AdminCamModal({ isOpen, onClose, onAdd }: AdminCamModalProps) {
  const [title, setTitle] = useState('');
  const [region, setRegion] = useState(REGIONS[0]);
  const [city, setCity] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const parseYoutubeUrl = (rawUrl: string): string | null => {
    const regex = (/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const match = rawUrl.match(regex);
    
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }

    if (rawUrl.includes('live_stream?channel=')) {
      return rawUrl;
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !city || !url) {
        setError('ALL TECHNICAL FIELDS ARE REQUIRED.');
        return;
    }

    const embedUrl = parseYoutubeUrl(url);
    if (!embedUrl) {
      setError('INVALID YOUTUBE SECTOR URL DETECTED.');
      return;
    }

    onAdd({
      title,
      region,
      city,
      youtubeUrl: embedUrl
    });

    setTitle('');
    setCity('');
    setUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-8 md:p-12">
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in duration-300">
        
        {/* Tactical Header */}
        <div className="px-8 py-5 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
            <div className="flex flex-col">
                <h3 className="text-xl font-black italic tracking-tighter text-white uppercase flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-cyan-400" />
                    Tactical <span className="text-cyan-400">Override</span>
                </h3>
                <span className="text-[10px] font-mono font-black text-slate-500 tracking-[0.2em] uppercase">Manual Intelligence Injection Protocol</span>
            </div>
            <button 
                onClick={onClose} 
                className="p-2 bg-slate-900/50 hover:bg-orange-600 text-slate-400 hover:text-white border border-slate-800 transition-all rounded-sm group"
            >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
                <div className="p-4 bg-red-950/40 border border-red-500/50 text-red-500 text-[10px] font-mono uppercase tracking-[0.2em] animate-pulse">
                    ERROR_SIGNAL_MALFORMED: {error}
                </div>
            )}

            <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-[0.3em]">Sector Descriptor</label>
                        <div className="relative">
                            <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.G. HORMUZ MONITOR"
                                className="w-full bg-slate-900/50 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 py-3 pl-10 pr-4 text-xs font-mono text-white transition-all outline-none placeholder:text-slate-700"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-[0.3em]">Strategic Region</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <select 
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-800 focus:border-cyan-500/50 py-3 pl-10 pr-4 text-xs font-mono text-white transition-all outline-none appearance-none"
                            >
                                {REGIONS.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-[0.3em]">Geolocation_Target (City)</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input 
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="E.G. KYIV"
                            className="w-full bg-slate-900/50 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 py-3 pl-10 pr-4 text-xs font-mono text-white transition-all outline-none placeholder:text-slate-700"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-[0.3em]">Intelligence_Vector (YouTube_URL)</label>
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input 
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="HTTP://YOUTUBE.COM/WATCH?V=... OR CHANNEL_ID"
                            className="w-full bg-slate-900/50 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 py-3 pl-10 pr-4 text-xs font-mono text-white transition-all outline-none placeholder:text-slate-700"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="order-2 sm:order-1 flex-1 px-8 py-4 border border-slate-800 text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                >
                    Abort_Protocol
                </button>
                <button 
                    type="submit"
                    className="order-1 sm:order-2 flex-1 px-8 py-4 bg-cyan-600 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-cyan-500 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                    <Save className="w-4 h-4" />
                    Inject_Neural_Feed
                </button>
            </div>
        </form>

        {/* Footer Area */}
        <div className="bg-slate-900 px-8 py-4 border-t border-slate-800 flex items-center justify-between opacity-50">
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none">Persistent Local Buffer Active</span>
            </div>
            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-tighter">SEC_LVL: ALPHA</span>
        </div>
      </div>
    </div>
  );
}
