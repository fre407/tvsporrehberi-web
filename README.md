# tvsporrehberi.com

TV Spor Rehberi mobil uygulamasının canlı maç verisiyle (aynı Supabase
projesi, `fixtures_with_channel` view) çalışan, SEO odaklı Next.js sitesi.

## Sayfalar

- `/` — Ana sayfa
- `/bugun` — Bugünün maç programı
- `/mac/[id]` — Maç detay (dinamik başlık/açıklama + Schema.org SportsEvent)
- `/takim/[slug]` — Takım sayfası (yaklaşan/son maçlar)
- `/lig/[slug]` — Lig sayfası

`/sitemap.xml` ve `/robots.txt` otomatik üretilir (bkz. `app/sitemap.js`,
`app/robots.js`).

## Geliştirme

```bash
npm install
npm run dev
```

## Deploy

Vercel'e bağlı — `main`'e her push otomatik yayına alır (build komutu
`next build`, ekstra ortam değişkeni gerekmiyor; Supabase anon key kod
içinde, herkese açık/salt-okunur bir anahtar).

## Google Search Console

`app/layout.js`'deki `metadata.verification.google` alanına GSC'nin verdiği
doğrulama kodunu yapıştırıp deploy etmek yeterli.
