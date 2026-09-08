import { notFound } from 'next/navigation';
import Link from 'next/link';
import Guide from '../../../components/Guide';
import Standings from '../../../components/Standings';
import LeagueStats from '../../../components/LeagueStats';
import AppCta from '../../../components/AppCta';
import JsonLd from '../../../components/JsonLd';
import { getFixturesForCompetition, getLeagueStats, getStandings, windowIso } from '../../../lib/data';
import {
  competitionFlag,
  competitionKeyFromSlug,
  competitionLabel,
  competitionSlug,
  MAJOR_COMPETITION_KEYS,
} from '../../../lib/competitions';
import { SITE_URL } from '../../../lib/links';
import { getLocale } from '../../../lib/locale';

export const revalidate = 600;

// Google/AdSense'in "sadece veri tablosu, özgün metin yok" tespitine karşı:
// sayfadaki gerçek fikstür/puan durumu verisinden türetilmiş, uydurma
// olmayan kısa bir özet cümlesi. Türkçe'de dinamik takım/lig adına doğrudan
// ek eklemek yanlış ünlü uyumu üretebileceği için (bkz. generateMetadata'daki
// not), cümleler hep adın SONRASINA bağımsız bir kelimeyle devam edecek
// şekilde kuruldu — asla "{isim}'de" gibi ek gerektiren bir kalıp yok.
function buildLeagueSummary({ rows, standings, locale }) {
  const now = Date.now();
  const upcomingCount = rows.filter((r) => new Date(r.kickoff_at).getTime() > now).length;
  const list = Array.isArray(standings?.standings) ? standings.standings : [];
  const lines = [];

  if (upcomingCount > 0) {
    lines.push(
      locale === 'en'
        ? `${upcomingCount} more ${upcomingCount === 1 ? 'match is' : 'matches are'} coming up in the schedule below.`
        : `Aşağıdaki programda önümüzdeki günlerde oynanacak ${upcomingCount} maç var.`
    );
  }

  if (list.length >= 2) {
    const leader = list[0];
    const second = list[1];
    const gap = (leader.points ?? 0) - (second.points ?? 0);
    if (leader.team?.name && second.team?.name) {
      lines.push(
        locale === 'en'
          ? `${leader.team.name} lead the table with ${leader.points} points, ${gap} ahead of ${second.team.name}.`
          : `Zirvede ${leader.team.name} var, ${leader.points} puanla lider; en yakın takipçisi ${second.team.name}, ${gap} puan geride.`
      );
    }
  }

  return lines;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const key = competitionKeyFromSlug(slug);
  if (!key) return { title: 'Lig Bulunamadı' };
  const label = competitionLabel(key);
  return {
    title: `${label} Maç Programı ve Yayın Kanalları`,
    // Not: `${label} + Türkçe ek` şeklinde kurulmuyor — dinamik lig adına
    // (Süper Lig, Bundesliga, Ligue 1...) doğru ünlü uyumuyla ek eklemek
    // genel bir çözüm gerektirir; cümleyi ek gerektirmeyecek şekilde kurmak
    // daha güvenli (önceden "Trendyol Süper Lig'nde" gibi hatalı bir ek
    // üretiyordu).
    description: `${label}: bu hafta oynanacak tüm maçlar, saatleri, puan durumu ve hangi kanalda yayınlandığı bilgisi.`,
    alternates: { canonical: `${SITE_URL}/lig/${slug}` },
  };
}

export default async function LeaguePage({ params }) {
  const locale = await getLocale();
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

  const summaryLines = buildLeagueSummary({ rows, standings, locale });
  const pageUrl = `${SITE_URL}/lig/${slug}`;
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: locale === 'en' ? 'Home' : 'Ana Sayfa', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: competitionLabel(key, locale), item: pageUrl },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <div className="crumb wrap">
        <Link href="/">{locale === 'en' ? 'Home' : 'Ana Sayfa'}</Link> › {competitionLabel(key, locale)}
      </div>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">{competitionFlag(key)} {locale === 'en' ? 'League Guide' : 'Lig Rehberi'}</div>
          <h1>{competitionLabel(key, locale)}</h1>
          <p className="page-desc">
            {locale === 'en' ? `Upcoming ${competitionLabel(key, locale)} matches, kick-off times, standings and broadcast channels.` : `${competitionLabel(key)}'nde yaklaşan tüm maçlar, saatleri, puan durumu ve yayın kanalları.`}
          </p>
          {summaryLines.map((line) => (
            <p className="page-desc" key={line}>{line}</p>
          ))}
        </div>
      </div>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-title">
              {locale === 'en' ? <>Match <span>Schedule</span></> : <>Maç <span>Programı</span></>}
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
                {locale === 'en' ? <><span>Standings</span></> : <>Puan <span>Durumu</span></>}
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
                {locale === 'en' ? <>Goals &amp; <span>Assists</span></> : <>Gol &amp; Asist <span>Kralı</span></>}
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
              {locale === 'en' ? <>Other <span>Leagues</span></> : <>Diğer <span>Ligler</span></>}
            </div>
          </div>
          <div className="related-leagues">
            {MAJOR_COMPETITION_KEYS.filter((k) => k !== key).map((k) => (
              <Link key={k} href={`/lig/${competitionSlug(k)}`} className="related-league-chip">
                {competitionFlag(k)} {competitionLabel(k, locale)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <AppCta campaign="lig_sayfasi" />
    </>
  );
}
