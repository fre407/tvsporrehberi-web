# 06 — Uygulanan Değişiklikler (dal `seo-audit-2026-11-03`, canlıda DEĞİL)

| Dosya | Değişiklik |
|---|---|
| `lib/structuredData.js` (yeni) | `matchPageJsonLd` (WebPage), `predictionArticleJsonLd` (Article), `breadcrumbJsonLd`, `findEventTypes`, `EVENT_TYPES` |
| `app/mac/[slug]/page.js` | SportsEvent/BroadcastEvent/sahte konum kaldırıldı. Durum farkında `matchDescription()` meta ve JSON-LD'de ortak. Eski kimlik yönlendirmesi 308. `/kanal/...` bağlantıları |
| `app/iddiali-tahminler/[slug]/page.js` | `about: SportsEvent` → `predictionArticleJsonLd` |
| `app/takim/[slug]/page.js` | Takma ad yönlendirmesi 308 |
| `lib/data.js` | `fetchAllRows()`: 1000'lik `.range()` sayfalama (en fazla 5000). `getFixturesInWindow` ve `getFixturesForSitemap` artık kesilmiyor. Sıralama `kickoff_at, id` |
| `lib/teamNames.js` | `Milan → AC Milan` |
| `lib/sitemapXml.js` | Maç site haritası geriye 2,5 gün (noindex sınırı 3 gün, önbellek payı) |
| `app/page.js` | Gece "Yarının Maçları" başlığı |
| `app/iddiali-tahminler/page.js`, `app/yayin-haklari/page.js`, `app/ligler/page.js` | Title ve açıklama kısaltıldı |
| `components/StickyBanner.js`, `app/layout.js`, `app/globals.css` | CLS düzeltmesi (sunucuda çizim + erken gizleme) |
| `app/globals.css` | `--accent-text` belirteci, açık tema kontrastı |
| `tests/structured-data.test.mjs`, `tests/dates.test.mjs` (yeni) | 15 test |
| `scripts/seo-audit.mjs` (yeni) | Denetim betiği |
| `package.json` | `npm test`, `npm run seo-audit` |

Yapılmayanlar:
- Veritabanında değişiklik veya migration yok.
- DNS, Vercel, Search Console ve AdSense ayarlarına dokunulmadı.
- Hiçbir sayfa noindex yapılmadı veya silinmedi.
