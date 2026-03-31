'use client';

import React, { useState, useMemo } from 'react';
import { Radio, Tv, Menu, X, Plus, Layout, Square, Globe, Shield, Activity } from 'lucide-react';
import { SURVEILLANCE_FEEDS, UnifiedFeed, FeedType, getFeedsByType } from '@/lib/surveillance';

// ─────────────────────────────────────────────────────────────────────────────
// REGION CATEGORIZATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

const REGION_ORDER = ['Global', 'Tactical', 'North America', 'South America', 'Europe', 'Middle East', 'Asia', 'Africa', 'Oceania'] as const;
type RegionName = (typeof REGION_ORDER)[number];

export function getRegion(feed: UnifiedFeed): RegionName {
  const map: Record<string, RegionName> = {
    'United States': 'North America',
    'USA': 'North America',
    'Canada': 'North America',
    'Mexico': 'North America',
    'United Kingdom': 'Europe',
    'UK': 'Europe',
    'France': 'Europe',
    'Germany': 'Europe',
    'Poland': 'Europe',
    'Ireland': 'Europe',
    'Ukraine': 'Europe',
    'Turkey': 'Europe',
    'Italy': 'Europe',
    'Qatar': 'Middle East',
    'Israel': 'Middle East',
    'Afghanistan': 'Middle East',
    'India': 'Asia',
    'Pakistan': 'Asia',
    'Bangladesh': 'Asia',
    'South Korea': 'Asia',
    'Korea': 'Asia',
    'Japan': 'Asia',
    'Taiwan': 'Asia',
    'Vietnam': 'Asia',
    'Philippines': 'Asia',
    'Thailand': 'Asia',
    'Hong Kong': 'Asia',
    'Australia': 'Oceania',
    'Republic of the Congo': 'Africa',
    'Congo': 'Africa',
    'South Africa': 'Africa',
    'Nigeria': 'Africa',
    'Jamaica': 'South America',
    'Brazil': 'South America',
    'Global': 'Global',
    'Tactical': 'Tactical'
  };
  return map[feed.country] || map[feed.region] || 'Global';
}

export function groupByRegion(feeds: UnifiedFeed[]): Record<string, UnifiedFeed[]> {
  const grouped: Record<string, UnifiedFeed[]> = {};
  for (const r of REGION_ORDER) grouped[r] = [];
  for (const f of feeds) {
    const region = getRegion(f);
    if (grouped[region]) {
      grouped[region].push(f);
    } else {
      grouped['Global'].push(f);
    }
  }
  return grouped;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: LiveNewsViewer
// ─────────────────────────────────────────────────────────────────────────────

export default React.memo(function LiveNewsViewer({ onOverrideClick }: { onOverrideClick?: () => void }) {
  const [activeChannel, setActiveChannel] = useState<UnifiedFeed>(SURVEILLANCE_FEEDS[0]);
  const [secondaryChannel, setSecondaryChannel] = useState<UnifiedFeed>(SURVEILLANCE_FEEDS[1] || SURVEILLANCE_FEEDS[0]);
  
  // Fallback to news if no webcams are available in the registry
  const initialSurveillance = useMemo(() => {
    const cams = SURVEILLANCE_FEEDS.filter(f => f.type === 'webcam');
    return cams.length > 0 ? cams.slice(0, 4) : SURVEILLANCE_FEEDS.filter(f => f.type === 'news').slice(4, 8);
  }, []);

  const [surveillanceChannels, setSurveillanceChannels] = useState<UnifiedFeed[]>(initialSurveillance);
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [targetStream, setTargetStream] = useState<number>(1); // 1: Prim, 2: Sec, 3-6: Surv

  const newsFeeds = useMemo(() => getFeedsByType('news'), []);
  const webcamFeeds = useMemo(() => getFeedsByType('webcam'), []);

  const handleChannelSelect = (ch: UnifiedFeed) => {
    if (targetStream === 1) {
      setActiveChannel(ch);
    } else if (targetStream === 2) {
      setSecondaryChannel(ch);
    } else {
      const idx = targetStream - 3;
      const newSurv = [...surveillanceChannels];
      newSurv[idx] = ch;
      setSurveillanceChannels(newSurv);
    }
    setIsMenuOpen(false);
  };

  const promoteToPrimary = (ch: UnifiedFeed) => {
    setActiveChannel(ch);
  };

  return (
    <div className="w-full flex flex-col bg-slate-950/90 border border-slate-800 rounded-sm backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden">

      {/* HEADER BAR */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-red-500 animate-pulse">
              LIVE
            </span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-slate-400">
            SIGNAL ACQUISITION ENGINE
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
            <button
              onClick={() => setIsSplitScreen(!isSplitScreen)}
              className={`flex items-center gap-2 px-2 py-1 rounded-sm border transition-all ${
                isSplitScreen 
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' 
                  : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title={isSplitScreen ? "Single View" : "Split View"}
            >
              {isSplitScreen ? <Square className="w-3 h-3" /> : <Layout className="w-3 h-3" />}
              <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:block">
                {isSplitScreen ? 'Single' : 'Split'}
              </span>
            </button>
            
            <button 
              onClick={onOverrideClick}
              className="p-1.5 rounded-sm bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
              title="Inject Source"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all ${
              isMenuOpen 
                ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              Catalog
            </span>
          </button>
        </div>
      </div>

      {/* CHANNEL MENU OVERLAY */}
      {isMenuOpen && (
        <div className="absolute top-[49px] left-0 right-0 bottom-0 z-50 bg-slate-950/98 border-t border-slate-800 backdrop-blur-xl flex flex-col animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-3 sm:grid-cols-6 border-b border-slate-900 bg-slate-950/50">
            <button 
              onClick={() => setTargetStream(1)}
              className={`py-2.5 text-[8px] font-black uppercase tracking-widest transition-all border-r border-slate-900 ${
                targetStream === 1 ? 'text-cyan-400 bg-cyan-950/20 border-b-2 border-cyan-500' : 'text-slate-600 hover:text-slate-300'
              }`}
            >
              Primary
            </button>
            <button 
              onClick={() => setTargetStream(2)}
              className={`py-2.5 text-[8px] font-black uppercase tracking-widest transition-all border-r border-slate-900 ${
                targetStream === 2 ? 'text-cyan-400 bg-cyan-950/20 border-b-2 border-cyan-500' : 'text-slate-600 hover:text-slate-300'
              }`}
            >
              Secondary
            </button>
            {[1, 2, 3, 4].map(i => (
              <button 
                key={i}
                onClick={() => setTargetStream(i + 2)}
                className={`py-2.5 text-[8px] font-black uppercase tracking-widest transition-all border-r border-slate-900 ${
                  targetStream === i + 2 ? 'text-emerald-400 bg-emerald-950/10 border-b-2 border-emerald-500' : 'text-slate-600 hover:text-slate-300'
                }`}
              >
                Surv {i}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 max-h-[60vh]">
            <section>
              <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3 flex items-center gap-2">
                <Shield className="w-3 h-3 text-cyan-500/50" />
                Global News Networks
                <span className="h-[1px] flex-1 bg-slate-800/50" />
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {newsFeeds.map(ch => {
                  let isActive = false;
                  if (targetStream === 1) isActive = activeChannel.id === ch.id;
                  else if (targetStream === 2) isActive = secondaryChannel.id === ch.id;
                  else isActive = surveillanceChannels[targetStream - 3]?.id === ch.id;
                  
                  return (
                    <ChannelButton 
                      key={ch.id} 
                      channel={ch} 
                      isActive={isActive}
                      onClick={() => handleChannelSelect(ch)}
                    />
                  );
                })}
              </div>
            </section>

            <section>
              <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3 flex items-center gap-2">
                <Activity className="w-3 h-3 text-emerald-500/50" />
                Live Surveillance Feeds
                <span className="h-[1px] flex-1 bg-slate-800/50" />
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {webcamFeeds.map(ch => {
                  let isActive = false;
                  if (targetStream === 1) isActive = activeChannel.id === ch.id;
                  else if (targetStream === 2) isActive = secondaryChannel.id === ch.id;
                  else isActive = surveillanceChannels[targetStream - 3]?.id === ch.id;

                  return (
                    <ChannelButton 
                      key={ch.id} 
                      channel={ch} 
                      isActive={isActive}
                      onClick={() => handleChannelSelect(ch)}
                    />
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* MULTI-STREAM GRID */}
      <div className={`grid ${isSplitScreen ? 'grid-cols-2' : 'grid-cols-1'} bg-black gap-[1px]`}>
        <div className="relative aspect-video group">
          <iframe
            src={`${activeChannel.youtubeUrl}${activeChannel.youtubeUrl.includes('?') ? '&' : '?'}autoplay=1&mute=1&rel=0&playsinline=1`}
            title={`Primary: ${activeChannel.title}`}
            className="w-full h-full grayscale"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 border border-slate-700/50 text-[8px] font-mono text-cyan-400 uppercase tracking-widest backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            PRI: {activeChannel.title}
          </div>
        </div>
 
        {isSplitScreen && (
          <div className="relative aspect-video group animate-in slide-in-from-right duration-500">
            <iframe
              src={`${secondaryChannel.youtubeUrl}${secondaryChannel.youtubeUrl.includes('?') ? '&' : '?'}autoplay=1&mute=1&rel=0&playsinline=1`}
              title={`Secondary: ${secondaryChannel.title}`}
              className="w-full h-full grayscale"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 border border-slate-700/50 text-[8px] font-mono text-emerald-400 uppercase tracking-widest backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              SEC: {secondaryChannel.title}
            </div>
          </div>
        )}
      </div>

      {/* STATUS BAR */}
      <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest leading-none">
              {activeChannel.title} {isSplitScreen && `| ${secondaryChannel.title}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
             <Globe className="w-3 h-3 text-slate-600" />
             <span className="text-[8px] font-mono text-slate-600 uppercase tracking-tighter">
               {isSplitScreen ? 'DUAL_TARGET_LOCKED' : 'SINGLE_SECTOR_MONITOR'}
             </span>
          </div>
        </div>
      </div>

      {/* 4-SPLIT SURVEILLANCE GRID (BOTTOM) */}
      <div className="grid grid-cols-2 bg-black border-t border-slate-800 gap-[1px]">
        {surveillanceChannels.map((cam, idx) => (
          <button 
            key={cam.id} 
            onClick={() => promoteToPrimary(cam)}
            className="relative aspect-video group overflow-hidden bg-slate-950 text-left border-none outline-none focus:ring-2 focus:ring-cyan-500/50 z-10"
          >
            <iframe
              src={`${cam.youtubeUrl}${cam.youtubeUrl.includes('?') ? '&' : '?'}autoplay=1&mute=1&controls=0&playsinline=1&modestbranding=1`}
              className="w-full h-full opacity-60 group-hover:opacity-100 transition-all duration-700 pointer-events-none"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <span className="text-[9px] font-black text-white/50 group-hover:text-white uppercase tracking-widest truncate transition-colors font-mono">
                    {cam.city} // {cam.country}
                </span>
            </div>
            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/80 border border-slate-800 text-[8px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
              SLOT_{idx + 1}
            </div>
          </button>
        ))}
      </div>

    </div>
  );
});

function ChannelButton({
  channel,
  isActive,
  onClick,
}: {
  channel: UnifiedFeed;
  isActive: boolean;
  onClick: () => void;
}) {
  const isNews = channel.type === 'news';
  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-1 p-2 rounded-sm text-left transition-all duration-300 border ${
        isActive
          ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
      }`}
    >
      <div className="flex items-center justify-between">
         <span className={`text-[9px] font-black uppercase tracking-widest truncate ${isActive ? 'text-cyan-400' : 'text-slate-300'}`}>
            {channel.title}
         </span>
         <span className={`text-[7px] px-1 border rounded-[2px] ${
           isActive ? 'border-cyan-500/50 text-cyan-500' : isNews ? 'border-slate-700 text-slate-500' : 'border-emerald-900/50 text-emerald-600/80'
         }`}>
           {isNews ? 'INTEL' : 'SURV'}
         </span>
      </div>
      <span className="text-[8px] font-mono text-slate-600 uppercase tracking-tighter truncate opacity-70">
        LOC: {channel.city}, {channel.country}
      </span>
    </button>
  );
}
