// Puan Durumu tablosu — league_standings.standings jsonb dizisini render eder
// (rank, team{name,logo}, points, goalsDiff, all{played,win,draw,lose}).
export default function Standings({ data }) {
  if (!data || !Array.isArray(data.standings) || data.standings.length === 0) return null;

  return (
    <div className="standings-wrap">
      <table className="standings-table">
        <thead>
          <tr>
            <th className="n">#</th>
            <th>Takım</th>
            <th className="n">O</th>
            <th className="n">G</th>
            <th className="n">B</th>
            <th className="n">M</th>
            <th className="n">AV</th>
            <th className="n pts">P</th>
          </tr>
        </thead>
        <tbody>
          {data.standings.map((row) => (
            <tr key={row.rank ?? row.team?.name}>
              <td className="n pos">{row.rank ?? '-'}</td>
              <td className="team-cell">
                {row.team?.logo ? <img src={row.team.logo} alt="" loading="lazy" /> : <span className="crest-ph" />}
                <span>{row.team?.name ?? '-'}</span>
              </td>
              <td className="n">{row.all?.played ?? '-'}</td>
              <td className="n">{row.all?.win ?? '-'}</td>
              <td className="n">{row.all?.draw ?? '-'}</td>
              <td className="n">{row.all?.lose ?? '-'}</td>
              <td className="n">{row.goalsDiff != null ? (row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff) : '-'}</td>
              <td className="n pts">{row.points ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
