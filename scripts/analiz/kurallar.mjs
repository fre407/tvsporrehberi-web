// Maç Analizleri — maç sonu yazılarının kuralları (bkz. content/analizler/
// YAZIM-REHBERI.md). dogrula.mjs (katı) ve derle.mjs (kuralı bozan yazıyı
// yayına almaz) ortak kullanır.

const SLUG_RE = /^[a-z0-9-]+-mac-analizi-\d{4}-\d{2}-\d{2}$/;
const MIN_WORDS = 700;
const MIN_SECTIONS = 5;

const FORBIDDEN = [
  [/https?:\/\/|www\./i, 'bağlantı'],
  [/\boran(ı|i|lar|ları)?\s*[:=]?\s*\d+[.,]\d{1,2}\b/i, 'oran rakamı'],
  [/\bkupon/i, '"kupon"'],
  [/\b(bilyoner|misli|nesine|tuttur|oley|birebin|iddaa\.com|bets10|betboo|1xbet|superbet)\b/i, 'bahis sitesi adı'],
];
const CLICHES = [
  /\bsonuç olarak\b/i,
  /\bözetle\b/i,
  /\bunutmamak gerekir ki\b/i,
  /heyecan dolu bir (mücadele|karşılaşma|maç)/i,
  /bu maç sadece bir maç değil/i,
  /\bzorlu bir sınav\b/i,
];

export function allText(a) {
  return [a.title, a.description, a.intro, ...(a.sections ?? []).flatMap((s) => [s.heading, ...(s.paragraphs ?? [])]), a.closing].join(' ');
}

export function wordCount(a) {
  return allText(a).split(/\s+/).filter(Boolean).length;
}

export function validateAnalysis(a, file, predictionSlugs = null) {
  const errors = [];
  for (const k of ['slug', 'predictionSlug', 'matchSlug', 'homeTeam', 'awayTeam', 'kickoff', 'title', 'seoTitle', 'description', 'intro', 'sections', 'closing', 'author', 'publishedAt']) {
    if (a[k] == null || a[k] === '') errors.push(`${k} eksik`);
  }
  if (!a.finalScore || !Number.isInteger(a.finalScore.home) || !Number.isInteger(a.finalScore.away)) errors.push('finalScore {home, away} tam sayı olmalı');
  if (errors.length) return errors;
  if (!SLUG_RE.test(a.slug)) errors.push('slug {ev}-{dep}-mac-analizi-YYYY-MM-DD olmalı');
  if (file && file !== `${a.slug}.json`) errors.push('dosya adı slug ile aynı olmalı');
  if (a.slug.replace('-mac-analizi-', '-mac-tahmini-') !== a.predictionSlug) errors.push('predictionSlug, slug ile eşleşmeli');
  if (predictionSlugs && !predictionSlugs.has(a.predictionSlug)) errors.push('bu maçın tahmin yazısı yok');
  if (a.author !== 'TV Spor Rehberi Editörü') errors.push('author "TV Spor Rehberi Editörü" olmalı');
  const { home, away } = a.finalScore;
  if (!a.intro.startsWith('Maç sonucu:')) errors.push('intro "Maç sonucu: ..." ile başlamalı');
  if (!a.intro.includes(`${home}-${away}`)) errors.push(`intro skoru (${home}-${away}) içermeli`);
  if (!Array.isArray(a.sections) || a.sections.length < MIN_SECTIONS) errors.push(`en az ${MIN_SECTIONS} bölüm`);
  else {
    if (!a.sections.some((s) => /tahmin/i.test(s.heading ?? ''))) errors.push('"Tahminim neden tuttu/tutmadı" bölümü zorunlu (başlıkta "Tahmin" geçmeli)');
    if (a.sections.some((s) => !s.heading || !Array.isArray(s.paragraphs) || !s.paragraphs.length)) errors.push('her bölümde heading + paragraphs');
  }
  if (a.description.length < 110 || a.description.length > 170) errors.push('description 110-170 karakter');
  const words = wordCount(a);
  if (words < MIN_WORDS) errors.push(`en az ${MIN_WORDS} kelime (şu an ${words})`);
  const text = allText(a);
  for (const [re, label] of FORBIDDEN) if (re.test(text)) errors.push(`yasak: ${label}`);
  for (const re of CLICHES) if (re.test(text)) errors.push(`klişe: ${re}`);
  return errors;
}
