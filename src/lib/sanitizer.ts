/**
 * Fusion Sanitizer Engine (V2)
 * 
 * Extracts and repairs JSON output from LLMs. 
 * Provides automated fallback to Vercel KV checkpoints.
 */

import { kv } from '@vercel/kv';

export async function sanitizeLLMOutput(rawText: string, fallbackKey: string = 'dashboard_live_data'): Promise<any> {
    try {
        // 1. Direct Parse Attempt
        return JSON.parse(rawText);
    } catch (e) {
        console.warn("[sanitizer] Direct JSON parse failed. Attempting regex repair...");
    }

    try {
        // 2. Extract JSON from Markdown Code Blocks
        const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            return JSON.parse(jsonMatch[1].trim());
        }

        // 3. Brute Force character search
        const firstChar = rawText.search(/[\[\{]/);
        const lastChar = Math.max(rawText.lastIndexOf(']'), rawText.lastIndexOf('}'));
        
        if (firstChar !== -1 && lastChar !== -1 && lastChar > firstChar) {
            const potentialJson = rawText.substring(firstChar, lastChar + 1);
            return JSON.parse(potentialJson);
        }
    } catch (e) {
        console.error("[sanitizer] Regex recovery failed:", e);
    }

    // 4. Final Fallback: Reverting to the previous 8-hour snapshot from Vercel KV
    console.warn(`[sanitizer] Critical Hallucination Detected. Falling back to KV [${fallbackKey}].`);
    const backup = await kv.get(fallbackKey);
    
    return backup || { 
        status: "MONITORING", 
        summary: "Digital intelligence systems are re-calibrating. Standby for next batch.",
        hotspots: [],
        threat_level: 5 
    };
}
