import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from '@react-email/components';

interface Headline {
  title: string;
  source?: string;
  url?: string;
  summary: string;
}

interface DailyBriefingEmailProps {
  headlines: Headline[];
  dateString?: string;
}

const GEOPOL_BASE_URL = 'https://geo-pol-one.vercel.app';

export const DailyBriefingEmail = ({
  headlines,
  dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }),
}: DailyBriefingEmailProps) => {
  return (
    <Html lang="en">
      <Head />
      <Preview>GeoPolitical Pulse: Daily Intelligence Brief — {dateString}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* ── Header ── */}
          <Section style={styles.headerSection}>
            <Row>
              <Column>
                <Heading style={styles.logo}>GEOPOL</Heading>
                <Text style={styles.logoSub}>Geopolitical Terminal</Text>
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={styles.dateText}>{dateString}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={styles.divider} />

          {/* ── Title ── */}
          <Section style={styles.titleSection}>
            <Heading style={styles.mainTitle}>
              Daily Intelligence Brief
            </Heading>
            <Text style={styles.subtitle}>
              Your curated geopolitical situation report.
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* ── Headlines ── */}
          <Section style={styles.headlinesSection}>
            {headlines.map((headline, index) => {
              const terminalLink = headline.url
                ? `${GEOPOL_BASE_URL}/?articleUrl=${encodeURIComponent(headline.url)}`
                : GEOPOL_BASE_URL;

              return (
                <Section key={index} style={styles.headlineItem}>
                  <Row>
                    <Column style={styles.indexBadgeCol}>
                      <Text style={styles.indexBadge}>{String(index + 1).padStart(2, '0')}</Text>
                    </Column>
                    <Column>
                      <Link href={terminalLink} style={styles.headlineLink}>
                        {headline.title}
                      </Link>
                      {headline.source && (
                        <Text style={styles.sourceText}>
                          SOURCE: {headline.source.toUpperCase()}
                        </Text>
                      )}
                      <Text style={styles.summaryText}>{headline.summary}</Text>
                    </Column>
                  </Row>
                  {index < headlines.length - 1 && <Hr style={styles.itemDivider} />}
                </Section>
              );
            })}
          </Section>

          {/* ── CTA ── */}
          <Section style={styles.ctaSection}>
            <Link href={GEOPOL_BASE_URL} style={styles.ctaButton}>
              Open Command Center →
            </Link>
          </Section>

          <Hr style={styles.divider} />

          {/* ── Footer ── */}
          <Section style={styles.footerSection}>
            <Text style={styles.footerText}>
              This daily briefing is provided for informational purposes only.
              You are receiving this because you subscribed to GeoPolitical Pulse.
            </Text>
            <Text style={styles.footerLinks}>
              <Link href="{{{RESEND_UNSUBSCRIBE_URL}}}" style={styles.footerLink}>
                Unsubscribe
              </Link>
              {'  ·  '}
              <Link href={GEOPOL_BASE_URL} style={styles.footerLink}>
                Visit Terminal
              </Link>
            </Text>
            <Text style={styles.copyright}>
              © {new Date().getFullYear()} GeoPolitical Pulse. All rights reserved.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
};

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: '#020617',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    margin: '0',
    padding: '0',
  },
  container: {
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    margin: '40px auto',
    maxWidth: '600px',
    padding: '0',
    width: '100%',
  },
  headerSection: {
    padding: '24px 32px 16px',
  },
  logo: {
    color: '#f97316',
    fontSize: '22px',
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: '-0.05em',
    margin: '0',
    padding: '0',
  },
  logoSub: {
    color: '#64748b',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.25em',
    margin: '2px 0 0',
    textTransform: 'uppercase' as const,
  },
  dateText: {
    color: '#475569',
    fontSize: '11px',
    fontFamily: 'monospace',
    margin: '0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  divider: {
    borderColor: '#1e293b',
    borderTop: '1px solid #1e293b',
    margin: '0',
  },
  titleSection: {
    padding: '24px 32px',
    textAlign: 'center' as const,
  },
  mainTitle: {
    color: '#f1f5f9',
    fontSize: '26px',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    margin: '0 0 8px',
    padding: '0',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '13px',
    fontFamily: 'monospace',
    letterSpacing: '0.05em',
    margin: '0',
    textTransform: 'uppercase' as const,
  },
  headlinesSection: {
    padding: '8px 32px',
  },
  headlineItem: {
    padding: '16px 0',
  },
  indexBadgeCol: {
    width: '40px',
    verticalAlign: 'top',
    paddingTop: '2px',
  },
  indexBadge: {
    backgroundColor: '#1e40af',
    borderRadius: '4px',
    color: '#93c5fd',
    display: 'inline-block',
    fontSize: '10px',
    fontFamily: 'monospace',
    fontWeight: '700',
    margin: '0',
    padding: '3px 6px',
    letterSpacing: '0.05em',
  },
  headlineLink: {
    color: '#60a5fa',
    display: 'block',
    fontSize: '16px',
    fontWeight: '700',
    lineHeight: '1.4',
    margin: '0 0 4px',
    textDecoration: 'none',
  },
  sourceText: {
    color: '#475569',
    fontFamily: 'monospace',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.15em',
    margin: '0 0 6px',
  },
  summaryText: {
    color: '#94a3b8',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0',
  },
  itemDivider: {
    borderColor: '#1e293b',
    borderTop: '1px solid #1e293b',
    margin: '0',
  },
  ctaSection: {
    padding: '24px 32px',
    textAlign: 'center' as const,
  },
  ctaButton: {
    backgroundColor: '#2563eb',
    borderRadius: '6px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    padding: '12px 28px',
    textDecoration: 'none',
    textTransform: 'uppercase' as const,
  },
  footerSection: {
    padding: '20px 32px 28px',
    textAlign: 'center' as const,
  },
  footerText: {
    color: '#475569',
    fontSize: '12px',
    lineHeight: '1.6',
    margin: '0 0 8px',
  },
  footerLinks: {
    margin: '0 0 8px',
  },
  footerLink: {
    color: '#3b82f6',
    fontSize: '12px',
    textDecoration: 'underline',
  },
  copyright: {
    color: '#334155',
    fontSize: '11px',
    fontFamily: 'monospace',
    margin: '0',
  },
};
