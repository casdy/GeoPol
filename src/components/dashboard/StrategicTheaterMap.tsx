'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import { Region } from '@/lib/types';
import { 
  MAP_HUBS, 
  FIBRE_OPTICS,
  SAFE_ZONES,
  NUCLEAR_SITES,
  DATA_CENTERS,
  getLiveHotspots
} from '@/lib/map-data';

import { Layers, Zap, ShieldAlert, Globe, Server, Activity, Flame, Plane, Info, Shield, Plus } from 'lucide-react';
import { fetchNasaEonet, fetchOpenSky } from '@/lib/mapDataFetchers';
import { useMapSync } from '@/lib/map-sync-engine';
import { getGeopoliticalIntelligence, CountryIntelligence } from '@/lib/intelligence-engine';
import { interactiveEngine } from '@/lib/interactive-engine';
import { Article } from '@/lib/types';
import { getProsperityHotspots } from '@/lib/goodNewsEngine';

// ─── TACTICAL REGISTRY ──────────────────────────────────────────
const TACTICAL_LAYER_MAP: Record<string, string[]> = {
    fibre: ['fibre-lines', 'fibre-lines-glow'],
    conflicts: ['conflict-pulsars', 'conflict-points', 'conflict-country-fill'],
    hubs: ['hub-points'],
    safe: ['safe-points'],
    earthquakes: ['usgs-earthquakes'],
    eonet: ['nasa-eonet'],
    aviation: ['opensky-aviation', 'aviation-clusters', 'aviation-cluster-count'],
    nuclear: ['nuclear-sites', 'nuclear-country-fill'],
    datacenters: ['datacenter-nodes', 'datacenter-glow']
};

interface StrategicTheaterMapProps {
  onRegionSelect: (region: Region) => void;
  selectedRegion: Region;
  articles?: Article[];
  timeRange?: '1h' | '6h' | '24h' | '48h' | '7d' | 'all';
  onTimeRangeChange?: (range: '1h' | '6h' | '24h' | '48h' | '7d' | 'all') => void;
  onCountrySelect?: (iso: string) => void;
  isGoodNewsMode?: boolean;
}

const REGION_BOUNDS: Record<string, { center: [number, number]; zoom: number }> = {
  'Global':         { center: [20, 20],    zoom: 1.2 },
  'Middle East':    { center: [45, 29],    zoom: 4 },
  'Eastern Europe': { center: [30, 52],    zoom: 4 },
  'Asia Pacific':   { center: [120, 25],   zoom: 3 },
  'Americas':       { center: [-80, 15],   zoom: 2.5 },
  'Africa':         { center: [20, 0],     zoom: 3 },
  'Arctic':         { center: [0, 75],     zoom: 3 },
  'South Asia':     { center: [78, 22],    zoom: 4 },
  'Central Asia':   { center: [65, 42],    zoom: 4 },
  'Latin America':  { center: [-60, -15],  zoom: 3 },
  'US':             { center: [-98, 39],   zoom: 4 },
  'Europe':         { center: [15, 50],    zoom: 4 },
  'Asia':           { center: [105, 35],   zoom: 3 },
};

function buildMapStyle(apiKey: string): maplibregl.StyleSpecification {
  return {
    version: 8,
    glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
    sources: {
      protomaps: {
        type: 'vector',
        url: `https://api.protomaps.com/tiles/v4.json?key=${apiKey}`,
        attribution: '© Protomaps',
      },
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#0a0a0a' } },
      { id: 'earth', type: 'fill', source: 'protomaps', 'source-layer': 'earth', paint: { 'fill-color': '#1a1a1a' } },
      { id: 'water', type: 'fill', source: 'protomaps', 'source-layer': 'water', paint: { 'fill-color': '#050505' } },
      { id: 'boundaries', type: 'line', source: 'protomaps', 'source-layer': 'boundaries', paint: { 'line-color': '#444444', 'line-opacity': 0.8, 'line-width': 1.0 } },
      {
        id: 'continent-labels', type: 'symbol', source: 'protomaps', 'source-layer': 'places',
        maxzoom: 3,
        filter: ['all', ['==', 'kind', 'continent']],
        layout: { 'text-field': '{name:en}', 'text-font': ['Noto Sans Regular'], 'text-size': 14, 'text-letter-spacing': 0.2, 'text-transform': 'uppercase' },
        paint: { 'text-color': '#94a3b8', 'text-halo-color': '#020617', 'text-halo-width': 1.5 }
      },
      {
        id: 'country-labels', type: 'symbol', source: 'protomaps', 'source-layer': 'places',
        minzoom: 2.5, maxzoom: 6,
        filter: ['all', ['==', 'kind', 'country']],
        layout: { 'text-field': '{name:en}', 'text-font': ['Noto Sans Regular'], 'text-size': 11, 'text-letter-spacing': 0.1, 'text-transform': 'uppercase' },
        paint: { 'text-color': '#64748b', 'text-halo-color': '#020617', 'text-halo-width': 1 }
      },
      {
        id: 'city-labels', type: 'symbol', source: 'protomaps', 'source-layer': 'places',
        minzoom: 5,
        filter: ['all', ['==', 'kind', 'city']],
        layout: { 'text-field': '{name:en}', 'text-font': ['Noto Sans Regular'], 'text-size': 9, 'text-transform': 'uppercase' },
        paint: { 'text-color': '#475569', 'text-halo-color': '#020617', 'text-halo-width': 0.5 }
      },
    ],
  };
}

export default function StrategicTheaterMap({ 
  onRegionSelect, 
  selectedRegion, 
  articles = [], 
  timeRange = 'all',
  onTimeRangeChange,
  onCountrySelect,
  isGoodNewsMode = false
}: StrategicTheaterMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const protocolRef = useRef<Protocol | null>(null);
  const mapStyleLoadedRef = useRef(false);
  
  const [activeLayers, setActiveLayers] = useState({ 
      fibre: true, 
      conflicts: true, 
      hubs: false, 
      safe: false, 
      earthquakes: false, 
      eonet: false, 
      aviation: true, 
      nuclear: true, 
      datacenters: false 
  });

  const [isMounted, setIsMounted] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isSplashActive, setIsSplashActive] = useState(true);
  const [splashPhase, setSplashPhase] = useState('INITIALIZING SATELLITE LINK...');

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('geopol-layers');
    if (saved) {
      try {
        setActiveLayers(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {
        console.error("Failed to parse saved layers", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('geopol-layers', JSON.stringify(activeLayers));
    }
  }, [activeLayers, isMounted]);

  // ─── Resize Observer to handle container changes ──────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [isMapReady]);

  // ─── SPLASH LIFECYCLE ──────────────────────────────────────────
  useEffect(() => {
    if (isMapReady && articles.length > 0) {
      setSplashPhase('SYSTEM_STABLE // SYNCING TACTICAL GRID...');
      const timer = setTimeout(() => {
        setIsSplashActive(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isMapReady, articles.length]);

  const [showLegend, setShowLegend] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  
  const articlesRef = useRef(articles);
  const onCountrySelectRef = useRef(onCountrySelect);

  useEffect(() => { articlesRef.current = articles; }, [articles]);
  useEffect(() => { onCountrySelectRef.current = onCountrySelect; }, [onCountrySelect]);
  
  const { syncLayers, updateSource } = useMapSync(mapRef.current, isMapReady);

  const initTacticalLayers = useCallback((map: maplibregl.Map) => {
    if (!map.isStyleLoaded()) return;
    const transition = { duration: 500, delay: 0 };

    if (!map.getSource('country-boundaries')) {
        map.addSource('country-boundaries', { type: 'geojson', data: '/api/proxy/countries' });
    }

    if (!map.getSource('nuclear-watch')) {
        map.addSource('nuclear-watch', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: NUCLEAR_SITES.map(s => ({
                type: 'Feature', geometry: { type: 'Point', coordinates: s.coords }, properties: { ...s }
            }))}
        });
        map.addLayer({
            id: 'nuclear-country-fill', type: 'fill', source: 'country-boundaries',
            filter: ['in', ['get', 'iso_a3'], ['literal', Array.from(new Set(NUCLEAR_SITES.map(s => s.isoCode).filter(Boolean)))]],
            paint: { 'fill-color': '#facc15', 'fill-opacity': 0.12, 'fill-opacity-transition': transition },
            layout: { visibility: activeLayers.nuclear ? 'visible' : 'none' }
        });
        map.addLayer({
            id: 'nuclear-sites', type: 'symbol', source: 'nuclear-watch',
            layout: { 'text-field': '☢', 'text-size': 20, 'text-allow-overlap': true, 'visibility': activeLayers.nuclear ? 'visible' : 'none' },
            paint: { 'text-color': '#facc15', 'text-opacity-transition': transition }
        });
    }

    if (!map.getSource('datacenter-hubs')) {
        map.addSource('datacenter-hubs', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: DATA_CENTERS.map(s => ({
                type: 'Feature', geometry: { type: 'Point', coordinates: s.coords }, properties: { ...s }
            }))},
            cluster: false 
        });
        map.addLayer({
            id: 'datacenter-glow', type: 'circle', source: 'datacenter-hubs',
            paint: { 'circle-radius': 14, 'circle-color': '#a855f7', 'circle-blur': 1.8, 'circle-opacity': ['interpolate', ['linear'], ['zoom'], 1.5, 0, 2, 0.4], 'circle-opacity-transition': transition },
            layout: { visibility: activeLayers.datacenters ? 'visible' : 'none' }
        });
        map.addLayer({
            id: 'datacenter-nodes', type: 'circle', source: 'datacenter-hubs',
            paint: { 'circle-radius': 4, 'circle-color': '#a855f7', 'circle-stroke-width': 1.5, 'circle-stroke-color': '#fff', 'circle-opacity': ['interpolate', ['linear'], ['zoom'], 1.5, 0, 2, 0.9], 'circle-opacity-transition': transition },
            layout: { visibility: activeLayers.datacenters ? 'visible' : 'none' }
        });
    }

    if (!map.getSource('dynamic-hotspots')) {
      const hotspots = getLiveHotspots(articles);
      map.addSource('dynamic-hotspots', { type: 'geojson', data: { type: 'FeatureCollection', features: hotspots.map(h => ({
        type: 'Feature', geometry: { type: 'Point', coordinates: h.coords }, properties: { ...h }
      }))}});
      const hotspotIsos = Array.from(new Set(hotspots.map(h => h.isoCode).filter(Boolean)));
      map.addLayer({
        id: 'conflict-country-fill', type: 'fill', source: 'country-boundaries',
        paint: { 'fill-color': ['case', ['in', ['get', 'iso_a3'], ['literal', hotspotIsos.length > 0 ? hotspotIsos : ['NONE']]], '#ef4444', 'transparent'], 'fill-opacity': 0.35, 'fill-opacity-transition': transition },
        layout: { visibility: activeLayers.conflicts ? 'visible' : 'none' }
      });
      map.addLayer({
        id: 'conflict-pulsars', type: 'circle', source: 'dynamic-hotspots',
        paint: { 'circle-radius': 12, 'circle-color': '#ef4444', 'circle-opacity': 0.2, 'circle-stroke-width': 1, 'circle-stroke-color': '#ef4444', 'circle-opacity-transition': transition },
        layout: { visibility: activeLayers.conflicts ? 'visible' : 'none' }
      });
      map.addLayer({
        id: 'conflict-points', type: 'circle', source: 'dynamic-hotspots',
        paint: { 'circle-radius': 3, 'circle-color': '#f87171', 'circle-stroke-width': 1, 'circle-stroke-color': '#fff', 'circle-opacity': 0.8, 'circle-opacity-transition': transition },
        layout: { visibility: activeLayers.conflicts ? 'visible' : 'none' }
      });
    }

    if (!map.getSource('fibre-optics')) {
      map.addSource('fibre-optics', {
          type: 'geojson',
          data: {
              type: 'FeatureCollection',
              features: FIBRE_OPTICS.map((conn, i) => {
                  const from = MAP_HUBS[conn.from];
                  const to = MAP_HUBS[conn.to];
                  if (!from || !to) return null;
                  return { type: 'Feature', id: `fibre-${i}`, geometry: { type: 'LineString', coordinates: [from, to] }, properties: { ...conn } };
              }).filter(Boolean) as any
          }
      });
      map.addLayer({
        id: 'fibre-lines-glow', type: 'line', source: 'fibre-optics',
        paint: { 'line-color': '#3b82f6', 'line-width': 4, 'line-blur': 4, 'line-opacity': 0.3, 'line-opacity-transition': transition },
        layout: { visibility: activeLayers.fibre ? 'visible' : 'none' }
      });
      map.addLayer({
          id: 'fibre-lines', type: 'line', source: 'fibre-optics',
          paint: { 'line-color': '#3b82f6', 'line-width': 1, 'line-opacity': 0.6, 'line-opacity-transition': transition },
          layout: { visibility: activeLayers.fibre ? 'visible' : 'none' }
      });
    }

    if (!map.getSource('tactical-hubs')) {
      map.addSource('tactical-hubs', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: Object.entries(MAP_HUBS).map(([name, coords], i) => ({ type: 'Feature', id: `hub-${i}`, geometry: { type: 'Point', coordinates: coords }, properties: { name } })) }
      });
    }
    if (!map.getLayer('hub-points')) {
        map.addLayer({ id: 'hub-points', type: 'circle', source: 'tactical-hubs', paint: { 'circle-radius': 3, 'circle-color': '#ffffff', 'circle-opacity': 0.3 }, layout: { visibility: activeLayers.hubs ? 'visible' : 'none' } });
    }

    if (!map.getSource('safe-zones')) {
      map.addSource('safe-zones', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: SAFE_ZONES.map((sz, i) => ({ type: 'Feature', id: `safe-${i}`, geometry: { type: 'Point', coordinates: sz.coords }, properties: { ...sz } })) }
      });
    }
    if (!map.getLayer('safe-points')) {
        map.addLayer({ id: 'safe-points', type: 'circle', source: 'safe-zones', paint: { 'circle-radius': 5, 'circle-color': '#22c55e', 'circle-opacity': 0.6 }, layout: { visibility: activeLayers.safe ? 'visible' : 'none' } });
    }

    if (!map.getSource('usgs-earthquakes')) {
      map.addSource('usgs-earthquakes', { type: 'geojson', data: '/api/proxy/usgs' });
    }
    if (!map.getLayer('usgs-earthquakes')) {
      map.addLayer({ id: 'usgs-earthquakes', type: 'circle', source: 'usgs-earthquakes', paint: { 'circle-radius': 4, 'circle-color': '#f97316', 'circle-opacity': 0.6, 'circle-stroke-width': 1, 'circle-stroke-color': '#ffffff', 'circle-opacity-transition': transition }, layout: { visibility: activeLayers.earthquakes ? 'visible' : 'none' } });
    }

    if (!map.getSource('nasa-eonet')) {
      map.addSource('nasa-eonet', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    }
    if (!map.getLayer('nasa-eonet')) {
      map.addLayer({ id: 'nasa-eonet', type: 'circle', source: 'nasa-eonet', paint: { 'circle-radius': 6, 'circle-color': '#8b5cf6', 'circle-opacity': 0.7, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff', 'circle-opacity-transition': transition }, layout: { visibility: activeLayers.eonet ? 'visible' : 'none' } });
    }

    if (!map.getSource('opensky-aviation')) {
      map.addSource('opensky-aviation', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, cluster: true, clusterRadius: 40, clusterMaxZoom: 8 });
    }
    if (!map.getLayer('aviation-clusters')) {
      map.addLayer({ id: 'aviation-clusters', type: 'circle', source: 'opensky-aviation', filter: ['has', 'point_count'], paint: { 'circle-color': '#e2e8f0', 'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 50, 25], 'circle-opacity': 0.15, 'circle-stroke-width': 1, 'circle-stroke-color': '#94a3b8', 'circle-opacity-transition': transition }, layout: { visibility: activeLayers.aviation ? 'visible' : 'none' } });
    }
    if (!map.getLayer('aviation-cluster-count')) {
      map.addLayer({ id: 'aviation-cluster-count', type: 'symbol', source: 'opensky-aviation', filter: ['has', 'point_count'], layout: { 'text-field': '{point_count}', 'text-font': ['Noto Sans Regular'], 'text-size': 10, 'visibility': activeLayers.aviation ? 'visible' : 'none' }, paint: { 'text-color': '#cbd5e1', 'text-opacity-transition': transition } });
    }
    if (!map.getLayer('opensky-aviation')) {
      map.addLayer({ id: 'opensky-aviation', type: 'symbol', source: 'opensky-aviation', filter: ['!', ['has', 'point_count']], layout: { 'text-field': '✈', 'text-size': 14, 'text-rotate': ['get', 'heading'], 'text-allow-overlap': true, 'visibility': activeLayers.aviation ? 'visible' : 'none' }, paint: { 'text-color': '#e2e8f0', 'text-opacity-transition': transition } });
    }

    if (!map.getSource('prosperity-nodes')) {
        map.addSource('prosperity-nodes', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    }
    if (!map.getLayer('prosperity-points')) {
        map.addLayer({ id: 'prosperity-points', type: 'circle', source: 'prosperity-nodes', paint: { 'circle-radius': 6, 'circle-color': '#10b981', 'circle-opacity': 0.8, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff', 'circle-opacity-transition': transition }, layout: { visibility: isGoodNewsMode ? 'visible' : 'none' } });
    }
  }, [activeLayers]);

  useEffect(() => {
    const overrides: Record<string, boolean> = {};
    if (isGoodNewsMode) overrides.conflicts = false;
    syncLayers(TACTICAL_LAYER_MAP, { ...activeLayers, ...overrides });
    if (mapRef.current && mapRef.current.getLayer('prosperity-points')) {
        mapRef.current.setLayoutProperty('prosperity-points', 'visibility', isGoodNewsMode ? 'visible' : 'none');
    }
  }, [activeLayers, syncLayers, isGoodNewsMode]);

  useEffect(() => {
    if (!isMapReady) return;
    const hotspots = getLiveHotspots(articles);
    updateSource('dynamic-hotspots', { type: 'FeatureCollection', features: hotspots.map(h => ({ type: 'Feature', geometry: { type: 'Point', coordinates: h.coords }, properties: { ...h } })) });

    if (isGoodNewsMode) {
        const prosperity = getProsperityHotspots(articles);
        updateSource('prosperity-nodes', { type: 'FeatureCollection', features: prosperity.map((p, i) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [Math.random() * 360 - 180, Math.random() * 140 - 70] }, properties: { ...p } })) });
    }

    const map = mapRef.current;
    if (map && map.getLayer('conflict-country-fill')) {
        const intel = getGeopoliticalIntelligence(articles);
        const COLORS = { CRITICAL: '#ef4444', VOLATILE: '#f97316', UNSTABLE: '#facc15', STABLE: '#4ade80', SECURE: '#22c55e', MONITORING: '#3b82f6', DEFAULT: 'transparent' };
        const colorExpression: any[] = ['match', ['get', 'iso_a3']];
        Object.values(intel).forEach(c => { const color = COLORS[c.status as keyof typeof COLORS] || COLORS.DEFAULT; colorExpression.push(c.isoCode, color); });
        colorExpression.push(COLORS.DEFAULT);
        map.setPaintProperty('conflict-country-fill', 'fill-color', colorExpression);
        map.setPaintProperty('conflict-country-fill', 'fill-opacity', 0.25);
    }
  }, [articles, updateSource]);

  useEffect(() => {
    const fetchData = async () => {
      if (!mapRef.current || !isMapReady) return;
      const [eonetData, cryptoAviationData] = await Promise.all([fetchNasaEonet(), fetchOpenSky()]);
      updateSource('nasa-eonet', eonetData);
      updateSource('opensky-aviation', cryptoAviationData);
    };
    if (isMapReady) {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }
  }, [isMapReady, updateSource]);

  useEffect(() => {
    let frameId: number;
    let start: number;
    const animate = (time: number) => {
      if (!start) start = time;
      const progress = (time - start) / 1500;
      const pulse = Math.abs(Math.sin(progress * Math.PI)); 
      const map = mapRef.current;
      if (map && mapStyleLoadedRef.current) {
        if (map.getLayer('nasa-eonet')) { map.setPaintProperty('nasa-eonet', 'circle-radius', 4 + (pulse * 4)); map.setPaintProperty('nasa-eonet', 'circle-opacity', 0.4 + (pulse * 0.4)); }
        if (map.getLayer('conflict-pulsars')) { map.setPaintProperty('conflict-pulsars', 'circle-opacity', 0.1 + (pulse * 0.2)); }
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const apiKey = process.env.NEXT_PUBLIC_PROTOMAPS_KEY || '';
    if (!protocolRef.current) {
      protocolRef.current = new Protocol();
      maplibregl.addProtocol('pmtiles', protocolRef.current.tile);
    }
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildMapStyle(apiKey),
      center: REGION_BOUNDS[selectedRegion]?.center || [20, 20],
      zoom: REGION_BOUNDS[selectedRegion]?.zoom || 1.8,
      minZoom: 1.5, maxZoom: 12, attributionControl: false,
    });
    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: 'tactical-popup' });
    map.on('mousemove', (e) => {
        const TARGET_LAYERS = ['conflict-country-fill', 'conflict-pulsars', 'conflict-points'];
        const existingLayers = TARGET_LAYERS.filter(id => map.getLayer(id));
        if (existingLayers.length === 0) return;
        const features = map.queryRenderedFeatures(e.point, { layers: existingLayers });
        if (features.length > 0) {
            const f = features[0];
            const p = f.properties;
            const iso = p?.iso_a3 || p?.ISO_A3 || p?.isoCode;
            const intel = getGeopoliticalIntelligence(articlesRef.current as Article[]);
            const nationIntel = intel[iso];
            if (nationIntel && (f.layer.id === 'conflict-country-fill' ? (nationIntel.status === 'CRITICAL' || nationIntel.status === 'VOLATILE' || nationIntel.status === 'UNSTABLE') : true)) {
                map.getCanvas().style.cursor = 'pointer';
                const readout = interactiveEngine.generateTacticalReadout(nationIntel, map.getZoom());
                popup.setLngLat(e.lngLat).setHTML(`
                        <div class="bg-[#050505] p-4 border border-zinc-800 shadow-2xl text-[11px] font-sans leading-relaxed text-white min-w-[200px] max-w-[280px] animate-in fade-in zoom-in duration-200">
                            <div class="${readout.isCritical ? 'text-red-500' : 'text-amber-500'} font-black mb-4 tracking-[0.2em] uppercase border-b border-zinc-900 pb-2 flex justify-between items-center">
                                <span>[${readout.isCritical ? 'KINETIC_HOTSPOT' : 'SECTOR_ANALYZED'}]</span>
                                <span class="text-[8px] opacity-40">SIGNAL.01</span>
                            </div>
                            <div class="space-y-4">
                                <div class="flex flex-col"><span class="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">TARGET:</span><span class="text-sm font-black tracking-tight">${readout.target}</span></div>
                                <div class="relative pl-3 border-l-2 border-red-500/30 py-1"><p class="text-[11px] font-bold leading-snug text-zinc-200 italic">"${readout.headline}"</p></div>
                                <div class="text-[10px] text-zinc-400 font-medium leading-relaxed">${readout.intel.substring(0, 160)}${readout.intel.length > 160 ? '...' : ''}</div>
                            </div>
                            <div class="mt-8 pt-4 border-t border-zinc-900 flex justify-between items-end">
                                <div class="flex flex-col"><span class="text-[8px] text-zinc-600 font-black uppercase tracking-widest">COORDS</span><span class="text-[10px] font-mono text-zinc-400">${e.lngLat.lng.toFixed(4)}°E / ${e.lngLat.lat.toFixed(4)}°N</span></div>
                                <div class="flex flex-col items-end"><span class="text-[8px] text-zinc-600 font-black uppercase tracking-widest">THREAT_LVL</span><span class="text-[10px] font-black ${readout.isCritical ? 'text-red-500' : 'text-orange-500'} tracking-tighter">DL: ${readout.riskScore / 10}</span></div>
                            </div>
                        </div>
                    `).addTo(map);
            } else { map.getCanvas().style.cursor = ''; popup.remove(); }
        } else { map.getCanvas().style.cursor = ''; popup.remove(); }
    });
    map.on('click', (e) => {
        const TARGET_LAYERS = ['conflict-country-fill', 'conflict-pulsars', 'conflict-points'];
        const existingLayers = TARGET_LAYERS.filter(id => map.getLayer(id));
        if (existingLayers.length === 0) return;
        const features = map.queryRenderedFeatures(e.point, { layers: existingLayers });
        if (features.length > 0) {
            const iso = features[0].properties?.iso_a3 || features[0].properties?.ISO_A3 || features[0].properties?.isoCode;
            if (iso && onCountrySelectRef.current) onCountrySelectRef.current(iso);
        }
    });

    const setupLayerListeners = (map: maplibregl.Map) => {
        if (!map.getLayer('conflict-country-fill')) return;
        map.on('mouseenter', 'conflict-country-fill', () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', 'conflict-country-fill', () => map.getCanvas().style.cursor = '');
    };
    map.on('styledata', () => { initTacticalLayers(map); setupLayerListeners(map); setIsMapReady(true); mapStyleLoadedRef.current = true; });
    map.on('load', () => {
        initTacticalLayers(map);
        setupLayerListeners(map);
        setIsMapReady(true);
        mapStyleLoadedRef.current = true;
        
        // Restore Native Navigation Controls (Zoom)
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; mapStyleLoadedRef.current = false; };
  }, [selectedRegion]); // Re-run on region change if needed for bounds, though flyTo handles it below

  useEffect(() => {
    if (mapRef.current) {
        const target = REGION_BOUNDS[selectedRegion] || REGION_BOUNDS['Global'];
        mapRef.current.flyTo({ center: target.center, zoom: target.zoom, duration: 1500, essential: true });
    }
  }, [selectedRegion]);

  const regions: Region[] = ['Global', 'Middle East', 'Eastern Europe', 'Asia Pacific', 'Americas', 'Africa', 'Arctic', 'South Asia', 'Central Asia', 'Latin America'];

  return (
    <div ref={containerRef} className="strategic-theater-map w-full h-full relative font-sans">
      <div className="absolute bottom-3 left-3 z-10 bg-black/80 border border-neutral-800 p-2 backdrop-blur-md flex flex-col gap-1 pointer-events-none sm:flex hidden md:flex">
        <div className="flex items-center gap-2">
            <span className="text-[8px] text-orange-500 font-bold tracking-widest uppercase">COORD:</span>
            <span className="text-[9px] text-neutral-300 tabular-nums">{mapRef.current?.getCenter().lng.toFixed(4)}°E / {mapRef.current?.getCenter().lat.toFixed(4)}°N</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[8px] text-cyan-500 font-bold tracking-widest uppercase">ZOOM_LVL:</span>
            <span className="text-[9px] text-neutral-300 tabular-nums">0{mapRef.current?.getZoom().toFixed(2)}</span>
        </div>
      </div>

      <div className="absolute top-[84px] left-3 z-10 flex gap-0.5 bg-black/60 backdrop-blur-md p-0.5 border border-white/5 opacity-80 sm:opacity-100">
        {(['1h', '6h', '24h', '48h', '7d', 'all'] as const).map((t) => (
          <button key={t} onClick={() => onTimeRangeChange?.(t)} className={`px-1 py-0.5 sm:px-1.5 text-[6px] sm:text-[7px] font-black uppercase transition-all duration-200 ${timeRange === t ? 'bg-cyan-500 text-black' : 'text-neutral-500 hover:text-neutral-300'}`}>{t}</button>
        ))}
      </div>

      <div className="absolute top-3 left-3 z-10 flex flex-nowrap overflow-x-auto no-scrollbar gap-1 max-w-[calc(100vw-60px)] sm:flex-wrap sm:max-w-[280px]">
        {regions.map((r) => (
          <button key={r} onClick={() => onRegionSelect(r)} className={`px-2 py-1 text-[8px] font-bold uppercase transition-all duration-200 border border-white/5 backdrop-blur-md whitespace-nowrap ${selectedRegion === r ? 'bg-orange-600/90 text-black' : 'bg-black/60 text-neutral-500 hover:text-neutral-300'}`}>{r}</button>
        ))}
      </div>

      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1.5 min-w-[120px] sm:min-w-[150px] pointer-events-auto">
            <button 
              onClick={() => setIsLayersOpen(!isLayersOpen)}
              aria-label="Toggle Tactical Layers"
              title="Tactical Layers"
              className={`w-full py-2 sm:py-2.5 border border-white/10 ${isLayersOpen ? 'bg-cyan-500/20 text-cyan-400' : 'bg-black/95 text-neutral-100'} hover:bg-neutral-800 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 group mb-1 shadow-lg`}
            >
              <Layers className={`w-3.5 h-3.5 ${isLayersOpen ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'}`} />
              <span className={isLayersOpen ? 'text-cyan-400' : 'text-neutral-100'}>Tactical Layers</span>
            </button>

            <button 
              onClick={() => setShowLegend(!showLegend)}
              aria-label="Toggle Tactical Legend"
              title="Tactical Legend"
              className="w-full py-2 sm:py-2.5 border border-white/10 bg-black/95 hover:bg-neutral-800 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] text-neutral-100 transition-all flex items-center justify-center gap-2 group shadow-lg"
            >
              <Info className="w-3.5 h-3.5 group-hover:animate-pulse" />
              <span>Tactical Legend</span>
            </button>
      </div>

      <AnimatePresence>
        {isLayersOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-24 right-3 z-20 w-64 bg-black/95 border border-white/10 p-4 backdrop-blur-xl shadow-2xl"
          >
            <div className="text-[10px] font-black text-cyan-500 tracking-[0.2em] uppercase mb-4 border-b border-white/5 pb-2">Layer Configuration</div>
            <div className="space-y-3">
              {Object.keys(activeLayers).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveLayers(prev => ({ ...prev, [key]: !prev[key as keyof typeof activeLayers] }))}
                  className="w-full flex items-center justify-between group"
                >
                  <span className="text-[9px] font-bold text-neutral-400 group-hover:text-white transition-colors uppercase tracking-widest">{key}</span>
                  <div className={`w-8 h-4 border border-white/10 relative transition-colors ${activeLayers[key as keyof typeof activeLayers] ? 'bg-cyan-500/20' : 'bg-neutral-900'}`}>
                    <div className={`absolute top-1 bottom-1 w-2 transition-all ${activeLayers[key as keyof typeof activeLayers] ? 'right-1 bg-cyan-500' : 'left-1 bg-neutral-600'}`} />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {showLegend && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-3 right-[160px] sm:right-[190px] z-20 w-72 bg-black/95 border border-white/10 p-5 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
              <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">Tactical Registry v3.2</span>
              <span className="text-[8px] text-cyan-500 font-mono animate-pulse">LIVE_SYNC</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500 animate-pulse mt-0.5" />
                <div>
                  <div className="text-[9px] font-black text-white uppercase tracking-wider">Kinetic Hotspots</div>
                  <div className="text-[8px] text-neutral-500 font-medium leading-relaxed">Active conflict zones and reported kinetic engagements via internal SIGINT.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-cyan-400 mt-0.5"><Plane className="w-3.5 h-3.5" /></div>
                <div>
                  <div className="text-[9px] font-black text-white uppercase tracking-wider">Aerial Surveillance</div>
                  <div className="text-[8px] text-neutral-500 font-medium leading-relaxed">Real-time transponder data for diplomatic and tactical aviation assets.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-purple-500 mt-0.5"><Server className="w-3.5 h-3.5" /></div>
                <div>
                  <div className="text-[9px] font-black text-white uppercase tracking-wider">Data Hubs</div>
                  <div className="text-[8px] text-neutral-500 font-medium leading-relaxed">Strategic telecommunications infrastructure and global fibre optic nodes.</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSplashActive && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.8, ease: "circOut" }} className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="relative flex flex-col items-center max-w-md w-full">
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse" />
                <Zap className="w-16 h-16 text-cyan-500 relative animate-pulse" />
              </div>
              <div className="w-full h-[1px] bg-white/10 mb-8 relative">
                <motion.div initial={{ width: 0 }} animate={{ width: isMapReady ? '100%' : '65%' }} className="absolute inset-0 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                  <span className="text-[10px] sm:text-xs font-mono text-cyan-400 tracking-[0.4em] uppercase font-black text-center">{splashPhase}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
