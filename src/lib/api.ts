'use server';

import { Article, Video, BiasMeta, FetchOptions } from './types';

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

export interface AggregationResult {
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
function isRelevantGeopoliticalArticle(article: Partial<Article>): boolean {
    const text = ((article.title || '') + ' ' + (article.description || '')).toLowerCase();

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

function deduplicateAndCluster(articles: Article[]): Article[] {
    const unique: Article[] = [];

    for (const article of articles) {
        let isDuplicate = false;

        for (let i = 0; i < unique.length; i++) {
            const existing = unique[i];
            const similarity = calculateSimilarity(article.title, existing.title);

            if (similarity >= 0.75) {
                isDuplicate = true;

                const articleTier1 = TIER_1_DOMAINS.includes(article.domain);
                const existingTier1 = TIER_1_DOMAINS.includes(existing.domain);

                if (articleTier1 && !existingTier1) {
                    unique[i] = article; // Replace with higher tier
                } else if (articleTier1 === existingTier1) {
                    const articleDate = new Date(article.publishedAt).getTime();
                    const existingDate = new Date(existing.publishedAt).getTime();
                    if (articleDate < existingDate) {
                        unique[i] = article; // Earliest publish date
                    }
                }
                break;
            }
        }

        if (!isDuplicate) {
            unique.push(article);
        }
    }

    return unique;
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

// -------------------------------------------------------------
// PROVIDERS
// -------------------------------------------------------------

function extractDomain(url: string): string {
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace('www.', '');
    } catch {
        return 'unknown';
    }
}

async function fetchNewsAPI(query: string, isCrisisMode: boolean, category: string, region: string): Promise<Omit<Article, 'biasMeta'>[]> {
    const key = process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY;
    if (!key) throw new Error("Missing NEWS_API_KEY");

    const res = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=30`, {
        headers: { 'X-Api-Key': key },
        next: { revalidate: isCrisisMode ? 30 : 60 }
    });

    if (!res.ok) throw new Error(`NewsAPI Error: ${res.statusText}`);
    const data = await res.json();

    return (data.articles || []).map((art: any, i: number) => ({
        id: `newsapi-${i}-${Date.now()}`,
        title: art.title || '',
        description: art.description || '',
        url: art.url || '',
        source: art.source?.name || 'Unknown',
        domain: extractDomain(art.url),
        publishedAt: art.publishedAt || new Date().toISOString(),
        image: art.urlToImage,
        tags: ['NEWS', category && category !== 'general' ? category.toUpperCase() : region.toUpperCase()]
    }));
}

async function fetchGNews(query: string, isCrisisMode: boolean, category: string, region: string): Promise<Omit<Article, 'biasMeta'>[]> {
    const key = process.env.GNEWS_API_KEY || process.env.G_NEWS_API;
    if (!key) throw new Error("Missing GNEWS_API_KEY");

    const res = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=30&apikey=${key}`, {
        next: { revalidate: isCrisisMode ? 30 : 60 }
    });

    if (!res.ok) throw new Error(`GNews Error: ${res.statusText}`);
    const data = await res.json();

    return (data.articles || []).map((art: any, i: number) => ({
        id: `gnews-${i}-${Date.now()}`,
        title: art.title || '',
        description: art.description || '',
        url: art.url || '',
        source: art.source?.name || 'Unknown',
        domain: extractDomain(art.url),
        publishedAt: art.publishedAt || new Date().toISOString(),
        image: art.image,
        tags: ['NEWS', category && category !== 'general' ? category.toUpperCase() : region.toUpperCase()]
    }));
}

async function fetchPerigon(query: string, isCrisisMode: boolean, category: string, region: string): Promise<Omit<Article, 'biasMeta'>[]> {
    const key = process.env.PERIGON_API_KEY || process.env.PERIGON_KEY;
    if (!key) throw new Error("Missing PERIGON_API_KEY");

    const res = await fetch(`https://api.perigon.io/v1/articles?q=${encodeURIComponent(query)}&apiKey=${key}&size=20`, {
        next: { revalidate: isCrisisMode ? 30 : 60 }
    });

    if (!res.ok) throw new Error(`Perigon Error: ${res.statusText}`);
    const data = await res.json();

    return (data.articles || []).map((art: any, i: number) => ({
        id: `perigon-${art.id || i}-${Date.now()}`,
        title: art.title || '',
        description: art.summary || art.description || '',
        url: art.url || '',
        source: art.source?.domain || 'Unknown',
        domain: extractDomain(art.url),
        publishedAt: art.pubDate || new Date().toISOString(),
        image: art.imageUrl,
        tags: ['NEWS', category && category !== 'general' ? category.toUpperCase() : region.toUpperCase()]
    }));
}

// -------------------------------------------------------------
// MAIN AGGREGATION ENGINE
// -------------------------------------------------------------

export async function getAggregatedIntelligence(options: FetchOptions): Promise<AggregationResult> {
    const isCrisisMode = !!options.isCrisisMode;
    const sourcesQueried: string[] = [];

    let baseQuery = options.query ? options.query : "geopolitics OR international relations OR security";
    if (isCrisisMode && !options.query) {
        baseQuery = "War OR Strike OR Invasion OR Emergency OR Security";
    }
    if (options.category && options.category !== 'general') {
        baseQuery += ` ${options.category}`;
    }

    const promises: Promise<Omit<Article, 'biasMeta'>[]>[] = [];
    const cat = options.category || 'general';
    const reg = options.region || 'Global';

    if (process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY) {
        sourcesQueried.push('NewsAPI');
        promises.push(fetchNewsAPI(baseQuery, isCrisisMode, cat, reg));
    }
    if (process.env.GNEWS_API_KEY || process.env.G_NEWS_API) {
        sourcesQueried.push('GNews');
        promises.push(fetchGNews(baseQuery, isCrisisMode, cat, reg));
    }
    if (process.env.PERIGON_API_KEY || process.env.PERIGON_KEY) {
        sourcesQueried.push('Perigon');
        promises.push(fetchPerigon(baseQuery, isCrisisMode, cat, reg));
    }

    // Promise.allSettled ensures resilience if one provider fails
    const results = await Promise.allSettled(promises);

    let rawArticles: Omit<Article, 'biasMeta'>[] = [];

    results.forEach((result) => {
        if (result.status === 'fulfilled') {
            rawArticles = [...rawArticles, ...result.value];
        } else {
            console.error(`Provider failed:`, result.reason);
        }
    });

    const totalFetched = rawArticles.length;

    // 1. Smart Filtering
    let filteredArticles = rawArticles.filter(art => {
        if (!isRelevantGeopoliticalArticle(art)) return false;
        return true;
    });

    // 2. Bias Enrichment mapping
    let enrichedArticles: Article[] = filteredArticles.map(enrichWithBiasMetadata);

    // 3. Deduplication Engine
    let deduplicatedArticles = deduplicateAndCluster(enrichedArticles);

    // Sort by latest published date
    deduplicatedArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    if (deduplicatedArticles.length === 0) {
        const mockDomain = "reuters.com";
        deduplicatedArticles.push(enrichWithBiasMetadata({
            id: 'mock-1',
            title: "Global Intelligence Feed Offline or Limited",
            description: "No secure signals received from integrated intelligence providers. Utilizing offline backups.",
            url: "#",
            source: "Reuters",
            domain: mockDomain,
            publishedAt: new Date().toISOString(),
            tags: ["System Warning"]
        }));
    }

    return {
        news: deduplicatedArticles,
        videos: [],
        meta: {
            sourcesQueried,
            totalFetched,
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
    "New York", "London", "Tokyo", "Moscow", "Beijing", "Dubai", "Berlin", "Paris",
    "Singapore", "Sydney", "Cairo", "Buenos Aires", "Istanbul", "Mumbai", "Seoul",
    "Rio de Janeiro", "Lagos"
];

const MOCK_WEATHER: WeatherData[] = [
    { id: 1, name: "New York", temp: 12, condition: "Cloudy", humidity: 60, windSpeed: 5.2, feelsLike: 10, description: "overcast clouds", pressure: 1012, country: "US", coordinates: { lat: 40.7, lon: -74.0 } },
    { id: 2, name: "London", temp: 8, condition: "Rain", humidity: 82, windSpeed: 6.5, feelsLike: 5, description: "light rain", pressure: 1008, country: "GB", coordinates: { lat: 51.5, lon: -0.1 } },
];

export async function fetchWeather(): Promise<WeatherData[]> {
    try {
        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
            return MOCK_WEATHER;
        }

        const shuffled = [...STRATEGIC_CITIES].sort(() => 0.5 - Math.random());
        const selectedCities = shuffled.slice(0, 10);

        const weatherPromises = selectedCities.map(async (city) => {
            const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;
            try {
                const res = await fetch(url, { next: { revalidate: 600 } });
                if (!res.ok) return null;
                const data = await res.json();
                
                return {
                    id: Math.floor(Math.random() * 100000),
                    name: data.location.name,
                    temp: Math.round(data.current.temp_c),
                    condition: data.current.condition.text,
                    humidity: data.current.humidity,
                    windSpeed: parseFloat((data.current.wind_kph / 3.6).toFixed(1)),
                    feelsLike: Math.round(data.current.feelslike_c),
                    description: data.current.condition.text.toLowerCase(),
                    pressure: data.current.pressure_mb,
                    country: data.location.country,
                    coordinates: { lat: data.location.lat, lon: data.location.lon }
                } as WeatherData;
            } catch (err) {
                return null;
            }
        });

        const results = await Promise.all(weatherPromises);
        const validResults = results.filter((w): w is WeatherData => w !== null);

        if (validResults.length === 0) return MOCK_WEATHER;
        
        return validResults;

    } catch (error) {
        return MOCK_WEATHER;
    }
}
