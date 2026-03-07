import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import * as fs from 'fs';

const resend = new Resend(process.env.RESEND_API_KEY);

const GEOPOL_BASE_URL = process.env.GEOPOL_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

import { PulseItem } from '@/lib/types';
import { getAggregatedIntelligence } from '@/lib/api';
import { generateNewsletterHooks } from '@/lib/newsletter-ai';

export interface CategorizedNewsletter {
  category: string;
  headlines: PulseItem[];
}

const CATEGORIES = [
  { name: 'Global', query: 'top+news' },
  { name: 'World', query: 'world+news+international' },
  { name: 'Business', query: 'business+finance' },
  { name: 'Technology', query: 'technology+AI' },
  { name: 'Entertainment', query: 'entertainment+celebrity' },
  { name: 'Science', query: 'science+research' },
  { name: 'Health', query: 'health+medicine' },
];

// ─── Daily Deduplication Cache ────────────────────────────────────────────────
const sentHeadlinesCache: { date: string; urls: Set<string> } = { date: '', urls: new Set() };

function deduplicateCategorized(categories: CategorizedNewsletter[], dateString: string): CategorizedNewsletter[] {
  if (sentHeadlinesCache.date !== dateString) {
    sentHeadlinesCache.date = dateString;
    sentHeadlinesCache.urls.clear();
  }

  return categories.map(cat => {
    const fresh = cat.headlines.filter(h => !sentHeadlinesCache.urls.has(h.url));
    fresh.forEach(h => sentHeadlinesCache.urls.add(h.url));
    return { ...cat, headlines: fresh };
  }).filter(cat => cat.headlines.length > 0);
}

// ─── HTML Builder (Styled Command Center Design) ──────────────────────────
function buildEmailHtml(categories: CategorizedNewsletter[], dateString: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const categoryBlocks = categories.map(cat => {
    const headlineRows = cat.headlines.map((h, i) => {
      const params = new URLSearchParams({
        articleUrl: h.url,
        articleTitle: h.title,
      });
      if (h.source && h.source.length < 50) params.append('articleSource', h.source);
      if (h.summary) params.append('articleDescription', h.summary.substring(0, 300));
      
      const link = `${GEOPOL_BASE_URL}/?${params.toString()}`;

      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #f3f4f6;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
              <tr>
                <td width="32" valign="top" style="padding-top:2px;">
                  <span style="display:inline-block;background-color:#111827;color:#ffffff;font-size:10px;font-weight:700;padding:4px 6px;border-radius:4px;">${String(i + 1).padStart(2, '0')}</span>
                </td>
                <td width="80" valign="top" style="padding-left:12px;padding-top:2px;">
                   <img src="${esc(h.imageUrl)}" alt="" width="80" height="80" style="display:block;border-radius:6px;object-fit:cover;background-color:#262626;border:1px solid #e5e7eb;" />
                </td>
                <td valign="top" style="padding-left:12px;">
                  <a href="${esc(link)}" target="_blank" rel="noopener noreferrer" style="color:#1d4ed8;font-size:15px;font-weight:700;line-height:1.4;text-decoration:none;display:block;margin-bottom:4px;">${esc(h.title)}</a>
                  <p style="margin:0 0 6px 0;color:#6b7280;font-size:10px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">SOURCE: ${esc(h.source)}</p>
                  <p style="margin:0;color:#374151;font-size:13px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(h.summary)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    }).join('');

    return `
      <!-- Category Header -->
      <tr>
        <td style="padding:32px 32px 8px;border-bottom:2px solid #ea580c;">
          <h2 style="margin:0;color:#111827;font-size:16px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">${esc(cat.category)}</h2>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
            ${headlineRows}
          </table>
        </td>
      </tr>
    `;
  }).join('');

  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Pulse Daily - ${esc(dateString)}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    p { display: block; margin: 0; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <center style="width:100%;background-color:#f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f4f6;margin:0 auto;" role="presentation">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <!-- MAIN CONTAINER -->
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;border:1px solid #e5e7eb;" role="presentation">

            <!-- Dark header bar -->
            <tr>
              <td bgcolor="#111827" style="padding:20px 32px;border-top-left-radius:8px;border-top-right-radius:8px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                  <tr>
                    <td>
                      <span style="color:#f97316;font-size:22px;font-weight:900;font-style:italic;letter-spacing:-0.5px;">GEOPOL</span>
                      <span style="color:#9ca3af;font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-left:8px;">Terminal</span>
                    </td>
                    <td align="right">
                      <span style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">${esc(dateString)}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Orange accent line -->
            <tr><td bgcolor="#f97316" style="height:4px;line-height:4px;font-size:4px;">&nbsp;</td></tr>

            <!-- Title -->
            <tr>
              <td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #e5e7eb;">
                <h1 style="margin:0 0 8px 0;color:#111827;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Daily Intelligence Brief</h1>
                <p style="margin:0;color:#6b7280;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Your curated geopolitical situation report</p>
              </td>
            </tr>

            <!-- Categorized Headlines -->
            <tr>
              <td style="padding:0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                  ${categoryBlocks}
                </table>
              </td>
            </tr>

            <!-- CTA button -->
            <tr>
              <td style="padding:32px;text-align:center;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
                <a href="${GEOPOL_BASE_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background-color:#ea580c;color:#ffffff;font-size:14px;font-weight:700;letter-spacing:1px;text-decoration:none;text-transform:uppercase;padding:14px 32px;border-radius:6px;min-width:200px;">Open Command Center</a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px 32px 32px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="margin:0 0 12px 0;color:#9ca3af;font-size:12px;line-height:1.6;">
                  You are receiving this because you subscribed to GeoPolitical Pulse.
                </p>
                <p style="margin:0 0 12px 0;">
                  <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#6b7280;font-size:12px;text-decoration:underline;">Unsubscribe</a>
                  &nbsp;&nbsp;&middot;&nbsp;&nbsp;
                  <a href="${GEOPOL_BASE_URL}" style="color:#6b7280;font-size:12px;text-decoration:underline;">Visit Terminal</a>
                </p>
                <p style="margin:0;color:#d1d5db;font-size:11px;">&copy; ${year} GeoPolitical Pulse. All rights reserved.</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
}

// ... pre-flight validation uses validateHtml (unchanged) ...
function validateHtml(html: string, categories: CategorizedNewsletter[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const escFull = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  if (!html || html.trim().length < 200) {
    errors.push(`HTML too short (${html?.trim().length ?? 0} chars).`);
  }
  if (!html.includes('Daily Intelligence Brief')) {
    errors.push('Missing heading "Daily Intelligence Brief".');
  }
  
  categories.forEach(cat => {
    if (cat.headlines.length > 0) {
       const firstTitle = cat.headlines[0].title;
       if (firstTitle && !html.includes(escFull(firstTitle))) {
          errors.push(`Missing headline in ${cat.category}: "${firstTitle.substring(0, 60)}"`);
       }
    }
  });

  if (!html.includes('{{{RESEND_UNSUBSCRIBE_URL}}}')) {
    errors.push('Missing {{{RESEND_UNSUBSCRIBE_URL}}} — CAN-SPAM compliance failure.');
  }
  if (!html.includes(GEOPOL_BASE_URL)) {
    errors.push('Missing GeoPol base URL.');
  }

  return { valid: errors.length === 0, errors };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
  }
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_AUDIENCE_ID) {
    return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
  }

  try {
    const dateString = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
    });

    const fetchPromises = CATEGORIES.map(async (cat) => {
      // 1. Fetch from the unified aggregation engine (Perigon, GNews, NewsAPI, Google News fallback)
      const intel = await getAggregatedIntelligence({ category: cat.name.toLowerCase() });
      
      // 2. Map the enriched unified Article back down into the newsletter PulseItem expectation
      let headlines: PulseItem[] = intel.news.slice(0, 5).map((a: any) => ({
          id: a.id,
          title: a.title,
          url: a.url,
          source: a.source,
          publishedAt: a.publishedAt,
          summary: a.description || a.title,
          imageUrl: a.image || '/images/news-placeholder.jpg',
      }));

      // 3. Generate High-CTR Hooks via Gemini
      if (headlines.length > 0) {
        const hooks = await generateNewsletterHooks(headlines);
        headlines = headlines.map((h, i) => ({
          ...h,
          summary: hooks[i] || h.summary
        }));
      }

      return { category: cat.name, headlines };
    });

    const results = await Promise.allSettled(fetchPromises);
    const rawCategories: CategorizedNewsletter[] = [];
    
    results.forEach(res => {
      if (res.status === 'fulfilled' && res.value.headlines.length > 0) {
        rawCategories.push(res.value);
      }
    });

    const force = request.nextUrl.searchParams.get('force') === 'true';
    const finalCategories = force ? rawCategories : deduplicateCategorized(rawCategories, dateString);

    const totalHeadlines = finalCategories.reduce((acc, cat) => acc + cat.headlines.length, 0);

    if (totalHeadlines === 0) {
      return NextResponse.json({ message: 'All headlines already sent today.' }, { status: 200 });
    }

    const emailHtml = buildEmailHtml(finalCategories, dateString);
    
    // Built text version as a pure fallback
    const emailText = finalCategories.map(cat => {
      let block = `=== ${cat.category.toUpperCase()} ===\n`;
      block += cat.headlines.map((h, i) => `${i + 1}. ${h.title}\nSource: ${h.source}\nURL: ${GEOPOL_BASE_URL}/?articleUrl=${encodeURIComponent(h.url)}\n\n${h.summary}`).join('\n---\n');
      return block;
    }).join('\n\n');

    // DEBUG DUMP
    try {
      import('fs').then(fs => fs.writeFileSync('c:\\Users\\User\\Desktop\\GeoPol\\debug_email.html', emailHtml));
    } catch (e) {}

    const { valid, errors: validationErrors } = validateHtml(emailHtml, finalCategories);
    if (!valid) {
      console.error('PRE-FLIGHT FAILED:', validationErrors);
      return NextResponse.json({ error: 'Pre-flight failed.', validationErrors }, { status: 500 });
    }

    const { data: contactsData, error: contactsError } = await resend.contacts.list({
      audienceId: process.env.RESEND_AUDIENCE_ID,
    });

    if (contactsError || !contactsData?.data?.length) {
      return NextResponse.json({ error: 'No subscribers found.' }, { status: 200 });
    }

    const subscriberEmails = contactsData.data
      .filter((c) => !c.unsubscribed)
      .map((c) => c.email);

    if (subscriberEmails.length === 0) {
      return NextResponse.json({ message: 'No active subscribers.' }, { status: 200 });
    }

    let totalSent = 0;

    // Use a serial loop instead of batch to isolate Resend SDK batch issues
    for (const to of subscriberEmails) {
      const { error: sendError } = await resend.emails.send({
        from: 'Pulse Daily <onboarding@resend.dev>',
        to,
        subject: `GeoPolitical Pulse - ${dateString}`,
        html: emailHtml,
        text: `GeoPolitical Pulse: Daily Intelligence Brief\n${dateString}\n\n${emailText}`, // Fallback text payload
      });
      
      if (sendError) {
        console.error(`Send error for ${to}:`, sendError);
      } else {
        totalSent++;
      }
    }

    return NextResponse.json({
      success: true,
      date: dateString,
      categoriesCount: finalCategories.length,
      headlineCount: totalHeadlines,
      subscriberCount: subscriberEmails.length,
      emailsSent: totalSent,
      htmlLength: emailHtml.length,
    });

  } catch (err: any) {
    console.error('Newsletter Error:', err);
    return NextResponse.json({ error: 'Internal server error.', details: err.message }, { status: 500 });
  }
}
