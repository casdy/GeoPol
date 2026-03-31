import { NextResponse } from 'next/server';
import { OpenRouter } from '@openrouter/sdk';

export const revalidate = 0; // No caching for individual summaries

const MODELS = [
  'meta-llama/llama-3.2-3b-instruct:free',
  'google/gemma-3-27b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen-2.5-7b-instruct:free',
  'openrouter/auto'
];

export async function POST(req: Request) {
  try {
    const { title, description, source } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    const client = new OpenRouter({
      apiKey: process.env.Open_Router || process.env.OPENROUTER_API_KEY || ''
    });

    const prompt = `You are a GeoPol Intelligence Analyst. 
Task: Synthesize a high-density "Tactical Intelligence Brief" for a field commander.
Context: Article Title: ${title}, Description: ${description}, Source: ${source}.

Requirements:
- TONE: Professional, cold, analytical (Military Grade).
- FORMAT: Single paragraph, max 60 words.
- CONTENT: Focus on strategic implications and tactical shifts.
- DICTION: Use terms like 'Vector', 'Kinetic', 'Asymmetric', 'Buffer Zone', 'Signal Density'.
- NO introductory phrases like "Here is the summary". Start directly with the intel.`;

    for (const model of MODELS) {
      try {
        const result = client.callModel({
          model,
          input: prompt,
          maxOutputTokens: 150,
          temperature: 0.3
        });

        const text = await result.getText();
        if (text) return NextResponse.json({ summary: text.trim() });
      } catch (e) {
        console.warn(`Summarizer: Model ${model} failed, trying fallback...`);
      }
    }

    return NextResponse.json({ error: 'AI Synthesis Offline' }, { status: 500 });
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
