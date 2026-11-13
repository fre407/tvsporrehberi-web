import { notFound, permanentRedirect } from 'next/navigation';
import {
  getFixtureById,
  getFixturesInWindow,
  getFixtureLineups,
  getFixtureLiveEvents,
  getFixtureStats,
  getFixturesForCompetition,
  getHeadToHead,
  getStandings,
  isIndexWorthyMatch,
  broadcastServices,
  broadcasterLabel,
  channelDisplay,
  channelSlug,
  matchStatus,
  teamSlug,
  windowIso,
} from '../../../lib/data';
import { istDateLong, istKeyToUtcRange, istTime, matchSlug, slugify } from '../../../lib/format';
import { competitionLabel, competitionSlug } from '../../../lib/competitions';
import { roundText } from '../../../lib/rounds';
import { keyMatchEvents } from '../../../lib/matchEvents';
import { predictionForMatch, predictionUrl } from '../../../lib/predictions';
import { analysisForMatch, analysisUrl } from '../../../lib/analyses';
import { APP_STORE_URL, SITE_URL, playStoreUrl } from '../../../lib/links';
import Link from 'next/link';
import Image from 'next/image';
import AppCta from '../../../components/AppCta';
import Guide from '../../../components/Guide';
import JsonLd from '../../../components/JsonLd';
import { breadcrumbJsonLd, matchPageJsonLd } from '../../../lib/structuredData';
import Lineups from '../../../components/Lineups';
import MatchStats from '../../../components/MatchStats';
import MatchKeyEvents from '../../../components/MatchKeyEvents';
import HeadToHead from '../../../components/HeadToHead';
import MatchDetailActions from '../../../components/MatchDetailActions';
import DailyShareCard from '../../../components/DailyShareCard';
import FavoriteButton from '../../../components/FavoriteButton';
import MatchComments from '../../../components/MatchComments';
import MatchPrediction from '../../../components/MatchPrediction';

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
  return roundText(round) ?? '';
}

// Sayfadaki gerçek veriden kurulan kısa düz metin özet — sadece tablo/kart
// değil, her maça özgü okunabilir içerik. Lig/takım sayfalarındaki gibi
// dinamik adlara Türkçe ek EKLENMİYOR (ünlü uyumu hatası riski).
function buildMatchSummary({ row, status, chan, homeStanding, awayStanding }) {
  const lines = [];
  const league = competitionLabel(row.competition_key);
  const roundSuffix = row.round ? ` (${roundLabel(row.round)})` : '';
  if (status === 'finished' && row.home_score != null && row.away_score != null) {
    lines.push(`${league}${roundSuffix} karşılaşması sona erdi: ${row.home_team} ${row.home_score} - ${row.away_score} ${row.away_team}.`);
  } else if (status === 'live') {
    lines.push(`${row.home_team} - ${row.away_team} karşılaşması şu anda oynanıyor; skor ve dakika bu sayfada otomatik güncelleniyor.`);
  } else if (status === 'not_happening') {
    lines.push(`${row.home_team} - ${row.away_team} karşılaşması ertelendi veya iptal edildi; yeni tarih açıklanırsa bu sayfa güncellenir.`);
  } else if (status !== 'finished_unknown') {
    lines.push(`${row.home_team} ile ${row.away_team}, ${league}${roundSuffix} kapsamında ${istDateLong(row.kickoff_at)} günü saat ${istTime(row.kickoff_at)} (TSİ) itibarıyla karşı karşıya gelecek.`);
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

// Meta açıklama ve JSON-LD açıklaması aynı metin — maçın durumuna göre
// (bitmiş maça "oynanıyor" yazılmasın). Saatin arkasına Türkçe ek
// eklenmiyor ("20:45'de" gibi ünlü uyumu hataları olmasın).
function matchDescription(row) {
  const status = matchStatus(row);
  const league = competitionLabel(row.competition_key);
  const services = broadcastServices(row);
  const yayin = services.length > 0 ? `Yayın: ${channelDisplay(row)}.` : 'Yayıncı kanal henüz açıklanmadı.';
  const when = `${istDateLong(row.kickoff_at)}, saat ${istTime(row.kickoff_at)} (TSİ)`;
  if (status === 'finished' && row.home_score != null && row.away_score != null) {
    return `${row.home_team} ${row.home_score}-${row.away_score} ${row.away_team}: ${league} maçı ${when} oynandı. ${yayin} Maç sonucu, kadrolar ve istatistikler.`;
  }
  if (status === 'finished_unknown') {
    return `${row.home_team} - ${row.away_team} (${league}) maçı ${when} oynandı. ${yayin} Maç sonucu ve detayları.`;
  }
  if (status === 'live') {
    return `${row.home_team} - ${row.away_team} maçı şu an canlı. ${yayin} ${league} maçının canlı skoru, dakikası ve kadroları.`;
  }
  if (status === 'not_happening') {
    return `${row.home_team} - ${row.away_team} (${league}) maçı ertelendi veya iptal edildi. Asıl tarih: ${when}. Yeni tarih açıklanınca güncellenir.`;
  }
  return `${row.home_team} - ${row.away_team} maçı ${when}. ${yayin} ${league} maçının canlı skoru ve detayları.`;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { row, legacyId } = await resolveParam(slug);
  if (!row || legacyId) return { title: row ? 'Yönlendiriliyor…' : 'Maç Bulunamadı' };

  const title = `${row.home_team} - ${row.away_team} Maçı Hangi Kanalda? Saat Kaçta?`;
  const description = matchDescription(row);
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
  if (legacyId) permanentRedirect(`/mac/${matchSlug(row.home_team, row.away_team, row.kickoff_at)}`);

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
  // Goller + kırmızı kartlar (skor kartında). Maç bitince fixture_stats,
  // canlıyken ya da istatistik henüz yazılmadıysa uygulamanın canlı olay
  // önbelleği; skorla tutmayan liste gösterilmez (lib/matchEvents.js).
  let keyEvents = null;
  if (isLive || isFinished) {
    keyEvents = keyMatchEvents(stats?.events, row.home_score, row.away_score);
    if (!keyEvents) {
      try {
        const live = await getFixtureLiveEvents(row.id);
        keyEvents = keyMatchEvents(live?.events, row.home_score, row.away_score);
      } catch {
        // opsiyonel bölüm
      }
    }
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
  const jsonLd = matchPageJsonLd({
    siteUrl: SITE_URL,
    url: matchUrl,
    name: `${row.home_team} - ${row.away_team} Maçı Hangi Kanalda? Saat Kaçta?`,
    description: matchDescription(row),
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    dateModified: row.updated_at ?? undefined,
  });
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Ana Sayfa', url: SITE_URL },
    { name: competitionLabel(row.competition_key), url: `${SITE_URL}/lig/${competitionSlug(row.competition_key)}` },
    { name: `${row.home_team} - ${row.away_team}`, url: matchUrl },
  ]);

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

            {isLive || isFinished ? (
              <MatchKeyEvents fixtureId={row.id} initialEvents={keyEvents} isLive={isLive} />
            ) : null}

            <div className="detail-meta">
              {broadcastServices(row).length > 0 ? (
                // Kanal adları kanalın yayın akışı sayfasına bağlanır (maç → kanal
                // iç bağlantısı; denetim 2026-11-03).
                broadcastServices(row).map((service) => (
                  <Link key={service} href={`/kanal/${channelSlug(service)}`} className="meta-pill channel">
                    📺 {broadcasterLabel(service)}
                  </Link>
                ))
              ) : (
                <div className={`meta-pill channel`}>📺 {chan}</div>
              )}
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
            📲 Canlı skor bildirimi almak için uygulamayı indir:{' '}
            <a href={playStoreUrl('mac_detay')} className="sec-link" target="_blank" rel="noopener noreferrer">
              Google Play
            </a>{' '}
            ·{' '}
            <a href={APP_STORE_URL} className="sec-link" target="_blank" rel="noopener noreferrer">
              App Store
            </a>
          </p>

          {(() => {
            const article = predictionForMatch(matchSlug(row.home_team, row.away_team, row.kickoff_at));
            if (!article) return null;
            return (
              <Link href={predictionUrl(article)} className="match-pred-link">
                <span className="match-pred-kicker">⚡ İDDİALI TAHMİN</span>
                <b>{article.title}</b>
                <span>Skor tahminim {article.scorePrediction.home}-{article.scorePrediction.away} · ilk yarı, ikinci yarı ve iddaa tercihleri →</span>
              </Link>
            );
          })()}

          {(() => {
            const analysis = analysisForMatch(matchSlug(row.home_team, row.away_team, row.kickoff_at));
            if (!analysis) return null;
            return (
              <Link href={analysisUrl(analysis)} className="match-pred-link">
                <span className="match-pred-kicker">📊 MAÇ SONU ANALİZİ</span>
                <b>{analysis.title}</b>
                <span>Maç sonu analizini oku · kırılma anları ve tahminimizin karnesi →</span>
              </Link>
            );
          })()}

          <MatchPrediction
            matchKey={matchSlug(row.home_team, row.away_team, row.kickoff_at)}
            homeTeam={row.home_team}
            awayTeam={row.away_team}
            isOpen={status === 'upcoming'}
            result={
              status === 'finished' && row.home_score != null && row.away_score != null
                ? row.home_score > row.away_score ? '1' : row.home_score < row.away_score ? '2' : 'X'
                : null
            }
          />

          <MatchComments
            matchKey={matchSlug(row.home_team, row.away_team, row.kickoff_at)}
            title={`${row.home_team} - ${row.away_team}`}
            isLive={isLive}
          />
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
