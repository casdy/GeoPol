import { Article } from './types';

export interface QuadcoreResults {
  globalRiskScore: number;
  theaterRisks: Record<string, number>;
  activeAPTs: string[];
  logisticsAlerts: string[];
  microBriefs: string[];
  timestamp: string;
}

/**
 * Quadcore Deterministic Engine
 * Processes OSINT data locally using high-speed regex and keyword mapping.
 */
export const QuadcoreEngine = {
  /**
   * Core 1: Geopolitical Theater Risk
   */
  processGeo: (articles: Article[]): Record<string, number> => {
    const theaters: Record<string, string[]> = {
      'Taiwan Strait': ['taiwan', 'tsmc', 'pla', 'strait'],
      'Red Sea': ['houthi', 'red sea', 'suez', 'bab al-mandab'],
      'Eastern Europe': ['ukraine', 'donbas', 'kyiv', 'russia', 'nato'],
      'Middle East': ['iran', 'israel', 'gaza', 'hezbollah', 'lebanon'],
      'South China Sea': ['philippines', 'manila', 'maritime', 'spratlys']
    };

    const risks: Record<string, number> = {};
    Object.keys(theaters).forEach(t => {
      const keywords = theaters[t];
      const count = articles.filter(a => 
        keywords.some(k => (a.title + a.description).toLowerCase().includes(k))
      ).length;
      
      // Benchmarking: 0=Stable, 5+=Elevated, 15+=Critical
      risks[t] = Math.min(100, count * 7);
    });

    return risks;
  },

  /**
   * Core 2: Cyber Threat Detection
   */
  processCyber: (articles: Article[]): string[] => {
    const aptKeywords = [
      'APT28', 'APT29', 'Lazarus', 'LockBit', 'StellarBear', 
      'Fancy Bear', 'Storm-05', 'Volt Typhoon', 'Sandworm'
    ];
    
    const detected = new Set<string>();
    articles.forEach(a => {
      const text = (a.title + a.description).toUpperCase();
      aptKeywords.forEach(k => {
        if (text.includes(k.toUpperCase())) detected.add(k);
      });
    });

    return Array.from(detected);
  },

  /**
   * Core 3: Logistics & Aviation Anomaly
   */
  processLogistics: (articles: Article[]): string[] => {
    const emergencyKeywords = ['squawk', '7700', '7600', 'ground stop', 'diverted', 'mid-air'];
    const alerts: string[] = [];
    
    articles.forEach(a => {
      const text = (a.title + a.description).toLowerCase();
      if (emergencyKeywords.some(k => text.includes(k))) {
        alerts.push(a.title);
      }
    });

    return alerts.slice(0, 5);
  },

  /**
   * Core 4: Micro-Insight Synthesis (NLP-Light)
   */
  synthesizeInsights: (articles: Article[]): string[] => {
    return articles
      .slice(0, 10)
      .map(a => {
        const sentence = (a.description || a.title).split('. ')[0];
        return sentence.length > 100 ? sentence.substring(0, 100) + '...' : sentence;
      });
  },

  /**
   * Run all cores
   */
  run: (articles: Article[]): QuadcoreResults => {
    const theaterRisks = QuadcoreEngine.processGeo(articles);
    const globalRiskScore = Math.min(100, Object.values(theaterRisks).reduce((a, b) => a + b, 0) / Object.keys(theaterRisks).length + 20);

    return {
      globalRiskScore: Math.round(globalRiskScore),
      theaterRisks,
      activeAPTs: QuadcoreEngine.processCyber(articles),
      logisticsAlerts: QuadcoreEngine.processLogistics(articles),
      microBriefs: QuadcoreEngine.synthesizeInsights(articles),
      timestamp: new Date().toISOString()
    };
  }
};
