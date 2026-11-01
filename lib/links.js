// Google Play, `referrer` parametresi olarak gelen UTM'i Play Console'un
// "Acquisition reports" ekranında hangi kaynaktan kaç indirme geldiğini
// göstermek için kullanır (Google Analytics/Firebase eklenince de aynı UTM
// otomatik oraya da düşer). Her sayfa/CTA kendi `campaign` değerini geçirir
// (ör. "homepage_hero", "mac_detay_cta") — hangi sayfanın indirme
// getirdiğini ayırt edebilmek için.
const PLAY_PACKAGE = 'com.tvsporrehberi.app';

export function playStoreUrl(campaign) {
  const referrer = `utm_source=tvsporrehberi_web&utm_medium=web&utm_campaign=${campaign}`;
  return `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}&referrer=${encodeURIComponent(referrer)}`;
}

export const SITE_URL = 'https://tvsporrehberi.com';

// iOS uygulaması (App Store'da 2026-09-22'den beri yayında). Google Play'deki
// gibi bir `referrer` karşılığı yok — App Store kampanya ölçümü (`ct`) ancak
// App Store Connect'teki sağlayıcı kodu (`pt`) ile birlikte çalışıyor, o
// yüzden sade bağlantı kullanılıyor.
export const APP_STORE_URL = 'https://apps.apple.com/tr/app/tv-spor-rehberi/id6810751290';
