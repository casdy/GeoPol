import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?days=7', {
      next: { revalidate: 3600 }, // Cache for 1 hour (disaster events are slow-moving)
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GeoPol Dashboard/1.0'
      }
    });

    if (!response.ok) throw new Error(`NASA EONET API Error: ${response.status}`);
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('NASA EONET Proxy Error:', error);
    return NextResponse.json({ events: [] }, { status: 200 });
  }
}
