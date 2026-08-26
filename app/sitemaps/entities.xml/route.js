import { entityEntries, urlset, xmlResponse } from '../../../lib/sitemapXml';
export const revalidate = 3600;
export async function GET() {
  return xmlResponse(urlset(await entityEntries()));
}
