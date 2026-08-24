const IST_TZ = 'Europe/Istanbul';

// Site tamamen Türkiye kullanıcısına yönelik olduğu için (uygulamanın
// aksine, o cihazın kendi saat dilimini kullanıyordu) burada BİLEREK sabit
// Türkiye saati (TSİ) gösteriliyor — ziyaretçinin tarayıcı saat dilimini
// sunucu render'ında bilmemiz mümkün değil.
export function istTime(iso) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: IST_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

export function istDateKey(iso) {
  // en-CA -> YYYY-MM-DD, karşılaştırma/gruplama için kullanışlı
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

export function istDateLong(iso) {
  const formatted = new Intl.DateTimeFormat('tr-TR', {
    timeZone: IST_TZ,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  }).format(new Date(iso));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function istDateShort(iso) {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: IST_TZ,
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(iso));
}

// Türkiye UTC+3'te sabit (2016'dan beri yaz saati uygulamıyor — bkz.
// tv-spor-rehberi-app'teki aynı not) — bu yüzden bir "Türkiye takvim günü"nün
// UTC sınırlarını sabit +03:00 ofsetiyle güvenle hesaplayabiliyoruz.
export function istKeyToUtcRange(dateKey) {
  const start = new Date(`${dateKey}T00:00:00+03:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

// Bugüne göre `days` gün offset'teki Türkiye takvim tarihini YYYY-MM-DD
// olarak döner (0 = bugün, 1 = yarın, -1 = dün).
export function dateKeyOffset(days) {
  const base = istDateKey(new Date().toISOString());
  const start = new Date(`${base}T12:00:00+03:00`); // öğlen — gün sınırı sorunlarından kaçınmak için güvenli referans
  const shifted = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
  return istDateKey(shifted.toISOString());
}

// İki Türkiye takvim tarihi (YYYY-MM-DD) arasındaki tam gün farkı.
export function dateKeyDiffDays(fromKey, toKey) {
  const a = new Date(`${fromKey}T12:00:00+03:00`);
  const b = new Date(`${toKey}T12:00:00+03:00`);
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

const TR_MAP = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i', Ç: 'c', Ğ: 'g', Ö: 'o', Ş: 's', Ü: 'u' };

export function slugify(name) {
  return (name ?? '')
    .split('')
    .map((ch) => TR_MAP[ch] ?? ch)
    .join('')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
