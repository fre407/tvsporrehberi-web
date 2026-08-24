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
};

export default nextConfig;
