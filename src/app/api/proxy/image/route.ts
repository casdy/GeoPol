import { NextResponse } from 'next/server';

const PLACEHOLDER_URL = 'https://placehold.co/600x400/020617/cbd5e1/png?text=GEO-INTEL+IMAGE+PENDING';

/**
 * Image Proxy API
 * 
 * Fetches remote images and serves them locally to bypass CORS and Referer blocks.
 * Includes a robust fallback to a placeholder for failed or forbidden requests.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': new URL(imageUrl).origin,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      console.warn(`Image Proxy: ${imageUrl} returned ${response.status}. Serving placeholder.`);
      return NextResponse.redirect(PLACEHOLDER_URL);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Image Proxy Critical Error:', error);
    return NextResponse.redirect(PLACEHOLDER_URL);
  }
}
