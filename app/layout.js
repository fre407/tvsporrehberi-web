import Script from 'next/script';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StickyBanner from '../components/StickyBanner';
import JsonLd from '../components/JsonLd';
import { Big_Shoulders, DM_Sans } from 'next/font/google';

// Fontlar next/font ile build sırasında indirilip KENDİ alan adımızdan
// sunuluyor. Önceden <link> ile fonts.googleapis.com'dan çekiliyordu; bu
// hem render'ı bloklayan üçüncü taraf bir gidiş-dönüş ekliyor hem de
// ziyaretçinin IP'sini Google'a gönderiyordu. Self-host ile ikisi de gitti;
// `display: 'swap'` yazının font inerken görünmesini sağlıyor (CLS/LCP).
// Her ikisi de değişken (variable) font — weight listelemek yerine tek dosya
// inip tüm kalınlıkları karşılıyor. subsets'te latin-ext şart: Türkçe
// ğ/ş/ı/İ karakterleri orada.
const displayFont = Big_Shoulders({
  subsets: ['latin-ext'],
  display: 'swap',
  variable: '--font-display-src',
});

const bodyFont = DM_Sans({
  subsets: ['latin-ext'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-body-src',
});
import { SITE_URL } from '../lib/links';

// Google AdSense reklam kütüphanesi — aynı yayıncı kimliği (ca-pub-...)
// tv-spor-rehberi-app'teki AdMob AppId'siyle paylaşılıyor. Site sahipliği
// doğrulaması `metadata.other`'daki statik <meta name="google-adsense-
// account"> etiketiyle yapılıyor (Next'in metadata API'si bunu gerçek HTML
// olarak render ediyor). Bu artık çözüldüğü için reklam scripti'ni
// strategy="afterInteractive" ile yüklüyoruz — "beforeInteractive" hydration
// öncesi ana thread'i bloklayıp Core Web Vitals'ı (LCP/INP) gereksiz yere
// kötüleştiriyordu; reklam scriptinin hydration'dan hemen sonra yüklenmesi
// yeterli, reklam gösterimini etkilemiyor.
const ADSENSE_CLIENT_ID = 'ca-pub-3167111771074405';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TV Spor Rehberi — Hangi Maç Hangi Kanalda, Kaçta?',
    template: '%s | TV Spor Rehberi',
  },
  description:
    'Süper Lig, Şampiyonlar Ligi ve Avrupa’nın 5 büyük liginde günün tüm maçlarını saatiyle, kanalıyla ve canlı skoruyla tek sayfada takip et.',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'TV Spor Rehberi',
    url: SITE_URL,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  // Google Search Console mülk doğrulaması: search.google.com/search-console
  // üzerinden "URL prefix" ile mülk eklenince "HTML tag" yöntemi bir
  // <meta name="google-site-verification" content="..."> kodu verir — o
  // kodu buraya yapıştırıp deploy etmek yeterli, DNS değişikliği gerekmez.
  verification: {
    google: 'C-EfQ0YSsIpbcAdOOU-tkJlOzz-b2ZucdnRPwGk5noo',
  },
  // AdSense site sahipliği doğrulaması — onboarding'in "Meta etiket" yöntemi
  // (kullanıcı bildirimi, 2026-08-24: script yöntemi JS ile enjekte edildiği
  // için doğrulanamadı, bkz. yukarıdaki not).
  other: {
    'google-adsense-account': ADSENSE_CLIENT_ID,
  },
};

// Not: SearchAction (sitelinks arama kutusu) şeması bilerek eklenmedi —
// Google bunun için gerçek bir HTML sonuç sayfası (ör. /ara?q=...) ister;
// bizde arama sadece istemci tarafı bir açılır kutu, ayrı bir sonuç sayfası
// yok. Olmayan bir şeyi şema ile "var" göstermek yanlış olur.
const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'TV Spor Rehberi',
  url: SITE_URL,
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <head>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <JsonLd data={ORG_JSON_LD} />
      </head>
      <body>
        <div className="sticky-shell">
          <StickyBanner />
          <Header />
        </div>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
