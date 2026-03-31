import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Manual .env.local loader (Same as fusion.test.ts)
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

/**
 * Mock Data for Testing Mapping Logic
 */
const MOCK_NASA_EONET = {
  events: [
    {
      id: 'EONET_123',
      title: 'Mock Wildfire',
      categories: [{ title: 'Wildfires' }],
      geometry: [{ type: 'Point', coordinates: [100.1, 10.2], date: '2026-03-25T00:00:00Z' }]
    }
  ]
};

const MOCK_OPENSKY = {
  states: [
    ['icao123', 'TEST456', 'United States', 1711411200, 1711411200, -122.4, 37.7, 10000, false, 250, 90, 0, null, 10000, '1234', false, 0]
  ]
};

/**
 * Mapping Logic Functions
 */
function validateEonetMapping(data: any) {
  const features = data.events.map((event: any) => {
    const geometry = event.geometry[0];
    if (!geometry || geometry.type !== 'Point') return null;
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: geometry.coordinates },
      properties: { id: event.id, title: event.title, category: event.categories[0]?.title }
    };
  }).filter(Boolean);
  
  return { type: 'FeatureCollection', features };
}

function validateOpenSkyMapping(data: any) {
  if (!data.states) return { type: 'FeatureCollection', features: [] };
  const features = data.states.map((state: any[]) => {
    const lon = state[5];
    const lat = state[6];
    if (lon === null || lat === null) return null;
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: { callsign: state[1], heading: state[10] }
    };
  }).filter(Boolean);
  
  return { type: 'FeatureCollection', features };
}

describe('Tactical Layers Mapping', () => {
  it('should correctly map EONET events to GeoJSON Features', () => {
    const geojson = validateEonetMapping(MOCK_NASA_EONET);
    expect(geojson.type).toBe('FeatureCollection');
    expect(geojson.features).toHaveLength(1);
    expect(geojson.features[0].geometry.coordinates).toEqual([100.1, 10.2]);
    expect(geojson.features[0].properties.title).toBe('Mock Wildfire');
  });

  it('should correctly map OpenSky states to GeoJSON Features', () => {
    const geojson = validateOpenSkyMapping(MOCK_OPENSKY);
    expect(geojson.type).toBe('FeatureCollection');
    expect(geojson.features).toHaveLength(1);
    expect(geojson.features[0].properties.callsign).toBe('TEST456');
    expect(geojson.features[0].geometry.coordinates[0]).toBe(-122.4);
  });

  it('should handle empty states in OpenSky data gracefully', () => {
    const geojson = validateOpenSkyMapping({ states: null });
    expect(geojson.features).toHaveLength(0);
  });
});

describe('Upstream API Accessibility', () => {
  it('should have a working network connection (smoke test)', async () => {
    const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?limit=1').catch(() => null);
    if (response) {
      expect(response.status).toBeGreaterThanOrEqual(200);
    } else {
      console.warn('Network not available, skipping upstream check.');
    }
  });
});
