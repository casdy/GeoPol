import Parser from 'rss-parser';
import { getAggregatedIntelligence } from './api';
import { getRedisClient } from './redis';
import { Article } from './types';

const parser = new Parser();

const OSINT_Feeds = [
    { url: 'https://www.gdacs.org/xml/rss_24h.xml', source: 'GDACS' },
    { url: 'https://reliefweb.int/updates/rss.xml', source: 'ReliefWeb' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World' }
];

export async function fetchRawData() {
    console.log("[ingestor] Starting global data capture...");
    
    // 1. Fetch Aggregated News
    const newsData = await getAggregatedIntelligence({ 
        query: "geopolitics OR international relations OR security OR conflict",
        isCrisisMode: false,
        timeRange: '24h'
    });
    
    // 1.5 Fetch Required OSINT feeds
    const osintArticles = await Promise.all(
        OSINT_Feeds.map(async (feed) => {
            try {
                const parsed = await parser.parseURL(feed.url);
                return (parsed.items || []).map((item: any) => ({
                    id: item.guid || item.link || Math.random().toString(),
                    title: item.title || 'Unknown Issue',
                    summary: item.contentSnippet || item.content || '',
                    description: item.contentSnippet || item.content || '',
                    url: item.link || feed.url,
                    source: feed.source,
                    domain: new URL(feed.url).hostname,
                    publishedAt: item.pubDate || new Date().toISOString(),
                    tags: ['OSINT', feed.source],
                    biasMeta: {
                        sourceReliability: 'unknown',
                        ownershipType: 'unknown',
                        countryOfOrigin: 'unknown',
                        geopoliticalAlignment: 'unknown',
                        sensationalismScore: 50,
                        emotionallyLoadedLanguage: false
                    }
                } as Article));
            } catch (e) {
                console.error(`[ingestor] Failed to fetch OSINT feed ${feed.source}:`, e);
                return [];
            }
        })
    );
    
    const combinedNews = [...osintArticles.flat(), ...newsData.news];

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
        news: combinedNews,
        nasa: nasaEvents,
        usgs: usgsData,
        flights: flightCount,
        timestamp: new Date().toISOString()
    };

    // Save Row Ingest to KV
    const redis = await getRedisClient();
    await redis.set('fusion_raw_ingest', JSON.stringify(payload));
    console.log(`[ingestor] Capture complete. Saved ${payload.news.length} articles and ${payload.nasa.length} events.`);

    return payload;
}
