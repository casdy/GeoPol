"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY || "";
const googleTtsApiKey = process.env.GOOGLE_TTS_API_KEY || ""; // Add this to .env.local

// Initialize Gemini
const genAI = new GoogleGenerativeAI(geminiApiKey);

export interface PodcastLine {
  speaker: "host";
  text: string;
}

export async function generateConversationalScript(params: { 
  type: 'overview' | 'deep-dive', 
  data: any,
  hostName?: string
}): Promise<PodcastLine[]> {
  if (!geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable. Please add it to your .env.local file.");
  }

  const HOST_NAMES = ["Alexander", "Caleb", "Josh", "Wale", "Iyke"];
  const randomHost = HOST_NAMES[Math.floor(Math.random() * HOST_NAMES.length)];
  const host = params.hostName || randomHost;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    // Force JSON output structure
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

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
    const result = await model.generateContent(prompt);
    const textInfo = result.response.text();
    // Safely parse the JSON, stripping any potential markdown formatting the AI might still add
    let cleanText = textInfo.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    // In-depth validation: Ensure we don't crash if Gemini hallucinated prepended text
    const jsonStartIdx = cleanText.indexOf('[');
    const jsonEndIdx = cleanText.lastIndexOf(']');
    if (jsonStartIdx !== -1 && jsonEndIdx !== -1) {
      cleanText = cleanText.substring(jsonStartIdx, jsonEndIdx + 1);
    }

    const script: PodcastLine[] = JSON.parse(cleanText);
    
    if (!Array.isArray(script) || script.length === 0) {
      throw new Error("Gemini returned an empty script array.");
    }
    
    return script;
  } catch (error: any) {
    console.error("Error generating podcast script:", error);
    throw new Error("Failed to generate podcast script from Gemini.");
  }
}

export async function generateAudioBuffer(text: string, speaker: "host"): Promise<string> {
  try {
    // Configure distinct, high-quality male voice (Premium US English)
    const voice = { languageCode: "en-US", name: "en-US-Journey-D" };

    const request = {
      input: { text: text },
      voice: voice,
      audioConfig: { audioEncoding: "MP3" },
    };

    // Use REST API to easily spoof HTTP referer headers
    // The official GRPC client fails if the API key has web restrictions
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleTtsApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "http://localhost:3000/" // Bypass standard browser API key restrictions
      },
      body: JSON.stringify(request)
    });
    
    const data = await response.json();

    if (data.error || !data.audioContent) {
      throw new Error(data.error?.message || "No audio content returned from Google Cloud TTS.");
    }

    // data.audioContent is already a base64 encoded string from the REST API
    return `data:audio/mp3;base64,${data.audioContent}`;
  } catch (error: any) {
    console.error("Google Cloud TTS Generation Error:", error);
    throw new Error("Failed to generate audio track. Make sure GOOGLE_TTS_API_KEY is set in .env.local.");
  }
}
