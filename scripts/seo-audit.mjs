// SEO ve yapılandırılmış veri denetimi.
//
//   node --no-warnings scripts/seo-audit.mjs                       → canlı site
//   node --no-warnings scripts/seo-audit.mjs http://localhost:3030  → yerel derleme
//   ... --sample 40   (site haritasından kaç adres örneklensin; varsayılan 30)
//
// Denetler: HTTP durumu, canonical (kendi adresi mi, apex mi), title/
// description uzunluğu, H1 sayısı, robots meta, JSON-LD (geçerli JSON mu,
// Event türü var mı, sahte konum/bilet var mı, aynı türden çift öğe var mı),
// site haritası (geçerli XML mi, adresler 200 mü, noindex/yönlendirme var mı,
// lastmod her istekte "şimdi" mi), host yönlendirmeleri. Sayılar gerçek
// isteklerden çıkar; hiçbir şey tahmin edilmez.

import { findEventTypes } from '../lib/structuredData.js';

const args = process.argv.slice(2);
const BASE = (args.find((a) => /^https?:\/\//.test(a)) ?? 'https://tvsporrehberi.com').replace(/\/$/, '');
const SAMPLE = Number(args[args.indexOf('--sample') + 1]) || 30;
const CANONICAL_ORIGIN = 'https://tvsporrehberi.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
const isLive = BASE === CANONICAL_ORIGIN;

const issues = [];
function issue(level, area, url, message) {
  issues.push({ level, area, url, message });
}

async function get(url, opts = {}) {
  const res = await fetch(url, { redirect: 'manual', headers: { 'user-agent': UA }, ...opts });
  const body = opts.method === 'HEAD' ? '' : await res.text();
  return { status: res.status, location: res.headers.get('location'), body };
}

const pick = (re, html) => html.match(re)?.[1] ?? null;
const decode = (s) => s?.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&') ?? s;

function auditHtml(url, path, html) {
  const title = decode(pick(/<title>([^<]*)<\/title>/, html));
  const desc = decode(pick(/<meta name="description" content="([^"]*)"/, html));
  const canonical = pick(/<link rel="canonical" href="([^"]*)"/, html);
  const robots = pick(/<meta name="robots" content="([^"]*)"/, html);
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  const expected = `${CANONICAL_ORIGIN}${path === '/' ? '' : path}`;

  if (!title) issue('P1', 'metadata', path, 'title yok');
  else if (title.length > 75) issue('P3', 'metadata', path, `title uzun (${title.length} karakter)`);
  if (!desc) issue('P1', 'metadata', path, 'meta description yok');
  else if (desc.length < 70 || desc.length > 175) issue('P3', 'metadata', path, `description uzunluğu ${desc.length}`);
  if (!canonical) issue('P1', 'canonical', path, 'canonical yok');
  else if (canonical.replace(/\/$/, '') !== expected.replace(/\/$/, '')) issue('P1', 'canonical', path, `canonical farklı: ${canonical}`);
  if (h1 !== 1) issue('P2', 'metadata', path, `H1 sayısı ${h1}`);

  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const types = [];
  for (const raw of blocks) {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      issue('P1', 'structured-data', path, 'geçersiz JSON-LD');
      continue;
    }
    types.push(...[].concat(data['@type'] ?? []));
    for (const e of findEventTypes(data)) issue('P1', 'structured-data', path, `Event türü: ${e.type} (${e.path})`);
    const text = JSON.stringify(data);
    if (/"location"\s*:\s*\{[^}]*"name"\s*:\s*"(UEFA|Trendyol|Premier|LaLiga|Serie|Bundesliga|Ligue)/.test(text)) {
      issue('P1', 'structured-data', path, 'location alanında turnuva adı (sahte konum)');
    }
    if (/"offers"/.test(text)) issue('P1', 'structured-data', path, 'offers alanı var (bilet teklifi)');
  }
  const dupes = types.filter((t, i) => types.indexOf(t) !== i && t !== 'BreadcrumbList');
  if (dupes.length) issue('P2', 'structured-data', path, `aynı türden çift JSON-LD: ${[...new Set(dupes)].join(', ')}`);
  return { title, desc, canonical, robots, h1, jsonLdTypes: types, noindex: /noindex/.test(robots ?? '') };
}

const report = { base: BASE, startedAt: new Date().toISOString(), pages: [], sitemap: {}, redirects: [] };

// 1) Ana rotalar
const ROUTES = ['/', '/bugun', '/canli', '/ligler', '/takimlar', '/kanallar', '/yayin-haklari', '/iddiali-tahminler',
  '/lig/super-lig', '/lig/sampiyonlar-ligi', '/takim/galatasaray', '/kanal/trt-1', '/hakkimizda', '/iletisim', '/gizlilik-politikasi'];

// 2) Site haritası
const smIndex = await get(`${BASE}/sitemap.xml`);
const subs = [...smIndex.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
report.sitemap.index = { status: smIndex.status, subSitemaps: subs.length };
if (smIndex.status !== 200 || !smIndex.body.includes('<sitemapindex')) issue('P0', 'sitemap', '/sitemap.xml', 'site haritası dizini okunamadı');
const allLocs = [];
for (const sub of subs) {
  const subPath = sub.replace(CANONICAL_ORIGIN, '');
  const r1 = await get(`${BASE}${subPath}`);
  const locs = [...r1.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const mods = [...r1.body.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
  const freshMods = mods.filter((m) => Date.now() - Date.parse(m) < 10 * 60 * 1000).length;
  report.sitemap[subPath] = { status: r1.status, urls: locs.length, lastmodSonDakikalarda: freshMods };
  if (r1.status !== 200 || !r1.body.startsWith('<?xml')) issue('P0', 'sitemap', subPath, `durum ${r1.status} / geçersiz XML`);
  if (locs.some((l) => !l.startsWith(`${CANONICAL_ORIGIN}`))) issue('P1', 'sitemap', subPath, 'apex dışı adres var');
  if (mods.length && freshMods === mods.length && mods.length > 3) issue('P2', 'sitemap', subPath, 'tüm lastmod değerleri istek anı (anlamlı değişikliği yansıtmıyor)');
  allLocs.push(...locs);
}
report.sitemap.totalUrls = allLocs.length;
if (new Set(allLocs).size !== allLocs.length) issue('P2', 'sitemap', '/sitemap.xml', 'tekrarlanan adres var');

// Örneklem: her alt haritadan eşit dağıtılmış adresler
const step = Math.max(1, Math.floor(allLocs.length / SAMPLE));
const sample = allLocs.filter((_, i) => i % step === 0).slice(0, SAMPLE).map((l) => l.replace(CANONICAL_ORIGIN, '') || '/');

for (const path of [...new Set([...ROUTES, ...sample])]) {
  const r = await get(`${BASE}${path}`);
  const inSitemap = allLocs.includes(`${CANONICAL_ORIGIN}${path === '/' ? '/' : path}`) || allLocs.includes(`${CANONICAL_ORIGIN}${path}`);
  const entry = { path, status: r.status, inSitemap };
  if (r.status >= 300 && r.status < 400) {
    issue(inSitemap ? 'P1' : 'P2', 'redirect', path, `yönlendirme → ${r.location}`);
  } else if (r.status !== 200) {
    issue(inSitemap ? 'P0' : 'P1', 'status', path, `HTTP ${r.status}`);
  } else {
    Object.assign(entry, auditHtml(`${BASE}${path}`, path, r.body));
    if (entry.noindex && inSitemap) issue('P1', 'sitemap', path, 'site haritasında ama noindex');
  }
  report.pages.push(entry);
}

// 3) Host yönlendirmeleri (yalnızca canlıda anlamlı)
if (isLive) {
  for (const u of ['https://www.tvsporrehberi.com/', 'http://tvsporrehberi.com/', 'http://www.tvsporrehberi.com/', 'https://www.tvsporrehberi.com/bugun?x=1']) {
    const hops = [];
    let cur = u;
    for (let i = 0; i < 5; i++) {
      const r = await get(cur, { method: 'HEAD' });
      hops.push(`${r.status} ${cur}`);
      if (r.status < 300 || r.status >= 400 || !r.location) break;
      cur = new URL(r.location, cur).href;
    }
    report.redirects.push({ from: u, hops });
    if (!cur.startsWith(CANONICAL_ORIGIN)) issue('P0', 'redirect', u, `apex'e varmıyor: ${cur}`);
    if (hops.length > 3) issue('P2', 'redirect', u, `yönlendirme zinciri ${hops.length - 1} adım`);
  }
}

// Özet
const count = (pred) => issues.filter(pred).length;
const pagesChecked = report.pages.filter((p) => p.status === 200).length;
const sdChecked = report.pages.reduce((n, p) => n + (p.jsonLdTypes?.length ?? 0), 0);
console.log(`SEO AUDIT — TV SPOR REHBERİ (${BASE})`);
console.log(`Pages checked: ${pagesChecked} / ${report.pages.length} requested`);
console.log(`Sitemap URLs: ${allLocs.length} in ${subs.length} sitemaps`);
console.log(`Indexability errors: ${count((i) => ['status', 'sitemap'].includes(i.area) && /P0|P1/.test(i.level))}`);
console.log(`Canonical errors: ${count((i) => i.area === 'canonical')}`);
console.log(`Metadata issues: ${count((i) => i.area === 'metadata')}`);
console.log(`Structured data items checked: ${sdChecked}`);
console.log(`Event-type items (invalid for this site): ${count((i) => i.area === 'structured-data' && i.message.startsWith('Event türü'))}`);
console.log(`Fake locations: ${count((i) => i.message.includes('sahte konum'))}`);
console.log(`Event offers: ${count((i) => i.message.includes('offers'))}`);
console.log(`Critical (P0): ${count((i) => i.level === 'P0')}  High (P1): ${count((i) => i.level === 'P1')}  P2: ${count((i) => i.level === 'P2')}  P3: ${count((i) => i.level === 'P3')}`);
console.log(`Status: ${count((i) => i.level === 'P0') ? 'KRİTİK SORUN VAR' : count((i) => i.level === 'P1') ? 'YÜKSEK ÖNCELİKLİ SORUN VAR' : 'P0/P1 YOK'}`);
console.log('\nSorunlar:');
for (const i of issues.sort((a, b) => a.level.localeCompare(b.level))) console.log(`  [${i.level}] ${i.area} ${i.url} — ${i.message}`);
if (args.includes('--json')) console.log(JSON.stringify({ ...report, issues }, null, 2));
