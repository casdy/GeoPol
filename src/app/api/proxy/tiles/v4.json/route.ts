import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.PROTOMAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'PROTOMAPS_API_KEY not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.protomaps.com/tiles/v4.json?key=${apiKey}`, {
      next: { revalidate: 3600 } // Cache metadata for 1 hour
    });

    if (!response.ok) throw new Error(`Protomaps Metadata Error: ${response.status}`);
    
    const data = await response.json();

    // Rewrite tile URLs to point to our local proxy
    // Original: https://api.protomaps.com/tiles/v4/{z}/{x}/{y}.mvt?key=...
    // New: /api/proxy/tiles/{z}/{x}/{y}
    if (data.tiles) {
      data.tiles = [
        `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/proxy/tiles/{z}/{x}/{y}`
      ];
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Protomaps Metadata Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to fetch map metadata' }, { status: 500 });
  }
}
