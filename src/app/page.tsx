'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Article, Region } from '@/lib/types';
import { getAggregatedIntelligence } from '@/lib/api';
import dynamic from 'next/dynamic';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';

// ─── DYNAMIC IMPORTS (BUFFER ENGINE) ──────────────────────────────────────────
const StrategicTheaterMap = dynamic(() => import('@/components/dashboard/StrategicTheaterMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-slate-900 flex items-center justify-center font-mono text-cyan-500 border border-cyan-900/40">
      <Radar className="w-8 h-8 mr-4 animate-spin" />
      INITIALIZING SATELLITE LINK...
    </div>
  )
});

import LiveWire from '@/components/dashboard/LiveWire';
import { ItemCard } from '@/components/dashboard/ItemCard';
import { ItemCardSkeleton } from '@/components/dashboard/ItemCardSkeleton';
import NewsModal from '@/components/dashboard/NewsModal';
import CrisisToggle from '@/components/dashboard/CrisisToggle';
import HamburgerMenu from '@/components/dashboard/HamburgerMenu';
import CategoryNav from '@/components/dashboard/CategoryNav';
import { processGoodNews } from '@/lib/goodNewsEngine';
import LiveNewsViewer from '@/components/dashboard/LiveNewsViewer';
import AviationStatusCard from '@/components/dashboard/AviationStatusCard';
import WeatherInsightsSlideshow from '@/components/dashboard/WeatherInsightsSlideshow';
import PaywallModal from '@/components/dashboard/PaywallModal';
import CommandCenterLayout from '@/components/layout/CommandCenterLayout';
import Footer from '@/components/layout/Footer';
import AdminCamModal from '@/components/dashboard/AdminCamModal';
import { useWebcams } from '@/hooks/useWebcams';
import { Search, Radar, Globe, Clock, Zap, Plus, Activity } from 'lucide-react';
import GlobalCamGrid from '@/components/dashboard/GlobalCamGrid';
import AIInsightsBrief from '@/components/dashboard/AIInsightsBrief';
import StrategicRiskGauge from '@/components/dashboard/StrategicRiskGauge';
import StrategicPosture from '@/components/dashboard/StrategicPosture';
import AIForecasts from '@/components/dashboard/AIForecasts';
import CountryInstability from '@/components/dashboard/CountryInstability';
import CyberThreatRadar from '@/components/dashboard/CyberThreatRadar';
import IntelFeed from '@/components/dashboard/IntelFeed';
import LiveInsightModal from '@/components/dashboard/LiveInsightModal';
import { getGeopoliticalIntelligence, CountryIntelligence } from '@/lib/intelligence-engine';

const TacticalWidgetSkeleton = () => (
  <div className="h-32 bg-neutral-900/40 border border-neutral-800/50 rounded-sm animate-pulse" />
);

function DashboardContent() {
  const searchParams = useSearchParams();

  const [region, setRegion] = useState<Region>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geopol-region');
      return (saved as Region) || 'Global';
    }
    return 'Global';
  });

  useEffect(() => {
    localStorage.setItem('geopol-region', region);
  }, [region]);
  const [newsQuery, setNewsQuery] = useState('');
  const [isCrisisMode, setIsCrisisMode] = useState(false);
  const [isGoodNewsMode, setIsGoodNewsMode] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '48h' | '7d' | 'all'>('all');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [isActiveLiveInsight, setIsActiveLiveInsight] = useState(false);
  const [category, setCategory] = useState('general');
  const [isPremium, setIsPremium] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedCountryIntel, setSelectedCountryIntel] = useState<CountryIntelligence | null>(null);
  const { addCam } = useWebcams();

  // Unified Intelligence Feed
  const { data: intelligenceData, isLoading } = useQuery({
    queryKey: ['intelligenceFeed', region, newsQuery, isCrisisMode, category, timeRange],
    queryFn: () => getAggregatedIntelligence({ region, query: newsQuery, isCrisisMode, category, timeRange }),
    // Pause all background refreshes while the user is reading an article
    refetchInterval: activeArticle ? false : (isCrisisMode ? 15000 : 60000),
    refetchOnWindowFocus: !activeArticle,
  });

  const [tacticalData, setTacticalData] = useState<any>(null);
  
  // Layout Slot Configuration for Drag & Drop
  const [slotConfig, setSlotConfig] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geopol-slots');
      return saved ? JSON.parse(saved) : { LB: 'intel', RT: 'video', RB: 'metrics' };
    }
    return { LB: 'intel', RT: 'video', RB: 'metrics' };
  });

  const swapSlots = (from: string, to: string) => {
    if (from === to) return;
    setSlotConfig(prev => {
      const next = { ...prev };
      const fromComponent = next[from];
      const toComponent = next[to];
      next[from] = toComponent;
      next[to] = fromComponent;
      localStorage.setItem('geopol-slots', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const fetchTacticalGrid = async () => {
      try {
        const res = await fetch('/api/geo-cache');
        const data = await res.json();
        if (data && data.status) {
          setTacticalData(data);
        }
      } catch (e) {
        console.error('Tactical Grid Fetch Error:', e);
      }
    };
    
    fetchTacticalGrid();
    const interval = setInterval(fetchTacticalGrid, 15 * 60 * 1000); // 15 mins
    return () => clearInterval(interval);
  }, []);

  const rawArticles = intelligenceData?.news || [];
  const seenTitles = new Set<string>();
  const allArticles = rawArticles.filter(a => {
    // Aggressive normalization: lowercase, remove special characters, trim
    const normalizedTitle = (a.title || '')
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .trim();
    
    // Also check for very similar prefixes (first 50 chars) to catch minor trailing changes
    const titlePrefix = normalizedTitle.substring(0, 50);
    
    if (seenTitles.has(normalizedTitle) || (normalizedTitle.length > 50 && seenTitles.has(titlePrefix))) {
      return false;
    }
    
    seenTitles.add(normalizedTitle);
    if (normalizedTitle.length > 50) seenTitles.add(titlePrefix);
    
    return true;
  });

  const finalArticles = isGoodNewsMode ? processGoodNews(allArticles) : allArticles;

  const strategicArticles = finalArticles.slice(0, 40);
  const liveIntelArticles = finalArticles.slice(40);
  const liveWireItems = finalArticles.slice(0, 20);

  // ─── Event-Driven Deep Link Intelligence Matcher ───────────────────────────
  useEffect(() => {
    if (activeArticle) return; 

    const rawUrl   = searchParams.get('articleUrl');
    const rawTitle = searchParams.get('articleTitle');
    
    if (!rawUrl && !rawTitle) return;

    const url   = rawUrl ? decodeURIComponent(rawUrl) : '';
    const title = rawTitle ? decodeURIComponent(rawTitle) : '';

    const liveFeedLoaded = allArticles && allArticles.length > 0;
    
    const findLiveMatch = (): Article | undefined => {
      if (!liveFeedLoaded) return undefined;
      
      if (url) {
        const strictMatch = allArticles.find(a => a.url === url);
        if (strictMatch) return strictMatch;
      }

      if (title) {
        const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/gi, '');
        const targetWords = normalize(title).split(/\s+/).filter(w => w.length > 3);
        
        if (targetWords.length === 0) return undefined;

        for (const candidate of allArticles) {
          const candidateWords = normalize(candidate.title).split(/\s+/);
          let matchCount = 0;
          
          targetWords.forEach(w => {
            if (candidateWords.includes(w)) matchCount++;
          });

          const overlapPercentage = (matchCount / targetWords.length) * 100;
          if (overlapPercentage >= 80) {
            return candidate;
          }
        }
      }
      return undefined;
    };

    const liveMatch = findLiveMatch();

    if (liveMatch) {
      setActiveArticle(liveMatch);
    } else if (liveFeedLoaded || isLoading === false) {
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
      bg: 'bg-red-950',
      text: 'text-red-50',
      accent: 'text-red-500',
      border: 'border-red-600',
      cardBg: 'bg-red-900/10',
      cardBorder: 'border-red-600/50',
      headerBg: 'bg-red-950',
      pulseColor: 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]',
      selection: 'selection:bg-red-600 selection:text-white',
      inputBg: 'bg-red-900/20',
      inputText: 'text-red-100',
      indicator: 'bg-red-500'
    }
    : {
      bg: 'bg-neutral-950',
      text: 'text-neutral-200',
      accent: 'text-orange-500',
      border: 'border-neutral-800',
      cardBg: 'bg-neutral-900/40',
      cardBorder: 'border-neutral-800 hover:border-orange-500/50',
      headerBg: 'bg-black',
      pulseColor: 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
      selection: 'selection:bg-orange-500/30 selection:text-orange-100',
      inputBg: 'bg-neutral-900',
      inputText: 'text-neutral-100',
      indicator: 'bg-orange-500'
    };

  // ─── Compute header height for layout offset ────────────────────────
  // Header is h-16 (4rem) + LiveWire bar (~28px) = ~92px
  const headerOffset = '92px';

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col overflow-x-hidden lg:overflow-hidden">
      <main className={`flex flex-col flex-1 lg:min-h-0 ${theme.bg} ${theme.text} ${theme.selection} transition-colors duration-700 font-sans`}>

      <NewsModal 
        article={activeArticle} 
        onClose={() => setActiveArticle(null)} 
        isLiveInsight={isActiveLiveInsight}
        isCrisis={isCrisisMode}
      />

      {/* Header */}
      <header className={`border-b ${theme.border} ${theme.headerBg} sticky top-0 z-50 transition-colors duration-700`}>
        <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between relative">
          
          {/* Mobile Header Layout (0px to 1280px) */}
          <div className="xl:hidden grid grid-cols-3 items-center w-full h-full relative">
            {/* Left: Hamburger */}
            <div className="flex justify-start">
               <HamburgerMenu
                  categories={['general', 'world', 'surveillance', 'nation', 'business', 'technology', 'entertainment', 'sports', 'science', 'health']}
                  selectedCategory={category}
                  onSelectCategory={setCategory}
               />
            </div>

            {/* Center: Logo */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="relative shrink-0">
                  <Radar className={`w-5 h-5 sm:w-6 sm:h-6 ${theme.accent} ${isCrisisMode ? 'animate-spin' : ''}`} />
                  <div className={`absolute inset-0 ${theme.pulseColor} rounded-full opacity-20 animate-ping`} />
                </div>
                <h1 className={`text-xl sm:text-2xl font-black italic tracking-tighter leading-none text-white`}>
                  GEO<span className={theme.accent}>POL</span>
                </h1>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex justify-end items-center gap-1 sm:gap-2">
               <div className="hidden xs:block">
                  <WeatherInsightsSlideshow />
               </div>
               <CrisisToggle 
                isCrisis={isCrisisMode} 
                isGoodNews={isGoodNewsMode}
                onCrisisToggle={() => {
                  setIsCrisisMode(!isCrisisMode);
                  if (!isCrisisMode) setIsGoodNewsMode(false);
                }}
                onGoodNewsToggle={() => {
                  setIsGoodNewsMode(!isGoodNewsMode);
                  if (!isGoodNewsMode) setIsCrisisMode(false);
                }}
              />
            </div>
          </div>

          {/* Desktop Left Side: Logo, Search, Categories (Only on 1280px+) */}
          <div className="hidden xl:flex items-center gap-4 group flex-1">
            <div className="relative shrink-0">
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
                  onChange={(e) => setNewsQuery(e.target.value)} // Updated to setNewsQuery
                />
              </div>
            )}

            <CategoryNav selectedCategory={category} onSelectCategory={setCategory} />
          </div>

          {/* Desktop Right Side: Weather & Crisis Toggle */}
          <div className="hidden xl:flex items-center justify-end gap-2 md:gap-4 shrink-0">
            <WeatherInsightsSlideshow />

            <CrisisToggle 
                isCrisis={isCrisisMode} 
                isGoodNews={isGoodNewsMode}
                onCrisisToggle={() => {
                  setIsCrisisMode(!isCrisisMode);
                  if (!isCrisisMode) setIsGoodNewsMode(false);
                }}
                onGoodNewsToggle={() => {
                  setIsGoodNewsMode(!isGoodNewsMode);
                  if (!isGoodNewsMode) setIsCrisisMode(false);
                }}
            />
          </div>
        </div>

        {/* LiveWire Ticker */}
        <div className={isCrisisMode ? "brightness-125 saturate-150 transition-all duration-500" : "transition-all duration-500"}>
          <LiveWire items={liveWireItems} onItemClick={setActiveArticle} />
        </div>
      </header>

      {/* ═══ COMMAND CENTER CONTENT ═══ */}
      {category === 'surveillance' ? (
        <div className="flex-1 lg:min-h-0 lg:overflow-hidden relative">
          <GlobalCamGrid onOverrideClick={() => setIsAdminModalOpen(true)} />
        </div>
      ) : (
        <div className="flex-1 lg:min-h-0 lg:overflow-hidden relative">
          <CommandCenterLayout
            mapSlot={
              <StrategicTheaterMap 
                onRegionSelect={setRegion} 
                selectedRegion={region} 
                articles={allArticles} 
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                isGoodNewsMode={isGoodNewsMode}
                onCountrySelect={(iso: string) => {
                  const intel = getGeopoliticalIntelligence(allArticles);
                  if (intel[iso]) setSelectedCountryIntel(intel[iso]);
                }}
              />
            }
            slotMapping={slotConfig}
            onSwap={swapSlots}
            intelComponent={
              <div className="flex flex-col h-full bg-[#050505]">
                <div className="px-3 py-2 border-b border-neutral-800/50 bg-neutral-900/20 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <Radar className="w-3 h-3 text-orange-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 font-mono">
                          Strategic Intelligence
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-1 bg-neutral-800/20 p-1">
                    {isLoading ? (
                      <>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="bg-neutral-950 p-2 h-16">
                            <ItemCardSkeleton variant="tactical-image" />
                          </div>
                        ))}
                      </>
                    ) : (
                      strategicArticles.map((article) => (
                        <div key={article.id} className="item-card-anim bg-neutral-950 h-full">
                          <ItemCard
                            item={article}
                            onPlay={(item) => {
                              setIsActiveLiveInsight(false);
                              setActiveArticle(item);
                            }}
                            variant="tactical-image"
                          />
                        </div>
                      ))
                    )}
                </div>
              </div>
            }
            videoComponent={
              <LiveNewsViewer onOverrideClick={() => setIsAdminModalOpen(true)} />
            }
            metricsComponent={
              <>
                {/* Crisis Alert Banner */}
                {isCrisisMode && (
                  <div className="w-full bg-red-950/50 border-b border-red-500 p-2 text-center animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]" />
                    <h2 className="text-red-500 font-black tracking-[0.3em] text-[10px] uppercase relative z-10 font-mono">
                      ⚠️ PRIORITY ALERT: MILITARY ACTION DETECTED ⚠️
                    </h2>
                  </div>
                )}

                <div className="px-3 py-2.5 border-b border-neutral-800/50 bg-neutral-950/80 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 font-mono">
                      Tactical Metrics
                    </span>
                  </div>
                  <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                    Signal Strength: <span className="text-green-500">OPTIMAL</span>
                  </div>
                </div>

                {/* Tactical Widgets Grid */}
                <div className="h-full bg-neutral-950/20">
                  <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 p-3 auto-rows-min">
                    <Suspense fallback={<TacticalWidgetSkeleton />}>
                      <div className="item-card-anim">
                        <AIInsightsBrief content={tacticalData?.insights} />
                      </div>
                    </Suspense>
                    <Suspense fallback={<TacticalWidgetSkeleton />}>
                      <div className="item-card-anim">
                        <StrategicRiskGauge score={tacticalData?.globalRiskScore || 63} />
                      </div>
                    </Suspense>
                    <Suspense fallback={<TacticalWidgetSkeleton />}>
                      <div className="item-card-anim">
                        <StrategicPosture />
                      </div>
                    </Suspense>
                    <Suspense fallback={<TacticalWidgetSkeleton />}>
                      <div className="item-card-anim">
                        <AIForecasts metrics={tacticalData?.forecasts} />
                      </div>
                    </Suspense>
                    <Suspense fallback={<TacticalWidgetSkeleton />}>
                      <div className="item-card-anim">
                        <CountryInstability 
                          countries={tacticalData?.instability} 
                          onCountryClick={(nameOrIso) => {
                            const intelArr = getGeopoliticalIntelligence(allArticles);
                            const intel = intelArr[nameOrIso] || Object.values(intelArr).find(c => c.name.toLowerCase() === nameOrIso.toLowerCase());
                            if (intel) setSelectedCountryIntel(intel);
                          }}
                        />
                      </div>
                    </Suspense>
                    <Suspense fallback={<TacticalWidgetSkeleton />}>
                      <div className="item-card-anim">
                        <CyberThreatRadar />
                      </div>
                    </Suspense>
                    <Suspense fallback={<TacticalWidgetSkeleton />}>
                      <div className="item-card-anim">
                        <IntelFeed 
                          items={tacticalData?.intelFeed} 
                          onItemClick={(item) => {
                            const intelMap = getGeopoliticalIntelligence(allArticles);
                            const t = (item.text || item.title || "").toLowerCase();
                            const iso = Object.keys(intelMap).find(idx => 
                              t.includes(intelMap[idx].name.toLowerCase())
                            );
    
                            if (iso) {
                              setSelectedCountryIntel(intelMap[iso]);
                            } else {
                              setIsActiveLiveInsight(true);
                              setActiveArticle({
                                id: `intel-${Date.now()}`,
                                title: item.text || item.title || 'Signal Analyzed',
                                description: `Source: ${item.source}. Raw signal received via Tactical Data Fusion.`,
                                url: '#',
                                source: item.source,
                                domain: 'intel.internal',
                                publishedAt: new Date().toISOString(),
                                biasMeta: {
                                  sourceReliability: 'high',
                                  ownershipType: 'unknown',
                                  countryOfOrigin: 'Internal',
                                  geopoliticalAlignment: 'western',
                                  sensationalismScore: 0,
                                  emotionallyLoadedLanguage: false
                                },
                                tags: ['LIVE_INTEL', item.badge || 'REPORT']
                              });
                            }
                          }}
                        />
                      </div>
                    </Suspense>
                    <Suspense fallback={<TacticalWidgetSkeleton />}>
                      <div className="item-card-anim">
                        <AviationStatusCard />
                      </div>
                    </Suspense>
                  </div>
                </div>
              </>
            }
          />
        </div>
      )}
      </main>

      {/* Global Modals */}
      <PaywallModal 
        isOpen={isPaywallOpen} 
        onClose={() => setIsPaywallOpen(false)} 
        onSubscribe={() => {
          setIsPremium(true);
          setIsPaywallOpen(false);
        }} 
      />
      <AdminCamModal 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
        onAdd={(newCam) => {
          addCam(newCam);
        }}
      />
      {selectedCountryIntel && (
        <LiveInsightModal 
          intel={selectedCountryIntel as any} 
          onClose={() => setSelectedCountryIntel(null)} 
        />
      )}

      {/* Global Footer - Natural Foot of Page */}
      <footer className="w-full shrink-0 border-t border-neutral-900 bg-slate-950 relative z-10">
        <Footer onRoadmapClick={() => setIsPaywallOpen(true)} />
      </footer>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]"><DashboardSkeleton /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
