import { Article } from './types';

export interface RawFusionPayload {
    news: Article[];
    nasa: any[];
    usgs: any[];
    flights: number;
    timestamp: string;
}

/**
 * String Similarity (Jaccard Index)
 */
function getJaccardSimilarity(s1: string, s2: string): number {
    const tokenize = (str: string) => {
        return new Set(
            str.toLowerCase()
               .replace(/[^\w\s]/g, '')
               .split(/\s+/)
               .filter(w => w.length > 2)
        );
    };
    const set1 = tokenize(s1);
    const set2 = tokenize(s2);
    let intersection = 0;
    for (const w of set1) {
        if (set2.has(w)) intersection++;
    }
    const union = set1.size + set2.size - intersection;
    if (union === 0) return 0;
    return intersection / union;
}

/**
 * Deduplicate news arrays by filtering out items sharing >60% word overlap.
 */
export function deduplicateNews(articles: Article[]): Article[] {
    const unique: Article[] = [];
    for (const art of articles) {
        if (!art || !art.title) continue;
        const isDup = unique.some(existing => getJaccardSimilarity(art.title, existing.title) > 0.6);
        if (!isDup) unique.push(art);
    }
    return unique;
}

/**
 * Fusion Trimmer Engine (V2)
 * 
 * Strictly trims and sanitizes data to stay within ~8k token limits
 * for free-tier LLM models (OpenRouter/Gemini).
 */
export function trimFusionPayload(payload: RawFusionPayload) {
    // 1. Deduplicate News and Limit to TOP 20 (Target: ~4,000 chars)
    const uniqueNews = deduplicateNews(payload.news || []);
    const trimmedNews = uniqueNews.slice(0, 20).map(art => ({
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

    // Final Safety Check: Stringify and check length (Target ~25k chars max for 8k tokens)
    const jsonStr = JSON.stringify(finalPayload);
    if (jsonStr.length > 25000) {
        console.warn("[trimmer] Payload still too large (>25k chars), aggressive emergency truncate.");
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
