import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY' // Prevent clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff' // Prevent MIME sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            // Basic CSP: Allow self, allow scripts/styles from self and strict inline (unsafe-inline used for simplicity in this demo due to Tailwind/Next dynamic styles, usually strict-dynamic is better but complex to setup)
            // We also allow images from placehold.co and youtube as used in the app.
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https: http:; media-src 'self' data:; font-src 'self' https://cdn.protomaps.com; frame-src 'self' https://www.youtube.com; connect-src 'self' https://newsapi.org https://www.googleapis.com https://api.resend.com https://api.protomaps.com https://cdn.protomaps.com; worker-src 'self' blob:;"
          }
        ]
      }
    ]
  }
};

export default nextConfig;
