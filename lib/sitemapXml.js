import { getDistinctChannels, getFixturesForSitemap, windowIso } from './data';
import { COMPETITIONS, competitionSlug } from './competitions';
import { dateKeyOffset, matchSlug, slugify } from './format';
import { SITE_URL } from './links';

const DAY_BACK = 90;
const DAY_FORWARD = 30;

function escapeXml(value) {
  return String(value).replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[character]));
}

export function xmlResponse(xml, cacheSeconds = 3600) {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Başarılı yanıt CDN'de saklanır. Supabase kısa süreli erişilemezse
      // ziyaretçi ve Google son başarılı sürümü görmeye devam eder.
      'Cache-Control': `public, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`,
    },
  });
}

export function urlset(entries) {
  const nodes = entries.map(({ url, lastModified, changeFrequency, priority }) => [
    '<url>',
    `<loc>${escapeXml(url)}</loc>`,
    lastModified ? `<lastmod>${new Date(lastModified).toISOString()}</lastmod>` : '',
    changeFrequency ? `<changefreq>${changeFrequency}</changefreq>` : '',
    priority != null ? `<priority>${priority}</priority>` : '',
    '</url>',
  ].filter(Boolean).join('')).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${nodes}</urlset>`;
}

export function sitemapIndex(paths) {
  const nodes = paths.map((path) => `<sitemap><loc>${escapeXml(`${SITE_URL}${path}`)}</loc><lastmod>${new Date().toISOString()}</lastmod></sitemap>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${nodes}</sitemapindex>`;
}

export function staticEntries() {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/bugun`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/canli`, changeFrequency: 'always', priority: 0.7 },
    { url: `${SITE_URL}/ligler`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/takimlar`, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/kanallar`, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/gizlilik-politikasi`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/hakkimizda`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}

export function leagueEntries() {
  return Object.keys(COMPETITIONS).map((key) => ({
    url: `${SITE_URL}/lig/${competitionSlug(key)}`,
    changeFrequency: 'daily',
    priority: 0.7,
  }));
}

export function dayEntries() {
  const entries = [];
  for (let offset = -DAY_BACK; offset <= DAY_FORWARD; offset += 1) {
    if (offset === 0) continue;
    entries.push({
      url: `${SITE_URL}/gun/${dateKeyOffset(offset)}`,
      changeFrequency: offset < 0 ? 'weekly' : 'daily',
      priority: offset < 0 ? 0.45 : 0.75,
    });
  }
  return entries;
}

export async function matchEntries() {
  const rows = await getFixturesForSitemap({ daysBack: DAY_BACK, daysForward: DAY_FORWARD });
  return rows.map((row) => ({
    url: `${SITE_URL}/mac/${matchSlug(row.home_team, row.away_team, row.kickoff_at)}`,
    lastModified: row.kickoff_at,
    changeFrequency: new Date(row.kickoff_at).getTime() > Date.now() ? 'hourly' : 'weekly',
    priority: 0.6,
  }));
}

export async function entityEntries() {
  const { startIso, endIso } = windowIso(DAY_BACK, DAY_FORWARD);
  const [fixtures, channels] = await Promise.all([
    getFixturesForSitemap({ daysBack: DAY_BACK, daysForward: DAY_FORWARD }),
    getDistinctChannels({ startIso, endIso }),
  ]);
  const teams = new Set();
  for (const row of fixtures) {
    teams.add(slugify(row.home_team));
    teams.add(slugify(row.away_team));
  }
  return [
    ...Array.from(teams, (slug) => ({ url: `${SITE_URL}/takim/${slug}`, changeFrequency: 'daily', priority: 0.5 })),
    ...channels.map((channel) => ({ url: `${SITE_URL}/kanal/${channel.slug}`, changeFrequency: 'daily', priority: 0.5 })),
  ];
}
