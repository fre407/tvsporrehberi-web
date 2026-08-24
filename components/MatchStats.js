const STAT_ROWS = [
  { key: 'possession', label: 'Topla Oynama', suffix: '%' },
  { key: 'shotsTotal', label: 'Şut' },
  { key: 'shotsOnGoal', label: 'İsabetli Şut' },
  { key: 'corners', label: 'Korner' },
  { key: 'offsides', label: 'Ofsayt' },
  { key: 'yellowCards', label: 'Sarı Kart' },
  { key: 'redCards', label: 'Kırmızı Kart' },
  { key: 'goalkeeperSaves', label: 'Kaleci Kurtarışı' },
  { key: 'xg', label: 'Gol Beklentisi (xG)' },
];

function StatBar({ label, home, away, suffix }) {
  if (home == null && away == null) return null;
  const h = Number(home) || 0;
  const a = Number(away) || 0;
  const total = h + a || 1;
  const hPct = (h / total) * 100;
  return (
    <div className="stat-row">
      <div className="stat-row-values">
        <span>{home ?? '-'}{suffix ?? ''}</span>
        <span className="stat-row-label">{label}</span>
        <span>{away ?? '-'}{suffix ?? ''}</span>
      </div>
      <div className="stat-row-bar">
        <div className="stat-row-bar-home" style={{ width: `${hPct}%` }} />
        <div className="stat-row-bar-away" style={{ width: `${100 - hPct}%` }} />
      </div>
    </div>
  );
}

const EVENT_ICON = { goal: '⚽', own_goal: '⚽', card: '🟨', subst: '🔄' };

function EventRow({ ev }) {
  const minuteLabel = `${ev.minute}${ev.extra ? `+${ev.extra}` : ''}'`;
  let text = ev.player ?? '';
  if (ev.type === 'goal' && ev.assist) text += ` (Asist: ${ev.assist})`;
  if (ev.type === 'subst') text = `${ev.playerOut ?? ''} ➜ ${ev.playerIn ?? ''}`;
  if (ev.type === 'card') text = `${ev.player ?? ''}${ev.cardType ? ` (${ev.cardType})` : ''}`;

  return (
    <div className={`event-row event-row-${ev.team}`}>
      {ev.team === 'away' ? <span className="event-spacer" /> : null}
      <div className="event-content">
        <span className="event-icon">{ev.type === 'card' && ev.cardType === 'red' ? '🟥' : EVENT_ICON[ev.type] ?? '•'}</span>
        <span className="event-text">{text}</span>
        <span className="event-minute">{minuteLabel}</span>
      </div>
      {ev.team === 'home' ? <span className="event-spacer" /> : null}
    </div>
  );
}

export default function MatchStats({ data }) {
  if (!data) return null;
  const home = data.home_stats ?? {};
  const away = data.away_stats ?? {};
  const events = data.events ?? [];
  const hasStats = STAT_ROWS.some((r) => home[r.key] != null || away[r.key] != null);
  if (!hasStats && events.length === 0) return null;

  return (
    <div className="match-stats-card">
      {events.length > 0 ? (
        <div className="event-timeline">
          {events.map((ev, i) => (
            <EventRow ev={ev} key={i} />
          ))}
        </div>
      ) : null}

      {hasStats ? (
        <div className="stat-rows">
          {STAT_ROWS.map((r) => (
            <StatBar key={r.key} label={r.label} home={home[r.key]} away={away[r.key]} suffix={r.suffix} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
