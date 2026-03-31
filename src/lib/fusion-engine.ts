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
    console.log("[fusion] Synthesizing tactical insights via OpenRouter...");
    
    const prompt = `
    CURRENT DATA SNAPSHOT:
    ${JSON.stringify(trimmedPayload)}

    Synthesize the situation report according to the system prompt.
    Ensure 'newsletter_brief' is detailed and professional for a high-level inbox.
    `;

    try {
        const apiKey = process.env.Open_Router;
        if (!apiKey) throw new Error("Open_Router API key not configured in .env.local");

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.1-8b-instruct",
                messages: [
                    { role: "system", content: FUSION_SYSTEM_PROMPT },
                    { role: "user", content: prompt }
                ],
                temperature: 0.2
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        
        if (!text) throw new Error("OpenRouter returned empty content");
        
        return text;
    } catch (e) {
        console.error("[fusion] AI synthesis failed:", e);
        throw e;
    }
}
