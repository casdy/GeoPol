'use server';

import { PulseItem, Region, FetchOptions } from './types';

const NEWS_API_URL = 'https://newsapi.org/v2/everything';

// Keyword strategies for regions
const REGION_KEYWORDS: Record<Region, string> = {
    'Global': 'geopolitics OR "foreign policy" OR "Security Council" OR "International Relations"',
    'Middle East': 'Israel OR Gaza OR Iran OR "Middle East" OR Syria OR Yemen OR "Saudi Arabia"',
    'Eastern Europe': 'Ukraine OR Russia OR NATO OR "Eastern Europe" OR Belarus OR Baltics',
    'Asia Pacific': 'China OR Taiwan OR "South China Sea" OR "North Korea" OR Japan OR Philippines',
    'Americas': '"United States" OR Brazil OR Venezuela OR NAFTA OR "Latin America" OR Mexico',
    'Africa': 'Sudan OR Congo OR "South Africa" OR Niger OR Ethiopia OR "Horn of Africa"',
    'Arctic': 'Arctic OR "Polar Region" OR "Ice Melt" OR "Northern Sea Route" OR Greenland',
    'South Asia': 'India OR Pakistan OR Afghanistan OR Kashmir OR Bangladesh',
    'Central Asia': 'Kazakhstan OR Uzbekistan OR Kyrgyzstan OR Tajikistan OR Turkmenistan',
    'Latin America': 'Brazil OR Argentina OR Venezuela OR Colombia OR "Latin America"',
};

// Expanded Mock Data Generator
const generateMockData = (): PulseItem[] => { // Realistic fallback data when API quota is exceeded
    const headlines = [
        { title: "Global energy summit concludes with new carbon tax agreement", region: 'Global' },
        { title: "Tensions rise in South China Sea as naval exercises begin", region: 'Asia Pacific' },
        { title: "European Union announces new trade sanctions pacakge", region: 'Eastern Europe' },
        { title: "Cybersecurity firm detects massive botnet targeting critical infrastructure", region: 'Global' },
        { title: "Middle East peace talks show tentative signs of progress", region: 'Middle East' },
        { title: "Satellite imagery reveals new military construction in Arctic region", region: 'Arctic' },
        { title: "OPEC+ decides to maintain current oil output levels despite pressure", region: 'Middle East' },
        { title: "Tech giants testify before Congress on AI safety regulations", region: 'Americas' },
        { title: "Rare earth mineral discovery in Africa sparks geopolitical interest", region: 'Africa' },
        { title: "NATO conducts large-scale joint operations drill in Eastern Europe", region: 'Eastern Europe' },
        { title: "Food security crisis looms as grain deal negotiations stall", region: 'Global' },
        { title: "Semiconductor supply chain diversification accelerates across Asia", region: 'Asia Pacific' },
        { title: "Diplomatic row escalates over border dispute in Central Asia", region: 'Central Asia' },
        { title: "UN report warns of accelerating climate migration patterns", region: 'Global' },
        { title: "Space debris collision risks threaten commercial satellite networks", region: 'Global' },
        { title: "Brazil hosts major summit on Amazon preservation efforts", region: 'Latin America' },
        { title: "India launches ambitious new space exploration mission", region: 'South Asia' }
    ];

    const sources = ['Reuters', 'AP News', 'Al Jazeera', 'BBC', 'Bloomberg', 'Foreign Policy'];

    // Mock Content Generator
    const dummyContent = `
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.

        "This is a significant geometric shift involves multiple state actors," said Dr. Elena Vance, a senior analyst at the Institute for Global Policy. "The ramifications will be felt across the entire region for decades to come."

        The summit concluded with a joint statement pledging further cooperation on these critical issues. However, analysts remain skeptical about the implementation timeline given the current geopolitical climate.
    `;

    return headlines.map((item, i) => ({
        id: `mock-${i}`,
        title: item.title,
        source: sources[i % sources.length],
        publishedAt: new Date(Date.now() - (i * 3600000)).toISOString(),
        url: '#',
        type: 'article',
        tags: [item.region, 'Geopolitics'],
        imageUrl: `https://placehold.co/600x400/0f172a/white?text=${encodeURIComponent(item.title.split(' ').slice(0, 3).join('+'))}`,
        description: `Breaking news from ${item.region}: ${item.title}. Experts weigh in on the potential impact as the situation develops.`,
        content: `(Mock Full Text) ${item.title}\n\n${item.region} - ${dummyContent}`
    }));
};

const MOCK_DATA = generateMockData();

export async function fetchPulseData(options: FetchOptions): Promise<PulseItem[]> {
    const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

    // Helper to filter mock data
    const getMockResponse = () => {
        if (!options.region || options.region === 'Global') {
            return MOCK_DATA;
        }
        // Filter by region in tags
        const filtered = MOCK_DATA.filter(item => item.tags.includes(options.region!));
        // If not enough items, pad with Global items to preserve layout
        if (filtered.length < 4) {
            return [...filtered, ...MOCK_DATA.filter(i => i.tags.includes('Global'))];
        }
        return filtered;
    };

    // Return mock data if env var is set or keys are missing
    if (isMockMode) {
        return new Promise((resolve) => setTimeout(() => resolve(getMockResponse()), 800));
    }

    let query = "";
    if (options.isCrisisMode) {
        // CRISIS OVERRIDE: Ignore region, focus on high-impact keywords
        query = '(War OR "Nuclear Alert" OR Invasion OR "Mass Casualties" OR "Military Strike" OR "State of Emergency")';
    } else {
        // Standard Logic
        const keyword = options.region ? REGION_KEYWORDS[options.region] : REGION_KEYWORDS['Global'];

        // SECURITY: Sanitize user input to prevent injection
        const safeQuery = options.query ? options.query.replace(/[<>{}]/g, '').trim() : '';

        query = safeQuery ? `${safeQuery} AND (${keyword})` : keyword;
    }

    try {
        // Use server-side keys (non-NEXT_PUBLIC)
        // Fallback to NEXT_PUBLIC versions if server keys aren't set (for backward compat during migration), but prefer secure ones.
        const newsKey = process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY;

        const newsRes = await fetch(`${NEWS_API_URL}?q=${encodeURIComponent(query)}&apiKey=${newsKey}&language=en&sortBy=publishedAt&pageSize=40`);

        let articles: PulseItem[] = [];

        // Handle News API
        if (newsRes.ok) {
            const newsData = await newsRes.json();
            // Normalize NewsAPI
            articles = (newsData.articles || []).map((art: any, idx: number) => ({
                id: art.url || `art-${idx}`, // Use URL as stable ID
                title: art.title,
                source: art.source.name,
                publishedAt: art.publishedAt,
                url: art.url,
                imageUrl: art.urlToImage,
                type: 'article',
                tags: ['News', options.region || 'Global'],
                description: art.description,
                content: art.content // NewsAPI usually truncates this, but we'll map it anyway
            }));
        } else {
            console.warn("News API failed (likely quota or rate limit), using fallback.");
            return getMockResponse();
        }

        // Merge and sort by date descending
        return articles.sort((a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

        // ... existing code ...
        return articles.sort((a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

        return articles.sort((a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

    } catch (error) {
        console.error("API Fetch Error:", error);
        return getMockResponse(); // Fallback to mock on error
    }
}

// GNews.io Integration
export async function fetchGNews(category: string = 'general', page: number = 1): Promise<PulseItem[]> {
    try {
        const apiKey = process.env.G_NEWS_API;
        if (!apiKey) return [];

        const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=us&page=${page}&max=20&apikey=${apiKey}`;

        const res = await fetch(url, { next: { revalidate: 300 } });
        if (!res.ok) {
            console.warn(`GNews API Error: ${res.statusText}`);
            return [];
        }

        const data = await res.json();
        if (!data.articles) return [];

        return data.articles.map((art: any, idx: number) => ({
            id: art.url || `gnews-${idx}`,
            title: art.title,
            source: art.source.name,
            publishedAt: art.publishedAt,
            url: art.url,
            imageUrl: art.image,
            type: 'article',
            tags: ['NEWS', category.toUpperCase()],
            description: art.description,
            content: art.content
        }));

    } catch (error) {
        console.error("GNews Fetch Error:", error);
        return [];
    }
}

// Weather Integration
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
    5128581, // New York
    2643743, // London
    1850147, // Tokyo
    524901,  // Moscow
    1816670, // Beijing
    292223,  // Dubai
    2950159, // Berlin
    2988507, // Paris
    1880252, // Singapore
    2147714, // Sydney
    360630,  // Cairo
    3435910, // Buenos Aires
];

// Mock Weather Data
const MOCK_WEATHER: WeatherData[] = [
    { id: 1, name: "New York", temp: 12, condition: "Cloudy", humidity: 60, windSpeed: 5.2, feelsLike: 10, description: "overcast clouds", pressure: 1012, country: "US", coordinates: { lat: 40.7, lon: -74.0 } },
    { id: 2, name: "London", temp: 8, condition: "Rain", humidity: 82, windSpeed: 6.5, feelsLike: 5, description: "light rain", pressure: 1008, country: "GB", coordinates: { lat: 51.5, lon: -0.1 } },
    { id: 3, name: "Tokyo", temp: 18, condition: "Clear", humidity: 45, windSpeed: 3.1, feelsLike: 18, description: "clear sky", pressure: 1015, country: "JP", coordinates: { lat: 35.6, lon: 139.7 } },
    { id: 4, name: "Moscow", temp: -2, condition: "Snow", humidity: 70, windSpeed: 4.0, feelsLike: -6, description: "light snow", pressure: 1020, country: "RU", coordinates: { lat: 55.7, lon: 37.6 } },
    { id: 5, name: "Beijing", temp: 15, condition: "Haze", humidity: 55, windSpeed: 2.8, feelsLike: 14, description: "haze", pressure: 1010, country: "CN", coordinates: { lat: 39.9, lon: 116.4 } }
];

export async function fetchWeather(): Promise<WeatherData[]> {
    try {
        const apiKey = process.env.OPEN_WEATHER_API_KEY;
        if (!apiKey) {
            console.warn("Weather API Key missing. Using Mock Data.");
            return MOCK_WEATHER;
        }

        // Shuffle and pick 5
        const shuffled = [...STRATEGIC_CITIES].sort(() => 0.5 - Math.random());
        const selectedIds = shuffled.slice(0, 5).join(',');

        const url = `https://api.openweathermap.org/data/2.5/group?id=${selectedIds}&units=metric&appid=${apiKey}`;

        const res = await fetch(url, { next: { revalidate: 60 } });

        if (!res.ok) {
            console.warn(`Weather API Error: ${res.status} ${res.statusText}. Using Mock Data.`);
            return MOCK_WEATHER;
        }

        const data = await res.json();

        if (!data.list) return MOCK_WEATHER;

        return data.list.map((city: any) => ({
            id: city.id,
            name: city.name,
            temp: Math.round(city.main.temp),
            condition: city.weather[0].main,
            humidity: city.main.humidity,
            windSpeed: city.wind.speed,
            feelsLike: Math.round(city.main.feels_like),
            description: city.weather[0].description,
            pressure: city.main.pressure,
            country: city.sys.country,
            coordinates: city.coord
        }));

    } catch (error) {
        console.error("Weather API Critical Error:", error);
        return MOCK_WEATHER;
    }
}
