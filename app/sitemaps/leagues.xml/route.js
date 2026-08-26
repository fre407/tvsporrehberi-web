import { leagueEntries, urlset, xmlResponse } from '../../../lib/sitemapXml';
export const revalidate = 86400;
export function GET() { return xmlResponse(urlset(leagueEntries()), 86400); }
