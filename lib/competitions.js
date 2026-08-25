// tv-spor-rehberi-app/src/data/sports.js içindeki COMPETITIONS'ın futbol alt
// kümesi — fixtures tablosu (ve dolayısıyla bu site) şu an SADECE futbol
// içeriyor. Etiketler/bayraklar o dosyayla birebir aynı tutulmalı (elle
// senkron — iki proje ayrı repo, paylaşılan modül pratik değil).
export const COMPETITIONS = {
  super_lig: { label: 'Trendyol Süper Lig', short: 'Süper Lig', flag: '🇹🇷', group: 'liga' },
  tff_1_lig: { label: 'TFF 1. Lig', short: 'TFF 1. Lig', flag: '🇹🇷', group: 'liga' },
  premier_lig: { label: 'İngiltere Premier Lig', short: 'Premier Lig', flag: '🏴', group: 'liga' },
  championship: { label: 'İngiltere Championship', short: 'Championship', flag: '🏴', group: 'liga' },
  league_one: { label: 'İngiltere League One', short: 'League One', flag: '🏴', group: 'liga' },
  la_liga: { label: 'İspanya LaLiga', short: 'LaLiga', flag: '🇪🇸', group: 'liga' },
  serie_a: { label: 'İtalya Serie A', short: 'Serie A', flag: '🇮🇹', group: 'liga' },
  bundesliga: { label: 'Almanya Bundesliga', short: 'Bundesliga', flag: '🇩🇪', group: 'liga' },
  ligue_1: { label: 'Fransa Ligue 1', short: 'Ligue 1', flag: '🇫🇷', group: 'liga' },
  eredivisie: { label: 'Hollanda Eredivisie', short: 'Eredivisie', flag: '🇳🇱', group: 'liga' },
  primeira_liga: { label: 'Portekiz Liga Portugal', short: 'Liga Portugal', flag: '🇵🇹', group: 'liga' },
  belcika_ligi: { label: 'Belçika Pro League', short: 'Pro League', flag: '🇧🇪', group: 'liga' },
  suudi_ligi: { label: 'Suudi Arabistan Pro Ligi', short: 'Suudi Pro Ligi', flag: '🇸🇦', group: 'liga' },
  mls: { label: 'ABD Major League Soccer', short: 'MLS', flag: '🇺🇸', group: 'liga' },
  brasil_ligi: { label: 'Brezilya Serie A', short: 'Brasileirão', flag: '🇧🇷', group: 'liga' },
  arjantin_ligi: { label: 'Arjantin Liga Profesional', short: 'Liga Arjantin', flag: '🇦🇷', group: 'liga' },
  liga_mx: { label: 'Meksika Liga MX', short: 'Liga MX', flag: '🇲🇽', group: 'liga' },

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

export function competitionLabel(key) {
  return COMPETITIONS[key]?.label ?? key;
}

export function competitionShort(key) {
  return COMPETITIONS[key]?.short ?? key;
}

export function competitionFlag(key) {
  return COMPETITIONS[key]?.flag ?? '⚽';
}

// Ana sayfa/Bugünün Maçları'nda lig sıralaması — en üstte büyük ligler.
const PRIORITY = {
  sampiyonlar_ligi: 0,
  super_lig: 1,
  premier_lig: 2,
  la_liga: 3,
  serie_a: 4,
  bundesliga: 5,
  ligue_1: 6,
  avrupa_ligi: 7,
  turkiye_kupasi: 8,
  konferans_ligi: 9,
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
