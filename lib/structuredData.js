// Sayfaların Schema.org (JSON-LD) verisi — tek yerden, test edilebilir.
//
// NEDEN Event/SportsEvent YOK (2026-11-03, Search Console "Etkinlikler"
// raporu: 3 geçersiz öğe, "location alanı eksik"): Google'ın Event zengin
// sonucu fiziksel bir mekânda, halka açık, rezervasyonu yapılabilen
// etkinlikler içindir ("Events must take place in a physical location") ve
// Türkiye bu deneyimin desteklendiği bölgeler arasında değil. Google'ın
// genel yapılandırılmış veri kuralları da kurala aykırı işaretleme örneği
// olarak tam bizim durumumuzu sayıyor: "A sports live streaming site
// labeling broadcasts as local events." Bizim sayfalar maçın TV/yayın
// rehberi; maçın stadyum verisi elimizde yok. Eskiden maç sayfasında
// location'a turnuva adı yazılıyordu (sahte konum) ve tahmin yazılarının
// "about" alanında konumsuz bir SportsEvent vardı — ikisi de kaldırıldı.
// Yerine sayfanın gerçek türü (WebPage / Article) ve gerçekten bilinen
// varlıklar (iki takım: SportsTeam) işaretleniyor.

export const EVENT_TYPES = new Set([
  'Event', 'SportsEvent', 'BroadcastEvent', 'PublicationEvent', 'ScreeningEvent', 'OnDemandEvent',
]);

function teams(homeTeam, awayTeam) {
  return [homeTeam, awayTeam].filter(Boolean).map((name) => ({ '@type': 'SportsTeam', name }));
}

export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

// Maç sayfası: "X - Y maçı hangi kanalda, saat kaçta?" sorusunun cevap
// sayfası — bir WebPage. Takımlar "about" ile bağlanır; tarih/kanal bilgisi
// açıklamada (görünür içerikle aynı) kalır.
export function matchPageJsonLd({ siteUrl, url, name, description, homeTeam, awayTeam, dateModified }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    url,
    name,
    description,
    inLanguage: 'tr-TR',
    isPartOf: { '@type': 'WebSite', name: 'TV Spor Rehberi', url: siteUrl },
    about: teams(homeTeam, awayTeam),
    ...(dateModified ? { dateModified } : {}),
  };
}

// İddialı Tahminler yazısı: Article. Yazarı/yayıncısı site (kişi uydurulmaz).
export function predictionArticleJsonLd({ siteUrl, url, article }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: [`${url}/opengraph-image`],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    inLanguage: 'tr-TR',
    articleSection: 'İddialı Tahminler',
    keywords: (article.keywords ?? []).join(', '),
    author: { '@type': 'Organization', name: 'TV Spor Rehberi', url: siteUrl },
    publisher: { '@type': 'Organization', name: 'TV Spor Rehberi', url: siteUrl, logo: { '@type': 'ImageObject', url: `${siteUrl}/icon.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    about: teams(article.homeTeam, article.awayTeam),
  };
}

// Testler ve seo-audit için: bir JSON-LD ağacında Event türü var mı?
export function findEventTypes(node, path = '$', out = []) {
  if (Array.isArray(node)) {
    node.forEach((n, i) => findEventTypes(n, `${path}[${i}]`, out));
  } else if (node && typeof node === 'object') {
    const types = [].concat(node['@type'] ?? []);
    for (const t of types) if (EVENT_TYPES.has(t)) out.push({ path, type: t });
    for (const [k, v] of Object.entries(node)) if (k !== '@type') findEventTypes(v, `${path}.${k}`, out);
  }
  return out;
}
