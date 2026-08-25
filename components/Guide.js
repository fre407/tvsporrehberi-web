'use client';

import Link from 'next/link';
import { useState } from 'react';
import { channelDisplay, matchStatus } from '../lib/data';
import { istTime, matchSlug } from '../lib/format';
import { competitionFlag, competitionLabel, competitionPriority, competitionSlug } from '../lib/competitions';

function MatchRow({ row }) {
  const status = matchStatus(row);
  const chan = channelDisplay(row);
  const isLive = status === 'live';
  const isPending = chan === 'Türkiye yayın bilgisi henüz bulunamadı';

  return (
    <Link href={`/mac/${matchSlug(row.home_team, row.away_team, row.kickoff_at)}`} className="mr-row-link">
      <div className="match-row">
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
              <span className="crest" />
            )}
            <span className="nm">{row.home_team}</span>
            {row.home_score != null && status !== 'upcoming' ? <span className="sc">{row.home_score}</span> : null}
          </div>
          <div className="mr-team">
            {row.away_logo ? (
              <img className="crest" src={row.away_logo} alt={row.away_team} loading="lazy" />
            ) : (
              <span className="crest" />
            )}
            <span className="nm">{row.away_team}</span>
            {row.away_score != null && status !== 'upcoming' ? <span className="sc">{row.away_score}</span> : null}
          </div>
        </div>
        <div className={`mr-chan${isPending ? ' pending' : ''}`}>{chan}</div>
      </div>
    </Link>
  );
}

// Fikstürleri lig önceliğine göre grupla ve TV rehberi formatında render et.
export default function Guide({ rows }) {
  const [collapsedLeagues, setCollapsedLeagues] = useState(() => new Set());

  if (!rows || rows.length === 0) {
    return <div className="guide empty-note">Bu aralıkta listelenecek maç bulunamadı.</div>;
  }

  const byCompetition = new Map();
  for (const row of rows) {
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
    <div className="guide">
      {groups.map(([key, matches]) => {
        const isCollapsed = collapsedLeagues.has(key);
        const label = competitionLabel(key);
        return (
        <div key={key}>
          <div className="league-row">
            <span>{competitionFlag(key)}</span>
            <Link href={`/lig/${competitionSlug(key)}`}>{label}</Link>
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
              <MatchRow key={row.id} row={row} />
            ))}
        </div>
        );
      })}
    </div>
  );
}
