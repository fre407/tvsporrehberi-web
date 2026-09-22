/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Sadece maç detay sayfasındaki büyük (64px) takım logoları için
    // kullanılıyor — bu iki görsel dışında sitede next/image kullanılmıyor
    // (küçük liste ikonları için hacim/kota riski nedeniyle bilinçli
    // olarak eklenmedi). Takım logoları SoccersAPI'nin kendi CDN'inden
    // geliyor ve tam host adı bizim kontrolümüzde değil, o yüzden https
    // üzerinden her kaynağa izin veriyoruz.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // HTTPS zaten Vercel tarafından zorlanıyor; bu, tarayıcıya
          // gelecekte de hep HTTPS'e gitmesini söyleyerek downgrade/SSL
          // strip saldırılarına karşı ek bir katman ekliyor.
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        // /api/ yanıtları önbelleğe alınıp toplu kopyalanmasın diye kişiye
        // özel/anlık işaretleniyor.
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
  // AdMob doğrulaması, kullanıcı raporu 2026-09-22: apex domain (tvsporrehberi.com)
  // şimdiye kadar Vercel domain ayarlarında SİTE GENELİNDE www'ye 308
  // yönlendiriliyordu. App Store Connect'teki "Marketing URL" apex (www'siz)
  // olduğundan, AdMob'un app-ads.txt tarayıcısı /app-ads.txt'yi apex'te
  // ARADI, yönlendirmeyi (muhtemelen) takip etmedi ve doğrulama hep
  // başarısız oldu — kod/reklam entegrasyonuyla ilgisi yok, salt bu dosyanın
  // apex'te DOĞRUDAN (yönlendirmesiz) 200 dönmesi gerekiyordu.
  // Çözüm: Vercel'deki domain-seviyesi (tüm path'leri kapsayan) yönlendirme
  // kaldırıldı, yerine SADECE /app-ads.txt HARİÇ her şeyi apex'ten www'ye
  // yönlendiren bu kural eklendi — sitenin geri kalanının kanonik adresi
  // (SEO, mevcut linkler) değişmedi, sadece bu tek dosya istisna edildi.
  async redirects() {
    return [
      {
        source: '/:path((?!app-ads\\.txt$).*)',
        has: [{ type: 'host', value: 'tvsporrehberi.com' }],
        destination: 'https://www.tvsporrehberi.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
