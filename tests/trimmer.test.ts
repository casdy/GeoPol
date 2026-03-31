import { it, expect, describe } from 'vitest';
import { trimFusionPayload } from '../src/lib/trimmer';

describe('Trimmer Engine', () => {
  const mockRawData = {
    news: Array(50).fill({ title: 'Important News Headline', description: 'Detailed description of geopolitical events.' }),
    nasa: Array(20).fill({ title: 'Wildfire' }),
    usgs: Array(20).fill({ id: 'quake1' }),
    flights: 100,
    timestamp: new Date().toISOString()
  };

  it('limits data to strict counts (v2)', () => {
    const trimmed = trimFusionPayload(mockRawData);
    expect(trimmed.n.length).toBeLessThanOrEqual(20);
    expect(trimmed.ev.length).toBeLessThanOrEqual(5);
    expect(trimmed.eq.length).toBeLessThanOrEqual(5);
  });

  it('uses short keys to save tokens', () => {
    const trimmed = trimFusionPayload(mockRawData);
    if (trimmed.n.length > 0) {
      const item = trimmed.n[0] as any;
      expect(item.title).toBeDefined(); // title is kept as title in the news array, but keys of main object are short
      // Wait, let's look at trimmer.ts again
      // 38:         n: trimmedNews, // Short keys to save tokens
      // 19:     const trimmedNews = (payload.news || []).slice(0, 20).map(art => ({
      // 20:         title: sanitizeText(art.title).substring(0, 100),
      // 21:         summary: sanitizeText(art.description || art.summary || '').substring(0, 120),
      // 22:         source: art.source
      // 23:     }));
    }
    expect(trimmed.n).toBeDefined();
    expect(trimmed.ev).toBeDefined();
    expect(trimmed.eq).toBeDefined();
  });

  it('handles empty data gracefully', () => {
    const trimmed = trimFusionPayload({ news: [], nasa: [], usgs: [], flights: 0, timestamp: '' });
    expect(trimmed.n).toEqual([]);
    expect(trimmed.ev).toEqual([]);
  });
});
