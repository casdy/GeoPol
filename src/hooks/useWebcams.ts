'use client';

import { useState, useEffect, useCallback } from 'react';
import { SURVEILLANCE_FEEDS, UnifiedFeed } from '@/lib/surveillance';

export interface Webcam {
  id: string;
  region: string;
  city: string;
  title: string;
  youtubeUrl: string;
  country?: string;
  channelId?: string;
}

const WEBCAM_VERSION = 'v5_deleted_surveillance';
const STORAGE_KEY = 'geopol_surveillance_cams_v4';

export function useWebcams() {
  const [cams, setCams] = useState<Webcam[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Derive default cams from unified dataset (both news and webcams as per user request to 'share same dataset')
  const DEFAULT_CAMS: Webcam[] = SURVEILLANCE_FEEDS.map(f => ({
    id: f.id,
    region: f.region,
    city: f.city,
    title: f.title,
    youtubeUrl: f.youtubeUrl,
    country: f.country,
    channelId: f.channelId
  }));

  useEffect(() => {
    const currentVersion = localStorage.getItem('geopol_webcam_version_v4');
    const stored = localStorage.getItem(STORAGE_KEY);

    if (currentVersion !== WEBCAM_VERSION) {
      setCams(DEFAULT_CAMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CAMS));
      localStorage.setItem('geopol_webcam_version_v4', WEBCAM_VERSION);
    } else if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCams(parsed);
        } else {
          setCams(DEFAULT_CAMS);
        }
      } catch (e) {
        setCams(DEFAULT_CAMS);
      }
    } else {
      setCams(DEFAULT_CAMS);
    }
    setIsLoaded(true);
  }, []);

  const addCam = useCallback((newCam: Omit<Webcam, 'id'>) => {
    const camWithId: Webcam = {
      ...newCam,
      id: `cam-custom-${Date.now()}`
    };
    
    setCams(prev => {
      const updated = [camWithId, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeCam = useCallback((id: string) => {
    setCams(prev => {
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetCams = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCams(DEFAULT_CAMS);
  }, []);

  return {
    ALL_CAMS: cams,
    isLoaded,
    addCam,
    removeCam,
    resetCams
  };
}
