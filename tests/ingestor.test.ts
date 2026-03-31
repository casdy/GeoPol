import { it, expect, vi, describe, beforeEach } from 'vitest';
import { fetchRawData } from '../src/lib/ingestor';
import { kv } from '@vercel/kv';
import { getAggregatedIntelligence } from '../src/lib/api';

vi.mock('@vercel/kv', () => ({
  kv: {
    set: vi.fn(),
  },
}));

vi.mock('../src/lib/api', () => ({
  getAggregatedIntelligence: vi.fn(),
}));

global.fetch = vi.fn();

describe('Ingestor Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully aggregates data from all sources', async () => {
    (getAggregatedIntelligence as any).mockResolvedValue({ news: [{ id: '1', title: 'Test' }] });
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('eonet')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ events: [] }) });
      if (url.includes('usgs')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ features: [] }) });
      if (url.includes('opensky')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ states: [] }) });
      return Promise.reject(new Error('Unknown URL'));
    });

    const data = await fetchRawData();

    expect(data.news).toHaveLength(1);
    expect(kv.set).toHaveBeenCalledWith('fusion_raw_ingest', expect.any(Object));
  });

  it('handles partial failures gracefully', async () => {
    (getAggregatedIntelligence as any).mockResolvedValue({ news: [] });
    //@ts-ignore
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('eonet')) return Promise.reject(new Error('NASA Down'));
      if (url.includes('usgs')) return Promise.resolve({ ok: false });
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    const data = await fetchRawData();
    expect(data.nasa).toEqual([]);
    expect(data.usgs).toEqual([]);
  });
});
