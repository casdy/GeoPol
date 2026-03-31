/**
 * Tactical Geopolitical Map Data & Dynamic Processors
 */

export interface MapPoint {
  name: string;
  coords: [number, number];
  type?: 'hub' | 'conflict' | 'safe' | 'hotspot';
  description?: string;
  intensity?: number; // 0 to 1
  isoCode?: string;
}


export interface MapConnection {
  from: string;
  to: string;
  type: 'strategic' | 'fibre';
}

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

export const MAP_HUBS: Record<string, [number, number]> = {
  'New York': [-74.006, 40.7128],
  'London': [-0.1278, 51.5074],
  'Tokyo': [139.6917, 35.6895],
  'Dubai': [55.2708, 25.2048],
  'Singapore': [103.8198, 1.3521],
  'Sydney': [151.2093, -33.8688],
  'Beijing': [116.4074, 39.9042],
  'Mumbai': [72.8777, 19.076],
  'Sao Paulo': [-46.6333, -23.5505],
  'Moscow': [37.6173, 55.7558],
  'Cape Town': [18.4241, -33.9249],
  'San Francisco': [-122.4194, 37.7749],
  'Frankfurt': [8.6821, 50.1109],
  'Hong Kong': [114.1694, 22.3193],
  'Paris': [2.3522, 48.8566],
  'Berlin': [13.405, 52.52],
  'Seoul': [126.978, 37.5665],
  'Istanbul': [28.9784, 41.0082],
  'Cairo': [31.2357, 30.0444],
  'Rio de Janeiro': [-43.1729, -22.9068],
  'Los Angeles': [-118.2437, 34.0522],
  'Shanghai': [121.4737, 31.2304],
  'Bangkok': [100.5018, 13.7563],
  'Rome': [12.4964, 41.9028],
  'Toronto': [-79.3832, 43.6532],
};

export const FIBRE_OPTICS: MapConnection[] = [
  { from: 'New York', to: 'London', type: 'fibre' },
  { from: 'New York', to: 'Frankfurt', type: 'fibre' },
  { from: 'San Francisco', to: 'Tokyo', type: 'fibre' },
  { from: 'San Francisco', to: 'Sydney', type: 'fibre' },
  { from: 'Tokyo', to: 'Singapore', type: 'fibre' },
  { from: 'London', to: 'Mumbai', type: 'fibre' },
  { from: 'Mumbai', to: 'Singapore', type: 'fibre' },
  { from: 'Singapore', to: 'Hong Kong', type: 'fibre' },
  { from: 'Dubai', to: 'Mumbai', type: 'fibre' },
  { from: 'London', to: 'Cape Town', type: 'fibre' },
  { from: 'New York', to: 'Sao Paulo', type: 'fibre' },
  { from: 'London', to: 'Paris', type: 'fibre' },
  { from: 'Paris', to: 'Frankfurt', type: 'fibre' },
  { from: 'Frankfurt', to: 'Berlin', type: 'fibre' },
  { from: 'Berlin', to: 'Moscow', type: 'fibre' },
  { from: 'Istanbul', to: 'Dubai', type: 'fibre' },
  { from: 'Singapore', to: 'Bangkok', type: 'fibre' },
  { from: 'Bangkok', to: 'Beijing', type: 'fibre' },
  { from: 'Hong Kong', to: 'Seoul', type: 'fibre' },
  { from: 'Seoul', to: 'Tokyo', type: 'fibre' },
  { from: 'Los Angeles', to: 'Tokyo', type: 'fibre' },
];


export const SAFE_ZONES: MapPoint[] = [
  { name: 'Switzerland', coords: [8.2275, 46.8182], type: 'safe', description: 'Geopolitical neutrality' },
  { name: 'Svalbard', coords: [15.4667, 78.2333], type: 'safe', description: 'Arctic security zone' },
  { name: 'New Zealand', coords: [174.886, -40.9006], type: 'safe', description: 'Deep Pacific stability' },
];

export const NUCLEAR_SITES: MapPoint[] = [
    { name: 'Zaporizhzhia', coords: [35.1097, 47.5125], type: 'hotspot', description: 'Active conflict zone monitoring', isoCode: 'UKR' },
    { name: 'Dimona', coords: [35.132, 31.025], type: 'hotspot', description: 'Negev Nuclear Research Center', isoCode: 'ISR' },
    { name: 'Yongbyon', coords: [125.75, 39.8], type: 'hotspot', description: 'Scientific Research Center', isoCode: 'PRK' },
    { name: 'Natanz', coords: [51.72, 33.72], type: 'hotspot', description: 'Enrichment facility', isoCode: 'IRN' },
];

export const DATA_CENTERS: MapPoint[] = [
    { name: 'US-East-1', coords: [-77.48, 38.95], type: 'hub', description: 'Global traffic backbone' },
    { name: 'Dublin-AZ', coords: [-6.26, 53.34], type: 'hub', description: 'EU Data Sovereignty Hub' },
    { name: 'Tokyo-AZ', coords: [139.69, 35.68], type: 'hub', description: 'Asia-Pacific core node' },
];

// ─── DYNAMIC PROCESSORS ───────────────────────────────────────────────────────

const HOTSPOT_KEYWORDS: Record<string, { coords: [number, number], iso: string }> = {
  'ukraine': { coords: [31.1656, 48.3794], iso: 'UKR' },
  'kiev': { coords: [30.5234, 50.4501], iso: 'UKR' },
  'russia': { coords: [37.6173, 55.7558], iso: 'RUS' },
  'gaza': { coords: [34.4267, 31.4332], iso: 'PSE' },
  'israel': { coords: [34.8516, 31.0461], iso: 'ISR' },
  'lebanon': { coords: [35.5017, 33.8938], iso: 'LBN' },
  'taiwan': { coords: [121.5, 23.5], iso: 'TWN' },
  'red sea': { coords: [40.0, 20.0], iso: 'YEM' },
  'suez': { coords: [32.5, 29.9], iso: 'EGY' },
  'houthi': { coords: [43.0, 15.0], iso: 'YEM' },
  'sudan': { coords: [32.5599, 15.5007], iso: 'SDN' },
  'niger': { coords: [8.0, 17.0], iso: 'NER' },
  'iran': { coords: [53.688, 32.4279], iso: 'IRN' },
  'north korea': { coords: [127.0, 39.0], iso: 'PRK' },
  'south china sea': { coords: [114.0, 10.0], iso: 'CHN' },
  'venezuela': { coords: [-66.9036, 10.4806], iso: 'VEN' },
  'syria': { coords: [36.2913, 33.5138], iso: 'SYR' },
  'usa': { coords: [-95.7129, 37.0902], iso: 'USA' },
  'china': { coords: [104.1954, 35.8617], iso: 'CHN' },
  'india': { coords: [78.9629, 20.5937], iso: 'IND' },
  'brazil': { coords: [-51.9253, -14.235], iso: 'BRA' },
  'france': { coords: [2.2137, 46.2276], iso: 'FRA' },
  'germany': { coords: [10.4515, 51.1657], iso: 'DEU' },
  'japan': { coords: [138.2529, 36.2048], iso: 'JPN' },
  'united kingdom': { coords: [-3.436, 55.3781], iso: 'GBR' },
  'pakistan': { coords: [69.3451, 30.3753], iso: 'PAK' },
  'saudi arabia': { coords: [45.0792, 23.8859], iso: 'SAU' },
  'turkey': { coords: [35.2433, 38.9637], iso: 'TUR' },
  'egypt': { coords: [30.8025, 26.8206], iso: 'EGY' },
  'nigeria': { coords: [8.6753, 9.082], iso: 'NGA' },
  'afghanistan': { coords: [67.7099, 33.9391], iso: 'AFG' },
  'iraq': { coords: [43.6793, 33.2232], iso: 'IRQ' },
  'libya': { coords: [17.2283, 26.3351], iso: 'LBY' },
  'mexico': { coords: [-102.5528, 23.6345], iso: 'MEX' },
  'philippines': { coords: [121.774, 12.8797], iso: 'PHL' },
  'poland': { coords: [19.1451, 51.9194], iso: 'POL' },
  'vietnam': { coords: [108.2772, 14.0583], iso: 'VNM' },
};


import { getGeopoliticalIntelligence, CountryIntelligence } from './intelligence-engine';
import { Article } from './types';

/**
 * Scans article stream to generate dynamic conflict hotspots.
 * Refactored to use the improved Geopolitical Intelligence Engine.
 */
export function getLiveHotspots(articles: any[] = []): MapPoint[] {
  const intel = getGeopoliticalIntelligence(articles as Article[]);
  
  return Object.values(intel)
    .filter(c => c.kineticCount > 0 || c.status === 'CRITICAL' || c.status === 'VOLATILE')
    .map(c => {
        // Find coordinates for the nation if they exists in our old keyword map or use a default if not
        // This keeps the map hotspots aligned with the engine
        const keywordEntry = Object.entries(HOTSPOT_KEYWORDS).find(([k, v]) => v.iso === c.isoCode);
        
        return {
            name: c.name,
            coords: (keywordEntry ? keywordEntry[1].coords : [0, 0]) as [number, number],
            type: 'hotspot' as const,
            intensity: Math.min(c.riskScore / 100, 1),
            description: c.intelBrief,
            isoCode: c.isoCode
        };
    })
    .filter(h => h.coords[0] !== 0); // Only return valid hotspots
}
