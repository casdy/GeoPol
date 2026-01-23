const { fetchPulseData } = require('./src/lib/api');

// Mock environment variables for the test script
process.env.NEWS_API_KEY = '06a05fd82b0a49778364c77ee0ebe220';
process.env.YOUTUBE_API_KEY = 'AIzaSyDlKwQLCZGA7OE2x2NBAkl8R9TuwC_BbII';
process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';

async function testApi() {
    console.log("Testing fetchPulseData...");
    try {
        const data = await fetchPulseData({ region: 'Global' });
        console.log(`Returned ${data.length} items.`);
        if (data.length > 0) {
            console.log("First item:", data[0].title);
            console.log("First item type:", data[0].type);
            const isMock = data[0].id.startsWith('mock') || data[0].id === '1' || data[0].id === '2';
            console.log("Is First Item Mock Data?", isMock);
        }
    } catch (error) {
        console.error("Test failed:", error);
    }
}

testApi();
