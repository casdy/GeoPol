import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://opensky-network.org/api/states/all', {
      next: { revalidate: 300 }, // Cache for 5 minutes to avoid 429 rate limits
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GeoPol Dashboard/1.0'
      }
    });

    if (response.status === 429) {
      console.warn('OpenSky API Rate Limited (429). Serving fallback mock data.');
      // Fallback: A few mock flights over major regions to confirm rendering
      return NextResponse.json({ 
        states: [
          ['f1', 'THRT77', 'United States', 0, 0, -74.0, 40.7, 10000, false, 250, 45, 0, null, 10000, 'SQ1', false, 0],
          ['f2', 'XRAY99', 'Europe', 0, 0, 12.5, 41.9, 11000, false, 300, 180, 0, null, 11000, 'SQ2', false, 0],
          ['f3', 'INTL01', 'Asia', 0, 0, 116.4, 39.9, 12000, false, 280, 270, 0, null, 12000, 'SQ3', false, 0]
        ],
        warning: 'Rate limit exceeded - showing fallback data' 
      }, { status: 200 });
    }

    if (!response.ok) throw new Error(`OpenSky API Error: ${response.status}`);
    
    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('OpenSky Proxy Error:', error);
    return NextResponse.json({ states: [] }, { status: 200 });
  }
}
