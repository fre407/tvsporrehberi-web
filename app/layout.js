import Script from 'next/script';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SITE_URL } from '../lib/links';

// Google AdSense mülk doğrulaması + reklam kütüphanesi — AdSense onboarding'in
// verdiği kod birebir bu (client=ca-pub-3167111771074405, aynı yayıncı
// kimliği tv-spor-rehberi-app'teki AdMob AppId'siyle paylaşılıyor).
// strategy="beforeInteractive" ile Next.js bunu sunucu render'ındaki ilk
// HTML <head>'e gömüyor — AdSense'in "sitenizin her sayfasında <head> içinde
// olsun" doğrulaması bunu görebiliyor (client tarafında sonradan eklenen bir
// script'i görmüyor).
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
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
