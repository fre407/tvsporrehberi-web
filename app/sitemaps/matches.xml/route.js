import { matchEntries, urlset, xmlResponse } from '../../../lib/sitemapXml';
export const revalidate = 3600;
export async function GET() {
  // Hata durumunda boş bir sitemap'i önbelleğe yazmak yerine isteği
  // başarısız bırakıyoruz; CDN'deki son başarılı XML stale-while-revalidate
  // süresince korunur ve Google'a eksik URL listesi gönderilmez.
  return xmlResponse(urlset(await matchEntries()));
}
