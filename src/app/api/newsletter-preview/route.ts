import { NextResponse } from 'next/server';
import * as React from 'react';
import { render } from '@react-email/render';
import { DailyBriefingEmail } from '@/emails/DailyBriefing';

export async function GET() {
  const headlines = [
    { title: 'Test Headline One', summary: 'This is the summary for article one.', source: 'Reuters', url: 'https://example.com/one' },
    { title: 'Test Headline Two', summary: 'This is the summary for article two.', source: 'AP News', url: 'https://example.com/two' },
  ];
  const dateString = 'Friday, March 6, 2026';

  try {
    const html = await render(React.createElement(DailyBriefingEmail, { headlines, dateString }));
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
