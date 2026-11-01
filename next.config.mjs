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
  //
  // DÜZELTME, 2026-11-01: yukarıdaki varsayım YANLIŞTI — sitenin kanonik
  // adresi hiçbir zaman www olmadı. lib/links.js'teki SITE_URL apex; her
  // sayfanın <link rel="canonical">'ı, og:url, sitemap <loc>'ları ve
  // robots.txt'deki Sitemap satırı hep apex'i gösteriyor. Apex→www
  // yönlendirmesi bu yüzden bir DÖNGÜ kurdu: Google sitemap'teki apex URL'ye
  // gidiyor → www'ye yönleniyor → www sayfası "kanoniğim apex" diyor → apex
  // yine www'ye yönleniyor. Sonuç: GSC'de 0 dizine eklenen sayfa, 1.400+
  // "Keşfedildi - dizine eklenmedi"; AdSense'in ads.txt tarayıcısı da apex'te
  // dosyayı bulamadı ("Bulunamadı", yönlendirme takip edilmiyor). GSC mülkü
  // ve AdSense sitesi de apex olarak kayıtlı. Bu yüzden yön tersine çevrildi:
  // apex her şeyi doğrudan (200) sunuyor, www → apex kalıcı yönlendiriliyor.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.tvsporrehberi.com' }],
        destination: 'https://tvsporrehberi.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
