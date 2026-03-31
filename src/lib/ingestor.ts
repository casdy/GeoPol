import { kv } from '@vercel/kv';
import { getAggregatedIntelligence } from './api';

export async function fetchRawData() {
    console.log("[ingestor] Starting global data capture...");
    
    // 1. Fetch News
    const newsData = await getAggregatedIntelligence({ 
        query: "geopolitics OR international relations OR security OR conflict",
        isCrisisMode: false,
        timeRange: '24h'
    });

    // 2. Fetch NASA EONET
    let nasaEvents = [];
    try {
        const res = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?days=7', {
            next: { revalidate: 3600 }
        });
        if (res.ok) {
            const data = await res.json();
            nasaEvents = data.events || [];
        }
    } catch (e) {
        console.error("[ingestor] NASA fetch failed", e);
    }

    // 3. Fetch USGS
    let usgsData = [];
    try {
        const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson', {
            next: { revalidate: 300 }
        });
        if (res.ok) {
            const data = await res.json();
            usgsData = data.features || [];
        }
    } catch (e) {
        console.error("[ingestor] USGS fetch failed", e);
    }

    // 4. Fetch OpenSky (Flight Count)
    let flightCount = 0;
    try {
        const res = await fetch('https://opensky-network.org/api/states/all', {
            next: { revalidate: 300 }
        });
        if (res.ok) {
            const data = await res.json();
            flightCount = (data.states || []).length;
        }
    } catch (e) {
        console.error("[ingestor] OpenSky fetch failed", e);
    }

    const payload = {
        news: newsData.news,
        nasa: nasaEvents,
        usgs: usgsData,
        flights: flightCount,
        timestamp: new Date().toISOString()
    };

    // Save Row Ingest to KV
    await kv.set('fusion_raw_ingest', payload);
    console.log(`[ingestor] Capture complete. Saved ${payload.news.length} articles and ${payload.nasa.length} events.`);

    return payload;
}
