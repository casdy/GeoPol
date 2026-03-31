import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

/**
 * High-Speed Tactical Buffer API
 * 
 * Directly reads 'tactical_grid_cache' from Vercel KV.
 * Provides the UI with instantaneous data snapshots.
 */
export async function GET() {
    // 1. Check for Vercel KV credentials
    // If missing, we return a high-density mock buffer for local development
    const isKVConfigured = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

    try {
        if (!isKVConfigured) {
            console.warn('[TacticalGrid] Vercel KV not configured. Serving local simulation buffer.');
            return NextResponse.json({
                status: 'LOCAL_SIMULATION',
                lastUpdate: new Date().toISOString(),
                gridPower: 100,
                nodes: [
                    { id: 'ALPHA', stress: 12, connections: 8, status: 'STABLE' },
                    { id: 'BRAVO', stress: 45, connections: 12, status: 'MONITOR' },
                    { id: 'TANGO', stress: 89, connections: 4, status: 'CRITICAL' }
                ],
                message: 'Local development buffer active.'
            });
        }

        const data = await kv.get('tactical_grid_cache');
        
        if (!data) {
            return NextResponse.json({ 
                error: 'TACTICAL_DATA_PENDING',
                message: 'Initializing tactical grid buffer...'
            }, { status: 503 });
        }

        return NextResponse.json(data);
        
    } catch (error: any) {
        console.error("Tactical Grid API Error:", error);
        // Fallback to minimal data instead of a 500 error on catch
        return NextResponse.json({ 
            error: 'TACTICAL_OFFLINE',
            details: error instanceof Error ? error.message : 'Unknown'
        }, { status: 500 });
    }
}
