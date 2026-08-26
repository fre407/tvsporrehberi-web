'use client';

import { useLanguage } from './LanguageProvider';
// Gol Kralı / Asist Kralı — league_stats.top_scorers/top_assists jsonb
// dizileri ({playerId,name,photo,teamName,goals|assists}[]).
function StatList({ title, entries, statKey, statLabel, limit }) {
  if (!entries || entries.length === 0) return null;
  return (
    <div className="stat-list">
      <div className="stat-list-title">{title}</div>
      {entries.slice(0, limit).map((p, i) => (
        <div className="stat-list-row" key={p.playerId ?? `${p.name}-${i}`}>
          <span className="stat-list-rank">{i + 1}</span>
          {p.photo ? (
            <img className="stat-list-photo" src={p.photo} alt={p.name ?? ''} loading="lazy" />
          ) : (
            <span className="stat-list-photo ph" />
          )}
          <span className="stat-list-name">
            {p.name}
            <span className="stat-list-team">{p.teamName}</span>
          </span>
          <span className="stat-list-value">
            {p[statKey]} <small>{statLabel}</small>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function LeagueStats({ data, limit = 10 }) {
  const { locale } = useLanguage();
  if (!data) return null;
  const hasScorers = data.top_scorers?.length > 0;
  const hasAssists = data.top_assists?.length > 0;
  if (!hasScorers && !hasAssists) return null;

  return (
    <div className="stats-grid">
      <StatList title={locale === 'en' ? 'Top Scorers' : 'Gol Kralı'} entries={data.top_scorers} statKey="goals" statLabel={locale === 'en' ? 'goals' : 'gol'} limit={limit} />
      <StatList title={locale === 'en' ? 'Top Assists' : 'Asist Kralı'} entries={data.top_assists} statKey="assists" statLabel={locale === 'en' ? 'assists' : 'asist'} limit={limit} />
    </div>
  );
}
