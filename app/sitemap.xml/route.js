import { sitemapIndex, xmlResponse } from '../../lib/sitemapXml';

export const revalidate = 3600;

export function GET() {
  return xmlResponse(sitemapIndex([
    '/sitemaps/static.xml',
    '/sitemaps/leagues.xml',
    '/sitemaps/days.xml',
    '/sitemaps/entities.xml',
    '/sitemaps/matches.xml',
  ]));
}
