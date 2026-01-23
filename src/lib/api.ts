'use server';

import { PulseItem, FetchOptions, Region } from './types';

const NEWS_API_URL = 'https://newsapi.org/v2/everything';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

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
        "Global energy summit concludes with new carbon tax agreement",
        "Tensions rise in South China Sea as naval exercises begin",
        "European Union announces new trade sanctions pacakge",
        "Cybersecurity firm detects massive botnet targeting critical infrastructure",
        "Middle East peace talks show tentative signs of progress",
        "Satellite imagery reveals new military construction in Arctic region",
        "OPEC+ decides to maintain current oil output levels despite pressure",
        "Tech giants testify before Congress on AI safety regulations",
        "Rare earth mineral discovery in Africa sparks geopolitical interest",
        "NATO conducts large-scale joint operations drill in Eastern Europe",
        "Food security crisis looms as grain deal negotiations stall",
        "Semiconductor supply chain diversification accelerates across Asia",
        "Diplomatic row escalates over border dispute in Central Asia",
        "UN report warns of accelerating climate migration patterns",
        "Space debris collision risks threaten commercial satellite networks"
    ];

    const sources = ['Reuters', 'AP News', 'Al Jazeera', 'BBC', 'Bloomberg', 'Foreign Policy'];

    const baseData: PulseItem[] = [
        {
            id: '1',
            title: 'UN Security Council holds emergency meeting regarding new sanctions',
            source: 'Reuters',
            publishedAt: new Date().toISOString(),
            url: '#',
            type: 'article',
            tags: ['Sanctions', 'Diplomacy'],
            imageUrl: 'https://placehold.co/600x400/1e293b/white?text=UN+Council'
        },
        {
            id: '2',
            title: 'Live: Cyber attacks reported on major energy infrastructure',
            source: 'BBC News',
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            url: '#',
            type: 'video',
            tags: ['Cybersecurity', 'Energy'],
            imageUrl: 'https://placehold.co/600x400/7f1d1d/white?text=Breaking+News'
        }
    ];

    const extraItems: PulseItem[] = headlines.map((title, i) => ({
        id: `mock-${i + 3}`,
        title: title,
        source: sources[i % sources.length],
        publishedAt: new Date(Date.now() - ((i + 1) * 3600000)).toISOString(), // Spread over time
        url: '#',
        type: i % 3 === 0 ? 'video' : 'article', // Mix types
        tags: ['Geopolitics', 'Global'],
        imageUrl: `https://placehold.co/600x400/0f172a/white?text=${encodeURIComponent(title.split(' ').slice(0, 2).join('+'))}`
    }));

    return [...baseData, ...extraItems];
};

const MOCK_DATA = generateMockData();

export async function fetchPulseData(options: FetchOptions): Promise<PulseItem[]> {
    // Return mock data if env var is set or keys are missing
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        return new Promise((resolve) => setTimeout(() => resolve(MOCK_DATA), 800));
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
        const youtubeKey = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

        const [newsRes, videoRes] = await Promise.all([
            fetch(`${NEWS_API_URL}?q=${encodeURIComponent(query)}&apiKey=${newsKey}&language=en&sortBy=publishedAt&pageSize=40`),
            fetch(`${YOUTUBE_API_URL}?part=snippet&q=${encodeURIComponent(query + " news")}&type=video&key=${youtubeKey}&maxResults=12&order=date`)
        ]);

        let articles: PulseItem[] = [];
        let videos: PulseItem[] = [];

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
            articles = MOCK_DATA.filter(i => i.type === 'article');
        }

        // Handle YouTube API
        if (videoRes.ok) {
            const videoData = await videoRes.json();
            // Normalize YouTube API
            videos = (videoData.items || []).map((vid: any) => ({
                id: vid.id.videoId,
                title: vid.snippet.title,
                source: vid.snippet.channelTitle,
                publishedAt: vid.snippet.publishedAt,
                url: `https://www.youtube.com/watch?v=${vid.id.videoId}`,
                imageUrl: vid.snippet.thumbnails.high.url,
                type: 'video',
                tags: ['Video', options.region || 'Global']
            }));
        } else {
            console.warn("YouTube API failed (likely quota), using fallback.");
            videos = MOCK_DATA.filter(i => i.type === 'video');
        }

        // Merge and sort by date descending
        return [...articles, ...videos].sort((a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

    } catch (error) {
        console.error("API Fetch Error:", error);
        return MOCK_DATA; // Fallback to mock on error
    }
}
