import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.PROTOMAPS_API_KEY;
  if (!apiKey) {
    console.error('[TileProxy] PROTOMAPS_API_KEY is missing from environment variables.');
    return NextResponse.json({ error: 'PROTOMAPS_API_KEY not configured' }, { status: 500 });
  }

  // Use the modern Next.js way to determine the absolute origin
  const baseUrl = request.nextUrl.origin;

  try {
    const requestOrigin = request.headers.get('origin') || process.env.GEOPOL_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`https://api.protomaps.com/tiles/v4.json?key=${apiKey}`, {
      headers: {
        'Origin': requestOrigin,
        'Referer': requestOrigin
      },
      next: { revalidate: 3600 } // Cache metadata for 1 hour
    });

    if (!response.ok) throw new Error(`Protomaps Metadata Error: ${response.status}`);
    
    const data = await response.json();

    // Rewrite tile URLs to point to our local proxy with ABSOLUTE paths
    // MapLibre requires absolute URLs in the tiles array for stable loading
    if (data.tiles) {
      data.tiles = [
        `${baseUrl}/api/proxy/tiles/{z}/{x}/{y}`
      ];
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Protomaps Metadata Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to fetch map metadata' }, { status: 500 });
  }
}
