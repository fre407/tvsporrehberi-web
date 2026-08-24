import { SITE_URL } from '../lib/links';

// Google/Bing normal şekilde taramaya devam eder (SEO buna bağlı).
// /api/ uçları arama motorları için değil, sadece sitenin kendi canlı
// skor/arama widget'ları için — indekslenmesine gerek yok ve toplu
// veri çekmeyi kolaylaştırıyor, o yüzden herkese kapatıyoruz.
// Bilinen yapay zekâ içerik-toplama botları da ayrıca engelleniyor;
// bu, Googlebot/Bingbot'un normal taramasını etkilemez.
const AI_SCRAPERS = [
  'GPTBot',
  'ChatGPT-User',
  'CCBot',
  'ClaudeBot',
  'anthropic-ai',
  'Claude-Web',
  'Bytespider',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'Diffbot',
  'Omgilibot',
  'Timpibot',
];

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/api/' },
      ...AI_SCRAPERS.map((userAgent) => ({ userAgent, disallow: '/' })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
