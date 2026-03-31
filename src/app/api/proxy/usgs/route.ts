import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson', {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    
    if (!response.ok) throw new Error(`USGS API Error: ${response.status}`);
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('USGS Proxy Error:', error);
    return NextResponse.json({ features: [] }, { status: 200 }); // Return empty success to prevent frontend crash
  }
}
