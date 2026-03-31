import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useState, useCallback } from 'react';

/** 
 * Layer visibility and data state descriptor 
 */
export interface MapLayerState {
  id: string;
  sourceId: string;
  visible: boolean;
  data?: any;
}

/** 
 * Strategic Map Engine
 * Manages the lifecycle of MapLibre layers and sources to ensure 
 * React state is always in sync with GPU-rendered tactical data.
 */
export class MapEngine {
  private map: maplibregl.Map | null = null;
  private ready = false;

  constructor(map?: maplibregl.Map) {
    if (map) this.map = map;
  }

  setMap(map: maplibregl.Map) {
    this.map = map;
    this.ready = !!map.isStyleLoaded();
  }

  setReady(isReady: boolean) {
    this.ready = isReady;
    if (!isReady) this.map = null; // Atomic nullify on not-ready
  }

  /**
   * Syncs a single layer category's visibility.
   * Efficiently toggles all sub-layers associated with a feature.
   */
  syncLayerVisibility(layerIds: string[], visible: boolean) {
    const map = this.map;
    if (!map || !this.ready) return;
    
    const visibility = visible ? 'visible' : 'none';
    layerIds.forEach(id => {
      try {
        if (map.getLayer(id)) {
          map.setLayoutProperty(id, 'visibility', visibility);
        }
      } catch (e) {
        console.warn(`[MapEngine] Layer ${id} sync failed`, e);
      }
    });
  }

  /**
   * Syncs data for a specific source.
   */
  syncSourceData(sourceId: string, data: any) {
    const map = this.map;
    if (!map || !this.ready) return;
    
    try {
      // Final guard: Ensure Map is in a state where getSource exists and can be called
      if (typeof map.getSource !== 'function') return;

      const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
      if (source && data) {
        source.setData(data);
      }
    } catch (e) {
      console.warn(`[MapEngine] Source ${sourceId} data sync failed`, e);
    }
  }

  /**
   * Atomic update for multiple layers and sources.
   */
  batchSync(layers: Record<string, string[]>, activeStates: Record<string, boolean>, sourceData: Record<string, any>) {
    if (!this.map || !this.ready) return;

    // 1. Sync Visibilities
    Object.entries(layers).forEach(([key, ids]) => {
      this.syncLayerVisibility(ids, !!activeStates[key]);
    });

    // 2. Sync Data
    Object.entries(sourceData).forEach(([sourceId, data]) => {
      this.syncSourceData(sourceId, data);
    });
  }
}

/**
 * React Hook: useMapSync
 * Provides a reactive interface to the MapEngine.
 */
export function useMapSync(map: maplibregl.Map | null, isReady: boolean) {
  const engineRef = useRef<MapEngine>(new MapEngine());

  useEffect(() => {
    if (map) {
      engineRef.current.setMap(map);
      engineRef.current.setReady(isReady);
    } else {
      engineRef.current.setReady(false);
    }
  }, [map, isReady]);

  const syncLayers = useCallback((layerMap: Record<string, string[]>, activeLayers: Record<string, boolean>) => {
    if (engineRef.current) {
        engineRef.current.batchSync(layerMap, activeLayers, {});
    }
  }, []);

  const updateSource = useCallback((sourceId: string, data: any) => {
    if (engineRef.current) {
        engineRef.current.syncSourceData(sourceId, data);
    }
  }, []);

  return {
    engine: engineRef.current,
    syncLayers,
    updateSource
  };
}
