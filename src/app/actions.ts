'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { headers } from 'next/headers';
import * as cheerio from 'cheerio';

import { rateLimit } from '@/lib/rate-limit';

const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");
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
        if (!process.env.API_KEY) {
            // Log missing key internally, return generic error
            console.error('SERVER CONFIG ERROR: API_KEY is missing.');
            return { error: 'Service temporarily unavailable.' };
        }

        // 2. Call Gemini
        const headerPayload = await headers();
        // Use the incoming referrer, or fallback to the host
        const referer = headerPayload.get('referer') || `http://${headerPayload.get('host')}` || 'http://localhost:3000';

        const model = genAI.getGenerativeModel(
            { model: 'gemini-2.0-flash' },
            { customHeaders: { 'Referer': referer } }
        );

        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { revalidate: 3600 }
        });

        if (!res.ok) {
            return { error: 'Unable to access source article.' }; // Generic error
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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return { summary: text };

    } catch (error: any) {
        // 3. Error Suppression
        // Log the full error to server logs for debugging
        console.error('SECURE SERVER LOG - Summarization Error:', error);

        // Return a sanitized, generic error to the client
        return { error: 'An processing error occurred. Our team has been notified.' };
    }
}

export async function fetchArticleContent(url: string) {
    try {
        if (!url) return { error: 'Invalid URL' };

        // Rate limit check (optional, but good practice if heavily used)
        const headerPayload = await headers();
        const ip = headerPayload.get('x-forwarded-for') || 'anonymous';
        if (!limiter.check(ip)) {
            return { error: 'Rate limit exceeded. Try again shortly.' };
        }

        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { revalidate: 3600 }
        });

        if (!res.ok) throw new Error('Failed to fetch article');

        const html = await res.text();
        const $ = cheerio.load(html);

        // Remove unwanted elements
        $('script, style, nav, header, footer, iframe, .ad, .advertisement, .social-share, .comments').remove();

        // Target common article bodies
        const selectors = [
            'article',
            '[itemprop="articleBody"]',
            '.article-body',
            '.story-body',
            '.post-content',
            '.entry-content',
            'main'
        ];

        let content = '';
        for (const selector of selectors) {
            const el = $(selector);
            if (el.length > 0) {
                // Get paragraphs for better formatting
                content = el.find('p').map((_, p) => $(p).text().trim()).get().join('\n\n');
                if (content.length > 500) break; // Found a good candidate
            }
        }

        // Fallback if structured selectors fail
        if (content.length < 200) {
            content = $('body').find('p').map((_, p) => $(p).text().trim()).get().join('\n\n');
        }

        return { content: content.slice(0, 20000) }; // Limit size

    } catch (error) {
        console.error('Fetch Content Error:', error);
        return { error: 'Unable to retrieve full content from source.' };
    }
}
