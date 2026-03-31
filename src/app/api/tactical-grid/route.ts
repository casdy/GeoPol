import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

/**
 * High-Speed Tactical Buffer API
 * 
 * Directly reads 'tactical_grid_cache' from Vercel KV.
 * Provides the UI with instantaneous data snapshots.
 */
export async function GET() {
    try {
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
        return NextResponse.json({ error: 'TACTICAL_OFFLINE' }, { status: 500 });
    }
}
