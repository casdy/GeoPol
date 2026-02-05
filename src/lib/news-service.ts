import { PulseItem } from './types';

// Configuration
const CONFIG = {
    PROVIDERS: {
        NEWS_API: {
            URL: 'https://newsapi.org/v2/everything',
            KEY: process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY
        },
        GNEWS: {
            URL: 'https://gnews.io/api/v4/search',
            KEY: process.env.G_NEWS_API
        }
    },
    // Mock Data Generator for absolute fallback
    MOCK_FALLBACK: [] as PulseItem[]
};

/**
 * Standardizes the response from NewsAPI to our PulseItem format
 */
function normalizeNewsAPI(data: any): PulseItem[] {
    if (!data.articles) return [];
    return data.articles.map((art: any, idx: number) => ({
        id: art.url || `newsapi-${idx}`,
        title: art.title,
        source: art.source?.name || 'NewsAPI',
        publishedAt: art.publishedAt,
        url: art.url,
        imageUrl: art.urlToImage,
        type: 'article',
        tags: ['NewsAPI', 'Global'],
        description: art.description,
        content: art.content
    }));
}

/**
 * Standardizes the response from GNews to our PulseItem format
 */
function normalizeGNews(data: any): PulseItem[] {
    if (!data.articles) return [];
    return data.articles.map((art: any, idx: number) => ({
        id: art.url || `gnews-${idx}`,
        title: art.title,
        source: art.source?.name || 'GNews',
        publishedAt: art.publishedAt,
        url: art.url,
        imageUrl: art.image,
        type: 'article',
        tags: ['GNews', 'Global'],
        description: art.description,
        content: art.content
    }));
}

// --- Provider Implementations ---

async function fetchFromNewsAPI(query: string): Promise<PulseItem[]> {
    const apiKey = CONFIG.PROVIDERS.NEWS_API.KEY;
    if (!apiKey) throw new Error("NewsAPI Key missing");

    const url = `${CONFIG.PROVIDERS.NEWS_API.URL}?q=${encodeURIComponent(query)}&apiKey=${apiKey}&language=en&sortBy=publishedAt&pageSize=20`;

    const res = await fetch(url);

    // 429 = Too Many Requests, 401 = Unauthorized (maybe quota)
    if (res.status === 429 || res.status === 402) {
        throw new Error(`Provider Limit Reached: ${res.status}`);
    }

    if (!res.ok) {
        throw new Error(`NewsAPI Error: ${res.statusText}`);
    }

    const data = await res.json();
    return normalizeNewsAPI(data);
}

async function fetchFromGNews(query: string): Promise<PulseItem[]> {
    const apiKey = CONFIG.PROVIDERS.GNEWS.KEY;
    if (!apiKey) throw new Error("GNews Key missing");

    // GNews Search Endpoint
    const url = `${CONFIG.PROVIDERS.GNEWS.URL}?q=${encodeURIComponent(query)}&apikey=${apiKey}&lang=en&max=10`;

    const res = await fetch(url);

    if (res.status === 429) {
        throw new Error(`Provider Limit Reached: ${res.status}`);
    }

    if (!res.ok) {
        throw new Error(`GNews Error: ${res.statusText}`);
    }

    const data = await res.json();
    return normalizeGNews(data);
}

// --- Main Rotation Logic ---

/**
 * Smart Rotation Fetcher
 * Attempts to fetch from Primary Provider. If quota exceeded (429/402), rotates to Secondary Provider.
 */
export async function fetchNewsWithRotation(query: string): Promise<PulseItem[]> {
    console.log(`[NewsService] Fetching news for query: "${query}"...`);

    try {
        // 1. Try Primary Provider (NewsAPI)
        console.log('[NewsService] Attempting Provider A (NewsAPI)...');
        return await fetchFromNewsAPI(query);

    } catch (error: any) {

        // Check if error is related to limits (429 Too Many Requests, 402 Payment Required/Quota)
        // Or if it's a generic "Provider Limit Reached" error we threw
        const isLimitError = error.message.includes('Limit Reached') || error.message.includes('429') || error.message.includes('402');

        if (isLimitError) {
            console.warn('[NewsService] Provider A limit reached/failed. Switching to Provider B (GNews)...');

            try {
                // 2. Try Secondary Provider (GNews)
                return await fetchFromGNews(query);
            } catch (secondaryError) {
                console.error('[NewsService] All providers failed.', secondaryError);
                return []; // Or throw, or return mock data
            }
        }

        // If it's a different error (e.g. network), rethrow or handle gracefully
        console.error('[NewsService] Unexpected error in primary provider:', error);
        return [];
    }
}
