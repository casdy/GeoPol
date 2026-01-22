import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
