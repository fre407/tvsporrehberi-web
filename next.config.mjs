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
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
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
