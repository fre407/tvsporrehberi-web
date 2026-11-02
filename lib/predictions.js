import articles from './generated/tahminler.json';
import { istDateKey } from './format';

// "İddialı Tahminler" yazıları. Kaynak: content/tahminler/*.json — her
// akşam otomatik görev ekler (bkz. content/tahminler/YAZIM-REHBERI.md);
// derlemede scripts/tahmin/derle.mjs ile lib/generated/tahminler.json'a
// toplanır (kurala uymayan yazı oraya hiç girmez). Liste maç saatine göre
// sıralı.

export const PREDICTIONS_PATH = '/iddiali-tahminler';
const MATCH_LENGTH_MS = 2 * 60 * 60 * 1000;

export function predictionUrl(article) {
  return `${PREDICTIONS_PATH}/${article.slug}`;
}

export function allPredictions() {
  return articles;
}

export function getPrediction(slug) {
  return articles.find((a) => a.slug === slug) ?? null;
}

export function predictionForMatch(matchSlug) {
  return articles.find((a) => a.matchSlug === matchSlug) ?? null;
}

export function isUpcoming(article, now = Date.now()) {
  return new Date(article.kickoff).getTime() + MATCH_LENGTH_MS > now;
}

// Ana sayfa kutusu: maçı henüz bitmemiş en yakın tarihteki yazılar (aynı
// güne denk gelen büyük maçlar yan yana kaydırılır). Hiç yaklaşan yoksa en
// son yazı gösterilir ki kutu boş kalmasın.
export function showcasePredictions(now = Date.now()) {
  const upcoming = articles.filter((a) => isUpcoming(a, now));
  if (upcoming.length === 0) return articles.length ? [articles[articles.length - 1]] : [];
  const firstDay = istDateKey(upcoming[0].kickoff);
  return upcoming.filter((a) => istDateKey(a.kickoff) === firstDay);
}

export function readingMinutes(article) {
  return Math.max(2, Math.round((article.wordCount ?? 600) / 200));
}

// Bitmiş maçta tercihlerin tutup tutmadığı — yalnızca skordan kesin
// anlaşılabilen pazarlar (MS, Çifte Şans, KG, Toplam Gol). İlk yarı gibi
// verisi olmayan pazarlar için null (işaret gösterilmez).
export function evaluatePick({ market, pick }, home, away) {
  if (/ilk yarı|İY|handikap/i.test(`${market} ${pick}`)) return null;
  const p = String(pick ?? '').toUpperCase().replace(/\s+/g, ' ').trim();
  const result = home > away ? '1' : home < away ? '2' : 'X';
  const total = home + away;
  const ms = p.match(/^MS ([12X])$/);
  if (ms) return ms[1] === result;
  const dc = p.match(/^([12X])-([12X])$/);
  if (dc) return dc[1] === result || dc[2] === result;
  if (p === 'KG VAR') return home > 0 && away > 0;
  if (p === 'KG YOK') return home === 0 || away === 0;
  const ou = p.match(/^(\d)[.,]5 (ÜST|ALT)$/);
  if (ou) return ou[2] === 'ÜST' ? total > Number(ou[1]) : total <= Number(ou[1]);
  return null;
}
