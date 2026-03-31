/**
 * Utility for fetching and translating raw JSON data into GeoJSON format.
 */

/**
 * NASA EONET: Natural Disasters
 * Endpoint: https://eonet.gsfc.nasa.gov/api/v3/events
 * Logic: Extracts coordinates from the geometries array.
 */
export async function fetchNasaEonet(): Promise<GeoJSON.FeatureCollection> {
  try {
    const response = await fetch('/api/proxy/nasa');
    if (!response.ok) throw new Error('NASA Proxy Unreachable');
    const data = await response.json();

    const features: GeoJSON.Feature[] = data.events.map((event: any) => {
      // EONET geometries can be points or polygons. We'll take the first point.
      const geometry = event.geometry[0];
      if (!geometry || geometry.type !== 'Point') return null;

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: geometry.coordinates, // [lon, lat]
        },
        properties: {
          id: event.id,
          title: event.title,
          description: event.description,
          category: event.categories[0]?.title || 'Unknown',
          date: geometry.date,
        },
      };
    }).filter(Boolean);

    return {
      type: 'FeatureCollection',
      features,
    };
  } catch (error) {
    // If the error is a "Failed to fetch" (TypeError), it means the server is likely unreachable
    // We return a valid empty FeatureCollection to keep the map engine stable
    console.error('NASA EONET Proxy Error (Likely server-side):', error instanceof Error ? error.message : 'Unknown Network Error');
    return { type: 'FeatureCollection', features: [] };
  }
}

/**
 * OpenSky Network: Aviation Data
 * Endpoint: https://opensky-network.org/api/states/all
 * Logic: Extracts longitude/latitude and track from state vectors.
 * Index 5: longitude, Index 6: latitude, Index 10: true track (heading)
 */
export async function fetchOpenSky(): Promise<GeoJSON.FeatureCollection> {
  try {
    const response = await fetch('/api/proxy/opensky');
    if (!response.ok) throw new Error('OpenSky Proxy Unreachable');
    const data = await response.json();

    if (!data || !data.states) return { type: 'FeatureCollection', features: [] };

    const features: GeoJSON.Feature[] = data.states.slice(0, 500).map((state: any[]) => {
      const lon = state[5];
      const lat = state[6];
      const heading = state[10] || 0; // True track in decimal degrees clockwise from north

      if (lon === null || lat === null) return null;

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat],
        },
        properties: {
          icao24: state[0],
          callsign: state[1]?.trim() || 'N/A',
          origin_country: state[2],
          velocity: state[9],
          heading: heading,
          altitude: state[7],
        },
      };
    }).filter(Boolean);

    return {
      type: 'FeatureCollection',
      features,
    };
  } catch (error) {
    console.error('OpenSky Proxy Error (Likely server-side):', error instanceof Error ? error.message : 'Unknown Network Error');
    return { type: 'FeatureCollection', features: [] };
  }
}
