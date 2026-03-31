import { describe, it, expect } from 'vitest';
import { SURVEILLANCE_FEEDS } from '../src/lib/surveillance';
import { getRegion, groupByRegion } from '../src/components/dashboard/LiveNewsViewer';

describe('Unified Surveillance Data Logic', () => {
  it('should have 32 total feeds in the unified list', () => {
    expect(SURVEILLANCE_FEEDS.length).toBe(32);
  });

  it('should have a unique channelId for every feed', () => {
    const ids = SURVEILLANCE_FEEDS.map(c => c.channelId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have a valid youtubeUrl for every feed', () => {
    SURVEILLANCE_FEEDS.forEach(feed => {
      expect(feed.youtubeUrl).toContain('youtube.com/embed/');
    });
  });

  it('should correctly map countries to regions using the component mapper', () => {
    // Note: getRegion now takes a feed object
    const indiaFeed = SURVEILLANCE_FEEDS.find(f => f.country === 'India')!;
    const usaFeed = SURVEILLANCE_FEEDS.find(f => f.country === 'USA')!;
    
    expect(getRegion(indiaFeed)).toBe('Asia');
    expect(getRegion(usaFeed)).toBe('North America');
  });

  it('should group feeds by region correctly', () => {
    const grouped = groupByRegion(SURVEILLANCE_FEEDS);
    expect(grouped['Asia'].length).toBeGreaterThan(0);
    expect(grouped['Europe'].length).toBeGreaterThan(0);
  });

  it('should have the correct DW News link in the unified dataset', () => {
    const dwNews = SURVEILLANCE_FEEDS.find(f => f.title === 'DW News');
    expect(dwNews?.youtubeUrl).toBe('https://www.youtube.com/embed/live_stream?channel=UCknLrEdhRCp1aegoMqRaCZg');
  });

  it('should include both news and webcam feeds', () => {
    const types = SURVEILLANCE_FEEDS.map(f => f.type);
    expect(types).toContain('news');
    expect(types).toContain('webcam');
  });
});
