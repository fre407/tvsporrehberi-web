import Link from 'next/link';
import { channelDisplay } from '../lib/data';
import { matchSlug } from '../lib/format';

export default function LiveNowStrip({ rows }) {
  if (!rows?.length) return null;
  return (
    <div className="live-now-strip">
      <div className="wrap live-now-inner">
        <span className="live-now-label">● ŞU AN CANLI</span>
        {rows.slice(0, 3).map((row) => (
          <Link key={row.id} href={`/mac/${matchSlug(row.home_team, row.away_team, row.kickoff_at)}`}>
            {row.elapsed != null ? `${row.elapsed}'` : 'CANLI'} · {row.home_team} {row.home_score ?? '-'}–{row.away_score ?? '-'} {row.away_team}
            <small>{channelDisplay(row)}</small>
          </Link>
        ))}
        <Link className="live-now-all" href="/canli">Tüm canlılar →</Link>
      </div>
    </div>
  );
}
