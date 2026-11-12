// Haftalık rehber yazılarının kuralları (content/rehber/*.json). Hem
// dogrula.mjs hem derle.mjs kullanır; kurala uymayan yazı yayına alınmaz.

export const WEEKLY_CATEGORIES = ['Güncel', 'Futbol Tarihi'];
const BANNED = [/\boran\b/i, /\bkupon\b/i, /bilyoner|misli|nesine|tuttur|iddaa\.com/i, /https?:\/\//i];
const CLICHES = [/Sonuç olarak/, /Özetle,/, /Unutmamak gerekir ki/];

export function wordCount(guide) {
  const text = [guide.intro, ...guide.sections.flatMap((s) => [s.heading, ...s.paragraphs])].join(' ');
  return text.split(/\s+/).filter(Boolean).length;
}

export function validateGuide(guide, file, knownSlugs = new Set()) {
  const errors = [];
  for (const key of ['slug', 'category', 'title', 'description', 'intro', 'publishedAt', 'sections']) {
    if (!guide[key]) errors.push(`${key} eksik`);
  }
  if (errors.length) return errors;
  if (file && file !== `${guide.slug}.json`) errors.push('dosya adı slug ile aynı olmalı');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(guide.slug)) errors.push('slug yalnız küçük harf, rakam ve tire');
  if (knownSlugs.has(guide.slug)) errors.push('bu slug zaten var');
  if (!WEEKLY_CATEGORIES.includes(guide.category)) errors.push(`category şunlardan biri olmalı: ${WEEKLY_CATEGORIES.join(', ')}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(guide.publishedAt)) errors.push('publishedAt YYYY-MM-DD');
  if (guide.title.length < 30 || guide.title.length > 110) errors.push('title 30-110 karakter');
  if (guide.description.length < 110 || guide.description.length > 170) errors.push('description 110-170 karakter');
  if (!Array.isArray(guide.sections) || guide.sections.length < 4) errors.push('en az 4 bölüm');
  else if (guide.sections.some((s) => !s.heading || !Array.isArray(s.paragraphs) || s.paragraphs.length === 0)) errors.push('her bölümde heading ve paragraphs olmalı');
  else {
    const words = wordCount(guide);
    if (words < 500) errors.push(`en az 500 kelime (şu an ${words})`);
    const text = JSON.stringify(guide);
    for (const re of BANNED) if (re.test(text)) errors.push(`yasak ifade: ${re}`);
    for (const re of CLICHES) if (re.test(text)) errors.push(`klişe: ${re}`);
  }
  return errors;
}
