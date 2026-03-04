export type Region = 'Global' | 'Middle East' | 'Eastern Europe' | 'Asia Pacific' | 'Americas' | 'Africa' | 'Arctic' | 'South Asia' | 'Central Asia' | 'Latin America';

export interface BiasMeta {
  sourceReliability: "high" | "medium" | "unknown";
  ownershipType: "state" | "private" | "publicly_traded" | "unknown";
  countryOfOrigin: string;
  geopoliticalAlignment: "western" | "non_western" | "mixed" | "unknown";
  sensationalismScore: number;
  emotionallyLoadedLanguage: boolean;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  domain: string;
  publishedAt: string; // ISO String
  image?: string;
  biasMeta: BiasMeta;
  tags?: string[];
}

export interface Video {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  thumbnail?: string;
}

export interface FetchOptions {
  query?: string;
  region?: Region;
  isCrisisMode?: boolean;
  page?: number;
  category?: string;
}
