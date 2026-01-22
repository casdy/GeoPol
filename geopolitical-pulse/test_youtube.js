const key = "AIzaSyDlKwQLCZGA7OE2x2NBAkl8R9TuwC_BbII";
const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=geopolitics&type=video&key=${key}&maxResults=5`;

async function test(name, headers = {}) {
    console.log(`\n--- Testing ${name} ---`);
    try {
        const response = await fetch(url, { headers });
        const data = await response.json();

        if (response.ok) {
            console.log("Success! Items found:", data.items?.length || 0);
        } else {
            console.log("Error:", response.status, data?.error?.message);
            if (data?.error?.details) {
                console.log("Details:", JSON.stringify(data.error.details, null, 2));
            }
        }
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}

async function run() {
    await test("No Referrer (Server-like)");
    await test("With Referrer (Browser-like)", { 'Referer': 'http://localhost:3000' });
}

run();
