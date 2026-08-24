function PlayerList({ title, players, muted }) {
  if (!players || players.length === 0) return null;
  return (
    <div className="lineup-col">
      {title ? <div className="lineup-col-title">{title}</div> : null}
      {players.map((p, i) => (
        <div className="lineup-player" key={`${p.name}-${i}`} style={muted ? { opacity: 0.6 } : undefined}>
          {p.number != null ? <span className="lineup-num">{p.number}</span> : null}
          <span>{p.name}</span>
        </div>
      ))}
    </div>
  );
}

export default function Lineups({ data, homeTeam, awayTeam }) {
  if (!data) return null;
  const hasXi = data.home_start_xi?.length > 0 || data.away_start_xi?.length > 0;
  if (!hasXi) return null;

  return (
    <div className="lineup-card">
      <div className="lineup-teams-row">
        <div className="lineup-team-head">
          <div className="lineup-team-name">{homeTeam}</div>
          {data.home_formation ? <div className="lineup-formation">{data.home_formation}</div> : null}
        </div>
        <div className="lineup-team-head">
          <div className="lineup-team-name">{awayTeam}</div>
          {data.away_formation ? <div className="lineup-formation">{data.away_formation}</div> : null}
        </div>
      </div>

      <div className="lineup-grid">
        <PlayerList players={data.home_start_xi} />
        <PlayerList players={data.away_start_xi} />
      </div>

      {(data.home_substitutes?.length > 0 || data.away_substitutes?.length > 0) && (
        <>
          <div className="lineup-sub-label">Yedekler</div>
          <div className="lineup-grid">
            <PlayerList players={data.home_substitutes} muted />
            <PlayerList players={data.away_substitutes} muted />
          </div>
        </>
      )}

      {(data.home_coach || data.away_coach) && (
        <div className="lineup-coach-row">
          <div>
            <span className="lineup-coach-label">Teknik Direktör</span> {data.home_coach ?? '—'}
          </div>
          <div>
            <span className="lineup-coach-label">Teknik Direktör</span> {data.away_coach ?? '—'}
          </div>
        </div>
      )}
    </div>
  );
}
