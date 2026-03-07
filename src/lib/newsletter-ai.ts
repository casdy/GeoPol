import { GoogleGenerativeAI } from "@google/generative-ai";
import { PulseItem } from "./types";

const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(geminiApiKey);

export async function generateNewsletterHooks(articles: PulseItem[]): Promise<string[]> {
  if (!geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable. Please add it to your .env.local file.");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `
    You are an elite intelligence briefer writing for the "Pulse Daily" geopolitics newsletter.
    I will provide you with a list of news articles. 
    Your task is to write a highly engaging 2-sentence "Hook" summary for each article.

    STRICT CONSTRAINTS:
    - You must return EXACTLY the same number of summaries as there are articles.
    - Each summary MUST be exactly 2 sentences long.
    - Sentence 1: State the core geopolitical event clearly and authoritatively.
    - Sentence 2: End on a cliffhanger, an open question, or a statement of hidden implications to drive the reader to click and read more.

    OUTPUT FORMAT:
    - You must return the output EXACTLY as a JSON array of strings. 
    - Each string in the array is the 2-sentence hook for the corresponding article in the input.
    - Do not include any other markdown or text outside of the JSON array.

    Input Articles:
    ${JSON.stringify(
      articles.map((a, i) => ({
        index: i,
        title: a.title,
        source: a.source,
        summary: a.summary,
      })),
      null,
      2
    )}
  `;

  try {
    const result = await model.generateContent(prompt);
    const textInfo = result.response.text();
    let cleanText = textInfo.replace(/```json/gi, "").replace(/```/g, "").trim();

    const jsonStartIdx = cleanText.indexOf('[');
    const jsonEndIdx = cleanText.lastIndexOf(']');
    if (jsonStartIdx !== -1 && jsonEndIdx !== -1) {
      cleanText = cleanText.substring(jsonStartIdx, jsonEndIdx + 1);
    }

    const hooks: string[] = JSON.parse(cleanText);

    if (!Array.isArray(hooks) || hooks.length !== articles.length) {
      console.warn("Gemini returned invalid number of hooks. Falling back to original summaries.");
      return articles.map(a => a.summary);
    }

    return hooks;
  } catch (error: any) {
    console.error("Error generating newsletter hooks:", error);
    // Fallback securely to original summaries on AI failure so newsletter doesn't break
    return articles.map(a => a.summary);
  }
}
