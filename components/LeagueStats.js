// Gol Kralı / Asist Kralı — league_stats.top_scorers/top_assists jsonb
// dizileri ({playerId,name,photo,teamName,goals|assists}[]).
function StatList({ title, entries, statKey, statLabel }) {
  if (!entries || entries.length === 0) return null;
  return (
    <div className="stat-list">
      <div className="stat-list-title">{title}</div>
      {entries.slice(0, 10).map((p, i) => (
        <div className="stat-list-row" key={p.playerId ?? `${p.name}-${i}`}>
          <span className="stat-list-rank">{i + 1}</span>
          {p.photo ? <img className="stat-list-photo" src={p.photo} alt="" loading="lazy" /> : <span className="stat-list-photo ph" />}
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

export default function LeagueStats({ data }) {
  if (!data) return null;
  const hasScorers = data.top_scorers?.length > 0;
  const hasAssists = data.top_assists?.length > 0;
  if (!hasScorers && !hasAssists) return null;

  return (
    <div className="stats-grid">
      <StatList title="Gol Kralı" entries={data.top_scorers} statKey="goals" statLabel="gol" />
      <StatList title="Asist Kralı" entries={data.top_assists} statKey="assists" statLabel="asist" />
    </div>
  );
}
