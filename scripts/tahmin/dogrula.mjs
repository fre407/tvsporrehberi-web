// Tüm tahmin yazılarını kurallara göre denetler (bkz. kurallar.mjs).
//   node --no-warnings scripts/tahmin/dogrula.mjs            → hepsi
//   node --no-warnings scripts/tahmin/dogrula.mjs <slug>     → tek yazı
// Hata varsa çıkış kodu 1 — otomatik görev bu durumda commit/push YAPMAZ.

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateArticle, wordCount } from './kurallar.mjs';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content', 'tahminler');
const only = process.argv[2];
const files = readdirSync(DIR).filter((f) => f.endsWith('.json') && (!only || f === `${only}.json` || f === only));
if (only && files.length === 0) {
  console.error(`Bulunamadı: ${only}`);
  process.exit(1);
}

let failed = 0;
for (const file of files) {
  let article;
  try {
    article = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
  } catch (e) {
    console.log(`✗ ${file}: JSON okunamadı — ${e.message}`);
    failed += 1;
    continue;
  }
  const errors = validateArticle(article, file);
  if (errors.length) {
    failed += 1;
    console.log(`✗ ${file}`);
    for (const e of errors) console.log(`   - ${e}`);
  } else {
    console.log(`✓ ${file} (${wordCount(article)} kelime)`);
  }
}
// Skor ayarı uyarısı (hata değil): son 4 yazının hepsi tek farklıysa
// yazar bunu gerçekten veriye/konjonktüre dayandırmış mı, tekrar düşünsün.
const all = readdirSync(DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => { try { return JSON.parse(readFileSync(join(DIR, f), 'utf8')); } catch { return null; } })
  .filter((a) => a?.scorePrediction)
  .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  .slice(0, 4);
if (all.length === 4 && all.every((a) => Math.abs(a.scorePrediction.home - a.scorePrediction.away) === 1)) {
  console.log('UYARI: son 4 yazının skor tahmini de tek farklı (' + all.map((a) => `${a.scorePrediction.home}-${a.scorePrediction.away}`).join(', ') +
    '). Rehberdeki "Skor tahmini nasıl verilir" bölümüne göre bunun gerçekten veriye ve konjonktüre dayandığını kontrol et.');
}
process.exit(failed ? 1 : 0);
