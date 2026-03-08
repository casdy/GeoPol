"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY || "";

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

/**
 * Builds a WAV file buffer from raw 16-bit Little-Endian PCM bytes.
 * Gemini TTS returns audio/L16;codec=pcm;rate=24000 (16-bit signed, mono, 24kHz).
 */
function buildWavHeader(pcmLength: number, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmLength, 4);       // ChunkSize
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);                   // Subchunk1Size (PCM)
  header.writeUInt16LE(1, 20);                    // AudioFormat = PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcmLength, 40);            // Subchunk2Size

  return header;
}

/**
 * Uses Gemini 2.5 Flash TTS (gemini-2.5-flash-preview-tts) to synthesize audio.
 * Returns a base64-encoded WAV data URI suitable for the HTML <audio> element.
 */
export async function generateAudioBuffer(text: string, speaker: "host"): Promise<string> {
  if (!geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY. Please add it to your .env.local file.");
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  // "Charon" is a deep, authoritative male voice
                  voiceName: "Charon",
                },
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(`Gemini TTS API error: ${response.status} - ${JSON.stringify(errData)}`);
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      throw new Error("Gemini TTS returned no audio parts.");
    }

    const audioPart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("audio/"));
    if (!audioPart) {
      throw new Error("Gemini TTS response contained no audio inline data.");
    }

    // The API returns raw PCM: audio/L16;codec=pcm;rate=24000 (16-bit LE, mono, 24kHz)
    const pcmBase64 = audioPart.inlineData.data as string;
    const pcmBuffer = Buffer.from(pcmBase64, "base64");

    // Wrap PCM in a valid WAV container
    const wavHeader = buildWavHeader(pcmBuffer.length);
    const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);

    // Return as a base64 WAV data URI the browser can play natively
    return `data:audio/wav;base64,${wavBuffer.toString("base64")}`;

  } catch (error: any) {
    console.error("Gemini TTS Generation Error:", error);
    throw new Error(`Failed to generate audio: ${error.message}`);
  }
}
