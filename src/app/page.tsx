'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PulseItem, Region } from '@/lib/types';
import { fetchPulseData } from '@/lib/api';
import WorldMap from '@/components/dashboard/WorldMap';
import LiveWire from '@/components/dashboard/LiveWire';
import { ItemCard } from '@/components/dashboard/ItemCard';
import NewsModal from '@/components/dashboard/NewsModal';
import CrisisToggle from '@/components/dashboard/CrisisToggle';
import { Loader2, Search, Radar, Zap, Globe } from 'lucide-react';

export default function Dashboard() {
  const [region, setRegion] = useState<Region>('Global');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(''); // Debouced state
  const [isCrisisMode, setIsCrisisMode] = useState(false);
  const [activeArticle, setActiveArticle] = useState<PulseItem | null>(null);

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data, isLoading } = useQuery({
    queryKey: ['pulseData', region, debouncedSearchQuery, isCrisisMode],
    queryFn: () => fetchPulseData({ region, query: debouncedSearchQuery, isCrisisMode }),
    refetchInterval: isCrisisMode ? 15000 : 60000,
  });

  const allArticles = data || [];

  // Dynamic Layout: Balance Main (2 cols) and Sidebar (1 col) heights.
  // Ratio: 2 items in Main (1 row) ~ 1 item in Sidebar (1 row).
  // Total Items = M + S. We want M/2 = S. => M = 2S.
  // Total = 2S + S = 3S. => S = Total / 3. M = 2/3 Total.
  // We ensure 'mainCount' is even to keep the grid balanced.

  const totalItems = allArticles.length;
  let mainCount = Math.floor(totalItems * (2 / 3));
  if (mainCount % 2 !== 0) mainCount -= 1; // Ensure even number for 2-col grid

  // Safe bounds check
  if (mainCount < 0) mainCount = 0;

  const mainStories = allArticles.slice(0, mainCount);
  const feedItems = allArticles.slice(mainCount);

  // Latest 10 for ticker
  const liveWireItems = allArticles.slice(0, 10);

  // FLASHPOINT THEME ENGINE
  const theme = isCrisisMode
    ? {
      // CRISIS: High Alert / Red / Kinetic
      bg: 'bg-red-950',
      text: 'text-red-50',
      accent: 'text-red-500',
      border: 'border-red-600',
      cardBg: 'bg-red-900/10',
      cardBorder: 'border-red-600/50',
      headerBg: 'bg-red-950/90',
      pulseColor: 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]',
      selection: 'selection:bg-red-600 selection:text-white',
      inputBg: 'bg-red-900/20',
      inputText: 'text-red-100',
      indicator: 'bg-red-500'
    }
    : {
      // DORMANT: Surveillance / Neutral / Orange / Amber
      bg: 'bg-neutral-950',
      text: 'text-neutral-200',
      accent: 'text-orange-500',
      border: 'border-neutral-800',
      cardBg: 'bg-neutral-900/40',
      cardBorder: 'border-neutral-800 hover:border-orange-500/50',
      headerBg: 'bg-neutral-950/80',
      pulseColor: 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
      selection: 'selection:bg-orange-500/30 selection:text-orange-100',
      inputBg: 'bg-neutral-900',
      inputText: 'text-neutral-100',
      indicator: 'bg-orange-500'
    };

  return (
    <main className={`min-h-screen ${theme.bg} ${theme.text} ${theme.selection} transition-colors duration-700 font-sans pb-20`}>

      <NewsModal article={activeArticle} onClose={() => setActiveArticle(null)} />

      {/* Header */}
      <header className={`border-b ${theme.border} ${theme.headerBg} backdrop-blur-md sticky top-0 z-50 transition-colors duration-700`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <Radar className={`w-8 h-8 ${theme.accent} ${isCrisisMode ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
              <div className={`absolute inset-0 ${theme.pulseColor} rounded-full opacity-20 animate-ping`} />
            </div>
            <div className="flex flex-col">
              <h1 className={`text-2xl font-black italic tracking-tighter leading-none ${isCrisisMode ? 'text-white' : 'text-white'}`}>
                GEO<span className={theme.accent}>POL</span>
              </h1>
              <span className={`text-[0.6rem] font-bold tracking-[0.3em] uppercase ${theme.text} opacity-70`}>
                Geopolitical Terminal
              </span>
            </div>
          </div>

          {/* Controls: Search + Crisis Toggle */}
          <div className="flex items-center gap-4">
            {/* Hide Search in Crisis Mode to force focus on the emergency */}
            {!isCrisisMode && (
              <div className="relative w-64 hidden md:block group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  suppressHydrationWarning={true}
                  placeholder="SEARCH DATABASE..."
                  className={`w-full ${theme.inputBg} border border-neutral-800 rounded-sm py-1.5 pl-10 pr-4 text-sm font-mono uppercase tracking-wide ${theme.inputText} focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/20 transition-all placeholder:text-neutral-700`}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {/* Crisis Toggle - The only switch that matters now */}
            <CrisisToggle
              isActive={isCrisisMode}
              onToggle={() => setIsCrisisMode(!isCrisisMode)}
            />
          </div>
        </div>

        {/* Reuse LiveWire - logic can also be updated to show Red bg only in crisis */}
        <div className={isCrisisMode ? "brightness-125 saturate-150 transition-all duration-500" : "transition-all duration-500"}>
          <LiveWire items={liveWireItems} onItemClick={setActiveArticle} />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Map Section */}
        <section className={`transition-opacity duration-500 ${isCrisisMode ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
          <WorldMap onRegionSelect={setRegion} selectedRegion={region} />
        </section>

        {isCrisisMode && (
          <div className="w-full bg-red-950/50 border border-red-500 rounded-sm p-3 text-center animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]" />
            <h2 className="text-red-500 font-black tracking-[0.3em] text-sm uppercase relative z-10 font-mono">
              ⚠️ PRIORITY ALERT: MILITARY ACTION DETECTED ⚠️
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Major Projects / Headlines */}
          <div className="lg:col-span-8 space-y-4">
            <h2 className={`text-sm font-bold uppercase tracking-widest ${theme.text} border-b ${theme.border} pb-2 flex items-center gap-2 font-mono`}>
              <Globe className="w-4 h-4 text-orange-500" />
              Headlines
            </h2>

            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className={`animate-spin ${theme.accent}`} /></div>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isCrisisMode ? '[&_div]:border-red-900/50 [&_div]:bg-red-950/30' : ''}`}>
                {mainStories.map(article => (
                  <ItemCard key={article.id} item={article} onPlay={(item) => setActiveArticle(item)} />
                ))}
                {mainStories.length === 0 && <p className="text-neutral-500 col-span-2 text-center py-10 font-mono text-xs uppercase">No intelligence reports found.</p>}
              </div>
            )}
          </div>

          {/* Sidebar Intelligence Feed */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              <h2 className={`text-sm font-bold uppercase tracking-widest ${theme.text} border-b ${theme.border} pb-2 flex items-center gap-2 font-mono`}>
                <Zap className="w-4 h-4 text-orange-500" />
                Intelligence Feed
              </h2>
              <div className={`space-y-4 ${isCrisisMode ? '[&_div]:border-red-900/50 [&_div]:bg-red-950/30' : ''}`}>
                {feedItems.map(item => (
                  <ItemCard key={item.id} item={item} onPlay={(i) => setActiveArticle(i)} />
                ))}
                {feedItems.length === 0 && !isLoading && <p className="text-neutral-600 text-center text-[10px] font-mono uppercase tracking-widest pt-4">No additional feed data.</p>}
              </div>
            </div>
          </div>

        </div>
      </div>

    </main>
  );
}
