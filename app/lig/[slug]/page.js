import { notFound } from 'next/navigation';
import Link from 'next/link';
import Guide from '../../../components/Guide';
import Standings from '../../../components/Standings';
import LeagueStats from '../../../components/LeagueStats';
import AppCta from '../../../components/AppCta';
import { getFixturesForCompetition, getLeagueStats, getStandings, windowIso } from '../../../lib/data';
import {
  competitionFlag,
  competitionKeyFromSlug,
  competitionLabel,
  competitionSlug,
  MAJOR_COMPETITION_KEYS,
} from '../../../lib/competitions';
import { SITE_URL } from '../../../lib/links';

export const revalidate = 600;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const key = competitionKeyFromSlug(slug);
  if (!key) return { title: 'Lig Bulunamadı' };
  const label = competitionLabel(key);
  return {
    title: `${label} Maç Programı ve Yayın Kanalları`,
    description: `${label}'nde bu hafta oynanacak tüm maçlar, saatleri, puan durumu ve hangi kanalda yayınlandığı bilgisi.`,
    alternates: { canonical: `${SITE_URL}/lig/${slug}` },
  };
}

export default async function LeaguePage({ params }) {
  const { slug } = await params;
  const key = competitionKeyFromSlug(slug);
  if (!key) notFound();

  const { startIso, endIso } = windowIso(2, 14);
  let rows = [];
  let standings = null;
  let leagueStats = null;
  try {
    [rows, standings, leagueStats] = await Promise.all([
      getFixturesForCompetition(key, { startIso, endIso }),
      getStandings(key),
      getLeagueStats(key),
    ]);
  } catch {
    rows = rows.length ? rows : [];
  }

  const pageUrl = `${SITE_URL}/lig/${slug}`;
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: competitionLabel(key), item: pageUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <div className="crumb wrap">
        <Link href="/">Ana Sayfa</Link> › {competitionLabel(key)}
      </div>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">{competitionFlag(key)} Lig Rehberi</div>
          <h1>{competitionLabel(key)}</h1>
          <p className="page-desc">
            {competitionLabel(key)}&apos;nde yaklaşan tüm maçlar, saatleri, puan durumu ve yayın kanalları.
          </p>
        </div>
      </div>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-title">
              Maç <span>Programı</span>
            </div>
          </div>
          <Guide rows={rows} />
        </div>
      </section>

      {standings ? (
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-title">
                Puan <span>Durumu</span>
              </div>
            </div>
            <Standings data={standings} />
          </div>
        </section>
      ) : null}

      {leagueStats ? (
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-title">
                Gol &amp; Asist <span>Kralı</span>
              </div>
            </div>
            <LeagueStats data={leagueStats} />
          </div>
        </section>
      ) : null}

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-title">
              Diğer <span>Ligler</span>
            </div>
          </div>
          <div className="related-leagues">
            {MAJOR_COMPETITION_KEYS.filter((k) => k !== key).map((k) => (
              <Link key={k} href={`/lig/${competitionSlug(k)}`} className="related-league-chip">
                {competitionFlag(k)} {competitionLabel(k)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <AppCta campaign="lig_sayfasi" />
    </>
  );
}
