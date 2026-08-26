import { staticEntries, urlset, xmlResponse } from '../../../lib/sitemapXml';
export const revalidate = 86400;
export function GET() { return xmlResponse(urlset(staticEntries()), 86400); }
