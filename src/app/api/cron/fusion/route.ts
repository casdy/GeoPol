import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { fetchRawData } from '@/lib/ingestor';
import { trimFusionPayload } from '@/lib/trimmer';
import { callOpenRouterFusion } from '@/lib/fusion-engine';
import { sanitizeLLMOutput } from '@/lib/sanitizer';

/**
 * Triple-Batch Fusion Pipeline Orchestrator
 * 
 * Triggered 3x daily via Vercel Cron.
 * 00:00, 08:00, 16:00 UTC.
 */
export async function GET(request: Request) {
    // 1. STRICTOR AUTH GUARD: Verify Authorization: Bearer <CRON_SECRET>
    const authHeader = request.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.CRON_SECRET?.trim()}`;
    
    if (!process.env.CRON_SECRET || authHeader !== expectedToken) {
        console.warn("[pipeline] UNAUTHORIZED ATTEMPT BLOCKED. Invalid Secret.");
        return NextResponse.json({ error: 'Unauthorized Access Denied' }, { status: 401 });
    }

    try {
        console.log("[pipeline] AUTH VERIFIED. Initializing Triple-Batch run...");

        // STAGE 1: Ingest
        const rawData = await fetchRawData();

        // STAGE 2: Trim
        const trimmed = trimFusionPayload(rawData);

        // STAGE 3: Fusion (AI)
        const rawAiOutput = await callOpenRouterFusion(trimmed);

        // STAGE 4: Sanitize
        // Note: Using 'dashboard_live_data' as the fallback key for high reliability
        const processedData = await sanitizeLLMOutput(rawAiOutput, 'dashboard_live_data');

        // STAGE 5: Distribute
        const timestamp = new Date().toISOString();
        
        const redis = await getRedisClient();

        // Save Unified Dashboard Cache (High-Speed Access)
        await redis.set('dashboard_live_data', JSON.stringify(processedData));
        await redis.set('fusion_last_update', timestamp);

        // Save Newsletter specific draft (Ensure Pulse Daily isn't affected)
        const newsletterPayload = {
            subject: `Tactical Briefing: ${processedData.status || 'MONITORING'}`,
            content: processedData.newsletter_brief || processedData.summary,
            hotspots: processedData.hotspots || [],
            generatedAt: timestamp
        };
        await redis.set('newsletter_draft_data', JSON.stringify(newsletterPayload));

        console.log("[pipeline] SUCCESS. Snapshots dispatched to KV.");

        return NextResponse.json({
            success: true,
            batch: timestamp,
            status: processedData.status
        });

    } catch (error: any) {
        console.error("[pipeline] CRITICAL FAILURE:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
