import { Article } from './types';

export interface RawFusionPayload {
    news: Article[];
    nasa: any[];
    usgs: any[];
    flights: number;
    timestamp: string;
}

/**
 * Fusion Trimmer Engine (V2)
 * 
 * Strictly trims and sanitizes data to stay within ~8k token limits
 * for free-tier LLM models (OpenRouter/Gemini).
 */
export function trimFusionPayload(payload: RawFusionPayload) {
    // 1. Limit News to TOP 20 (Target: ~4,000 chars)
    const trimmedNews = (payload.news || []).slice(0, 20).map(art => ({
        title: sanitizeText(art.title).substring(0, 100),
        summary: sanitizeText(art.description || art.summary || '').substring(0, 120),
        source: art.source
    }));

    // 2. Limit NASA Events to Top 5 (Target: ~500 chars)
    const trimmedNasa = (payload.nasa || []).slice(0, 5).map(event => ({
        title: sanitizeText(event.title),
        cat: event.categories?.[0]?.title || 'Unknown'
    }));

    // 3. Limit USGS Earthquakes to Top 5 (Target: ~500 chars)
    const trimmedUsgs = (payload.usgs || []).slice(0, 5).map(f => ({
        place: sanitizeText(f.properties?.place || 'Unknown'),
        mag: f.properties?.mag
    }));

    const finalPayload = {
        n: trimmedNews, // Short keys to save tokens
        ev: trimmedNasa,
        eq: trimmedUsgs,
        fl: payload.flights,
        ts: payload.timestamp
    };

    // Final Safety Check: Stringify and check length
    const jsonStr = JSON.stringify(finalPayload);
    if (jsonStr.length > 15000) { // Approx 6,000-7,000 tokens safely
        console.warn("[trimmer] Payload still too large, aggressive emergency truncate.");
        return {
            ...finalPayload,
            n: finalPayload.n.slice(0, 10) // Cut news in half again
        };
    }

    return finalPayload;
}

/**
 * Strips HTML tags and collapses redundant whitespace.
 */
function sanitizeText(text: string): string {
    if (!text) return '';
    return text
        .replace(/<[^>]*>?/gm, '') // Strip HTML
        .replace(/\s+/g, ' ')      // Collapse whitespace
        .trim();
}
