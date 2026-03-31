import { it, expect, describe } from 'vitest';
import { getGeopoliticalIntelligence } from '../src/lib/intelligence-engine';
import { Article } from '../src/lib/types';

describe('Intelligence Engine', () => {
  it('identifies countries from article text', () => {
    const articles: Article[] = [
      {
        id: '1',
        title: 'CRITICAL: Heavy shelling and missile strikes in Ukraine as war escalates',
        description: 'Military forces report mass casualties from rocket attacks, explosions, and drone strikes in Kyiv.',
        url: '#',
        source: 'Test',
        domain: 'test.com',
        publishedAt: new Date().toISOString(),
        tags: [],
        biasMeta: {} as any,
        apiSource: 'test'
      } as Article
    ];

    const intel = getGeopoliticalIntelligence(articles);
    expect(intel['UKR'].status).toBe('CRITICAL');
    expect(intel['UKR'].riskScore).toBeGreaterThan(50);
  });

  it('handles multiple countries in one article', () => {
    const articles: Article[] = [
      {
        id: '1',
        title: 'USA and China sign a major trade agreement in Beijing',
        description: 'Stability indicators are growing in the region.',
        url: '#',
        source: 'Test',
        domain: 'test.com',
        publishedAt: new Date().toISOString(),
        tags: [],
        biasMeta: {} as any,
        apiSource: 'test'
      } as Article
    ];

    const intel = getGeopoliticalIntelligence(articles);
    expect(intel['USA'].status).toBe('STABLE');
    expect(intel['CHN'].status).toBe('STABLE');
  });
});
