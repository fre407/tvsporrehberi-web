// tv-spor-rehberi-app/src/data/sports.js içindeki COMPETITIONS'ın futbol alt
// kümesi — fixtures tablosu (ve dolayısıyla bu site) şu an SADECE futbol
// içeriyor. Etiketler/bayraklar o dosyayla birebir aynı tutulmalı (elle
// senkron — iki proje ayrı repo, paylaşılan modül pratik değil).
export const COMPETITIONS = {
  super_lig: { label: 'Trendyol Süper Lig', short: 'Süper Lig', flag: '🇹🇷', group: 'liga' },
  tff_1_lig: { label: 'TFF 1. Lig', short: 'TFF 1. Lig', flag: '🇹🇷', group: 'liga' },
  premier_lig: { label: 'İngiltere Premier Lig', short: 'Premier Lig', flag: '🏴', group: 'liga' },
  championship: { label: 'İngiltere Championship', short: 'Championship', flag: '🏴', group: 'liga' },
  la_liga: { label: 'İspanya LaLiga', short: 'LaLiga', flag: '🇪🇸', group: 'liga' },
  serie_a: { label: 'İtalya Serie A', short: 'Serie A', flag: '🇮🇹', group: 'liga' },
  bundesliga: { label: 'Almanya Bundesliga', short: 'Bundesliga', flag: '🇩🇪', group: 'liga' },
  ligue_1: { label: 'Fransa Ligue 1', short: 'Ligue 1', flag: '🇫🇷', group: 'liga' },
  eredivisie: { label: 'Hollanda Eredivisie', short: 'Eredivisie', flag: '🇳🇱', group: 'liga' },
  primeira_liga: { label: 'Portekiz Liga Portugal', short: 'Liga Portugal', flag: '🇵🇹', group: 'liga' },
  belcika_ligi: { label: 'Belçika Pro League', short: 'Pro League', flag: '🇧🇪', group: 'liga' },
  suudi_ligi: { label: 'Suudi Arabistan Pro Ligi', short: 'Suudi Pro Ligi', flag: '🇸🇦', group: 'liga' },
  mls: { label: 'ABD Major League Soccer', short: 'MLS', flag: '🇺🇸', group: 'liga' },

  turkiye_kupasi: { label: 'Ziraat Türkiye Kupası', short: 'Türkiye Kupası', flag: '🇹🇷', group: 'cup' },
  fa_cup: { label: 'İngiltere FA Cup', short: 'FA Cup', flag: '🏴', group: 'cup' },
  league_cup: { label: 'İngiltere Lig Kupası (Carabao Cup)', short: 'Lig Kupası', flag: '🏴', group: 'cup' },
  community_shield: { label: 'İngiltere Community Shield', short: 'Community Shield', flag: '🏴', group: 'cup' },
  copa_del_rey: { label: 'İspanya Copa del Rey', short: 'Copa del Rey', flag: '🇪🇸', group: 'cup' },
  coppa_italia: { label: 'İtalya Coppa Italia', short: 'Coppa Italia', flag: '🇮🇹', group: 'cup' },
  dfb_pokal: { label: 'Almanya DFB-Pokal', short: 'DFB-Pokal', flag: '🇩🇪', group: 'cup' },
  sampiyonlar_ligi: { label: 'UEFA Şampiyonlar Ligi', short: 'Şampiyonlar Ligi', flag: '⭐', group: 'cup' },
  avrupa_ligi: { label: 'UEFA Avrupa Ligi', short: 'Avrupa Ligi', flag: '⭐', group: 'cup' },
  konferans_ligi: { label: 'UEFA Konferans Ligi', short: 'Konferans Ligi', flag: '⭐', group: 'cup' },
  uefa_super_kupa: { label: 'UEFA Süper Kupa', short: 'UEFA Süper Kupa', flag: '⭐', group: 'cup' },
  dunya_kupasi: { label: 'FIFA Dünya Kupası', short: 'Dünya Kupası', flag: '🌐', group: 'cup' },
  euro: { label: 'UEFA Avrupa Şampiyonası', short: 'EURO', flag: '⭐', group: 'cup' },
  uluslar_ligi: { label: 'UEFA Uluslar Ligi', short: 'Uluslar Ligi', flag: '⭐', group: 'cup' },
  copa_libertadores: { label: 'Copa Libertadores', short: 'Libertadores', flag: '🌎', group: 'cup' },
  copa_sudamericana: { label: 'Copa Sudamericana', short: 'Sudamericana', flag: '🌎', group: 'cup' },
  hazirlik_maci: { label: 'Hazırlık Maçı', short: 'Hazırlık Maçı', flag: '🤝', group: 'cup' },
};

const KEY_TO_SLUG = {};
const SLUG_TO_KEY = {};
for (const key of Object.keys(COMPETITIONS)) {
  const slug = key.replace(/_/g, '-');
  KEY_TO_SLUG[key] = slug;
  SLUG_TO_KEY[slug] = key;
}

export function competitionSlug(key) {
  return KEY_TO_SLUG[key] ?? key.replace(/_/g, '-');
}

export function competitionKeyFromSlug(slug) {
  return SLUG_TO_KEY[slug] ?? null;
}

export function competitionLabel(key, locale = 'tr') {
  const label = COMPETITIONS[key]?.label ?? key;
  if (locale !== 'en') return label;
  return label
    .replace(/^Trendyol Süper Lig$/, 'Trendyol Süper Lig')
    .replace(/^İngiltere /, 'English ')
    .replace(/^İspanya /, 'Spanish ')
    .replace(/^İtalya /, 'Italian ')
    .replace(/^Almanya /, 'German ')
    .replace(/^Fransa /, 'French ')
    .replace(/^Hollanda /, 'Dutch ')
    .replace(/^Portekiz /, 'Portuguese ')
    .replace(/^Belçika /, 'Belgian ')
    .replace(/^Suudi Arabistan /, 'Saudi Arabian ')
    .replace(/^ABD /, 'US ')
    .replace(/^Ziraat Türkiye Kupası$/, 'Turkish Cup')
    .replace(/^UEFA Şampiyonlar Ligi$/, 'UEFA Champions League')
    .replace(/^UEFA Avrupa Ligi$/, 'UEFA Europa League')
    .replace(/^UEFA Konferans Ligi$/, 'UEFA Conference League')
    .replace(/^UEFA Süper Kupa$/, 'UEFA Super Cup')
    .replace(/^FIFA Dünya Kupası$/, 'FIFA World Cup')
    .replace(/^UEFA Avrupa Şampiyonası$/, 'UEFA European Championship')
    .replace(/^UEFA Uluslar Ligi$/, 'UEFA Nations League')
    .replace(/^Hazırlık Maçı$/, 'Friendly Match');
}

export function competitionShort(key, locale = 'tr') {
  const label = COMPETITIONS[key]?.short ?? key;
  if (locale !== 'en') return label;
  return competitionLabel(key, locale) === COMPETITIONS[key]?.label ? label : competitionLabel(key, locale);
}

export function competitionFlag(key) {
  return COMPETITIONS[key]?.flag ?? '⚽';
}

// Ana sayfa/Bugünün Maçları'nda yayın önceliği: Türkiye, UEFA, ardından
// Avrupa'nın beş büyük ligi. Böylece yoğun günlerde en çok aranan maçlar
// ilk ekranda kalır.
const PRIORITY = {
  super_lig: 0,
  sampiyonlar_ligi: 1,
  avrupa_ligi: 2,
  konferans_ligi: 3,
  uefa_super_kupa: 4,
  premier_lig: 5,
  la_liga: 6,
  serie_a: 7,
  bundesliga: 8,
  ligue_1: 9,
  tff_1_lig: 10,
  turkiye_kupasi: 11,
  fa_cup: 12,
  league_cup: 13,
  copa_del_rey: 14,
  coppa_italia: 15,
  dfb_pokal: 16,
};

export function competitionPriority(key) {
  return PRIORITY[key] ?? 99;
}

// Puan Durumu / Gol-Asist Kralı için: tv-spor-rehberi-app'in `league_standings`
// ve `league_stats` tablolarındaki `league_api_id` kolonu KASITLI olarak
// API-Football'ın eski lig numaralarını kullanmaya devam ediyor (SoccersAPI
// geçişinde DEĞİŞTİRİLMEDİ — bkz. sync-standings-soccersapi'deki not: "bu
// kolon artık veri kaynağının id'si değil, uygulamanın bildiği sabit lig
// anahtarı"). Bu yüzden burada da AYNI sabit id'ler kullanılıyor.
export const COMPETITION_TO_LEAGUE_API_ID = {
  super_lig: 203,
  premier_lig: 39,
  la_liga: 140,
  serie_a: 135,
  bundesliga: 78,
  ligue_1: 61,
  sampiyonlar_ligi: 2,
  avrupa_ligi: 3,
  konferans_ligi: 848,
  eredivisie: 88,
  primeira_liga: 94,
  belcika_ligi: 144,
  suudi_ligi: 307,
  tff_1_lig: 204,
  turkiye_kupasi: 206,
  fa_cup: 45,
  league_cup: 48,
  community_shield: 528,
  copa_del_rey: 143,
  coppa_italia: 137,
  dfb_pokal: 81,
};

// /takimlar sayfasında "popüler takımlar" bu kapsamdan türetiliyor —
// PRIORITY objesinin anahtarlarıyla aynı (zaten "büyük ligler" listesi).
export const MAJOR_COMPETITION_KEYS = Object.keys(PRIORITY);

// /ligler sayfasında "Popüler Ligler" öne çıkan grup, geri kalanı
// "Diğer Ligler ve Kupalar" altında listeleniyor.
export function isMajorCompetition(key) {
  return key in PRIORITY;
}
