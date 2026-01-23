// Standalone API Test
const NEWS_API_URL = 'https://newsapi.org/v2/everything';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

// Hardcoded keys from .env.local (as seen in previous steps)
const NEWS_KEY = '06a05fd82b0a49778364c77ee0ebe220';
const YOUTUBE_KEY = 'AIzaSyDlKwQLCZGA7OE2x2NBAkl8R9TuwC_BbII';

async function fetchPulseData() {
    console.log("Testing with News Key:", NEWS_KEY.substring(0, 5) + "...");

    // Test NewsAPI
    const query = '(geopolitics OR "foreign policy" OR "Security Council" OR "International Relations")';
    const url = `${NEWS_API_URL}?q=${encodeURIComponent(query)}&apiKey=${NEWS_KEY}&language=en&sortBy=publishedAt&pageSize=5`;

    console.log("Fetching NewsAPI:", url.replace(NEWS_KEY, 'HIDDEN'));

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'error') {
            console.error("NewsAPI Error:", data.code, data.message);
        } else {
            console.log(`NewsAPI Success: Found ${data.totalResults} articles.`);
            if (data.articles && data.articles.length > 0) {
                console.log("Sample Article:", data.articles[0].title);
            }
        }
    } catch (e) {
        console.error("NewsAPI Fetch Failed:", e.message);
    }
}

fetchPulseData();
