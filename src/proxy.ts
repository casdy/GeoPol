import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RateLimitContext {
    count: number;
    resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitContext>();
const WINDOW_IN_MS = 10000;
const MAX_REQUESTS = 50;

// Next.js 16: "middleware" is deprecated, usage is now "proxy"
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Block access to dotfiles (e.g., .env, .git)
    // Exception: .well-known represents valid public metadata
    if (pathname.includes('/.') && !pathname.includes('/.well-known')) {
        console.warn(`[Security] Blocked access to dotfile: ${pathname}`);
        return new NextResponse(null, { status: 403, statusText: 'Forbidden' });
    }

    // 2. Block sensitive configuration files
    const sensitiveFiles = [
        'next.config',
        'tsconfig.json',
        'package.json',
        'README.md',
        'security_audit.md'
    ];

    if (sensitiveFiles.some(file => pathname.includes(file))) {
        console.warn(`[Security] Blocked access to sensitive file: ${pathname}`);
        return new NextResponse(null, { status: 403, statusText: 'Forbidden' });
    }

    // 3. API Rate Limiting (DE.CM-06)
    if (pathname.startsWith('/api')) {
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        const now = Date.now();
        const rateLimitContext = rateLimitMap.get(ip) || { count: 0, resetAt: now + WINDOW_IN_MS };

        if (now > rateLimitContext.resetAt) {
            rateLimitContext.count = 0;
            rateLimitContext.resetAt = now + WINDOW_IN_MS;
        }

        rateLimitContext.count++;
        rateLimitMap.set(ip, rateLimitContext);

        if (rateLimitContext.count > MAX_REQUESTS) {
            return new NextResponse('Rate Limit Exceeded', {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': MAX_REQUESTS.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': rateLimitContext.resetAt.toString()
                }
            });
        }

        const response = NextResponse.next();
        response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
        response.headers.set('X-RateLimit-Remaining', (MAX_REQUESTS - rateLimitContext.count).toString());
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
