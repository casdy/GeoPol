export type Region = 'Global' | 'Middle East' | 'Eastern Europe' | 'Asia Pacific' | 'Americas' | 'Africa' | 'Arctic' | 'South Asia' | 'Central Asia' | 'Latin America';

export interface PulseItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string; // ISO String
  url: string;
  imageUrl?: string;
  type: 'article' | 'video';
  tags: string[];
}

export interface FetchOptions {
  query?: string;
  region?: Region;
  isCrisisMode?: boolean;
}
