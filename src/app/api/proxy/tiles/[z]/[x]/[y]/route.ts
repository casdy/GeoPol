import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ z: string; x: string; y: string }> }
) {
  const apiKey = process.env.PROTOMAPS_API_KEY;
  const { z, x, y } = await params;

  if (!apiKey) {
    return NextResponse.json({ error: 'PROTOMAPS_API_KEY not configured' }, { status: 500 });
  }

  try {
    const tileUrl = `https://api.protomaps.com/tiles/v4/${z}/${x}/${y}.mvt?key=${apiKey}`;
    const requestOrigin = request.headers.get('origin') || process.env.GEOPOL_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(tileUrl, {
      headers: {
        'Origin': requestOrigin,
        'Referer': requestOrigin
      },
      next: { revalidate: 86400 } // Cache tiles for 24 hours (mostly static)
    });

    if (!response.ok) {
      if (response.status === 404) return new Response(null, { status: 404 });
      throw new Error(`Protomaps Tile Error: ${response.status}`);
    }

    const blob = await response.blob();
    
    // Return the response with correct headers for vector tiles
    return new Response(blob, {
      headers: {
        'Content-Type': 'application/x-protobuf',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff'
      }
    });

  } catch (error) {
    console.error(`Error proxying tile ${z}/${x}/${y}:`, error);
    // Return 204 No Content for tile errors to keep the map stable
    return new Response(null, { status: 204 });
  }
}
