import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson', {
      next: { revalidate: 86400 } // Cache for 24 hours (static data)
    });
    
    if (!response.ok) throw new Error('Failed to fetch from static source');
    
    const data = await response.json();
    return NextResponse.json(data, {
        headers: {
            'Cache-Control': 's-maxage=86400, stale-while-revalidate=43200'
        }
    });
  } catch (error) {
    console.error('Countries Proxy Error:', error);
    return NextResponse.json({ type: 'FeatureCollection', features: [] }, { status: 500 });
  }
}
