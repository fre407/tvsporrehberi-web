import { dayEntries, urlset, xmlResponse } from '../../../lib/sitemapXml';
export const revalidate = 3600;
export function GET() { return xmlResponse(urlset(dayEntries())); }
