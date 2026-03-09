'use server';

import { headers } from 'next/headers';
import * as cheerio from 'cheerio';

import { rateLimit } from '@/lib/rate-limit';
import { generateText } from '@/lib/ai-router';

const limiter = rateLimit(5, 60 * 1000); // 5 requests per minute

export async function summarizeArticle(url: string) {
    // 0. Rate Limiting (DoS Protection)
    const headerPayload = await headers();
    const ip = headerPayload.get('x-forwarded-for') || 'anonymous';

    if (!limiter.check(ip)) {
        return { error: 'Too many requests. Please try again in a minute.' };
    }

    // 1. Input Validation & Sanitization
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        return { error: 'Invalid URL provided.' };
    }

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { revalidate: 3600 }
        });

        if (!res.ok) {
            return { error: 'Unable to access source article.' };
        }

        const html = await res.text();
        const $ = cheerio.load(html);
        const content = $('article, main, .article-body, .story-body, .content').text().replace(/\s+/g, ' ').trim().slice(0, 10000);

        if (content.length < 200) {
            return { error: 'Content too short to summarize.' };
        }

        const prompt = `You are a geopolitical intelligence analyst. Summarize the following news article in 3-4 concise, high-impact bullet points. Focus on the strategic implications, key actors, and potential risks. 
    
    Article Content:
    ${content}
    
    Output Format:
    - Point 1
    - Point 2
    - Point 3`;

        // generateText handles Gemini → HuggingFace fallback automatically
        const text = await generateText(prompt);

        return { summary: text };

    } catch (error: any) {
        console.error('SECURE SERVER LOG - Summarization Error:', error);
        return { error: 'A processing error occurred. Our team has been notified.' };
    }
}
