import { describe, it, expect, vi } from 'vitest';
import { trimFusionPayload, deduplicateNews } from '../src/lib/trimmer';
import { Article } from '../src/lib/types';

describe('Governor Engine - Deduplicator & Trimmer', () => {
    it('should correctly deduplicate articles with high string similarity (>60%)', () => {
        const articles: Article[] = [
            {
                id: '1', title: 'UN brokers peace treaty in Sudan region', description: '', url: '', source: 'BBC', domain: '', publishedAt: '', tags: [],
                biasMeta: { sourceReliability: 'unknown', ownershipType: 'unknown', countryOfOrigin: 'unknown', geopoliticalAlignment: 'unknown', sensationalismScore: 50, emotionallyLoadedLanguage: false }
            },
            {
                id: '2', title: 'Sudan peace treaty brokered by UN officials', description: '', url: '', source: 'Al Jazeera', domain: '', publishedAt: '', tags: [],
                biasMeta: { sourceReliability: 'unknown', ownershipType: 'unknown', countryOfOrigin: 'unknown', geopoliticalAlignment: 'unknown', sensationalismScore: 50, emotionallyLoadedLanguage: false }
            },
            {
                id: '3', title: 'Completely unrelated tech news about a new phone', description: '', url: '', source: 'TechCrunch', domain: '', publishedAt: '', tags: [],
                biasMeta: { sourceReliability: 'unknown', ownershipType: 'unknown', countryOfOrigin: 'unknown', geopoliticalAlignment: 'unknown', sensationalismScore: 50, emotionallyLoadedLanguage: false }
            }
        ];

        const unique = deduplicateNews(articles);
        expect(unique).toHaveLength(2); // The second one should be dropped as a duplicate
        expect(unique[0].title).toBe('UN brokers peace treaty in Sudan region');
        expect(unique[1].title).toBe('Completely unrelated tech news about a new phone');
    });

    it('should aggressively truncate the payload if output string exceeds 25,000 characters', () => {
        const giantArray = Array.from({ length: 40 }).map((_, i) => ({
            id: String(i),
            title: `Title ${i}`,
            // Generates ~1000 characters per summary
            summary: Array.from({ length: 150 }).fill('longstring').join(' '),
            description: '', url: '', source: 'Test', domain: '', publishedAt: '', tags: [],
            biasMeta: { sourceReliability: 'unknown', ownershipType: 'unknown', countryOfOrigin: 'unknown', geopoliticalAlignment: 'unknown', sensationalismScore: 50, emotionallyLoadedLanguage: false } as any
        }));

        const result = trimFusionPayload({
            news: giantArray,
            nasa: [],
            usgs: [],
            flights: 0,
            timestamp: ''
        });

        const stringified = JSON.stringify(result);
        expect(stringified.length).toBeLessThanOrEqual(25000);
        
        // As per trimmer logic, emergency truncate halves the initial limit (from 20 -> 10)
        expect(result.n.length).toBeLessThanOrEqual(10);
    });

    it('should safely limit news items to a standard ceiling of 20 items', () => {
        const standardArray = Array.from({ length: 50 }).map((_, i) => ({
            id: String(i),
            title: `Unique Valid Title ${i}`,
            summary: 'Short text',
            description: '', url: '', source: 'Test', domain: '', publishedAt: '', tags: [],
            biasMeta: { sourceReliability: 'unknown', ownershipType: 'unknown', countryOfOrigin: 'unknown', geopoliticalAlignment: 'unknown', sensationalismScore: 50, emotionallyLoadedLanguage: false } as any
        }));

        const result = trimFusionPayload({
            news: standardArray,
            nasa: [],
            usgs: [],
            flights: 0,
            timestamp: ''
        });

        expect(result.n.length).toBe(20);
    });
});
