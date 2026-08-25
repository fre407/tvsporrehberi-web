'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { broadcastServices, channelDisplay, matchStatus } from '../lib/data';
import { istTime, matchSlug, slugify } from '../lib/format';
import { competitionFlag, competitionLabel, competitionPriority, competitionSlug } from '../lib/competitions';
import FavoriteButton, { getFavoriteIds } from './FavoriteButton';

const FILTER_STORAGE_KEY = 'tvsporrehberi:match-filter';

function MatchRow({ row, isExpanded, onToggle }) {
  const status = matchStatus(row);
  const chan = channelDisplay(row);
  const services = broadcastServices(row);
  const isLive = status === 'live';
  const isPending = chan === 'Türkiye yayın bilgisi henüz bulunamadı';

  return (
    <div className={`match-row-shell${isExpanded ? ' is-expanded' : ''}`} onClick={onToggle}>
      <div className="match-row">
      <Link href={`/mac/${matchSlug(row.home_team, row.away_team, row.kickoff_at)}`} className="mr-match-link" onClick={(event) => event.preventDefault()}>
        <div className={`mr-time${isLive ? ' live' : ''}`}>
          {isLive ? (
            <>
              {row.elapsed != null ? `${row.elapsed}'` : 'CANLI'}
              <small>CANLI</small>
            </>
          ) : (
            istTime(row.kickoff_at)
          )}
        </div>
        <div className="mr-teams">
          <div className="mr-team">
            {row.home_logo ? (
              <img className="crest" src={row.home_logo} alt={row.home_team} loading="lazy" />
            ) : (
              <span className="crest crest-fallback">⚽</span>
            )}
            <span className="nm">{row.home_team}</span>
            <FavoriteButton favoriteId={`team:${slugify(row.home_team)}`} label={row.home_team} compact />
            {row.home_score != null && status !== 'upcoming' ? <span className="sc">{row.home_score}</span> : null}
          </div>
          <div className="mr-team">
            {row.away_logo ? (
              <img className="crest" src={row.away_logo} alt={row.away_team} loading="lazy" />
            ) : (
              <span className="crest crest-fallback">⚽</span>
            )}
            <span className="nm">{row.away_team}</span>
            <FavoriteButton favoriteId={`team:${slugify(row.away_team)}`} label={row.away_team} compact />
            {row.away_score != null && status !== 'upcoming' ? <span className="sc">{row.away_score}</span> : null}
          </div>
        </div>
      </Link>
      <div className="mr-channel-wrap">
        <div className={`mr-channel-pills${isPending ? ' pending' : ''}`}>
          {isPending ? (
            <div className="mr-chan pending"><span>{chan}</span><small>Yayın bilgisi bekleniyor</small></div>
          ) : (
            <>
              {services.map((service) => (
                <div className="mr-chan" key={service} title={service}>
                  <span>{service}</span>
                  <FavoriteButton favoriteId={`channel:${slugify(service)}`} label={service} compact />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      </div>
      {isExpanded ? (
        <div className="match-expanded">
          <div className="match-expanded-team">
            {row.home_logo ? <img src={row.home_logo} alt="" /> : null}
            <strong>{row.home_team}</strong>
          </div>
          <div className="match-expanded-center">
            <span>{isLive ? (row.elapsed != null ? `${row.elapsed}' · CANLI` : 'CANLI') : istTime(row.kickoff_at)}</span>
            <small>{competitionLabel(row.competition_key)}</small>
          </div>
          <div className="match-expanded-team away">
            {row.away_logo ? <img src={row.away_logo} alt="" /> : null}
            <strong>{row.away_team}</strong>
          </div>
          <Link href={`/mac/${matchSlug(row.home_team, row.away_team, row.kickoff_at)}`} className="match-expanded-link" onClick={(event) => event.stopPropagation()}>Maç detayına git →</Link>
        </div>
      ) : null}
    </div>
  );
}

// Fikstürleri lig önceliğine göre grupla ve TV rehberi formatında render et.
export default function Guide({ rows }) {
  const router = useRouter();
  const [collapsedLeagues, setCollapsedLeagues] = useState(() => new Set());
  const [activeFilter, setActiveFilter] = useState('all');
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  useEffect(() => {
    const sync = () => setFavoriteIds(getFavoriteIds());
    sync();
    window.addEventListener('tvsporrehberi:favorites', sync);
    return () => window.removeEventListener('tvsporrehberi:favorites', sync);
  }, []);

  // Ana sayfa ve gün programı açık bırakıldığında canlı satırlar da taze
  // kalsın. Yalnızca canlı maç varken ve sekme görünürken yeniliyoruz;
  // /canli sayfasının 25 sn'lik özel poll mekanizmasına dokunmuyoruz.
  useEffect(() => {
    if (!rows?.some((row) => matchStatus(row) === 'live')) return undefined;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh();
    }, 60000);
    return () => clearInterval(timer);
  }, [rows, router]);

  useEffect(() => {
    const savedFilter = window.localStorage.getItem(FILTER_STORAGE_KEY);
    if (savedFilter) setActiveFilter(savedFilter);
  }, []);

  function chooseFilter(value) {
    setActiveFilter(value);
    window.localStorage.setItem(FILTER_STORAGE_KEY, value);
  }

  if (!rows || rows.length === 0) {
    return <div className="guide empty-note">Bu aralıkta listelenecek maç bulunamadı.</div>;
  }

  const visibleRows = rows.filter((row) => {
    if (activeFilter === 'favorites') return favoriteIds.has(`league:${row.competition_key}`) || favoriteIds.has(`team:${slugify(row.home_team)}`) || favoriteIds.has(`team:${slugify(row.away_team)}`) || broadcastServices(row).some((service) => favoriteIds.has(`channel:${slugify(service)}`));
    if (activeFilter === 'live') return matchStatus(row) === 'live';
    if (activeFilter === 'broadcast') return Boolean(row.channel || row.channel2 || row.platform);
    return activeFilter === 'all' || row.competition_key === activeFilter;
  });
  const byCompetition = new Map();
  for (const row of visibleRows) {
    const list = byCompetition.get(row.competition_key);
    if (list) list.push(row);
    else byCompetition.set(row.competition_key, [row]);
  }

  const groups = Array.from(byCompetition.entries()).sort(
    (a, b) => competitionPriority(a[0]) - competitionPriority(b[0])
  );

  function toggleLeague(key) {
    setCollapsedLeagues((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <>
      <div className="guide-filter-bar">
        {[
          ['all', 'Tümü'], ['live', '● Canlı'], ['broadcast', 'Türkiye’de yayınlanan'],
          ['super_lig', 'Süper Lig'], ['turkiye_kupasi', 'Türkiye Kupası'], ['sampiyonlar_ligi', 'Şampiyonlar Ligi'], ['favorites', '★ Takip ettiklerim'],
        ].map(([value, label]) => (
          <button key={value} type="button" className={`guide-filter${activeFilter === value ? ' active' : ''}`} onClick={() => chooseFilter(value)} aria-pressed={activeFilter === value}>{label}</button>
        ))}
      </div>
      {groups.length === 0 ? <div className="guide empty-note">Takip ettiğin lig için bu aralıkta maç bulunamadı.</div> : <div className="guide">
      {groups.map(([key, matches]) => {
        const isCollapsed = collapsedLeagues.has(key);
        const label = competitionLabel(key);
        return (
        <div key={key}>
          <div className="league-row">
            <span>{competitionFlag(key)}</span>
            <Link href={`/lig/${competitionSlug(key)}`}>{label}</Link>
            <FavoriteButton favoriteId={`league:${key}`} label={label} compact />
            <button
              type="button"
              className={`league-toggle${isCollapsed ? ' is-collapsed' : ''}`}
              onClick={() => toggleLeague(key)}
              aria-expanded={!isCollapsed}
              aria-label={`${label} maçlarını ${isCollapsed ? 'aç' : 'kapat'}`}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="m3 6 5 5 5-5" />
              </svg>
            </button>
          </div>
          {!isCollapsed && matches.map((row) => (
              <MatchRow key={row.id} row={row} isExpanded={expandedMatchId === row.id} onToggle={() => setExpandedMatchId((current) => current === row.id ? null : row.id)} />
            ))}
        </div>
        );
      })}
      </div>}
    </>
  );
}
