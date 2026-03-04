'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Article, Region } from '@/lib/types';
import { getAggregatedIntelligence } from '@/lib/api';
import WorldMap from '@/components/dashboard/WorldMap';
import LiveWire from '@/components/dashboard/LiveWire';
import { ItemCard } from '@/components/dashboard/ItemCard';
import NewsModal from '@/components/dashboard/NewsModal';
import CrisisToggle from '@/components/dashboard/CrisisToggle';
import HamburgerMenu from '@/components/dashboard/HamburgerMenu';
import CategoryNav from '@/components/dashboard/CategoryNav';
import WeatherWidget from '@/components/dashboard/WeatherWidget';
import { MobileLayout, TabletLayout, DesktopLayout } from '@/components/layout/DeviceLayouts';
import { Loader2, Search, Radar, Zap, Globe, Menu, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [region, setRegion] = useState<Region>('Global');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isCrisisMode, setIsCrisisMode] = useState(false);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  // New States
  // const [category, setCategory] = useState('general'); // Keep category? Yes.
  const [category, setCategory] = useState('general');

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Unified Intelligence Feed
  const { data: intelligenceData, isLoading } = useQuery({
    queryKey: ['intelligenceFeed', region, debouncedSearchQuery, isCrisisMode, category],
    queryFn: () => getAggregatedIntelligence({ region, query: debouncedSearchQuery, isCrisisMode, category }),
    refetchInterval: isCrisisMode ? 15000 : 60000,
  });

  // The unified API returns deduplicated, bias-enriched items. 
  // We split them to fit the dashboard's Desktop 10-col grid (Headlines vs Ground News).
  const allArticles = intelligenceData?.news || [];
  
  const mainStories = allArticles.slice(0, 24);
  const sidebarStories = allArticles.slice(24, 48);

  // Latest 10 for ticker
  const liveWireItems = allArticles.slice(0, 10);

  // To preserve UI load states for Sidebar grid
  const isGNewsLoading = isLoading;

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
      headerBg: 'bg-black/60',
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
      headerBg: 'bg-black/60',
      pulseColor: 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
      selection: 'selection:bg-orange-500/30 selection:text-orange-100',
      inputBg: 'bg-neutral-900',
      inputText: 'text-neutral-100',
      indicator: 'bg-orange-500'
    };

  const renderHeadlines = () => (
    <>
      <h2 className={`text-sm font-bold uppercase tracking-widest ${theme.text} border-b ${theme.border} pb-2 flex items-center gap-2 font-mono`}>
        <Globe className="w-4 h-4 text-orange-500" />
        Headlines
      </h2>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className={`animate-spin ${theme.accent}`} /></div>
      ) : (
        <>
          <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 ${isCrisisMode ? '[&_div]:border-red-900/50 [&_div]:bg-red-950/30' : ''}`}>
            <AnimatePresence mode='popLayout'>
              {mainStories.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ItemCard item={article} onPlay={(item) => setActiveArticle(item)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {mainStories.length === 0 && <p className="text-neutral-500 text-center py-10 font-mono text-xs uppercase">No intelligence reports found.</p>}
        </>
      )}
    </>
  );

  const renderGroundNews = () => (
    <div className="sticky top-24 space-y-6">
      <h2 className={`text-sm font-bold uppercase tracking-widest ${theme.text} border-b ${theme.border} pb-2 flex items-center gap-2 font-mono`}>
        <Zap className="w-4 h-4 text-orange-500" />
        GROUND NEWS
      </h2>

      <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 ${isCrisisMode ? '[&_div]:border-red-900/50 [&_div]:bg-red-950/30' : ''}`}>
        {isGNewsLoading ? (
          <div className="col-span-2 flex justify-center py-10"><Loader2 className={`animate-spin ${theme.accent}`} /></div>
        ) : (
          <AnimatePresence mode='popLayout'>
            {sidebarStories.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.05 }}
              >
                <ItemCard item={item} onPlay={(i) => setActiveArticle(i)} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {sidebarStories.length === 0 && !isGNewsLoading && <p className="col-span-2 text-neutral-600 text-center text-[10px] font-mono uppercase tracking-widest pt-4">No additional feed data.</p>}
      </div>
    </div>
  );

  return (
    <main className={`min-h-screen ${theme.bg} ${theme.text} ${theme.selection} transition-colors duration-700 font-sans pb-20`}>

      <NewsModal article={activeArticle} onClose={() => setActiveArticle(null)} />

      {/* Header */}
      <header className={`border-b ${theme.border} ${theme.headerBg} backdrop-blur-[20px] sticky top-0 z-50 transition-colors duration-700`}>
        <div className="w-full mx-auto px-4 lg:px-8 xl:px-12 h-16 flex items-center justify-between">
          
          {/* Left Side: Logo, Search, Categories */}
          <div className="flex items-center gap-4 group flex-1">
            <div className="lg:hidden shrink-0">
                <HamburgerMenu
                  categories={['general', 'world', 'nation', 'business', 'technology', 'entertainment', 'sports', 'science', 'health']}
                  selectedCategory={category}
                  onSelectCategory={setCategory}
                />
            </div>
            <div className="relative shrink-0 hidden sm:block">
              <Radar className={`w-8 h-8 ${theme.accent} ${isCrisisMode ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
              <div className={`absolute inset-0 ${theme.pulseColor} rounded-full opacity-20 animate-ping`} />
            </div>
            <div className="flex flex-col shrink-0 mr-4">
              <h1 className={`text-2xl font-black italic tracking-tighter leading-none ${isCrisisMode ? 'text-white' : 'text-white'}`}>
                GEO<span className={theme.accent}>POL</span>
              </h1>
              <span className={`text-[0.6rem] font-bold tracking-[0.3em] uppercase ${theme.text} opacity-70 whitespace-nowrap`}>
                Geopolitical Terminal
              </span>
            </div>

            {/* Search Input - Desktop Left */}
            {!isCrisisMode && (
              <div className="relative w-64 hidden xl:block group mr-4">
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

            <CategoryNav selectedCategory={category} onSelectCategory={setCategory} />
          </div>

          {/* Right Side: Weather & Crisis Toggle */}
          <div className="flex items-center justify-end gap-2 md:gap-4 shrink-0">
            <WeatherWidget />

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
      <div className="w-full mx-auto px-4 lg:px-8 xl:px-12 py-6 space-y-6">

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

        {/* Device Based Layout Blocks */}
        <DesktopLayout>
          {(() => {
            const heroArt = allArticles[0];
            const leftCols = allArticles.slice(1, 4);
            const centerUnderHero = allArticles.slice(4, 9);
            const rightCols = allArticles.slice(9, 13);
            const remainder = allArticles.slice(13, 48);

            return (
              <div className="w-full flex flex-col space-y-8">
                {/* Hero Headline */}
                {heroArt && (
                  <div className="w-full text-center max-w-6xl mx-auto my-6 px-4">
                    <a 
                      href={heroArt.url} 
                      onClick={(e) => { e.preventDefault(); setActiveArticle(heroArt); }}
                      className="block group cursor-pointer"
                    >
                      <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold ${theme.text} group-hover:text-orange-500 transition-colors leading-[1.15] tracking-tight font-serif text-balance`}>
                        {heroArt.title}
                      </h1>
                    </a>
                  </div>
                )}

                {/* 3 Column Newspaper Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                  {/* Left Column (25%) */}
                  <div className="lg:col-span-3 flex flex-col space-y-6">
                    {leftCols.map(art => (
                      <ItemCard key={art.id} item={art} onPlay={setActiveArticle} variant="compact" />
                    ))}
                  </div>

                  {/* Center Column (50%) */}
                  <div className="lg:col-span-6 flex flex-col space-y-4">
                    {heroArt && (
                      <ItemCard item={heroArt} onPlay={setActiveArticle} variant="hero" hideTitle={true} />
                    )}
                    {/* Live updates / subtext styling */}
                    <div className="flex items-center gap-2 mt-4 px-2">
                       <span className="bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm animate-pulse tracking-widest flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-white opacity-90 inline-block" /> Live
                       </span>
                       <div className="h-[2px] bg-neutral-800 flex-grow rounded-full" />
                    </div>
                    {/* Related / Center Feed */}
                    <div className="flex flex-col space-y-1">
                      {centerUnderHero.map(art => (
                        <ItemCard key={art.id} item={art} onPlay={setActiveArticle} variant="text-only" />
                      ))}
                    </div>
                  </div>

                  {/* Right Column (25%) */}
                  <div className="lg:col-span-3 flex flex-col space-y-6">
                    {rightCols.map(art => (
                      <ItemCard key={art.id} item={art} onPlay={setActiveArticle} variant="compact" />
                    ))}
                  </div>
                </div>

                {/* Separator */}
                <div className={`w-full h-[1px] ${theme.border} my-12 bg-neutral-800/60`} />
                
                {/* Bottom Main Grid */}
                <div>
                   <h2 className={`text-sm font-bold uppercase tracking-widest ${theme.text} border-b ${theme.border} pb-4 mb-6 flex items-center gap-2 font-mono`}>
                     <Radar className="w-5 h-5 text-orange-500" />
                     Expanded Intelligence
                   </h2>
                   
                   <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 ${isCrisisMode ? '[&_div]:border-red-900/50 [&_div]:bg-red-950/30' : ''}`}>
                     <AnimatePresence mode='popLayout'>
                       {remainder.map((article, i) => (
                         <motion.div
                           key={article.id}
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: i * 0.05 }}
                         >
                           <ItemCard item={article} onPlay={setActiveArticle} variant="default" />
                         </motion.div>
                       ))}
                     </AnimatePresence>
                   </div>
                </div>

              </div>
            );
          })()}
        </DesktopLayout>

        <TabletLayout>
          {(() => {
            const heroArt = allArticles[0];
            const leftCols = allArticles.slice(1, 4);
            const centerUnderHero = allArticles.slice(4, 9);
            const rightCols = allArticles.slice(9, 13);
            const remainder = allArticles.slice(13, 24); // smaller set for tablet

            return (
              <div className="w-full flex flex-col space-y-8">
                {/* Hero Headline */}
                {heroArt && (
                  <div className="w-full text-center max-w-4xl mx-auto my-4 px-2">
                    <a 
                      href={heroArt.url} 
                      onClick={(e) => { e.preventDefault(); setActiveArticle(heroArt); }}
                      className="block group cursor-pointer"
                    >
                      <h1 className={`text-4xl font-bold ${theme.text} group-hover:text-orange-500 transition-colors leading-[1.15] tracking-tight font-serif`}>
                        {heroArt.title}
                      </h1>
                    </a>
                  </div>
                )}

                {/* 2 Column Flow for Tablet */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Left: Hero Image + Subtext */}
                  <div className="flex flex-col space-y-4">
                    {heroArt && (
                      <ItemCard item={heroArt} onPlay={setActiveArticle} variant="hero" hideTitle={true} />
                    )}
                    <div className="flex items-center gap-2 mt-2 px-2">
                       <span className="bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm animate-pulse tracking-widest flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-white opacity-90 inline-block" /> Live Data
                       </span>
                       <div className="h-[2px] bg-neutral-800 flex-grow rounded-full" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      {centerUnderHero.map(art => (
                        <ItemCard key={art.id} item={art} onPlay={setActiveArticle} variant="text-only" />
                      ))}
                    </div>
                  </div>

                  {/* Right: Compact Cards */}
                  <div className="flex flex-col space-y-6">
                    {[...leftCols, ...rightCols].map(art => (
                      <ItemCard key={art.id} item={art} onPlay={setActiveArticle} variant="compact" />
                    ))}
                  </div>
                </div>

                {/* Bottom Expanded Feed (2 cols) */}
                <div className={`w-full h-[1px] ${theme.border} my-8 bg-neutral-800/60`} />
                <h2 className={`text-sm font-bold uppercase tracking-widest ${theme.text} border-b ${theme.border} pb-2 mb-4 flex items-center gap-2 font-mono`}>
                  <Radar className="w-4 h-4 text-orange-500" />
                  Expanded Feed
                </h2>
                <div className={`grid grid-cols-2 gap-4 ${isCrisisMode ? '[&_div]:border-red-900/50 [&_div]:bg-red-950/30' : ''}`}>
                  {remainder.map(art => (
                    <ItemCard key={art.id} item={art} onPlay={setActiveArticle} variant="default" />
                  ))}
                </div>
              </div>
            );
          })()}
        </TabletLayout>

        <MobileLayout>
          {(() => {
            const heroArt = allArticles[0];
            const secondary = allArticles.slice(1, 5);
            const remainder = allArticles.slice(5, 12); // smaller set for mobile

            return (
              <div className="flex flex-col space-y-6">
                {/* Hero Block Stacking */}
                {heroArt && (
                  <div className="flex flex-col space-y-4">
                    <div className="w-full text-center px-2 py-2">
                      <a 
                        href={heroArt.url} 
                        onClick={(e) => { e.preventDefault(); setActiveArticle(heroArt); }}
                        className="block active:opacity-70 cursor-pointer"
                      >
                        <h1 className={`text-2xl font-bold ${theme.text} leading-tight tracking-tight font-serif`}>
                          {heroArt.title}
                        </h1>
                      </a>
                    </div>
                    <ItemCard item={heroArt} onPlay={setActiveArticle} variant="hero" hideTitle={true} />
                  </div>
                )}
                
                {/* Secondary Compact */}
                <div className="grid grid-cols-1 gap-4">
                   <div className="flex items-center gap-2 mb-2 px-1">
                       <span className="bg-red-600 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded-sm animate-pulse tracking-widest flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-white opacity-90 inline-block" /> Live
                       </span>
                       <div className="h-[2px] bg-neutral-800 flex-grow rounded-full" />
                   </div>
                  {secondary.map(art => (
                    <ItemCard key={art.id} item={art} onPlay={setActiveArticle} variant="compact" />
                  ))}
                </div>

                <div className={`w-full h-[1px] ${theme.border} my-4 bg-neutral-800/60`} />
                
                {/* Remainder Feed */}
                <div className={`grid grid-cols-1 gap-4 ${isCrisisMode ? '[&_div]:border-red-900/50 [&_div]:bg-red-950/30' : ''}`}>
                  {remainder.map(art => (
                    <ItemCard key={art.id} item={art} onPlay={setActiveArticle} variant="default" />
                  ))}
                </div>
              </div>
            );
          })()}
        </MobileLayout>

      </div>

    </main>
  );
}
