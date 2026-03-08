'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
import PodcastPlayer from '@/components/shared/PodcastPlayer';
import { MobileLayout, TabletLayout, DesktopLayout } from '@/components/layout/DeviceLayouts';
import Footer from '@/components/layout/Footer';
import { Loader2, Search, Radar, Zap, Globe, Menu, ChevronDown, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function DashboardContent() {
  const searchParams = useSearchParams();

  const [region, setRegion] = useState<Region>('Global');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isCrisisMode, setIsCrisisMode] = useState(false);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
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
    // Pause all background refreshes while the user is reading an article — prevents
    // the deep-link modal from re-opening or flickering after the user closes it.
    refetchInterval: activeArticle ? false : (isCrisisMode ? 15000 : 60000),
    refetchOnWindowFocus: !activeArticle,
  });

  const allArticles = intelligenceData?.news || [];
  const mainStories = allArticles.slice(0, 36);
  const sidebarStories = allArticles.slice(36, 72);
  const liveWireItems = allArticles.slice(0, 20);
  const isGNewsLoading = isLoading;

  // ─── Event-Driven Deep Link Intelligence Matcher ───────────────────────────
  useEffect(() => {
    // Only proceed once if we haven't already hydrated the modal
    if (activeArticle) return; 

    const rawUrl   = searchParams.get('articleUrl');
    const rawTitle = searchParams.get('articleTitle');
    
    if (!rawUrl && !rawTitle) return;

    const url   = rawUrl ? decodeURIComponent(rawUrl) : '';
    const title = rawTitle ? decodeURIComponent(rawTitle) : '';

    // Step 1: Wait for live feed to populate before attempting a match
    const liveFeedLoaded = allArticles && allArticles.length > 0;
    
    // Step 2: Fuzzy Text Matching Algorithm
    const findLiveMatch = (): Article | undefined => {
      if (!liveFeedLoaded) return undefined;
      
      // Strict URL Match (fastest, most reliable)
      if (url) {
        const strictMatch = allArticles.find(a => a.url === url);
        if (strictMatch) return strictMatch;
      }

      // Fuzzy Title Match (handles slight API string variations)
      if (title) {
        const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/gi, '');
        const targetWords = normalize(title).split(/\s+/).filter(w => w.length > 3); // Ignore small words
        
        if (targetWords.length === 0) return undefined;

        for (const candidate of allArticles) {
          const candidateWords = normalize(candidate.title).split(/\s+/);
          let matchCount = 0;
          
          targetWords.forEach(w => {
            if (candidateWords.includes(w)) matchCount++;
          });

          // 80% keyword overlap threshold
          const overlapPercentage = (matchCount / targetWords.length) * 100;
          if (overlapPercentage >= 80) {
            return candidate; // Found a high-confidence match!
          }
        }
      }
      return undefined;
    };

    const liveMatch = findLiveMatch();

    if (liveMatch) {
      // 🎯 SUCCESS: Found the rich live data item in the feed!
      setActiveArticle(liveMatch);
    } else if (liveFeedLoaded || isLoading === false) {
      // 🌫️ MISS: The API finished loading, but the article rotated out of the feed.
      // Generate the synthetic phantom fallback from the URL parameters.
      const rawSrc  = searchParams.get('articleSource');
      const rawDesc = searchParams.get('articleDescription');
      
      const syntheticArticle: Article = {
        id: `deeplink-${Date.now()}`,
        title: title || 'Deep Link Content',
        description: rawDesc ? decodeURIComponent(rawDesc) : '',
        url: url,
        source: rawSrc ? decodeURIComponent(rawSrc) : 'GeoPolitical Pulse',
        domain: (() => { try { return new URL(url).hostname.replace('www.',''); } catch { return 'unknown'; } })(),
        publishedAt: new Date().toISOString(),
        tags: ['NEWSLETTER'],
        biasMeta: {
          sourceReliability: 'unknown',
          ownershipType: 'unknown',
          countryOfOrigin: 'unknown',
          geopoliticalAlignment: 'unknown',
          sensationalismScore: 0,
          emotionallyLoadedLanguage: false,
        },
      };
      
      setActiveArticle(syntheticArticle);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, allArticles, isLoading]);

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
      headerBg: 'bg-red-950', // Solid Red-950
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
      headerBg: 'bg-black', // Solid Black
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
    <div className="max-w-[100vw] overflow-x-hidden lg:max-w-none lg:overflow-x-visible">
      <main className={`min-h-screen lg:min-w-[1280px] ${theme.bg} ${theme.text} ${theme.selection} transition-colors duration-700 font-sans pb-20`}>

      <NewsModal article={activeArticle} onClose={() => setActiveArticle(null)} />

      {/* Header */}
      <header className={`border-b ${theme.border} ${theme.headerBg} sticky top-0 z-50 transition-colors duration-700 lg:min-w-[1280px]`}>
        <div className="w-full mx-auto px-4 lg:px-8 xl:px-12 h-16 flex items-center justify-between relative">
          
          {/* Mobile Center Header Layout */}
          <div className="lg:hidden flex items-center justify-between w-full h-full">
            <div className="flex-1 flex justify-start">
               <HamburgerMenu
                  categories={['general', 'world', 'nation', 'business', 'technology', 'entertainment', 'sports', 'science', 'health']}
                  selectedCategory={category}
                  onSelectCategory={setCategory}
               />
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <div className="relative shrink-0">
                  <Radar className={`w-5 h-5 ${theme.accent} ${isCrisisMode ? 'animate-spin' : ''}`} />
                  <div className={`absolute inset-0 ${theme.pulseColor} rounded-full opacity-20 animate-ping`} />
                </div>
                <h1 className={`text-xl font-black italic tracking-tighter leading-none text-white`}>
                  GEO<span className={theme.accent}>POL</span>
                </h1>
              </div>
            </div>

            <div className="flex-1 flex justify-end items-center gap-1">
               <WeatherWidget />
               <CrisisToggle
                 isActive={isCrisisMode}
                 onToggle={() => setIsCrisisMode(!isCrisisMode)}
               />
            </div>
          </div>

          {/* Desktop Left Side: Logo, Search, Categories */}
          <div className="hidden lg:flex items-center gap-4 group flex-1">
            <div className="relative shrink-0 hidden sm:block">
              <Radar className={`w-8 h-8 ${theme.accent} ${isCrisisMode ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
              <div className={`absolute inset-0 ${theme.pulseColor} rounded-full opacity-20 animate-ping`} />
            </div>
            <div className="flex flex-col shrink-0 mr-4">
              <h1 className={`text-2xl font-black italic tracking-tighter leading-none text-white`}>
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

          {/* Desktop Right Side: Weather & Crisis Toggle */}
          <div className="hidden lg:flex items-center justify-end gap-2 md:gap-4 shrink-0">
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

        {/* Audio Overview Podcast Section */}
        <section className="mt-6">
          <PodcastPlayer type="overview" data={mainStories.slice(0, 5)} />
        </section>

        {/* Device Based Layout Blocks */}
        <DesktopLayout>
          {(() => {
            const heroArt = allArticles[0];
            const leftCols = allArticles.slice(1, 5);
            const centerUnderHero = allArticles.slice(5, 12);
            const rightCols = allArticles.slice(12, 16);
            const remainder = allArticles.slice(16, 60);

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
            const leftCols = allArticles.slice(1, 5);
            const centerUnderHero = allArticles.slice(5, 12);
            const rightCols = allArticles.slice(12, 16);
            const remainder = allArticles.slice(16, 40); // smaller set for tablet

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
            const secondary = allArticles.slice(1, 10);
            const remainder = allArticles.slice(10); // Show all remaining items on mobile for higher density

            return (
              <div className="flex flex-col space-y-8">
                {/* Mobile Region Selector */}
                <div className="flex overflow-x-auto pb-2 gap-2 custom-scrollbar snap-x no-scrollbar">
                  {['Global', 'US', 'Europe', 'Asia', 'Middle East', 'Africa', 'Americas'].map((reg) => (
                    <button
                      key={reg}
                      onClick={() => setRegion(reg as Region)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold uppercase tracking-widest transition-all snap-start ${
                        region === reg 
                        ? 'bg-orange-600 text-black shadow-[0_0_15px_rgba(234,88,12,0.4)]' 
                        : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                      }`}
                    >
                      {reg}
                    </button>
                  ))}
                </div>

                {/* Hero Block Stacking */}
                {heroArt && (
                  <div className="flex flex-col space-y-4">
                    <div className="w-full text-center px-2 py-2">
                      <a 
                        href={heroArt.url} 
                        onClick={(e) => { e.preventDefault(); setActiveArticle(heroArt); }}
                        className="block active:opacity-70 cursor-pointer"
                      >
                        <h1 className={`text-3xl font-bold ${theme.text} leading-tight tracking-tight font-serif text-balance`}>
                          {heroArt.title}
                        </h1>
                      </a>
                    </div>
                    <ItemCard item={heroArt} onPlay={setActiveArticle} variant="hero" hideTitle={true} />
                  </div>
                )}
                
                {/* Live Feed as per Mockup */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <span className="bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-sm flex items-center gap-2 tracking-tight">
                          <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]" /> LIVE
                        </span>
                        <div className="h-[1px] bg-neutral-800 flex-grow" />
                    </div>
                    
                    <div className="flex flex-col flex-grow divide-y divide-neutral-800/50">
                      {secondary.slice(0, 15).map(art => (
                        <div key={art.id} className="py-5 active:bg-neutral-900/40 transition-all cursor-pointer" onClick={() => setActiveArticle(art)}>
                           <div className="flex gap-2 mb-2.5">
                              <span className="text-[10px] font-black uppercase text-orange-600 border border-orange-600/30 px-1.5 py-0.5 rounded-sm bg-orange-600/5 tracking-tighter">NEWS</span>
                              <span className="text-[10px] font-bold uppercase text-neutral-500 border border-neutral-800 px-1.5 py-0.5 rounded-sm tracking-tighter">GLOBAL</span>
                           </div>
                           <h3 className="text-[19px] font-bold text-neutral-100 leading-[1.3] font-sans tracking-tight mb-2">
                              {art.title}
                           </h3>
                           <div className="flex items-center gap-2 text-[10px] text-neutral-600 font-mono">
                              <Clock className="w-3 h-3" />
                              {new Date(art.publishedAt).toLocaleString(undefined, {
                                month: 'numeric',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }).replace(',', ' // ')}
                           </div>
                        </div>
                      ))}
                    </div>
                </div>

                <div className={`w-full h-[1px] ${theme.border} my-6 bg-neutral-800/60`} />
                
                {/* Remainder Feed */}
                <div className={`flex flex-col space-y-6 ${isCrisisMode ? '[&_div]:border-red-900/50 [&_div]:bg-red-950/30' : ''}`}>
                   <h2 className={`text-sm font-bold uppercase tracking-widest ${theme.text} border-b ${theme.border} pb-4 mb-2 flex items-center gap-2 font-mono`}>
                      <Radar className="w-5 h-5 text-orange-500" />
                      Extended Feed
                   </h2>
                  {remainder.map(art => (
                    <ItemCard key={art.id} item={art} onPlay={setActiveArticle} variant="default" />
                  ))}
                </div>
              </div>
            );
          })()}
        </MobileLayout>

        <Footer />
      </div>

      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
