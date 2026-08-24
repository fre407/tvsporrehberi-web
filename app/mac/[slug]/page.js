import { notFound, redirect } from 'next/navigation';
import {
  getFixtureById,
  getFixturesInWindow,
  getFixtureLineups,
  getFixtureStats,
  getFixturesForCompetition,
  getHeadToHead,
  channelDisplay,
  matchStatus,
  windowIso,
} from '../../../lib/data';
import { istDateLong, istKeyToUtcRange, istTime, matchSlug, slugify } from '../../../lib/format';
import { competitionLabel, competitionSlug } from '../../../lib/competitions';
import { SITE_URL, playStoreUrl } from '../../../lib/links';
import Link from 'next/link';
import Image from 'next/image';
import AppCta from '../../../components/AppCta';
import Guide from '../../../components/Guide';
import Lineups from '../../../components/Lineups';
import MatchStats from '../../../components/MatchStats';
import HeadToHead from '../../../components/HeadToHead';

export const revalidate = 120;

const DATE_TAIL_RE = /\d{4}-\d{2}-\d{2}$/;

// Slug'ın son 10 karakteri her zaman "YYYY-MM-DD" — o günün fikstürleri
// çekilip her birinin kendi slug'ı (matchSlug ile) yeniden üretilerek tam
// eşleşme aranıyor. Ayrı bir slug kolonu/tablosu TUTULMUYOR (kullanıcı
// isteği: mevcut şemaya dokunma).
async function loadFixtureBySlug(slug) {
  const dateMatch = slug.match(DATE_TAIL_RE);
  if (!dateMatch) return null;
  const dateKey = dateMatch[0];
  const { startIso, endIso } = istKeyToUtcRange(dateKey);
  let rows = [];
  try {
    rows = await getFixturesInWindow(startIso, endIso);
  } catch {
    return null;
  }
  return rows.find((r) => matchSlug(r.home_team, r.away_team, r.kickoff_at) === slug) ?? null;
}

// Eskiden /mac/[sayısal-id] idi — indexlenmiş eski linkler kırılmasın diye
// sayısal bir param gelirse kalıcı yönlendirme yapılıyor (kullanıcı isteği,
// 2026-08-24: "sonradan sorun yaşamayalım").
async function resolveParam(slug) {
  if (/^-?\d+$/.test(slug)) {
    let row = null;
    try {
      row = await getFixtureById(Number(slug));
    } catch {
      row = null;
    }
    if (!row) return { row: null };
    return { row, legacyId: true };
  }
  const row = await loadFixtureBySlug(slug);
  return { row };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { row, legacyId } = await resolveParam(slug);
  if (!row || legacyId) return { title: row ? 'Yönlendiriliyor…' : 'Maç Bulunamadı' };

  const chan = channelDisplay(row);
  const dateLabel = istDateLong(row.kickoff_at);
  const timeLabel = istTime(row.kickoff_at);
  const title = `${row.home_team} - ${row.away_team} Maçı Hangi Kanalda? Saat Kaçta?`;
  const description = `${row.home_team} - ${row.away_team} maçı ${dateLabel} günü saat ${timeLabel}'de (TSİ) oynanıyor. Yayın: ${chan}. ${competitionLabel(row.competition_key)} maçının canlı skoru ve detayları.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/mac/${matchSlug(row.home_team, row.away_team, row.kickoff_at)}` },
    openGraph: { title, description },
  };
}

export default async function MatchDetailPage({ params }) {
  const { slug } = await params;
  const { row, legacyId } = await resolveParam(slug);
  if (!row) notFound();
  if (legacyId) redirect(`/mac/${matchSlug(row.home_team, row.away_team, row.kickoff_at)}`);

  const status = matchStatus(row);
  const chan = channelDisplay(row);
  const isLive = status === 'live';
  const isFinished = status === 'finished' || status === 'finished_unknown';
  const showScore = row.home_score != null && row.away_score != null && (isLive || isFinished);

  let lineups = null;
  let stats = null;
  let h2h = [];
  let otherFixtures = [];
  try {
    const { startIso, endIso } = windowIso(0, 7);
    [lineups, stats, h2h, otherFixtures] = await Promise.all([
      getFixtureLineups(row.id),
      getFixtureStats(row.id),
      getHeadToHead(row.home_team, row.away_team),
      getFixturesForCompetition(row.competition_key, { startIso, endIso }),
    ]);
  } catch {
    // Bu ek bölümler opsiyonel — hata olursa maç kartının kendisi yine de gösterilsin.
  }
  const otherLeagueMatches = otherFixtures.filter((r) => r.id !== row.id).slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${row.home_team} - ${row.away_team}`,
    startDate: row.kickoff_at,
    sport: 'Football',
    homeTeam: { '@type': 'SportsTeam', name: row.home_team },
    awayTeam: { '@type': 'SportsTeam', name: row.away_team },
    location: { '@type': 'Place', name: competitionLabel(row.competition_key) },
    ...(row.channel
      ? {
          publication: {
            '@type': 'BroadcastEvent',
            broadcastOfEvent: { '@type': 'SportsEvent', name: `${row.home_team} - ${row.away_team}` },
            videoFormat: 'TV',
            broadcastDisplayName: row.channel,
          },
        }
      : {}),
  };

  const matchUrl = `${SITE_URL}/mac/${matchSlug(row.home_team, row.away_team, row.kickoff_at)}`;
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: competitionLabel(row.competition_key),
        item: `${SITE_URL}/lig/${competitionSlug(row.competition_key)}`,
      },
      { '@type': 'ListItem', position: 3, name: `${row.home_team} - ${row.away_team}`, item: matchUrl },
    ],
  };

  return (
    <>
      <div className="crumb wrap">
        <Link href="/">Ana Sayfa</Link> ›{' '}
        <Link href={`/lig/${competitionSlug(row.competition_key)}`}>{competitionLabel(row.competition_key)}</Link> ›{' '}
        {row.home_team} - {row.away_team}
      </div>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="hero" style={{ paddingBottom: 14 }}>
        <div className="wrap">
          <div className="eyebrow">
            {competitionLabel(row.competition_key)}
            {row.round ? ` · ${row.round}` : ''}
          </div>
          <h1 style={{ fontSize: 34 }}>
            {row.home_team} <em>vs</em> {row.away_team}
          </h1>
        </div>
      </div>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="detail-card">
            <div className="detail-teams">
              <div className="detail-team">
                {row.home_logo ? (
                  <Image src={row.home_logo} alt={row.home_team} width={64} height={64} />
                ) : null}
                <Link href={`/takim/${slugify(row.home_team)}`}>{row.home_team}</Link>
              </div>
              <div className="detail-vs">
                {showScore ? (
                  <>
                    <div className="sc">
                      {row.home_score} - {row.away_score}
                    </div>
                    <div className="lbl">{isLive ? (row.elapsed != null ? `CANLI · ${row.elapsed}'` : 'CANLI') : 'MAÇ SONUCU'}</div>
                  </>
                ) : (
                  <>
                    <div className="time">{istTime(row.kickoff_at)}</div>
                    <div className="lbl">{istDateLong(row.kickoff_at)}</div>
                  </>
                )}
              </div>
              <div className="detail-team">
                {row.away_logo ? (
                  <Image src={row.away_logo} alt={row.away_team} width={64} height={64} />
                ) : null}
                <Link href={`/takim/${slugify(row.away_team)}`}>{row.away_team}</Link>
              </div>
            </div>

            <div className="detail-meta">
              <div className={`meta-pill channel`}>📺 {chan}</div>
              {isLive ? <div className="meta-pill live">● Canlı</div> : null}
              <div className="meta-pill">🗓 {istDateLong(row.kickoff_at)}</div>
              <div className="meta-pill">⏰ Saat {istTime(row.kickoff_at)} (TSİ)</div>
            </div>
          </div>

          <p style={{ marginTop: 22 }}>
            <a href={playStoreUrl('mac_detay')} className="sec-link" target="_blank" rel="noopener noreferrer">
              📲 Canlı skor bildirimi almak için uygulamayı indir →
            </a>
          </p>
        </div>
      </section>

      {lineups ? (
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-title">
                İlk <span>11</span>
              </div>
            </div>
            <Lineups data={lineups} homeTeam={row.home_team} awayTeam={row.away_team} />
          </div>
        </section>
      ) : null}

      {stats ? (
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-title">
                Maç <span>İstatistikleri</span>
              </div>
            </div>
            <MatchStats data={stats} />
          </div>
        </section>
      ) : null}

      {h2h.length > 0 ? (
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-title">
                Geçmiş <span>Karşılaşmalar</span>
              </div>
            </div>
            <HeadToHead matches={h2h} />
          </div>
        </section>
      ) : null}

      {otherLeagueMatches.length > 0 ? (
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <div>
                <div className="sec-title">
                  {competitionLabel(row.competition_key)} <span>Diğer Maçlar</span>
                </div>
              </div>
              <Link className="sec-link" href={`/lig/${competitionSlug(row.competition_key)}`}>
                Tüm fikstür →
              </Link>
            </div>
            <Guide rows={otherLeagueMatches} />
          </div>
        </section>
      ) : null}

      <AppCta campaign="mac_detay_footer" />
    </>
  );
}
