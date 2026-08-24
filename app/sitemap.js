import { getFixturesInWindow, windowIso } from '../lib/data';
import { competitionSlug, COMPETITIONS } from '../lib/competitions';
import { dateKeyOffset, slugify } from '../lib/format';
import { SITE_URL } from '../lib/links';

export const revalidate = 3600;

export default async function sitemap() {
  const staticUrls = [
    { url: `${SITE_URL}/`, changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/bugun`, changeFrequency: 'hourly', priority: 0.9 },
  ];

  // Dün + gelecek 13 gün — /gun/[date] (bkz. DayTabs.js'teki aynı aralık).
  const dayUrls = [];
  for (let offset = -1; offset <= 13; offset++) {
    if (offset === 0) continue; // bugün zaten /bugun olarak listelendi
    dayUrls.push({
      url: `${SITE_URL}/gun/${dateKeyOffset(offset)}`,
      changeFrequency: 'hourly',
      priority: 0.8,
    });
  }

  const leagueUrls = Object.keys(COMPETITIONS).map((key) => ({
    url: `${SITE_URL}/lig/${competitionSlug(key)}`,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  let matchUrls = [];
  let teamUrls = [];
  try {
    const { startIso, endIso } = windowIso(3, 14);
    const rows = await getFixturesInWindow(startIso, endIso);
    matchUrls = rows.map((r) => ({
      url: `${SITE_URL}/mac/${r.id}`,
      lastModified: r.kickoff_at,
      changeFrequency: 'hourly',
      priority: 0.6,
    }));

    const teamSlugs = new Set();
    for (const r of rows) {
      teamSlugs.add(slugify(r.home_team));
      teamSlugs.add(slugify(r.away_team));
    }
    teamUrls = Array.from(teamSlugs).map((slug) => ({
      url: `${SITE_URL}/takim/${slug}`,
      changeFrequency: 'daily',
      priority: 0.5,
    }));
  } catch {
    // Supabase geçici olarak erişilemezse sitemap sadece statik URL'lerle döner
    // — build'i hiç kırmıyoruz.
  }

  return [...staticUrls, ...dayUrls, ...leagueUrls, ...matchUrls, ...teamUrls];
}
