import { notFound, redirect } from 'next/navigation';
import {
  getFixtureById,
  getFixturesInWindow,
  getFixtureLineups,
  getFixtureStats,
  getFixturesForCompetition,
  getHeadToHead,
  getStandings,
  isIndexWorthyMatch,
  broadcastServices,
  channelDisplay,
  matchStatus,
  teamSlug,
  windowIso,
} from '../../../lib/data';
import { istDateLong, istKeyToUtcRange, istTime, matchSlug, slugify } from '../../../lib/format';
import { competitionLabel, competitionSlug } from '../../../lib/competitions';
import { SITE_URL, playStoreUrl } from '../../../lib/links';
import Link from 'next/link';
import Image from 'next/image';
import AppCta from '../../../components/AppCta';
import Guide from '../../../components/Guide';
import JsonLd from '../../../components/JsonLd';
import Lineups from '../../../components/Lineups';
import MatchStats from '../../../components/MatchStats';
import HeadToHead from '../../../components/HeadToHead';
import MatchDetailActions from '../../../components/MatchDetailActions';
import DailyShareCard from '../../../components/DailyShareCard';
import FavoriteButton from '../../../components/FavoriteButton';

export const revalidate = 30;

const DATE_TAIL_RE = /\d{4}-\d{2}-\d{2}$/;

// Maç bittikten birkaç gün sonra bu sayfanın arama değeri kalmıyor (kimse
// "X-Y maçı hangi kanalda" diye 2 hafta sonra aramaz) — GSC'de 1860 keşfedilen
// sayfadan sadece 2'sinin indekslenmesi (bkz. lib/sitemapXml.js'teki not) ve
// AdSense'in "düşük değere sahip içerik" tespiti, bu tür binlerce neredeyse
// aynı şablonlu eski sayfanın sitenin genel kalite skorunu düşürdüğünü
// gösteriyor. Sayfa yine de erişilebilir kalıyor (link kırılmıyor, kullanıcı
// hâlâ görebiliyor), sadece Google'a "bunu arama sonuçlarında gösterme"
// deniyor — `follow: true` iç linklerin (takım/lig sayfalarına) SEO değeri
// aktarmasını engellemiyor.
const NOINDEX_AFTER_MS = 3 * 24 * 60 * 60 * 1000;

// Aynı gerekçeyle: küçük bir ligin, yayıncısı bilinmeyen maçının "hangi
// kanalda" sayfası soruyu cevaplamıyor — indekslenmesi siteye değer
// katmıyor, kalite skorunu düşürüyor (kural: lib/data.js isIndexWorthyMatch,
// sitemap ile ortak). Yayın bilgisi gelince sayfa kendiliğinden
// indekslenebilir olur.

// Veri sağlayıcısı tur adını İngilizce veriyor ("Regular Season - 9");
// Türkçe sayfada lig haftası olarak gösteriliyor. Diğer tur adları
// (ör. "Round of 16") olduğu gibi kalıyor.
function roundLabel(round) {
  if (!round) return '';
  const week = round.match(/^Regular Season - (\d+)$/);
  return week ? `${week[1]}. Hafta` : round;
}

// Sayfadaki gerçek veriden kurulan kısa düz metin özet — sadece tablo/kart
// değil, her maça özgü okunabilir içerik. Lig/takım sayfalarındaki gibi
// dinamik adlara Türkçe ek EKLENMİYOR (ünlü uyumu hatası riski).
function buildMatchSummary({ row, status, chan, homeStanding, awayStanding }) {
  const lines = [];
  const league = competitionLabel(row.competition_key);
  const roundText = row.round ? ` (${roundLabel(row.round)})` : '';
  if (status === 'finished' && row.home_score != null && row.away_score != null) {
    lines.push(`${league}${roundText} karşılaşması sona erdi: ${row.home_team} ${row.home_score} - ${row.away_score} ${row.away_team}.`);
  } else if (status === 'live') {
    lines.push(`${row.home_team} - ${row.away_team} karşılaşması şu anda oynanıyor; skor ve dakika bu sayfada otomatik güncelleniyor.`);
  } else if (status === 'not_happening') {
    lines.push(`${row.home_team} - ${row.away_team} karşılaşması ertelendi veya iptal edildi; yeni tarih açıklanırsa bu sayfa güncellenir.`);
  } else if (status !== 'finished_unknown') {
    lines.push(`${row.home_team} ile ${row.away_team}, ${league}${roundText} kapsamında ${istDateLong(row.kickoff_at)} günü saat ${istTime(row.kickoff_at)} (TSİ) itibarıyla karşı karşıya gelecek.`);
  }
  if (status !== 'finished' && status !== 'finished_unknown') {
    if (broadcastServices(row).length > 0) {
      lines.push(`Yayın bilgisi: karşılaşma Türkiye'den ${chan} üzerinden canlı izlenebilecek.`);
    } else if (row.confirmed_unavailable) {
      lines.push('Yayın bilgisi: bu karşılaşmanın Türkiye’de canlı yayınlanmayacağı doğrulandı.');
    } else {
      lines.push('Yayın bilgisi: yayıncı kuruluş henüz netleşmedi; bilgi geldiğinde bu sayfa otomatik olarak güncellenir.');
    }
  }
  if (homeStanding && awayStanding) {
    lines.push(`Puan durumu: ${row.home_team} ${homeStanding.rank}. sırada (${homeStanding.points} puan), ${row.away_team} ${awayStanding.rank}. sırada (${awayStanding.points} puan).`);
  }
  return lines;
}

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
  const isStale = Date.now() - new Date(row.kickoff_at).getTime() > NOINDEX_AFTER_MS;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/mac/${matchSlug(row.home_team, row.away_team, row.kickoff_at)}` },
    openGraph: { title, description },
    ...(isStale || !isIndexWorthyMatch(row) ? { robots: { index: false, follow: true } } : {}),
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
  let standings = null;
  try {
    const { startIso, endIso } = windowIso(0, 7);
    [lineups, stats, h2h, otherFixtures, standings] = await Promise.all([
      getFixtureLineups(row.id),
      getFixtureStats(row.id),
      getHeadToHead(row.home_team, row.away_team),
      getFixturesForCompetition(row.competition_key, { startIso, endIso }),
      getStandings(row.competition_key),
    ]);
  } catch {
    // Bu ek bölümler opsiyonel — hata olursa maç kartının kendisi yine de gösterilsin.
  }
  const otherLeagueMatches = otherFixtures.filter((r) => r.id !== row.id).slice(0, 4);

  // Puan durumu verisi ayrı bir kaynaktan (league_standings) geliyor ve
  // isim yazımı fikstür verisiyle birebir aynı olmayabilir — önce tam eşleşme,
  // olmazsa slugify ile gevşek eşleşme deneniyor.
  function findStanding(teamName) {
    const list = standings?.standings;
    if (!Array.isArray(list)) return null;
    return (
      list.find((s) => s.team?.name === teamName) ??
      list.find((s) => teamSlug(s.team?.name) === teamSlug(teamName)) ??
      null
    );
  }
  const homeStanding = findStanding(row.home_team);
  const awayStanding = findStanding(row.away_team);
  const matchUrl = `${SITE_URL}/mac/${matchSlug(row.home_team, row.away_team, row.kickoff_at)}`;
  const summaryLines = buildMatchSummary({ row, status, chan, homeStanding, awayStanding });
  const broadcastServiceList = broadcastServices(row);
  const eventStatus = isFinished
    ? 'https://schema.org/EventCompleted'
    : isLive
      ? 'https://schema.org/EventInProgress'
      : 'https://schema.org/EventScheduled';
  const broadcastEvents = broadcastServiceList.map((service) => ({
    '@type': 'BroadcastEvent',
    broadcastOfEvent: { '@type': 'SportsEvent', name: `${row.home_team} - ${row.away_team}`, url: matchUrl },
    videoFormat: 'TV',
    broadcastDisplayName: service,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${row.home_team} - ${row.away_team}`,
    url: matchUrl,
    startDate: row.kickoff_at,
    dateModified: row.updated_at ?? row.kickoff_at,
    eventStatus,
    sport: 'Football',
    homeTeam: { '@type': 'SportsTeam', name: row.home_team },
    awayTeam: { '@type': 'SportsTeam', name: row.away_team },
    image: [row.home_logo, row.away_logo].filter(Boolean),
    location: { '@type': 'Place', name: competitionLabel(row.competition_key) },
    organizer: { '@type': 'SportsOrganization', name: competitionLabel(row.competition_key) },
    ...(broadcastEvents.length ? { publication: broadcastEvents } : {}),
  };

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

      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbLd} />

      <div className="hero" style={{ paddingBottom: 14 }}>
        <div className="wrap">
          <div className="eyebrow">
            {competitionLabel(row.competition_key)}
            {row.round ? ` · ${roundLabel(row.round)}` : ''}
          </div>
          <h1 style={{ fontSize: 30 }}>
            {row.home_team} - {row.away_team} <em>maçı hangi kanalda, saat kaçta?</em>
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
                ) : <span className="detail-crest-fallback">⚽</span>}
                <div className="detail-team-name">
                  <Link href={`/takim/${slugify(row.home_team)}`}>{row.home_team}</Link>
                  <FavoriteButton favoriteId={`team:${slugify(row.home_team)}`} label={row.home_team} />
                </div>
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
                ) : <span className="detail-crest-fallback">⚽</span>}
                <div className="detail-team-name">
                  <Link href={`/takim/${slugify(row.away_team)}`}>{row.away_team}</Link>
                  <FavoriteButton favoriteId={`team:${slugify(row.away_team)}`} label={row.away_team} />
                </div>
              </div>
            </div>

            <div className="detail-meta">
              <div className={`meta-pill channel`}>📺 {chan}</div>
              {isLive ? <div className="meta-pill live">● Canlı</div> : null}
              <div className="meta-pill">🗓 {istDateLong(row.kickoff_at)}</div>
              <div className="meta-pill">⏰ Saat {istTime(row.kickoff_at)} (TSİ)</div>
              {homeStanding ? (
                <div className="meta-pill">
                  📊 {row.home_team}: {homeStanding.rank}. sıra, {homeStanding.points} puan
                </div>
              ) : null}
              {awayStanding ? (
                <div className="meta-pill">
                  📊 {row.away_team}: {awayStanding.rank}. sıra, {awayStanding.points} puan
                </div>
              ) : null}
            </div>
            <MatchDetailActions
              shareUrl={matchUrl}
              shareText={`${row.home_team} - ${row.away_team} | ${istTime(row.kickoff_at)} (TSİ) | ${chan}`}
            />
            <DailyShareCard match={{ homeTeam: row.home_team, awayTeam: row.away_team, homeLogo: row.home_logo, awayLogo: row.away_logo, time: istTime(row.kickoff_at), channel: chan }} />
          </div>

          {summaryLines.length > 0 ? (
            <div className="match-summary">
              {summaryLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ) : null}

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
