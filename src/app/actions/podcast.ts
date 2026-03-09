"use server";

import { generateText } from "@/lib/ai-router";

export interface PodcastLine {
  speaker: "host";
  text: string;
}

export async function generateConversationalScript(params: {
  type: "overview" | "deep-dive";
  data: any;
  hostName?: string;
}): Promise<PodcastLine[]> {
  const HOST_NAMES = ["Alexander", "Caleb", "Josh", "Wale", "Iyke"];
  const randomHost = HOST_NAMES[Math.floor(Math.random() * HOST_NAMES.length)];
  const host = params.hostName || randomHost;

  let promptContext = "";
  if (params.type === "overview") {
    promptContext = `
    Instructions: Do a rapid-fire roundup of the provided headlines, noting global trends.
    Data (Headlines):
    ${JSON.stringify(params.data, null, 2)}
    `;
  } else if (params.type === "deep-dive") {
    promptContext = `
    Instructions: Do a detailed analysis of the single article's full text, debating the geopolitical implications.
    Data (Article Full Text):
    ${JSON.stringify(params.data, null, 2)}
    `;
  }

  const prompt = `
    You are an expert podcast scriptwriter. I will provide context for a daily news briefing podcast.
    
    The script features a single male host narrating the news:
    - Host (Name: "${host}"): The main anchor, formal but approachable, delivering a solo briefing.
    
    STRICT INTRODUCTION RULE:
    - The host must start with a greeting, like: "Welcome to the GeoPolitical Pulse briefing, I'm ${host}."
    
    STRICT OUTRO RULE:
    - The host MUST end the briefing by saying exactly (or very closely to): "If you want to get intelligence like this delivered to your inbox daily, feel free to subscribe to the Pulse Daily newsletter."
    
    Keep the podcast brief (about 6-8 lines total).
    
    IMPORTANT: You must return the output EXACTLY as a JSON array of objects, with no markdown formatting outside of the JSON. Avoid wrapping in \`\`\`json.
    Each object must have exactly two string properties:
    "speaker": Must be "host"
    "text": The line of dialogue spoken by the host
    
    Context:
    ${promptContext}
  `;

  try {
    const textInfo = await generateText(prompt, true);
    let cleanText = textInfo.replace(/```json/gi, "").replace(/```/g, "").trim();

    const jsonStartIdx = cleanText.indexOf("[");
    const jsonEndIdx = cleanText.lastIndexOf("]");
    if (jsonStartIdx !== -1 && jsonEndIdx !== -1) {
      cleanText = cleanText.substring(jsonStartIdx, jsonEndIdx + 1);
    }

    const script: PodcastLine[] = JSON.parse(cleanText);

    if (!Array.isArray(script) || script.length === 0) {
      throw new Error("AI returned an empty script array.");
    }

    return script;
  } catch (error: any) {
    console.error("Error generating podcast script:", error);
    throw new Error("Failed to generate podcast script.");
  }
}

/**
 * Gemini (Google Cloud) TTS — PREMIUM audio source.
 * High-quality neural voices.
 */
export async function generateAudioBuffer(
  text: string,
  speaker: "host"
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured.");
  }

  // Google Cloud Text-to-Speech API
  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: "en-US",
          name: "en-US-Neural2-D", // Premium neural male voice
        },
        audioConfig: {
          audioEncoding: "MP3",
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini TTS Error:", errText);
    throw new Error(`Gemini TTS error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.audioContent) {
    throw new Error("Gemini TTS returned no audio content.");
  }

  return `data:audio/mp3;base64,${data.audioContent}`;
}

/**
 * RapidAPI (Open-AI21) TTS — FUTURE/Alternative audio source.
 */
export async function generateAudioBufferRapid(
  text: string,
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "alloy"
): Promise<string> {
  const rapidKey = process.env.X_Rapid_Api_Key;
  if (!rapidKey) {
    throw new Error("X_Rapid_Api_Key not configured.");
  }

  const response = await fetch("https://open-ai21.p.rapidapi.com/texttospeech", {
    method: "POST",
    headers: {
      "x-rapidapi-key": rapidKey.replace(/'/g, "").trim(),
      "x-rapidapi-host": "open-ai21.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text,
      voice: voice,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("RapidAPI TTS Error:", errText);
    throw new Error(`RapidAPI TTS error: ${response.status}`);
  }

  const data = await response.json();
  // RapidAPI open-ai21 typically returns { "status": "ok", "url": "..." } 
  // or a base64 string depending on the exact sub-endpoint or response config.
  // Based on common "open-ai21" wrappers, it might return a direct URL or base64.
  if (data.audio_url) {
    return data.audio_url;
  }
  
  if (data.audioContent) {
    return `data:audio/mp3;base64,${data.audioContent}`;
  }

  throw new Error("RapidAPI TTS returned no recognizable audio content.");
}

/**
 * HF TTS Fallback (Future Reference)
 */
/*
export async function generateAudioBufferHF(text: string): Promise<string> {
  const hfKey = process.env.HF_KEY;
  // ... implementation ...
}
*/

