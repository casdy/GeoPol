/**
 * Fusion Engine (V2)
 * 
 * Orchestrates the AI synthesis of geopolitical data.
 * Designed for triple-batch execution (Cron) with high reliability.
 */

import { generateText } from './ai-router';

const FUSION_SYSTEM_PROMPT = `
You are the GeoPol Strategic Fusion AI. 
Analyze the provided JSON payload containing News, NASA events, USGS earthquakes, and Flight data.
Generate a high-density, professional tactical situation report.

OUTPUT RULES:
1. Return EXACT JSON. No markdown, no conversational filler.
2. If news is stale or missing, focus on the available environmental data (NASA/USGS).
3. "global_status": One of [CRITICAL, VOLATILE, UNSTABLE, STABLE, MONITORING].
4. "intel_summary": A 3-sentence high-level strategic briefing.
5. "briefings": Match key events to countries. Focus on 5-8 major developments.
6. "newsletter": A richer, narrative paragraph for an email briefing.

JSON SCHEMA:
{
  "status": "...",
  "summary": "...",
  "threat_level": 0-100,
  "hotspots": [
    { "iso": "USA", "title": "...", "snippet": "...", "severity": "..." }
  ],
  "newsletter_brief": "..."
}
`;

export async function callOpenRouterFusion(trimmedPayload: any) {
    console.log("[fusion] Synthesizing tactical insights...");
    
    const prompt = `
    CURRENT DATA SNAPSHOT:
    ${JSON.stringify(trimmedPayload)}

    Synthesize the situation report according to the system prompt.
    Ensure 'newsletter_brief' is detailed and professional for a high-level inbox.
    `;

    try {
        // We use generateText from ai-router which already handles fallbacks
        // but we'll wrap it for fusion-specific logging and potential second-tier fallbacks if needed.
        const response = await generateText(FUSION_SYSTEM_PROMPT + "\n\n" + prompt, true);
        
        return response;
    } catch (e) {
        console.error("[fusion] AI synthesis failed:", e);
        throw e;
    }
}
