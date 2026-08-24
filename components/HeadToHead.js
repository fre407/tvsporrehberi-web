import Link from 'next/link';
import { istDateShort, matchSlug } from '../lib/format';
import { competitionShort } from '../lib/competitions';

export default function HeadToHead({ matches }) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="h2h-card">
      {matches.map((m) => (
        <Link
          key={m.id}
          href={`/mac/${matchSlug(m.home_team, m.away_team, m.kickoff_at)}`}
          className="h2h-row"
        >
          <span className="h2h-date">{istDateShort(m.kickoff_at)}</span>
          <span className="h2h-teams">
            {m.home_team} <b>{m.home_score}-{m.away_score}</b> {m.away_team}
          </span>
          <span className="h2h-comp">{competitionShort(m.competition_key)}</span>
        </Link>
      ))}
    </div>
  );
}
