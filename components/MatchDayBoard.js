import Link from 'next/link';
import { broadcasterLabel, broadcastServices, channelDisplay, isForeignBroadcaster, matchStatus, topBroadcasters } from '../lib/data';
import { competitionLabel, competitionPriority, competitionShort, competitionSlug } from '../lib/competitions';
import { dateKeyOffset, istDateKey, istTime, matchSlug } from '../lib/format';

// Ana sayfa "maç günü panosu" (kullanıcı kararı 2026-11-01: düzen 2 + 6).
// Günün maçı büyük kartta, yanında canlı skorlar ve küçük özet kutuları.
// Hepsi gerçek fikstür verisinden; veri yoksa ilgili kutu sessizce düşer.
// Eski düzene dönüş: lib/siteConfig.js HOME_LAYOUT = 'klasik'.

function matchHref(row) {
  return `/mac/${matchSlug(row.home_team, row.away_team, row.kickoff_at)}`;
}

function countdownText(row, locale) {
  const minutes = Math.round((new Date(row.kickoff_at).getTime() - Date.now()) / 60000);
  if (minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (locale === 'en') return h > 0 ? `${h} h ${m} min` : `${m} min`;
  return h > 0 ? `${h} sa ${m} dk` : `${m} dk`;
}

// Dar kutular için kısa kanal metni: önce Türk yayıncılar, en fazla iki tane.
function shortChannel(row, locale) {
  const services = broadcastServices(row);
  if (services.length === 0) return channelDisplay(row, locale);
  const turkish = services.filter((name) => !isForeignBroadcaster(name));
  const list = turkish.length > 0 ? turkish : services.map((name) => broadcasterLabel(name, locale));
  return list.slice(0, 2).join(' / ');
}

function Crest({ src, name }) {
  if (src) return <img className="board-crest" src={src} alt="" width="72" height="72" loading="lazy" />;
  return <span className="board-crest board-crest-fallback" aria-hidden="true">{name.slice(0, 2).toLocaleUpperCase('tr')}</span>;
}

function FeaturedCard({ row, locale }) {
  const status = matchStatus(row);
  const isLive = status === 'live';
  const isFinished = status === 'finished' || status === 'finished_unknown';
  const isToday = istDateKey(row.kickoff_at) === dateKeyOffset(0);
  const countdown = !isLive && !isFinished ? countdownText(row, locale) : null;
  const en = locale === 'en';
  return (
    <div className="board-featured">
      <div className="board-featured-top">
        <span className="board-featured-badge">{en ? 'MATCH OF THE DAY' : 'GÜNÜN MAÇI'}</span>
        <Link href={`/lig/${competitionSlug(row.competition_key)}`}>{competitionLabel(row.competition_key, locale)}</Link>
      </div>
      <div className="board-featured-teams">
        <div className="board-team">
          <Crest src={row.home_logo} name={row.home_team} />
          <span>{row.home_team}</span>
        </div>
        <div className="board-featured-center">
          {isLive ? (
            <>
              <strong>{row.home_score ?? 0} – {row.away_score ?? 0}</strong>
              <span className="board-live">● {row.elapsed != null ? `${row.elapsed}'` : (en ? 'LIVE' : 'CANLI')}</span>
            </>
          ) : isFinished && row.home_score != null ? (
            <>
              <strong>{row.home_score} – {row.away_score}</strong>
              <span>{en ? 'Full time' : 'Maç sonu'}</span>
            </>
          ) : (
            <>
              <strong>{istTime(row.kickoff_at)}</strong>
              <span>{isToday ? 'TSİ' : `${en ? 'Tomorrow' : 'Yarın'} · TSİ`}</span>
            </>
          )}
        </div>
        <div className="board-team">
          <Crest src={row.away_logo} name={row.away_team} />
          <span>{row.away_team}</span>
        </div>
      </div>
      <div className="board-featured-bottom">
        <div className="board-featured-info">
          <span>{en ? 'Channel' : 'Kanal'}</span>
          <b>{channelDisplay(row, locale)}</b>
          {countdown ? (
            <>
              <span className="board-featured-sep">{en ? 'Kick-off in' : 'Başlamasına'}</span>
              <b className="board-accent">{countdown}</b>
            </>
          ) : null}
        </div>
        <Link className="board-featured-cta" href={matchHref(row)}>{en ? 'Match details' : 'Maç detayı'}</Link>
      </div>
    </div>
  );
}

function ListRow({ row, locale }) {
  const isLive = matchStatus(row) === 'live';
  return (
    <Link className="board-list-row" href={matchHref(row)}>
      <b className={isLive ? 'board-list-min live' : 'board-list-min'}>
        {isLive ? (row.elapsed != null ? `${row.elapsed}'` : '●') : istTime(row.kickoff_at)}
      </b>
      <span className="board-list-teams">
        {row.home_team}{' '}
        {isLive ? <b>{row.home_score ?? 0} – {row.away_score ?? 0}</b> : '–'}{' '}
        {row.away_team}
      </span>
      <span className="board-list-chan">{shortChannel(row, locale)}</span>
    </Link>
  );
}

export default function MatchDayBoard({ rows, featured, liveRows, locale = 'tr' }) {
  const en = locale === 'en';
  // Gece geç saatte bugünün maçları bitmiş olur; o zaman özet kutuları
  // yarının programını gösterir (rows zaten "şimdiden itibaren 24 saat").
  const todayKey = dateKeyOffset(0);
  const todayOnly = rows.filter((r) => istDateKey(r.kickoff_at) === todayKey);
  const showTomorrow = todayOnly.length === 0;
  const dayKey = showTomorrow ? dateKeyOffset(1) : todayKey;
  const todayRows = showTomorrow ? rows.filter((r) => istDateKey(r.kickoff_at) === dayKey) : todayOnly;
  const dayLabel = showTomorrow ? (en ? 'Tomorrow' : 'Yarın') : (en ? 'Today' : 'Bugün');
  const channelCount = new Set(todayRows.flatMap((r) => broadcastServices(r).filter((name) => !isForeignBroadcaster(name)))).size;
  const upcoming = rows
    .filter((r) => matchStatus(r) === 'upcoming' && r.id !== featured?.id)
    .sort((a, b) => new Date(a.kickoff_at) - new Date(b.kickoff_at));
  const hasLive = liveRows.length > 0;
  const sideRows = hasLive ? liveRows.slice(0, 3) : upcoming.slice(0, 3);

  // Bugün en çok maçı olan, öncelikli üç turnuva — her biri o turnuvanın
  // bugünkü yayıncılarıyla (yalnızca Türkiye'deki yayıncılar sayılır).
  const byCompetition = new Map();
  for (const r of todayRows) {
    const list = byCompetition.get(r.competition_key);
    if (list) list.push(r);
    else byCompetition.set(r.competition_key, [r]);
  }
  const leagueTiles = Array.from(byCompetition.entries())
    .sort((a, b) => competitionPriority(a[0]) - competitionPriority(b[0]) || b[1].length - a[1].length)
    .slice(0, 3);

  return (
    <div className="match-board">
      {featured ? <FeaturedCard row={featured} locale={locale} /> : null}

      <div className="board-card board-side">
        <div className="board-side-head">
          <b>{hasLive ? <><span className="board-live-dot">●</span> {en ? 'Live now' : 'Şu an canlı'}</> : (en ? 'Up next' : 'Sıradaki maçlar')}</b>
          <Link href={hasLive ? '/canli' : '/bugun'}>{hasLive ? `${en ? 'All' : 'Tümü'} (${liveRows.length})` : (en ? 'Full schedule' : 'Tüm program')}</Link>
        </div>
        {sideRows.length > 0 ? (
          sideRows.map((row) => <ListRow key={row.id} row={row} locale={locale} />)
        ) : (
          <p className="board-empty">{en ? 'No more matches today.' : 'Bugün başka maç yok.'}</p>
        )}
      </div>

      <Link className="board-tile board-tile-accent" href={showTomorrow ? `/gun/${dayKey}` : '/bugun'}>
        <span>{dayLabel}</span>
        <div><b>{todayRows.length}</b> {en ? `matches · ${channelCount} channels` : `maç · ${channelCount} kanal`}</div>
      </Link>
      <Link className="board-tile" href="/canli">
        <span>{en ? 'Live scores' : 'Canlı skorlar'}</span>
        <div><b>{liveRows.length}</b> {en ? 'live now' : 'maç şu an canlı'}</div>
      </Link>

      {leagueTiles.map(([key, list]) => {
        const names = topBroadcasters(list, 2).map((b) => b.name).join(', ');
        return (
          <Link className="board-tile board-tile-league" key={key} href={`/lig/${competitionSlug(key)}`}>
            <span>{competitionShort(key, locale)}</span>
            <b>{en ? `${list.length} ${showTomorrow ? 'tomorrow' : 'today'}` : `${dayLabel} ${list.length} maç`}</b>
            <small>{names || (en ? 'Broadcaster pending' : 'Yayın bilgisi bekleniyor')}</small>
          </Link>
        );
      })}
      <Link className="board-tile board-tile-dark" href="/yayin-haklari">
        <span>{en ? 'Guide' : 'Rehber'}</span>
        <b>{en ? 'Which league on which channel?' : 'Hangi lig hangi kanalda?'} <em>→</em></b>
      </Link>
    </div>
  );
}
