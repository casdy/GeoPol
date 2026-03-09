/**
 * ai-router.ts — Quota-Aware AI Provider Router
 *
 * Strategy:
 *  1. All text generation goes through `generateText()`.
 *  2. If Gemini returns 429, we parse the `Retry-After` (or `x-ratelimit-reset`)
 *     header to know the EXACT epoch time when the quota resets, and store it.
 *  3. Every subsequent call checks `isGeminiAvailable()` BEFORE touching the
 *     Gemini API — zero wasted calls during the cooldown window.
 *  4. Once the reset time passes, Gemini is transparently restored.
 *  5. HuggingFace (Mistral-7B-Instruct) handles all text tasks during the block.
 *  6. TTS/audio is NOT routed to HF — callers should check `isGeminiAvailable()`
 *     and surface a "paused" UI instead.
 */

// ── In-memory quota state ──────────────────────────────────────────────────
// These live for the lifetime of the Node.js process (Next.js server).
// On a fresh cold-start they reset automatically.

let geminiBlockedUntil: number = 0;       // epoch ms — 0 means available
let lastGeminiHeaders: Record<string, string> = {}; // headers from last request

// ── Constants ─────────────────────────────────────────────────────────────
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";
const HF_BASE = "https://router.huggingface.co/hf-inference/models";
const DEFAULT_COOLDOWN_MS = 60_000; // fallback if no Retry-After header

// ── Public guard ──────────────────────────────────────────────────────────

/**
 * Returns true if Gemini is currently available (quota not exhausted).
 * Zero API calls — purely a timestamp comparison.
 */
export function isGeminiAvailable(): boolean {
  return Date.now() >= geminiBlockedUntil;
}

/**
 * Returns how many milliseconds remain on the Gemini cooldown (0 = available).
 */
export function geminiCooldownMs(): number {
  return Math.max(0, geminiBlockedUntil - Date.now());
}

/**
 * Expose the last known rate-limit headers for debugging / logging.
 */
export function getLastGeminiHeaders(): Record<string, string> {
  return { ...lastGeminiHeaders };
}

// ── Private helpers ───────────────────────────────────────────────────────

/**
 * Parses the reset time from Gemini 429 response headers.
 *
 * Gemini REST API can return:
 *  - `Retry-After: <seconds>`           (most common)
 *  - `x-ratelimit-reset: <epoch-secs>`  (sometimes)
 *
 * Returns the absolute epoch-ms timestamp when we can retry.
 */
function parseGeminiResetTime(headers: Headers): number {
  // Cache all headers for inspection
  headers.forEach((value, key) => {
    lastGeminiHeaders[key.toLowerCase()] = value;
  });

  // 1. Retry-After: <seconds>
  const retryAfter = headers.get("retry-after");
  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds) && seconds > 0) {
      return Date.now() + seconds * 1_000;
    }
    // Some implementations send an HTTP-date string
    const parsed = Date.parse(retryAfter);
    if (!isNaN(parsed)) return parsed;
  }

  // 2. x-ratelimit-reset: <epoch seconds>
  const resetHeader = headers.get("x-ratelimit-reset");
  if (resetHeader) {
    const epochSec = parseInt(resetHeader, 10);
    if (!isNaN(epochSec) && epochSec > 0) {
      return epochSec * 1_000;
    }
  }

  // 3. RateLimit header (HF-style, but Gemini sometimes mirrors it): "r=X;t=Y"
  const rateLimitHeader = headers.get("ratelimit");
  if (rateLimitHeader) {
    const tMatch = rateLimitHeader.match(/t=(\d+)/);
    if (tMatch) {
      return Date.now() + parseInt(tMatch[1], 10) * 1_000;
    }
  }

  // 4. Default cooldown
  return Date.now() + DEFAULT_COOLDOWN_MS;
}

/**
 * Marks Gemini as quota-exhausted until the given epoch-ms timestamp.
 */
function blockGeminiUntil(epochMs: number): void {
  geminiBlockedUntil = epochMs;
  const resetIn = Math.ceil((epochMs - Date.now()) / 1000);
  console.warn(`[ai-router] Gemini quota exhausted. Blocked for ~${resetIn}s. Routing to HuggingFace.`);
}

// ── Gemini text generation ────────────────────────────────────────────────

async function callGemini(prompt: string, jsonMode: boolean): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    ...(jsonMode && { generationConfig: { responseMimeType: "application/json" } }),
  };

  const response = await fetch(
    `${GEMINI_BASE}/models/${GEMINI_TEXT_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  // Capture headers regardless of status
  response.headers.forEach((value, key) => {
    lastGeminiHeaders[key.toLowerCase()] = value;
  });

  if (response.status === 429) {
    const resetAt = parseGeminiResetTime(response.headers);
    blockGeminiUntil(resetAt);
    throw new GeminiQuotaError("Gemini quota exhausted (429).");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error ${response.status}: ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) throw new Error("Gemini returned empty response.");
  return text;
}

// ── HuggingFace text generation ───────────────────────────────────────────

async function callHuggingFace(prompt: string): Promise<string> {
  const apiKey = process.env.HF_KEY;
  if (!apiKey) throw new Error("HF_KEY not configured — cannot use HuggingFace fallback.");

  // Use the chat-completion style endpoint for instruction-following models
  const response = await fetch(
    `${HF_BASE}/${HF_MODEL}/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4096,
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`HuggingFace API error ${response.status}: ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("HuggingFace returned empty response.");
  return text;
}

// ── Custom error class ────────────────────────────────────────────────────

export class GeminiQuotaError extends Error {
  readonly code = "GEMINI_QUOTA_EXHAUSTED" as const;
  constructor(message: string) {
    super(message);
    this.name = "GeminiQuotaError";
  }
}

// ── Main public API ───────────────────────────────────────────────────────

/**
 * Generates text via Gemini 2.5 Flash if available, or falls back to
 * HuggingFace Mistral-7B if Gemini quota is currently exhausted.
 *
 * @param prompt   The full prompt string.
 * @param jsonMode When true, Gemini is asked to return JSON (ignored by HF,
 *                 which should still honour your prompt's JSON instructions).
 * @returns        The raw text response from whichever provider was used.
 */
export async function generateText(prompt: string, jsonMode = false): Promise<string> {
  // ── GEMINI_DISABLED mode: route ALL requests to HuggingFace, zero Gemini calls ──
  const geminiDisabled =
    process.env.GEMINI_DISABLED === "true" || !process.env.GEMINI_API_KEY;

  if (geminiDisabled) {
    console.info("[ai-router] GEMINI_DISABLED — routing directly to HuggingFace.");
    return callHuggingFace(prompt);
  }

  // ── Fast path: Gemini is available ────────────────────────────────────
  if (isGeminiAvailable()) {
    try {
      const result = await callGemini(prompt, jsonMode);
      return result;
    } catch (err) {
      if (err instanceof GeminiQuotaError) {
        console.warn("[ai-router] Mid-request 429 from Gemini — switching to HuggingFace.");
      } else {
        throw err;
      }
    }
  } else {
    const remaining = Math.ceil(geminiCooldownMs() / 1000);
    console.info(`[ai-router] Gemini blocked for ${remaining}s more — using HuggingFace.`);
  }

  // ── Fallback path: HuggingFace ─────────────────────────────────────────
  return callHuggingFace(prompt);
}
