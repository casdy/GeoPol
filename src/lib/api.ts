'use server';

import { Article, Video, BiasMeta, FetchOptions, PulseItem } from './types';

const TIER_1_DOMAINS = [
    "reuters.com",
    "apnews.com",
    "bbc.com",
    "bbc.co.uk",
    "bloomberg.com",
    "aljazeera.com",
    "ft.com",
    "wsj.com",
    "dw.com",
    "france24.com",
    "nikkei.com",
    "theguardian.com"
];

const SOURCE_INTELLIGENCE_PROFILE: Record<string, Partial<BiasMeta>> = {
    "reuters.com": { sourceReliability: "high", ownershipType: "publicly_traded", countryOfOrigin: "UK", geopoliticalAlignment: "western" },
    "apnews.com": { sourceReliability: "high", ownershipType: "private", countryOfOrigin: "USA", geopoliticalAlignment: "western" },
    "bbc.com": { sourceReliability: "high", ownershipType: "state", countryOfOrigin: "UK", geopoliticalAlignment: "western" },
    "bbc.co.uk": { sourceReliability: "high", ownershipType: "state", countryOfOrigin: "UK", geopoliticalAlignment: "western" },
    "bloomberg.com": { sourceReliability: "high", ownershipType: "private", countryOfOrigin: "USA", geopoliticalAlignment: "western" },
    "aljazeera.com": { sourceReliability: "high", ownershipType: "state", countryOfOrigin: "Qatar", geopoliticalAlignment: "non_western" },
    "ft.com": { sourceReliability: "high", ownershipType: "publicly_traded", countryOfOrigin: "UK", geopoliticalAlignment: "western" },
    "wsj.com": { sourceReliability: "medium", ownershipType: "publicly_traded", countryOfOrigin: "USA", geopoliticalAlignment: "western" },
    "dw.com": { sourceReliability: "high", ownershipType: "state", countryOfOrigin: "Germany", geopoliticalAlignment: "western" },
    "france24.com": { sourceReliability: "high", ownershipType: "state", countryOfOrigin: "France", geopoliticalAlignment: "western" },
    "nikkei.com": { sourceReliability: "high", ownershipType: "private", countryOfOrigin: "Japan", geopoliticalAlignment: "western" },
    "theguardian.com": { sourceReliability: "medium", ownershipType: "private", countryOfOrigin: "UK", geopoliticalAlignment: "western" }
};

const SENSATIONAL_WORDS = ["shocking", "explosive", "devastating", "historic", "massive", "catastrophic", "dramatic", "unbelievable"];
const NOISE_CATEGORIES = ["sports", "entertainment", "celebrity", "gossip", "lifestyle", "fashion", "movie", "tv", "music"];

interface AggregationResult {
    news: Article[];
    videos: Video[];
    meta: {
        sourcesQueried: string[];
        totalFetched: number;
        totalAfterDedup: number;
        mode: "monitor" | "crisis";
    };
}

// -------------------------------------------------------------
// UTILITIES
// -------------------------------------------------------------
function isRelevantGeopoliticalArticle(title: string, summary: string): boolean {
    const text = ((title || '') + ' ' + (summary || '')).toLowerCase();

    for (const noise of NOISE_CATEGORIES) {
        const regex = new RegExp(`\\b${noise}\\b`, 'i');
        if (regex.test(text)) {
            return false;
        }
    }
    return true;
}

function calculateSimilarity(str1: string, str2: string): number {
    const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
    const words1 = new Set(normalize(str1).split(" "));
    const words2 = new Set(normalize(str2).split(" "));

    const stopwords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for"]);
    const filterStopwords = (set: Set<string>) => new Set([...set].filter(x => !stopwords.has(x) && x.length > 2));

    const clean1 = filterStopwords(words1);
    const clean2 = filterStopwords(words2);

    if (clean1.size === 0 && clean2.size === 0) return 1;
    if (clean1.size === 0 || clean2.size === 0) return 0;

    const intersection = new Set([...clean1].filter(x => clean2.has(x)));
    const union = new Set([...clean1, ...clean2]);

    return intersection.size / union.size;
}

function enrichWithBiasMetadata(article: Omit<Article, 'biasMeta'>): Article {
    const profile = SOURCE_INTELLIGENCE_PROFILE[article.domain] || {
        sourceReliability: "unknown",
        ownershipType: "unknown",
        countryOfOrigin: "unknown",
        geopoliticalAlignment: "unknown"
    };

    const text = ((article.title || '') + ' ' + (article.description || '')).toLowerCase();
    const words = text.split(/\s+/);
    let matchedWords = 0;
    for (const w of words) {
        if (SENSATIONAL_WORDS.includes(w.replace(/[^\w]/g, ''))) {
            matchedWords++;
        }
    }
    let sensationalismScore = words.length > 0 ? (matchedWords / words.length) * 10 : 0;
    sensationalismScore = Math.min(Math.max(sensationalismScore, 0), 1);

    const hasExcessiveExclamations = (article.title?.match(/!/g) || []).length >= 2;
    const hasAllCaps = /\b[A-Z]{5,}\b/.test(article.title || '');
    const emotionallyLoadedLanguage = hasExcessiveExclamations || hasAllCaps || matchedWords > 2;

    return {
        ...article,
        biasMeta: {
            sourceReliability: profile.sourceReliability as any,
            ownershipType: profile.ownershipType as any,
            countryOfOrigin: profile.countryOfOrigin as any,
            geopoliticalAlignment: profile.geopoliticalAlignment as any,
            sensationalismScore,
            emotionallyLoadedLanguage
        }
    } as Article;
}

function extractDomain(url: string): string {
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace('www.', '');
    } catch {
        return 'unknown';
    }
}

// -------------------------------------------------------------
// PROVIDERS (QUAD-CORE)
// -------------------------------------------------------------

async function fetchGNews(keyword: string, isCrisisMode: boolean): Promise<PulseItem[]> {
    const key = process.env.GNEWS_API_KEY || process.env.G_NEWS_API;
    if (!key) return [];

    try {
        const res = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(keyword)}&lang=en&max=20&apikey=${key}`, {
            next: { revalidate: isCrisisMode ? 30 : 3600 }
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error("GNews API Response:", errorText);
            throw new Error(`GNews Error: ${res.statusText}`);
        }
        const data = await res.json();
        return (data.articles || []).map((art: any, i: number) => ({
            id: `gnews-${i}-${Date.now()}`,
            title: art.title || '',
            url: art.url || '',
            source: art.source?.name || 'GNews',
            publishedAt: art.publishedAt || new Date().toISOString(),
            summary: art.description || '',
            imageUrl: art.image || '/images/default-radar-placeholder.jpg',
        }));
    } catch (e) {
        console.warn("fetchGNews failed:", e);
        return [];
    }
}

async function fetchNewsApi(keyword: string, isCrisisMode: boolean): Promise<PulseItem[]> {
    const key = process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY;
    if (!key) return [];

    try {
        const res = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&language=en&sortBy=publishedAt&pageSize=20`, {
            headers: { 'X-Api-Key': key },
            next: { revalidate: isCrisisMode ? 30 : 3600 }
        });
        if (!res.ok) throw new Error(`NewsAPI Error: ${res.statusText}`);
        const data = await res.json();
        return (data.articles || []).map((art: any, i: number) => ({
            id: `newsapi-${i}-${Date.now()}`,
            title: art.title || '',
            url: art.url || '',
            source: art.source?.name || 'NewsAPI',
            publishedAt: art.publishedAt || new Date().toISOString(),
            summary: art.description || '',
            imageUrl: art.urlToImage || '/images/default-radar-placeholder.jpg',
        }));
    } catch (e) {
        console.warn("fetchNewsApi failed:", e);
        return [];
    }
}

async function fetchWorldNews(keyword: string, isCrisisMode: boolean): Promise<PulseItem[]> {
    const key = process.env.WORLD_NEWS_API_KEY;
    if (!key) return [];

    try {
        const res = await fetch(`https://api.worldnewsapi.com/search-news?text=${encodeURIComponent(keyword)}&language=en&number=20`, {
            headers: { 'x-api-key': key },
            next: { revalidate: isCrisisMode ? 30 : 3600 }
        });
        if (!res.ok) throw new Error(`World News API Error: ${res.statusText}`);
        const data = await res.json();
        return (data.news || []).map((art: any) => ({
            id: art.id?.toString() || `worldnews-${Date.now()}-${Math.random()}`,
            title: art.title || '',
            url: art.url || '',
            source: art.authors?.[0] || 'World News API',
            publishedAt: art.publish_date || new Date().toISOString(),
            summary: art.text || '',
            imageUrl: art.image || '/images/default-radar-placeholder.jpg',
            sentiment: art.sentiment
        }));
    } catch (e) {
        console.warn("fetchWorldNews failed:", e);
        return [];
    }
}

async function fetchTheNewsApi(keyword: string, isCrisisMode: boolean): Promise<PulseItem[]> {
    const key = process.env.THENEWSAPI_KEY;
    if (!key) return [];

    try {
        const res = await fetch(`https://api.thenewsapi.com/v1/news/all?api_token=${key}&search=${encodeURIComponent(keyword)}&language=en&limit=20`, {
            next: { revalidate: isCrisisMode ? 30 : 3600 }
        });
        if (!res.ok) throw new Error(`The News API Error: ${res.statusText}`);
        const data = await res.json();
        return (data.data || []).map((art: any) => ({
            id: art.uuid || `thenewsapi-${Date.now()}-${Math.random()}`,
            title: art.title || '',
            url: art.url || '',
            source: art.source || 'The News API',
            publishedAt: art.published_at || new Date().toISOString(),
            summary: art.description || art.snippet || '',
            imageUrl: art.image_url || '/images/default-radar-placeholder.jpg',
        }));
    } catch (e) {
        console.warn("fetchTheNewsApi failed:", e);
        return [];
    }
}

// -------------------------------------------------------------
// MAIN AGGREGATION ENGINE (V3)
// -------------------------------------------------------------

export async function getAggregatedNews(keyword: string, isCrisisMode: boolean = false): Promise<PulseItem[]> {
    const promises = [
        fetchNewsApi(keyword, isCrisisMode),
        fetchGNews(keyword, isCrisisMode),
        fetchWorldNews(keyword, isCrisisMode),
        fetchTheNewsApi(keyword, isCrisisMode)
    ];

    const results = await Promise.allSettled(promises);
    let allItems: PulseItem[] = [];

    results.forEach((result) => {
        if (result.status === 'fulfilled') {
            allItems = [...allItems, ...result.value];
        } else {
            console.error(`Provider failed:`, result.reason);
        }
    });

    // Smart Filtering
    allItems = allItems.filter(item => isRelevantGeopoliticalArticle(item.title, item.summary));

    // Deduplicate Engine based on title similarity and exact URL match
    const unique: PulseItem[] = [];
    const seenUrls = new Set<string>();

    for (const item of allItems) {
        if (!item.url || seenUrls.has(item.url)) continue;
        
        let isDuplicate = false;
        for (let i = 0; i < unique.length; i++) {
            const existing = unique[i];
            const similarity = calculateSimilarity(item.title, existing.title);
            if (similarity >= 0.75) {
                isDuplicate = true;
                break;
            }
        }

        if (!isDuplicate) {
            seenUrls.add(item.url);
            unique.push(item);
        }
    }

    // Sort by latest published date
    unique.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return unique;
}

export async function getAggregatedIntelligence(options: FetchOptions): Promise<AggregationResult> {
    const isCrisisMode = !!options.isCrisisMode;

    let baseQuery = options.query ? options.query : "geopolitics OR international relations OR security";
    if (isCrisisMode && !options.query) {
        baseQuery = "war OR health crisis OR food OR economy";
    }
    if (options.category && options.category !== 'general') {
        baseQuery += ` ${options.category}`;
    }

    const pulseItems = await getAggregatedNews(baseQuery, isCrisisMode);

    // Map the new PulseItem structure back to the legacy Article structure
    const mappedArticles: Omit<Article, 'biasMeta'>[] = pulseItems.map(p => ({
        id: p.id,
        title: p.title,
        description: p.summary,
        url: p.url,
        source: p.source,
        domain: extractDomain(p.url),
        publishedAt: p.publishedAt,
        image: p.imageUrl === '/images/default-radar-placeholder.jpg' ? undefined : p.imageUrl,
        tags: ['NEWS', (options.category && options.category !== 'general') ? options.category.toUpperCase() : (options.region || 'Global').toUpperCase()],
        apiSource: 'Aggregator V3'
    }));

    // Enrich
    const deduplicatedArticles: Article[] = mappedArticles.map(enrichWithBiasMetadata);

    if (deduplicatedArticles.length === 0) {
        const mockDomain = "reuters.com";
        deduplicatedArticles.push(enrichWithBiasMetadata({
            id: 'mock-1',
            title: "Global Intelligence Feed Offline or Limited",
            description: "No secure signals received from integrated intelligence providers. Utilizing offline backups.",
            url: "#",
            source: "System",
            domain: mockDomain,
            publishedAt: new Date().toISOString(),
            tags: ["System Warning"]
        }));
    }

    return {
        news: deduplicatedArticles,
        videos: [],
        meta: {
            sourcesQueried: ['NewsAPI', 'GNews', 'World News API', 'The News API'],
            totalFetched: pulseItems.length,
            totalAfterDedup: deduplicatedArticles.length,
            mode: isCrisisMode ? 'crisis' : 'monitor'
        }
    };
}


// -------------------------------------------------------------
// EXISTING WEATHER INTEGRATION
// -------------------------------------------------------------
export interface WeatherData {
    id: number;
    name: string;
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    feelsLike: number;
    description: string;
    pressure: number;
    country: string;
    coordinates: { lat: number; lon: number };
}

const STRATEGIC_CITIES = [
    { name: "New York", country: "US", lat: 40.71, lon: -74.00 },
    { name: "London", country: "GB", lat: 51.50, lon: -0.12 },
    { name: "Tokyo", country: "JP", lat: 35.68, lon: 139.75 },
    { name: "Moscow", country: "RU", lat: 55.75, lon: 37.61 },
    { name: "Beijing", country: "CN", lat: 39.90, lon: 116.40 },
    { name: "Dubai", country: "AE", lat: 25.20, lon: 55.27 },
    { name: "Berlin", country: "DE", lat: 52.52, lon: 13.40 },
    { name: "Paris", country: "FR", lat: 48.85, lon: 2.35 },
    { name: "Singapore", country: "SG", lat: 1.28, lon: 103.85 },
    { name: "Sydney", country: "AU", lat: -33.86, lon: 151.20 },
    { name: "Cairo", country: "EG", lat: 30.04, lon: 31.23 },
    { name: "Buenos Aires", country: "AR", lat: -34.60, lon: -58.38 },
    { name: "Istanbul", country: "TR", lat: 41.00, lon: 28.97 },
    { name: "Mumbai", country: "IN", lat: 19.07, lon: 72.87 },
    { name: "Seoul", country: "KR", lat: 37.56, lon: 126.97 },
    { name: "Rio de Janeiro", country: "BR", lat: -22.90, lon: -43.17 },
    { name: "Lagos", country: "NG", lat: 6.45, lon: 3.39 }
];

function getWeatherCondition(code: number): { condition: string; description: string } {
    if (code === 0) return { condition: 'Clear', description: 'clear sky' };
    if ([1, 2, 3].includes(code)) return { condition: 'Cloudy', description: 'partly cloudy to overcast' };
    if ([45, 48].includes(code)) return { condition: 'Fog', description: 'foggy conditions' };
    if ([51, 53, 55, 56, 57].includes(code)) return { condition: 'Drizzle', description: 'light drizzle' };
    if ([61, 63, 65, 66, 67].includes(code)) return { condition: 'Rain', description: 'rainy conditions' };
    if ([71, 73, 75, 77].includes(code)) return { condition: 'Snow', description: 'snow fall' };
    if ([80, 81, 82].includes(code)) return { condition: 'Showers', description: 'rain showers' };
    if ([95, 96, 99].includes(code)) return { condition: 'Storm', description: 'thunderstorms' };
    return { condition: 'Unknown', description: 'variable' };
}

export async function fetchWeather(): Promise<WeatherData[]> {
    try {
        const shuffled = [...STRATEGIC_CITIES].sort(() => 0.5 - Math.random());
        const selectedCities = shuffled.slice(0, 10);

        const weatherPromises = selectedCities.map(async (city) => {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m`;
            
            let attempts = 0;
            const maxAttempts = 3;
            
            while (attempts < maxAttempts) {
                try {
                    const res = await fetch(url, { next: { revalidate: 600 } });
                    if (!res.ok) throw new Error("HTTP error");
                    const data = await res.json();
                    
                    const { condition, description } = getWeatherCondition(data.current.weather_code);

                    return {
                        id: Math.floor(Math.random() * 100000),
                        name: city.name,
                        temp: Math.round(data.current.temperature_2m),
                        condition: condition,
                        humidity: data.current.relative_humidity_2m,
                        windSpeed: parseFloat((data.current.wind_speed_10m / 3.6).toFixed(1)),
                        feelsLike: Math.round(data.current.apparent_temperature),
                        description: description,
                        pressure: data.current.surface_pressure,
                        country: city.country,
                        coordinates: { lat: city.lat, lon: city.lon }
                    } as WeatherData;
                } catch (err) {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        // Return a graceful mock for this specific city if the fetch fails after 3 tries
                        return {
                            id: Math.floor(Math.random() * 100000),
                            name: city.name,
                            temp: 15,
                            condition: 'Clear',
                            humidity: 50,
                            windSpeed: 3.5,
                            feelsLike: 14,
                            description: 'clear sky (cached)',
                            pressure: 1012,
                            country: city.country,
                            coordinates: { lat: city.lat, lon: city.lon }
                        } as WeatherData;
                    }
                    // Wait before retrying (exponential backoff: 500ms, 1000ms...)
                    await new Promise(resolve => setTimeout(resolve, attempts * 500));
                }
            }
            return null;
        });

        const results = await Promise.all(weatherPromises);
        return results.filter((w): w is WeatherData => w !== null);

    } catch (error) {
        return [];
    }
}
