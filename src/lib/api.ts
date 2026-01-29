'use server';

import { PulseItem, FetchOptions, Region } from './types';

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

    return headlines.map((item, i) => ({
        id: `mock-${i}`,
        title: item.title,
        source: sources[i % sources.length],
        publishedAt: new Date(Date.now() - (i * 3600000)).toISOString(),
        url: '#',
        type: 'article',
        tags: [item.region, 'Geopolitics'],
        imageUrl: `https://placehold.co/600x400/0f172a/white?text=${encodeURIComponent(item.title.split(' ').slice(0, 3).join('+'))}`
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
                id: `art-${idx}-${Date.now()}`,
                title: art.title,
                source: art.source.name,
                publishedAt: art.publishedAt,
                url: art.url,
                imageUrl: art.urlToImage,
                type: 'article',
                tags: ['News', options.region || 'Global']
            }));
        } else {
            console.warn("News API failed (likely quota or rate limit), using fallback.");
            return getMockResponse();
        }

        // Merge and sort by date descending
        return articles.sort((a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

    } catch (error) {
        console.error("API Fetch Error:", error);
        return getMockResponse(); // Fallback to mock on error
    }
}
