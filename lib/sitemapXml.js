import {
  DAY_INDEX_BACK,
  DAY_INDEX_FORWARD,
  MIN_CHANNEL_MATCHES,
  TEAM_INDEX_COMPETITIONS,
  getDistinctChannels,
  getFixturesForSitemap,
  isIndexWorthyLeague,
  isIndexWorthyMatch,
  windowIso,
} from './data';
import { COMPETITIONS, competitionSlug } from './competitions';
import { dateKeyOffset, matchSlug, slugify } from './format';
import { SITE_URL } from './links';
import { GUIDES, guideUrl } from './guides';
import { allPredictions, isUpcoming, predictionUrl } from './predictions';

// Google'a çok yeni bir sitede kısıtlı tarama bütçesini oynanmış, artık
// hiçbir arama değeri kalmamış maç sayfalarına harcatmamak için (2026-09-01
// tespiti: 90 günlük pencere ~1000 maç URL'sinin ~%75'ini geçmişe dönük
// "hangi kanalda" sayfalarına ayırıyordu, GSC'de 1860 keşfedilip sadece 2
// sayfa indeksleniyordu) — geçmişe bakış 7 güne indirildi. Bu sayfalar
// sitede linkle hâlâ erişilebilir, sadece Google'a artık önerilmiyor.
const DAY_BACK = 7;
const DAY_FORWARD = 30;

// Sitemap'e yalnızca arama değeri olan sayfalar giriyor (2026-11-01, GSC:
// 1.400+ URL "Keşfedildi - dizine eklenmedi"). Yeni ve otoritesi düşük bir
// sitede Google'a binlerce şablon sayfa önermek tarama bütçesini boşa
// harcatıyor ve AdSense'in "düşük değerli içerik" tespitini besliyor. Maç
// kuralı lib/data.js'teki isIndexWorthyMatch'te (maç sayfasının noindex
// kararıyla aynı fonksiyon). Sayfalar sitede erişilebilir kalıyor, sadece
// Google'a önerilmiyor.

// Maç sayfaları başlama saatinden 3 gün sonra noindex oluyor (bkz.
// app/mac/[slug]/page.js NOINDEX_AFTER_MS). Sitemap'te noindex bir URL
// bulunması Google'a çelişkili sinyal veriyor (GSC: '"noindex" etiketi
// tarafından hariç tutuldu'), o yüzden maç sitemap'i aynı sınırdan başlıyor.
// Maç sayfası 3 gün sonra noindex oluyor (app/mac/[slug]); site haritası
// 1 saat önbelleklendiği için sınırda noindex adres listelenmesin diye
// burada yarım gün pay bırakılıyor (denetim 2026-11-03: 2 adres sınırdaydı).
const MATCH_SITEMAP_BACK_MS = 2.5 * 24 * 60 * 60 * 1000;

// Takım sayfaları yalnızca bu lig ve Avrupa kupalarında oynayan takımlar için
// öneriliyor. Kupaların erken turları (Türkiye Kupası, FA Cup, Copa del Rey…)
// yüzlerce alt lig/amatör takımın tek maçlık ince sayfasını üretiyordu.
// (Liste lib/data.js TEAM_INDEX_COMPETITIONS — takım sayfasının robots kararıyla ortak.)
const TEAM_SITEMAP_COMPETITIONS = TEAM_INDEX_COMPETITIONS;

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
    { url: `${SITE_URL}/iletisim`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/yayin-haklari`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/iddiali-tahminler`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/rehber`, changeFrequency: 'monthly', priority: 0.7 },
    ...GUIDES.map((guide) => ({ url: `${SITE_URL}${guideUrl(guide)}`, changeFrequency: 'monthly', priority: 0.7 })),
  ];
}

export function leagueEntries() {
  return Object.keys(COMPETITIONS).filter(isIndexWorthyLeague).map((key) => ({
    url: `${SITE_URL}/lig/${competitionSlug(key)}`,
    changeFrequency: 'daily',
    priority: 0.7,
  }));
}

export function dayEntries() {
  const entries = [];
  // Yalnızca dün … +7 gün (gün sayfasının robots kararıyla aynı sınır).
  for (let offset = -DAY_INDEX_BACK; offset <= DAY_INDEX_FORWARD; offset += 1) {
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
  const rows = (await getFixturesForSitemap({ daysBack: DAY_BACK, daysForward: DAY_FORWARD })).filter(
    (row) => isIndexWorthyMatch(row) && new Date(row.kickoff_at).getTime() > Date.now() - MATCH_SITEMAP_BACK_MS
  );
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
  for (const row of fixtures.filter((r) => TEAM_SITEMAP_COMPETITIONS.has(r.competition_key))) {
    teams.add(slugify(row.home_team));
    teams.add(slugify(row.away_team));
  }
  return [
    ...Array.from(teams, (slug) => ({ url: `${SITE_URL}/takim/${slug}`, changeFrequency: 'daily', priority: 0.5 })),
    ...channels.filter((channel) => channel.count >= MIN_CHANNEL_MATCHES).map((channel) => ({ url: `${SITE_URL}/kanal/${channel.slug}`, changeFrequency: 'daily', priority: 0.5 })),
  ];
}

// İddialı Tahminler yazıları — yaklaşan maçınki en yüksek öncelikte.
export function predictionEntries() {
  const now = Date.now();
  return allPredictions().map((a) => ({
    url: `${SITE_URL}${predictionUrl(a)}`,
    lastModified: a.updatedAt ?? a.publishedAt,
    changeFrequency: isUpcoming(a, now) ? 'daily' : 'monthly',
    priority: isUpcoming(a, now) ? 0.9 : 0.5,
  }));
}
