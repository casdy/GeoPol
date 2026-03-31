/**
 * Geopolitical Intelligence Engine (V1)
 * 
 * Logic to map live news articles to nations and determine 
 * their tactical status, threat level, and primary briefings.
 */

import { Article } from './types';

export interface CountryIntelligence {
    isoCode: string;
    name: string;
    status: 'CRITICAL' | 'VOLATILE' | 'UNSTABLE' | 'STABLE' | 'MONITORING' | 'SECURE';
    riskScore: number; // 0-100
    topHeadline: string;
    intelBrief: string;
    kineticCount: number;
    warTerrorCount: number;
    stabilityCount: number;
}

// ─── COUNTRY REGISTRY ────────────────────────────────────────────────────────

const COUNTRY_REGISTRY: Record<string, { iso: string; aliases: string[] }> = {
    'AFGHANISTAN': { iso: 'AFG', aliases: ['kabul', 'taliban'] },
    'ALBANIA': { iso: 'ALB', aliases: [] },
    'ALGERIA': { iso: 'DZA', aliases: [] },
    'ARGENTINA': { iso: 'ARG', aliases: ['buenos aires'] },
    'ARMENIA': { iso: 'ARM', aliases: [] },
    'AUSTRALIA': { iso: 'AUS', aliases: ['sydney', 'canberra', 'melbourne'] },
    'AUSTRIA': { iso: 'AUT', aliases: ['vienna'] },
    'AZERBAIJAN': { iso: 'AZE', aliases: ['baku'] },
    'BANGLADESH': { iso: 'BGD', aliases: ['dhaka'] },
    'BELGIUM': { iso: 'BEL', aliases: ['brussels', 'eu'] },
    'BRAZIL': { iso: 'BRA', aliases: ['rio de janeiro', 'sao paulo', 'brasilia', 'lula'] },
    'CANADA': { iso: 'CAN', aliases: ['ottawa', 'toronto', 'vancouver'] },
    'CHILE': { iso: 'CHL', aliases: ['santiago'] },
    'CHINA': { iso: 'CHN', aliases: ['beijing', 'shanghai', 'xi jinping', 'south china sea'] },
    'COLOMBIA': { iso: 'COL', aliases: ['bogota'] },
    'CONGO': { iso: 'COD', aliases: ['kinshasa', 'drc'] },
    'CUBA': { iso: 'CUB', aliases: ['havana'] },
    'EGYPT': { iso: 'EGY', aliases: ['cairo', 'suez'] },
    'ETHIOPIA': { iso: 'ETH', aliases: ['addis ababa'] },
    'FRANCE': { iso: 'FRA', aliases: ['paris', 'macron'] },
    'GERMANY': { iso: 'DEU', aliases: ['berlin', 'frankfurt', 'scholz'] },
    'GREECE': { iso: 'GRC', aliases: ['athens'] },
    'HUNGARY': { iso: 'HUN', aliases: ['budapest', 'orban'] },
    'INDIA': { iso: 'IND', aliases: ['new delhi', 'mumbai', 'modi'] },
    'INDONESIA': { iso: 'IDN', aliases: ['jakarta'] },
    'IRAN': { iso: 'IRN', aliases: ['tehran', 'khamenei', 'natanz'] },
    'IRAQ': { iso: 'IRQ', aliases: ['baghdad'] },
    'ISRAEL': { iso: 'ISR', aliases: ['jerusalem', 'tel aviv', 'netanyahu', 'gaza', 'idf'] },
    'ITALY': { iso: 'ITA', aliases: ['rome', 'milan', 'meloni'] },
    'JAPAN': { iso: 'JPN', aliases: ['tokyo', 'osaka', 'kishida'] },
    'JORDAN': { iso: 'JOR', aliases: ['amman'] },
    'KAZAKHSTAN': { iso: 'KAZ', aliases: ['astana'] },
    'KENYA': { iso: 'KEN', aliases: ['nairobi'] },
    'KOREA_NORTH': { iso: 'PRK', aliases: ['pyongyang', 'kim jong un', 'dprk'] },
    'KOREA_SOUTH': { iso: 'KOR', aliases: ['seoul', 'samsung'] },
    'LEBANON': { iso: 'LBN', aliases: ['beirut', 'hezbollah'] },
    'LIBYA': { iso: 'LBY', aliases: ['tripoli'] },
    'MALAYSIA': { iso: 'MYS', aliases: ['kuala lumpur'] },
    'MEXICO': { iso: 'MEX', aliases: ['mexico city'] },
    'MOROCCO': { iso: 'MAR', aliases: ['rabat'] },
    'NETHERLANDS': { iso: 'NLD', aliases: ['amsterdam', 'hague'] },
    'NIGER': { iso: 'NER', aliases: ['niamey'] },
    'NIGERIA': { iso: 'NGA', aliases: ['abuja', 'lagos'] },
    'NORWAY': { iso: 'NOR', aliases: ['oslo'] },
    'PAKISTAN': { iso: 'PAK', aliases: ['islamabad', 'karachi'] },
    'PALESTINE': { iso: 'PSE', aliases: ['gaza', 'west bank', 'hamas'] },
    'PANAMA': { iso: 'PAN', aliases: ['panama canal'] },
    'PERU': { iso: 'PER', aliases: ['lima'] },
    'PHILIPPINES': { iso: 'PHL', aliases: ['manila'] },
    'POLAND': { iso: 'POL', aliases: ['warsaw'] },
    'PORTUGAL': { iso: 'PRT', aliases: ['lisbon'] },
    'QATAR': { iso: 'QAT', aliases: ['doha'] },
    'ROMANIA': { iso: 'ROU', aliases: ['bucharest'] },
    'RUSSIA': { iso: 'RUS', aliases: ['moscow', 'putin', 'kremlin', 'ukraine war'] },
    'SAUDI_ARABIA': { iso: 'SAU', aliases: ['riyadh', 'jeddah', 'mbs'] },
    'SINGAPORE': { iso: 'SGP', aliases: [] },
    'SOUTH_AFRICA': { iso: 'ZAF', aliases: ['cape town', 'johannesburg', 'pretoria'] },
    'SPAIN': { iso: 'ESP', aliases: ['madrid', 'barcelona'] },
    'SUDAN': { iso: 'SDN', aliases: ['khartoum'] },
    'SWEDEN': { iso: 'SWE', aliases: ['stockholm'] },
    'SWITZERLAND': { iso: 'CHE', aliases: ['bern', 'zurich', 'geneva'] },
    'SYRIA': { iso: 'SYR', aliases: ['damascus', 'assad'] },
    'TAIWAN': { iso: 'TWN', aliases: ['taipei'] },
    'THAILAND': { iso: 'THA', aliases: ['bangkok'] },
    'TURKEY': { iso: 'TUR', aliases: ['ankara', 'istanbul', 'erdogan'] },
    'UKRAINE': { iso: 'UKR', aliases: ['kyiv', 'zelensky', 'kharkiv', 'donbas'] },
    'UNITED_ARAB_EMIRATES': { iso: 'ARE', aliases: ['dubai', 'abu dhabi'] },
    'UNITED_KINGDOM': { iso: 'GBR', aliases: ['london', 'downing street', 'sunak', 'king charles'] },
    'USA': { iso: 'USA', aliases: ['washington', 'biden', 'trump', 'pentagon', 'white house', 'new york'] },
    'VENEZUELA': { iso: 'VEN', aliases: ['caracas', 'maduro'] },
    'VIETNAM': { iso: 'VNM', aliases: ['hanoi'] },
    'YEMEN': { iso: 'YEM', aliases: ['sanaa', 'houthi'] },
};

// ─── TACTICAL KEYWORDS ──────────────────────────────────────────────────────

const WAR_TERROR_WORDS = [
    'war', 'invasion', 'combat', 'military', 'army', 'soldier', 'terror', 'terrorism', 'terrorist', 
    'insurgent', 'militant', 'bombing', 'missile strike', 'rocket attack', 'offensive'
];

const KINETIC_WORDS = [
    'conflict', 'strike', 'blast', 'explosion', 'attack', 'kill', 'death', 'dead',
    'missile', 'rocket', 'fire', 'bomb', 'drone', 'shelling', 'casualty',
    'coup', 'riot', 'clash', 'protest', 'violence', 'hostage', 'siege'
];

const STABILITY_WORDS = [
    'treaty', 'pact', 'agreement', 'deal', 'cooperation', 'growth', 'summit', 'talks',
    'peace', 'election', 'democracy', 'trade', 'investment', 'reform', 'stability',
    'dialogue', 'diplomacy', 'partnership', 'alliance', 'ratified', 'victory'
];

// ─── THE ENGINE ──────────────────────────────────────────────────────────────

/**
 * Processes a stream of articles and generates national intelligence profiles.
 */
export function getGeopoliticalIntelligence(articles: Article[] = []): Record<string, CountryIntelligence> {
    const intelligence: Record<string, CountryIntelligence> = {};

    // Initialize every country with a monitoring status
    const seenArticles = new Set<string>();
    Object.entries(COUNTRY_REGISTRY).forEach(([name, meta]) => {
        intelligence[meta.iso] = {
            isoCode: meta.iso,
            name: name,
            status: 'MONITORING',
            riskScore: 5,
            topHeadline: 'AWAITING SIGNALS',
            intelBrief: 'NO ACTIVE TACTICAL REPORTS FOR THIS SECTOR.',
            kineticCount: 0,
            warTerrorCount: 0,
            stabilityCount: 0
        };
    });

    articles.forEach(article => {
        // Aggressive normalization: lowercase, alphanumeric only, trim
        const normalizedTitle = (article.title || '')
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .trim();
        
        const titlePrefix = normalizedTitle.substring(0, 50);

        if (seenArticles.has(normalizedTitle) || (normalizedTitle.length > 50 && seenArticles.has(titlePrefix))) {
            return;
        }

        seenArticles.add(normalizedTitle);
        if (normalizedTitle.length > 50) seenArticles.add(titlePrefix);

        const text = (normalizedTitle + ' ' + (article.description || '')).toLowerCase();

        // 1. Identify Target Nations
        Object.entries(COUNTRY_REGISTRY).forEach(([name, meta]) => {
            const countryIdentifier = name.toLowerCase();
            const matchedAlias = meta.aliases.find(alias => text.includes(alias));
            
            if (text.includes(countryIdentifier) || matchedAlias) {
                const cIntel = intelligence[meta.iso];
                
                // Update Headline (if latest or more critical)
                // Heuristic: If article has kinetic words, it's higher priority
                const isKinetic = KINETIC_WORDS.some(w => text.includes(w));
                const currentIsKinetic = KINETIC_WORDS.some(w => cIntel.topHeadline.toLowerCase().includes(w));
                
                if (cIntel.topHeadline === 'AWAITING SIGNALS' || (isKinetic && !currentIsKinetic)) {
                    cIntel.topHeadline = article.title;
                    cIntel.intelBrief = article.description || article.title;
                }

                // 2. Tally Hot Words
                WAR_TERROR_WORDS.forEach(w => { if (text.includes(w)) cIntel.warTerrorCount++; });
                KINETIC_WORDS.forEach(w => { if (text.includes(w)) cIntel.kineticCount++; });
                STABILITY_WORDS.forEach(w => { if (text.includes(w)) cIntel.stabilityCount++; });
            }
        });
    });

    // 3. Status Determination (Final Pass)
    Object.values(intelligence).forEach(cIntel => {
        if (cIntel.kineticCount > 0 || cIntel.stabilityCount > 0) {
            // Calculate Risk Score
            const totalSignals = cIntel.kineticCount + cIntel.stabilityCount;
            const score = Math.min((cIntel.kineticCount * 15) - (cIntel.stabilityCount * 5) + 10, 100);
            cIntel.riskScore = Math.max(score, 5);

            // Label Status based on Risk and Signal Composition
            const hasWarTerror = cIntel.warTerrorCount > 0;
            
            if (cIntel.riskScore > 75 && hasWarTerror) cIntel.status = 'CRITICAL';
            else if (cIntel.riskScore > 50) cIntel.status = 'VOLATILE';
            else if (cIntel.riskScore > 30) cIntel.status = 'UNSTABLE';
            else if (cIntel.stabilityCount > 3 && cIntel.kineticCount === 0 && !hasWarTerror) cIntel.status = 'SECURE';
            else if (cIntel.stabilityCount > 0) cIntel.status = 'STABLE';
            else cIntel.status = 'MONITORING';
        } else {
            // Default status for no-signal countries (Often secure/monitoring)
            cIntel.status = 'SECURE'; 
        }
    });

    return intelligence;
}
