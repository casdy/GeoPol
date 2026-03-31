import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

// Required for Next.js App Router dynamic edge limits or dynamic route configuration
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const redis = await getRedisClient();
        const dataStr = await redis.get('dashboard_live_data');
        
        let tacticalData = null;
        if (dataStr) {
            try { tacticalData = JSON.parse(dataStr); } catch (e) { }
        }

        if (!tacticalData) {
            tacticalData = {
                status: "MONITORING",
                insights: "Awaiting initial data fusion. The Governor engine is actively processing inputs.",
                forecasts: [],
                hotspots: [],
                globalRiskScore: 50
            };
        }

        return NextResponse.json(tacticalData);
    } catch (error) {
        console.error("[geo-cache] Failed to fetch live data from Redis:", error);
        return NextResponse.json({
            status: "ERROR",
            insights: "Local cache synchronization failure.",
            forecasts: [],
            globalRiskScore: 0
        }, { status: 500 });
    }
}
