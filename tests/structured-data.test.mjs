// node --test tests/  — yapılandırılmış veri: Event işaretlemesi YOK,
// sahte konum/bilet/organizatör YOK, gerçek veriyle tutarlı.
import test from 'node:test';
import assert from 'node:assert/strict';
import { breadcrumbJsonLd, findEventTypes, matchPageJsonLd, predictionArticleJsonLd } from '../lib/structuredData.js';

const SITE = 'https://tvsporrehberi.com';
const FORBIDDEN_KEYS = ['location', 'offers', 'organizer', 'performer', 'startDate', 'endDate', 'eventStatus'];

function keysDeep(node, out = new Set()) {
  if (Array.isArray(node)) node.forEach((n) => keysDeep(n, out));
  else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) { out.add(k); keysDeep(v, out); }
  return out;
}

const scenarios = [
  { label: 'gelecek maç, kanalı belli', homeTeam: 'Fenerbahçe', awayTeam: 'Liverpool', description: 'Fenerbahçe - Liverpool maçı 4 Kasım 2026 Çarşamba, saat 20:45 (TSİ). Yayın: TRT 1.' },
  { label: 'stadyumu bilinmeyen yabancı maç', homeTeam: 'Celtic', awayTeam: 'Beşiktaş', description: 'Celtic - Beşiktaş maçı 5 Kasım 2026 Perşembe, saat 23:00 (TSİ).' },
  { label: 'ertelenen maç', homeTeam: 'Rizespor', awayTeam: 'Trabzonspor', description: 'Rizespor - Trabzonspor maçı ertelendi veya iptal edildi.' },
  { label: 'iptal/yayıncısı bilinmeyen maç', homeTeam: 'A Takımı', awayTeam: 'B Takımı', description: 'Yayıncı kanal henüz açıklanmadı.' },
  { label: 'geçmiş maç', homeTeam: 'Galatasaray', awayTeam: 'Fenerbahçe', description: 'Galatasaray 2-1 Fenerbahçe: Trendyol Süper Lig maçı oynandı.' },
];

for (const sc of scenarios) {
  test(`maç sayfası JSON-LD — ${sc.label}`, () => {
    const url = `${SITE}/mac/x-y-2026-11-04`;
    const ld = matchPageJsonLd({ siteUrl: SITE, url, name: `${sc.homeTeam} - ${sc.awayTeam}`, description: sc.description, homeTeam: sc.homeTeam, awayTeam: sc.awayTeam });
    assert.equal(ld['@type'], 'WebPage');
    assert.deepEqual(findEventTypes(ld), [], 'Event türü olmamalı');
    const keys = keysDeep(ld);
    for (const k of FORBIDDEN_KEYS) assert.ok(!keys.has(k), `${k} alanı üretilmemeli`);
    assert.equal(ld.url, url);
    assert.equal(ld.description, sc.description, 'açıklama görünür meta açıklamayla aynı olmalı');
    assert.deepEqual(ld.about.map((t) => t.name), [sc.homeTeam, sc.awayTeam]);
    assert.ok(ld.about.every((t) => t['@type'] === 'SportsTeam'));
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(ld)));
  });
}

test('tahmin yazısı JSON-LD — Article, Event yok, yazar kurum', () => {
  const article = { title: 'Fenerbahçe - Liverpool Maç Tahmini: X', description: 'd', publishedAt: '2026-11-02T18:45:00+03:00', updatedAt: '2026-11-02T20:30:00+03:00', homeTeam: 'Fenerbahçe', awayTeam: 'Liverpool', keywords: ['a', 'b'] };
  const url = `${SITE}/iddiali-tahminler/fenerbahce-liverpool-mac-tahmini-2026-11-04`;
  const ld = predictionArticleJsonLd({ siteUrl: SITE, url, article });
  assert.equal(ld['@type'], 'Article');
  assert.deepEqual(findEventTypes(ld), []);
  assert.equal(ld.author['@type'], 'Organization', 'uydurma kişi yazar olmamalı');
  assert.equal(ld.dateModified, article.updatedAt);
  assert.ok(!keysDeep(ld).has('location'));
});

test('findEventTypes iç içe Event türlerini yakalar (regresyon koruması)', () => {
  const old = { '@type': 'SportsEvent', publication: [{ '@type': 'BroadcastEvent', broadcastOfEvent: { '@type': 'SportsEvent' } }] };
  assert.equal(findEventTypes(old).length, 3);
});

test('breadcrumb sırası ve konumları', () => {
  const ld = breadcrumbJsonLd([{ name: 'Ana Sayfa', url: SITE }, { name: 'Lig', url: `${SITE}/lig/x` }]);
  assert.deepEqual(ld.itemListElement.map((i) => i.position), [1, 2]);
});
