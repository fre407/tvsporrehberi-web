import { NextResponse } from 'next/server';

// Google/Bing/sosyal medya botları — bunlar HER ZAMAN geçmeli, yoksa SEO
// ve link önizlemeleri kırılır. Site indekslenebilir kalmalı.
const GOOD_BOTS =
  /googlebot|google-adsbot|adsbot-google|mediapartners-google|storebot-google|bingbot|duckduckbot|yandexbot|baiduspider|applebot(?!-extended)|facebookexternalhit|facebookcatalog|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|redditbot|pinterest|slackbot|slurp/i;

// Betik/kütüphane HTTP istemcileri — çoğu scraping aracının varsayılan
// User-Agent'ı budur. Gerçek tarayıcılar (Chrome/Firefox/Safari/Edge UA'sı)
// bu listeye hiç girmez.
const BAD_BOTS =
  /curl|wget|python-requests|python-urllib|scrapy|libwww-perl|httpclient|go-http-client|java\/\d|okhttp|postmanruntime|insomnia|mechanize|node-fetch|axios\/|guzzlehttp|ruby|php\/|apache-httpclient|headlesschrome|phantomjs|selenium|playwright|puppeteer/i;

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 60;
const hits = new Map();

function clientIp(req) {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    if (hits.size > 5000) {
      const oldestKey = hits.keys().next().value;
      hits.delete(oldestKey);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX;
}

export function proxy(req) {
  const ua = req.headers.get('user-agent') || '';
  const { pathname } = req.nextUrl;

  if (GOOD_BOTS.test(ua)) return NextResponse.next();

  if (!ua || BAD_BOTS.test(ua)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (pathname.startsWith('/api/') && isRateLimited(clientIp(req))) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$).*)'],
};
