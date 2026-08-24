import Script from 'next/script';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StickyBanner from '../components/StickyBanner';
import { SITE_URL } from '../lib/links';

// Google AdSense reklam kütüphanesi — aynı yayıncı kimliği (ca-pub-...)
// tv-spor-rehberi-app'teki AdMob AppId'siyle paylaşılıyor. next/script
// strategy="beforeInteractive" gerçek tarayıcılarda reklamların yüklenmesi
// için doğru/performanslı yol, AMA Next.js bunu JS ile (self.__next_s
// push mekanizmasıyla) enjekte ediyor — ham sunucu HTML'inde LİTERAL bir
// <script> etiketi olarak GÖRÜNMÜYOR. Bu yüzden AdSense'in site sahipliği
// doğrulama botu bunu göremeyip "doğrulanamadı" verdi (2026-08-24). Site
// sahipliği doğrulaması bunun yerine aşağıdaki `metadata.other`'daki statik
// <meta name="google-adsense-account"> etiketiyle yapılıyor — o, Next'in
// metadata API'si tarafından gerçek/statik HTML olarak render ediliyor.
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
  robots: { index: true, follow: true },
  // Google Search Console mülk doğrulaması: search.google.com/search-console
  // üzerinden "URL prefix" ile mülk eklenince "HTML tag" yöntemi bir
  // <meta name="google-site-verification" content="..."> kodu verir — o
  // kodu buraya yapıştırıp deploy etmek yeterli, DNS değişikliği gerekmez.
  verification: {
    // google: 'BURAYA_GOOGLE_SEARCH_CONSOLE_KODUNU_YAPISTIR',
  },
  // AdSense site sahipliği doğrulaması — onboarding'in "Meta etiket" yöntemi
  // (kullanıcı bildirimi, 2026-08-24: script yöntemi JS ile enjekte edildiği
  // için doğrulanamadı, bkz. yukarıdaki not).
  other: {
    'google-adsense-account': ADSENSE_CLIENT_ID,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Big+Shoulders:wght@600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500&display=swap"
        />
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <StickyBanner />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
