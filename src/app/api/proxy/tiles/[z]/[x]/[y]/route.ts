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
    
    const response = await fetch(tileUrl, {
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
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error(`Error proxying tile ${z}/${x}/${y}:`, error);
    return NextResponse.json({ error: 'Failed to fetch map tile' }, { status: 500 });
  }
}
