/**
 * Good News Engine (V1)
 * 
 * A local, 4-engine data pipeline to filter RSS feeds for positive 
 * global developments without external LLM dependencies.
 */

import { Article } from './types';

// ─── ENGINE 1: SEMANTIC LEXICON ─────────────────────────────────────────────

const POSITIVE_LEXICON = [
    'breakthrough', 'peace', 'cure', 'agreement', 'rescue', 'innovation', 
    'growth', 'renewable', 'ceasefire', 'alliance', 'success', 'expansion', 
    'recovery', 'stability', 'cooperation', 'treaty', 'discovery', 
    'solution', 'progress', 'prosperity'
];

const NEGATIVE_LEXICON = [
    'death', 'war', 'crash', 'crisis', 'attack', 'blast', 'conflict', 
    'strike', 'invasion', 'combat', 'casualty', 'terror', 'militant', 
    'insurgent', 'coup', 'riot', 'clash', 'violence', 'hostage', 'siege'
];

// ─── ENGINE 2: OPTIMIZER (DEDUPLICATION) ───────────────────────────────────

function calculateSimilarity(str1: string, str2: string): number {
    const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const s1 = normalize(str1);
    const s2 = normalize(str2);
    
    if (s1 === s2) return 1.0;
    
    const words1 = new Set(s1.split(/\s+/));
    const words2 = new Set(s2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
}

// ─── THE PIPELINE ──────────────────────────────────────────────────────────

export function processGoodNews(articles: Article[]): Article[] {
    const scored: Article[] = [];

    // Engine 1: Semantic Filter
    articles.forEach(article => {
        const text = ((article.title || '') + ' ' + (article.description || '')).toLowerCase();
        
        // Instant drop on negative words
        const hasNegative = NEGATIVE_LEXICON.some(word => text.includes(word));
        if (hasNegative) return;

        // Score based on positive words
        let score = 0;
        POSITIVE_LEXICON.forEach(word => {
            if (text.includes(word)) score++;
        });

        if (score > 0) {
            scored.push(article);
        }
    });

    // Engine 2: Optimizer (Deduplication)
    const unique: Article[] = [];
    scored.forEach(current => {
        const isDuplicate = unique.some(existing => 
            calculateSimilarity(current.title, existing.title) > 0.8
        );
        
        if (!isDuplicate) {
            unique.push(current);
        }
    });

    return unique;
}

// ─── ENGINE 4: MAP SYNC HELPER ─────────────────────────────────────────────

export function getProsperityHotspots(articles: Article[]) {
    // Returns geo-coordinates for positive stories if available
    // For now, it maps back to country ISO codes for green highlighting
    return articles.map(art => {
        const tags = art.tags || [];
        // Extract country from tags if present (heuristic)
        const countryTag = tags.find(t => t !== 'NEWS' && t !== 'STABILITY');
        return {
            id: art.id,
            title: art.title,
            iso: countryTag || 'Global'
        };
    });
}
