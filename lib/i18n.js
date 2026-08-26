export const DEFAULT_LOCALE = 'tr';
export const LOCALES = new Set(['tr', 'en']);

const messages = {
  tr: {
    nav: { today: 'Bugün', live: 'Canlı Skorlar', leagues: 'Ligler', teams: 'Takımlar', channels: 'Kanallar' },
    theme: { label: 'Renk teması', dark: 'Koyu', light: 'Açık' },
    language: { label: 'Dil seçimi', tr: 'TR', en: 'ENG' },
    common: { today: 'Bugün', yesterday: 'Dün', tomorrow: 'Yarın', live: 'CANLI', all: 'Tümü', details: 'Maç detayına git →', follow: 'Takibe al', unfollow: 'Takipten çıkar', share: 'Paylaş', copied: 'Bağlantı kopyalandı', noMatches: 'Bu aralıkta listelenecek maç bulunamadı.' },
    guide: { live: '● Canlı', broadcast: 'Türkiye’de yayınlanan', favorites: '★ Takip ettiklerim', all: 'Tümü', cup: 'Türkiye Kupası', champions: 'Şampiyonlar Ligi', pending: 'Yayın bilgisi bekleniyor', noFavorites: 'Takip ettiğin lig için bu aralıkta maç bulunamadı.', open: 'aç', close: 'kapat' },
    broadcast: { unavailable: 'Yayınlanmıyor', missing: 'Türkiye yayın bilgisi henüz bulunamadı' },
    search: { placeholder: 'Takım, lig veya maç ara…', label: 'Site içinde ara', loading: 'Aranıyor…', empty: 'Sonuç bulunamadı.', teams: 'Takımlar', leagues: 'Ligler', upcoming: 'Yaklaşan Maçlar' },
    banner: { kicker: 'TV SPOR REHBERİ UYGULAMASI', text: 'Maç saati, yayıncı kanal ve canlı skor bildirimlerini kaçırma.', download: 'Ücretsiz indir', close: "Banner'ı kapat" },
    footer: { text: 'Günün maçlarını, yayıncı kanalları ve canlı skorları tek yerde takip et.', app: 'Uygulamayı indir', explore: 'Keşfet', info: 'Bilgiler', today: 'Bugünün Maçları', live: 'Canlı Skorlar', leagues: 'Ligler', channels: 'Kanallar', about: 'Hakkımızda', privacy: 'Gizlilik Politikası', legal: 'Yasal Bilgilendirme', updated: 'Maç, kanal ve skor bilgileri düzenli olarak güncellenir.' },
    cta: { title1: 'Bildirim gelsin,', title2: 'sen kaçırma.', text: 'Favori takımının maçı yaklaşınca, İlk 11 açıklanınca ve maç bitince telefonuna anında haber verelim. TV Spor Rehberi uygulamasını indir, hiçbir maçı kaçırma.', download: "▶ Google Play'den İndir" },
    live: { none: 'Şu anda canlı maç yok. ⚽', browse: 'Bugünün maç programına göz at →', updated: 'Son güncelleme: {time}', refreshing: 'Skorlar otomatik güncellenir.', all: 'Tüm canlılar →' },
    share: { launcher: 'MAÇI PAYLAŞ', launcherText: 'Arkadaşlarına görsel maç kartı gönder', view: 'Kartı görüntüle ↗', title: 'PAYLAŞILABİLİR MAÇ KARTI', story: 'Story görselini paylaş', ready: 'Hazır!', image: 'Görseli paylaş', close: 'Kart önizlemesini kapat', matchCard: 'MAÇ KARTI', todaysMatch: 'BUGÜNÜN MAÇI', turkeyTime: 'TÜRKİYE SAATİ İLE', wide: 'Yatay · 1200×630', storyFormat: 'Instagram Story · 1080×1920' },
    home: { eyebrow: 'Canlı yayın rehberi', title1: 'Hangi maç,', title2: 'hangi kanalda, kaçta?', intro: 'Günün maçlarını, yayıncı kanallarını ve canlı skorları tek yerde takip et.', today: 'BUGÜN', note: 'Maç programını lig lig incele, aradığın karşılaşmayı saniyeler içinde bul.', matches: 'Bugünün Maçları', subtitle: 'Saat, kanal ve canlı skor bilgisiyle', programme: 'Tüm program →', allMatches: 'Bugünün tüm maç programını aç →', standings: 'Puan Durumu', standingsEmpty: 'Puan durumu yakında güncellenecek.', allStandings: 'Tüm puan durumunu gör →', goalsAssists: 'Gol & Asist', statsEmpty: 'Liderlik verileri yakında güncellenecek.', allStats: 'Tüm istatistikleri gör →', more: 'Sadece yayın rehberi değil', moreSub: 'Uygulamadaki her şey web’de de seninle', liveScore: 'Canlı Skor', liveScoreText: 'Dakika dakika skor ve maç durumu, sayfa yenilemeden.', lineups: 'İlk 11’ler', lineupsText: 'Resmî kadrolar açıklanır açıklanmaz burada.', table: 'Puan Durumu', tableText: 'Süper Lig ve 5 büyük Avrupa liginde güncel tablo.', notifications: 'Maç Bildirimleri', notificationsText: 'Favori takımının maçını uygulamadan anında öğren.', faq: 'Sıkça Sorulan Sorular' },
  },
  en: {
    nav: { today: 'Today', live: 'Live Scores', leagues: 'Leagues', teams: 'Teams', channels: 'Channels' },
    theme: { label: 'Colour theme', dark: 'Dark', light: 'Light' },
    language: { label: 'Language selection', tr: 'TR', en: 'ENG' },
    common: { today: 'Today', yesterday: 'Yesterday', tomorrow: 'Tomorrow', live: 'LIVE', all: 'All', details: 'Go to match details →', follow: 'Follow', unfollow: 'Unfollow', share: 'Share', copied: 'Link copied', noMatches: 'There are no matches to list in this period.' },
    guide: { live: '● Live', broadcast: 'Broadcast in Türkiye', favorites: '★ Following', all: 'All', cup: 'Turkish Cup', champions: 'Champions League', pending: 'Broadcast information pending', noFavorites: 'No matches found for the competitions you follow in this period.', open: 'open', close: 'collapse' },
    broadcast: { unavailable: 'Not broadcast', missing: 'Broadcast information for Türkiye is not available yet' },
    search: { placeholder: 'Search team, league or match…', label: 'Search this site', loading: 'Searching…', empty: 'No results found.', teams: 'Teams', leagues: 'Leagues', upcoming: 'Upcoming matches' },
    banner: { kicker: 'TV SPOR REHBERİ APP', text: 'Never miss match time, broadcaster and live-score notifications.', download: 'Download free', close: 'Close banner' },
    footer: { text: 'Follow today’s matches, broadcast channels and live scores in one place.', app: 'Get the app', explore: 'Explore', info: 'Information', today: 'Today’s Matches', live: 'Live Scores', leagues: 'Leagues', channels: 'Channels', about: 'About', privacy: 'Privacy Policy', legal: 'Legal Notice', updated: 'Match, channel and score information is updated regularly.' },
    cta: { title1: 'Get notified,', title2: 'never miss out.', text: 'Get an instant notification when your favourite team is about to play, the starting lineups are announced or the match ends. Download TV Spor Rehberi and never miss a match.', download: '▶ Download on Google Play' },
    live: { none: 'There are no live matches right now. ⚽', browse: 'Browse today’s match schedule →', updated: 'Last updated: {time}', refreshing: 'Scores update automatically.', all: 'All live matches →' },
    share: { launcher: 'SHARE MATCH', launcherText: 'Send a match card image to your friends', view: 'View card ↗', title: 'SHAREABLE MATCH CARD', story: 'Share Story image', ready: 'Ready!', image: 'Share image', close: 'Close card preview', matchCard: 'MATCH CARD', todaysMatch: 'TODAY’S MATCH', turkeyTime: 'TÜRKİYE TIME', wide: 'Landscape · 1200×630', storyFormat: 'Instagram Story · 1080×1920' },
    home: { eyebrow: 'Live broadcast guide', title1: 'Which match,', title2: 'on which channel, at what time?', intro: 'Follow today’s matches, broadcasters and live scores in one place.', today: 'TODAY', note: 'Explore the schedule competition by competition and find the match you want in seconds.', matches: 'Today’s Matches', subtitle: 'With match time, channel and live-score information', programme: 'Full schedule →', allMatches: 'Open today’s full match schedule →', standings: 'Standings', standingsEmpty: 'Standings will be updated soon.', allStandings: 'View full standings →', goalsAssists: 'Goals & Assists', statsEmpty: 'Leaderboard data will be updated soon.', allStats: 'View all statistics →', more: 'More than a broadcast guide', moreSub: 'Everything in the app is also here on the web', liveScore: 'Live Scores', liveScoreText: 'Minute-by-minute score and match status, without refreshing the page.', lineups: 'Starting Lineups', lineupsText: 'Official lineups are here as soon as they are announced.', table: 'Standings', tableText: 'Current tables for the Süper Lig and Europe’s five major leagues.', notifications: 'Match Notifications', notificationsText: 'Get notified instantly in the app when your favourite team plays.', faq: 'Frequently Asked Questions' },
  },
};

export function translate(locale, key, values = {}) {
  const value = key.split('.').reduce((current, segment) => current?.[segment], messages[LOCALES.has(locale) ? locale : DEFAULT_LOCALE]);
  if (typeof value !== 'string') return key;
  return value.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? `{${name}}`);
}

export const t = translate;
