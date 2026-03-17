'use client';

import React, { useState, useMemo } from 'react';
import { Radio, ChevronDown, ChevronUp, Tv, Menu, X } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Metadata for each live news channel. */
export interface NewsChannel {
  id: string;
  country: string;
  name: string;
  channelId: string;
  liveStreamUrl: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATIC CHANNEL DATA — 30 Global News Feeds
// ─────────────────────────────────────────────────────────────────────────────

const CHANNELS: NewsChannel[] = [
  { id: "de-dw", country: "Germany", name: "DW News", channelId: "UCknLrEdhRCp1aegoMqRaCZg", liveStreamUrl: "https://www.youtube.com/embed/live_stream?channel=UCknLrEdhRCp1aegoMqRaCZg" },
  { id: "qa-aje", country: "Qatar", name: "Al Jazeera", channelId: "UCNye-wNBqNL5ZzHSJj3l8Bg", liveStreamUrl: "https://www.youtube.com/embed/live_stream?channel=UCNye-wNBqNL5ZzHSJj3l8Bg" },
  { id: "au-abc", country: "Australia", name: "ABC News", channelId: "UCzQUP1qoWDoEbEQUBUWE41A", liveStreamUrl: "https://www.youtube.com/embed/-X6fW5SoWIM" },
  { id: "ca-cbc", country: "Canada", name: "CBC News", channelId: "UCuFVjoYg9hGzQe0Q1i2-eAg", liveStreamUrl: "https://www.youtube.com/embed/ZR6AfSs6iZ8" },
  { id: "tr-trt", country: "Turkey", name: "TRT World", channelId: "UC7fWeaHhqgM4Ry-RMpM2YYw", liveStreamUrl: "https://www.youtube.com/embed/live_stream?channel=UC7fWeaHhqgM4Ry-RMpM2YYw" },
  { id: "pl-tvp", country: "Poland", name: "TVP World", channelId: "UCvMGBE1sIeK5x8dZtB3B5fA", liveStreamUrl: "https://www.youtube.com/embed/m4mVcUReR6Y" },
  { id: "ie-rte", country: "Ireland", name: "RTÉ News", channelId: "UCj3EBJmB-x3b5fBpxG2_n_w", liveStreamUrl: "https://www.youtube.com/embed/Y3zPtTN-wmQ" },
  { id: "ua-u24", country: "Ukraine", name: "UNITED24", channelId: "UCc0EEDj2wJz_4H7mGv-h_2Q", liveStreamUrl: "https://www.youtube.com/embed/w8ZBdu83tMQ" },
  { id: "il-i24", country: "Israel", name: "i24NEWS", channelId: "UCaXawI0W3k_n7U9oEsq933Q", liveStreamUrl: "https://www.youtube.com/embed/iSuEPISmyNs" },
  { id: "cg-africanews", country: "Republic of the Congo", name: "Africanews", channelId: "UC0qSGq2LL9h-ZtaQG-oJ_jw", liveStreamUrl: "https://www.youtube.com/embed/NQjabLGdP5g" },
  { id: "jp-nhk", country: "Japan", name: "NHK World", channelId: "UCp2WwK8nQ4BebzD0P-tP-kw", liveStreamUrl: "https://www.youtube.com/embed/f0lYkdA-Gtw" },
  { id: "ng-channels", country: "Nigeria", name: "Channels TV", channelId: "UC1EGNED28BwTqLNbYjB7p9g", liveStreamUrl: "https://www.youtube.com/embed/W8nThq62Vb4" },
  { id: "af-tolo", country: "Afghanistan", name: "TOLOnews", channelId: "UCEwBqHq1e7e4rS202HkUj4g", liveStreamUrl: "https://www.youtube.com/embed/gUF7uYD_AnQ" },
  { id: "in-ndtv", country: "India", name: "NDTV", channelId: "UCZFMm1mMw0F81Z37AA81xEQ", liveStreamUrl: "https://www.youtube.com/embed/Gm0wjEuXPZI" },
  { id: "uk-ch4", country: "United Kingdom", name: "Channel 4 News", channelId: "UCT6iAerLNE-0J1S_Eklq_sw", liveStreamUrl: "https://www.youtube.com/embed/f56tfSVtlo4" },
  { id: "ca-global", country: "Canada", name: "Global News", channelId: "UChLtXXpo4Ge1ReTEboVvTDg", liveStreamUrl: "https://www.youtube.com/embed/QrtJ2foQgfk" },
  { id: "hk-scmp", country: "Hong Kong", name: "SCMP", channelId: "UCH2wZpB9yAozvM4E_x8sA1g", liveStreamUrl: "https://www.youtube.com/embed/jggTnetqeho" },
  // Newly Requested Channels
  { id: "us-cbs2", country: "United States", name: "CBS News", channelId: "UCAeOZZinty8w5A9hX2R-NFA", liveStreamUrl: "https://www.youtube.com/embed/nqs9aeQrpGM" },
  { id: "us-abc", country: "United States", name: "ABC News Live", channelId: "UCBi2mrWuNuyYy4gbM6fU18Q", liveStreamUrl: "https://www.youtube.com/embed/iipR5yUp36o" },
  { id: "us-foxlive2", country: "United States", name: "LiveNOW from FOX", channelId: "UCJg9wBPyKMNA5sRDNVpz--g", liveStreamUrl: "https://www.youtube.com/embed/ooXFU53gMyk" },
  { id: "us-pbs", country: "United States", name: "PBS NewsHour", channelId: "UC6ZFN9Tx6xh-skXCuRHCDpQ", liveStreamUrl: "https://www.youtube.com/embed/F_Ny5Us_rvw" },
  { id: "uk-gbnews", country: "United Kingdom", name: "GB News", channelId: "UCUO8-mEok5_ZUSmU1b8o46w", liveStreamUrl: "https://www.youtube.com/embed/oI_Zt-jTxQc" },
  { id: "in-firstpost", country: "India", name: "Firstpost", channelId: "UCz8QaiQxApLq8sLNcszYyJw", liveStreamUrl: "https://www.youtube.com/embed/rMydh_-HOY0" },
  { id: "in-indiatoday", country: "India", name: "India Today", channelId: "UCYPvAwZP8pZhSMW8qsG1XWw", liveStreamUrl: "https://www.youtube.com/embed/XhnK1u6iHJw" },
  { id: "tw-taiwanplus", country: "Taiwan", name: "TaiwanPlus News", channelId: "UCGv3O4E0lYx1vEExy9O-W1w", liveStreamUrl: "https://www.youtube.com/embed/nT__fkHXsvE" },
  { id: "kr-ytn", country: "South Korea", name: "YTN", channelId: "UChlgI3UHCOnwUGzWzbJ3H5w", liveStreamUrl: "https://www.youtube.com/embed/kVBfp6e_Dvc" },
  { id: "mx-milenio", country: "Mexico", name: "Milenio", channelId: "UCxweB3BWe4lM4qfKkE1Aptw", liveStreamUrl: "https://www.youtube.com/embed/tQ941SU5UR0" },
  { id: "qa-aja", country: "Qatar", name: "Al Jazeera Arabic", channelId: "UCfiwzLy-8yKzIbsmZTzxDgw", liveStreamUrl: "https://www.youtube.com/embed/bNyUyrR0PHo" },
  { id: "un-webtv", country: "Global", name: "United Nations", channelId: "UC5O114-PQNYkurlTg6hekZw", liveStreamUrl: "https://www.youtube.com/embed/vYRfQo6JMxc" },
  { id: "fr-f24fr", country: "France", name: "France 24 Français", channelId: "UCCCPCZNChQdGa9EkATeye4g", liveStreamUrl: "https://www.youtube.com/embed/l8PMl7tUDIE" },
  { id: "de-dwes", country: "Germany", name: "DW Español", channelId: "UCT4GvRTFl6R0AIEB2oQvNvg", liveStreamUrl: "https://www.youtube.com/embed/jRnqxURJ120" },
  { id: "us-yahoofinance", country: "United States", name: "Yahoo Finance", channelId: "UCEAZeUIeJs0IjQiqTCdXGQg", liveStreamUrl: "https://www.youtube.com/embed/uhD18nS09YQ" }
];

// ─────────────────────────────────────────────────────────────────────────────
// REGION CATEGORIZATION ENGINE
// Maps each country string to a geopolitical parent region.
// ─────────────────────────────────────────────────────────────────────────────

const REGION_ORDER = ['North America', 'Europe', 'Middle East', 'Asia', 'Africa', 'Oceania'] as const;
type RegionName = (typeof REGION_ORDER)[number];

/** Deterministic country → region mapper. */
function getRegion(country: string): RegionName {
  const map: Record<string, RegionName> = {
    'United States': 'North America',
    'Canada': 'North America',
    'United Kingdom': 'Europe',
    'France': 'Europe',
    'Germany': 'Europe',
    'Europe': 'Europe',
    'Poland': 'Europe',
    'Ireland': 'Europe',
    'Ukraine': 'Europe',
    'Turkey': 'Europe',
    'Qatar': 'Middle East',
    'Israel': 'Middle East',
    'United Arab Emirates': 'Middle East',
    'Afghanistan': 'Middle East',
    'India': 'Asia',
    'Singapore': 'Asia',
    'South Korea': 'Asia',
    'Japan': 'Asia',
    'China': 'Asia',
    'Hong Kong': 'Asia',
    'Australia': 'Oceania',
    'Republic of the Congo': 'Africa',
    'South Africa': 'Africa',
    'Kenya': 'Africa',
    'Nigeria': 'Africa',
    'Mexico': 'North America',
  };
  return map[country] || 'Asia';
}

/**
 * Groups channels into a region-keyed record, preserving the canonical
 * REGION_ORDER for consistent UI rendering.
 */
function groupByRegion(channels: NewsChannel[]): Record<string, NewsChannel[]> {
  const grouped: Record<string, NewsChannel[]> = {};
  // Seed empty arrays in display order
  for (const r of REGION_ORDER) grouped[r] = [];
  for (const ch of channels) {
    const region = getRegion(ch.country);
    grouped[region].push(ch);
  }
  return grouped;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: LiveNewsViewer
// A compact live-stream hub embedded inline in the dashboard center column.
// ─────────────────────────────────────────────────────────────────────────────

export default React.memo(function LiveNewsViewer() {
  // Active channel state — defaults to NBC News (first in array)
  const [activeChannel, setActiveChannel] = useState<NewsChannel>(CHANNELS[0]);

  // Active region filter — null means "show all"
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  // Hamburger menu for channels
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Memoize the region-grouped data (static, but good practice)
  const regionData = useMemo(() => groupByRegion(CHANNELS), []);

  // Filtered channels by active region
  const displayedChannels = activeRegion
    ? (regionData[activeRegion] || [])
    : CHANNELS;

  return (
    <div className="w-full flex flex-col bg-neutral-900/60 border border-neutral-800 rounded-md backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative">

      {/* ── HEADER BAR ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-950/80">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="w-4 h-4 text-red-500" />
            <div className="absolute inset-0 bg-red-500 rounded-full opacity-30 animate-ping" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300 font-mono">
            Live Intelligence Feed
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
            <span className="text-[9px] uppercase font-bold tracking-widest text-green-500/80 font-mono">
              ON AIR
            </span>
          </div>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded-sm bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── BURGER MENU OVERLAY (CHANNELS & REGIONS) ─────────────────── */}
      {isMenuOpen && (
        <div className="absolute top-[37px] left-0 right-0 z-50 bg-neutral-950/95 border-b border-neutral-800 backdrop-blur-xl shadow-2xl flex flex-col max-h-[400px]">
          {/* REGION TAB BAR */}
          <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto no-scrollbar border-b border-neutral-800/50">
            <button
              onClick={() => setActiveRegion(null)}
              className={`shrink-0 px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-all font-mono ${
                activeRegion === null
                  ? 'bg-orange-600 text-black shadow-[0_0_10px_rgba(234,88,12,0.3)]'
                  : 'bg-neutral-900 text-neutral-500 border border-neutral-800 hover:text-neutral-300 hover:border-neutral-700'
              }`}
            >
              All
            </button>
            {REGION_ORDER.map((region) => (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                className={`shrink-0 px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-all font-mono ${
                  activeRegion === region
                    ? 'bg-orange-600 text-black shadow-[0_0_10px_rgba(234,88,12,0.3)]'
                    : 'bg-neutral-900 text-neutral-500 border border-neutral-800 hover:text-neutral-300 hover:border-neutral-700'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          {/* CHANNELS GRID */}
          <div className="overflow-y-auto custom-scrollbar p-3">
            {activeRegion ? (
              <div className="flex flex-wrap gap-1.5">
                {displayedChannels.map((ch) => (
                  <ChannelButton
                    key={ch.id}
                    channel={ch}
                    isActive={activeChannel.id === ch.id}
                    onClick={() => {
                      setActiveChannel(ch);
                      setIsMenuOpen(false);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {REGION_ORDER.map((region) => {
                  const channels = regionData[region];
                  if (!channels || channels.length === 0) return null;
                  return (
                    <div key={region}>
                      <h4 className="text-[9px] font-black uppercase tracking-[0.25em] text-orange-500/70 mb-1.5 font-mono">
                        {region}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {channels.map((ch) => (
                          <ChannelButton
                            key={ch.id}
                            channel={ch}
                            isActive={activeChannel.id === ch.id}
                            onClick={() => {
                              setActiveChannel(ch);
                              setIsMenuOpen(false);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── NOW PLAYING TITLE BAR ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-950/60 border-b border-neutral-800/30">
        <div className="flex items-center gap-2 min-w-0">
          <Tv className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span className="text-xs font-bold text-neutral-200 truncate font-mono">
            {activeChannel.name}
          </span>
          <span className="text-[9px] text-neutral-500 uppercase tracking-wider font-mono shrink-0">
            {activeChannel.country}
          </span>
        </div>
      </div>

      {/* ── 16:9 VIDEO PLAYER ──────────────────────────────────────────── */}
      <div className="relative w-full aspect-video bg-black shrink-0 border border-neutral-800 shadow-2xl">
        <iframe
          key={activeChannel.id}
          src={`${activeChannel.liveStreamUrl}${activeChannel.liveStreamUrl.includes('?') ? '&' : '?'}autoplay=1&mute=1&rel=0`}
          title={`${activeChannel.name} Live Stream`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: ChannelButton
// A small, styled button for selecting a channel.
// ─────────────────────────────────────────────────────────────────────────────

function ChannelButton({
  channel,
  isActive,
  onClick,
}: {
  channel: NewsChannel;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-sm text-left transition-all duration-200 group ${
        isActive
          ? 'bg-blue-900/50 border border-blue-500/50 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
          : 'bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200 hover:bg-neutral-800/60'
      }`}
      title={`${channel.name} — ${channel.country}`}
    >
      <span className={`text-[10px] font-bold truncate max-w-[120px] ${isActive ? 'text-blue-300' : 'group-hover:text-white'}`}>
        {channel.name}
      </span>
      <span className={`text-[8px] uppercase tracking-wider ${isActive ? 'text-blue-400/60' : 'text-neutral-600'}`}>
        {/* Show short country code for compactness */}
        {channel.country.length > 10 ? channel.country.substring(0, 3).toUpperCase() : channel.country.substring(0, 2).toUpperCase()}
      </span>
    </button>
  );
}
