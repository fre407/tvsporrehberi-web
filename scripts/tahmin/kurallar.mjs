// İddialı Tahminler — bir tahmin yazısının yayına girebilmesi için gereken
// kurallar (bkz. content/tahminler/YAZIM-REHBERI.md). dogrula.mjs (katı,
// otomatik görev kaydetmeden önce) ve derle.mjs (site derlemesi; kuralı
// bozan yazıyı yayına almaz) ortak kullanır.

const SLUG_RE = /^[a-z0-9-]+-mac-tahmini-\d{4}-\d{2}-\d{2}$/;
const MATCH_SLUG_RE = /^[a-z0-9-]+-\d{4}-\d{2}-\d{2}$/;
const MIN_WORDS = 650;
const MIN_SECTIONS = 5;

// Oran, kupon, bahis sitesi/uygulama adı ve bağlantı yasak.
const FORBIDDEN = [
  [/https?:\/\/|www\./i, 'bağlantı'],
  [/\boran(ı|i|lar|ları|ları)?\s*[:=]?\s*\d+[.,]\d{1,2}\b/i, 'oran rakamı'],
  [/\b\d[.,]\d{2}\s*(oran|oranla|oranlı)/i, 'oran rakamı'],
  [/\bkupon/i, '"kupon"'],
  [/\b(bilyoner|misli|nesine|tuttur|oley|birebin|iddaa\.com|bets10|betboo|1xbet|superbet)\b/i, 'bahis sitesi adı'],
];

// Yapay zekâ kokan, insan yazısı hissini bozan kalıplar.
const CLICHES = [
  /\bsonuç olarak\b/i,
  /\bözetle\b/i,
  /\bunutmamak gerekir ki\b/i,
  /heyecan dolu bir (mücadele|karşılaşma|maç)/i,
  /nefes(ler)?i(ni)? tut/i,
  /bu maç sadece bir maç değil/i,
  /\bzorlu bir sınav\b/i,
  /\bgöz önünde bulundurul/i,
];

function words(text) {
  return (text ?? '').split(/\s+/).filter(Boolean).length;
}

export function allText(article) {
  return [
    article.title,
    article.description,
    article.intro,
    ...(article.sections ?? []).flatMap((s) => [s.heading, ...(s.paragraphs ?? [])]),
    ...(article.picks ?? []).flatMap((p) => [p.market, p.pick, p.note]),
    article.closing,
  ]
    .filter(Boolean)
    .join('\n');
}

export function wordCount(article) {
  return words(
    [article.intro, ...(article.sections ?? []).flatMap((s) => s.paragraphs ?? []), article.closing].join(' '),
  );
}

// Tercihler skor tahminiyle çelişmesin (skor 2-1 iken "KG Yok" gibi).
function pickConflicts(article) {
  const errors = [];
  const { home, away } = article.scorePrediction ?? {};
  if (!Number.isInteger(home) || !Number.isInteger(away)) return errors;
  const total = home + away;
  const result = home > away ? '1' : home < away ? '2' : 'X';
  for (const p of article.picks ?? []) {
    const pick = String(p.pick ?? '').toUpperCase().replace(/\s+/g, ' ');
    const ms = pick.match(/^MS ([12X])$/);
    if (ms && ms[1] !== result) errors.push(`"${p.pick}" skor tahminiyle (${home}-${away}) çelişiyor`);
    if (pick === 'KG VAR' && (home === 0 || away === 0)) errors.push(`"KG Var" skor tahminiyle (${home}-${away}) çelişiyor`);
    if (pick === 'KG YOK' && home > 0 && away > 0) errors.push(`"KG Yok" skor tahminiyle (${home}-${away}) çelişiyor`);
    const ou = pick.match(/^(\d)[.,]5 (ÜST|ALT)$/);
    if (ou && !/İLK YARI|İY/i.test(p.market ?? '')) {
      const line = Number(ou[1]) + 0.5;
      if ((ou[2] === 'ÜST' && total < line) || (ou[2] === 'ALT' && total > line)) {
        errors.push(`"${p.pick}" skor tahminiyle (${home}-${away}) çelişiyor`);
      }
    }
  }
  return errors;
}

export function validateArticle(article, fileName) {
  const errors = [];
  const req = ['slug', 'matchSlug', 'homeTeam', 'awayTeam', 'competition', 'kickoff', 'title', 'seoTitle', 'description', 'intro', 'closing', 'author', 'publishedAt'];
  for (const key of req) if (!article?.[key]) errors.push(`"${key}" eksik`);
  if (errors.length) return errors;

  if (!SLUG_RE.test(article.slug)) errors.push('slug biçimi yanlış (…-mac-tahmini-YYYY-MM-DD)');
  if (fileName && fileName !== `${article.slug}.json`) errors.push(`dosya adı slug ile aynı olmalı: ${article.slug}.json`);
  if (!MATCH_SLUG_RE.test(article.matchSlug)) errors.push('matchSlug biçimi yanlış');
  if (Number.isNaN(Date.parse(article.kickoff))) errors.push('kickoff geçerli bir tarih değil');
  if (Number.isNaN(Date.parse(article.publishedAt))) errors.push('publishedAt geçerli bir tarih değil');
  if (article.author !== 'TV Spor Rehberi Editörü') errors.push('author "TV Spor Rehberi Editörü" olmalı');

  const { home, away } = article.scorePrediction ?? {};
  if (!Number.isInteger(home) || !Number.isInteger(away)) errors.push('scorePrediction {home, away} tam sayı olmalı');
  else if (!new RegExp(`^Skor tahminim: .*${home}-${away}`).test(article.intro)) {
    errors.push(`intro "Skor tahminim: ... ${home}-${away} ..." ile başlamalı`);
  }

  if (!article.title.includes(article.homeTeam) || !article.title.includes(article.awayTeam)) errors.push('title iki takımın adını içermeli');
  if (!/Maç Tahmini/.test(article.title)) errors.push('title "Maç Tahmini" içermeli');
  if (article.seoTitle.length > 75) errors.push('seoTitle 75 karakteri geçmemeli');
  if (article.description.length < 110 || article.description.length > 170) errors.push('description 110–170 karakter olmalı');

  const sections = article.sections ?? [];
  if (sections.length < MIN_SECTIONS) errors.push(`en az ${MIN_SECTIONS} bölüm olmalı (şu an ${sections.length})`);
  for (const [i, s] of sections.entries()) {
    if (!s.heading) errors.push(`${i + 1}. bölümün başlığı yok`);
    if (!Array.isArray(s.paragraphs) || s.paragraphs.length === 0) errors.push(`${i + 1}. bölümde paragraf yok`);
  }
  if (!sections.some((s) => /kulüp/i.test(s.heading ?? ''))) {
    errors.push('"Kulüplerde son durum" bölümü yok (başlığında "Kulüp" geçen bir bölüm zorunlu)');
  }
  const wc = wordCount(article);
  if (wc < MIN_WORDS) errors.push(`yazı çok kısa: ${wc} kelime (en az ${MIN_WORDS})`);

  const picks = article.picks ?? [];
  if (picks.length < 3 || picks.length > 5) errors.push('3–5 iddaa tercihi olmalı');
  for (const p of picks) if (!p.market || !p.pick) errors.push('her tercihin market ve pick alanı olmalı');
  errors.push(...pickConflicts(article));

  const text = allText(article);
  for (const [re, label] of FORBIDDEN) if (re.test(text)) errors.push(`yasak içerik: ${label}`);
  for (const re of CLICHES) {
    const m = text.match(re);
    if (m) errors.push(`yapay zekâ klişesi: "${m[0]}"`);
  }
  return errors;
}
