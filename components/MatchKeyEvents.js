'use client';

import { useEffect, useState } from 'react';

const POLL_MS = 30000;

const ICON = { goal: '⚽', penalty: '⚽', own_goal: '⚽', red: '🟥' };
const NOTE = { penalty: ' (P)', own_goal: ' (K.K.)' };

// Maç kartında skorun altındaki goller + kırmızı kartlar. İlk liste sunucuda
// gelir; maç canlıyken /api/live-events'ten tazelenir, maç bitince durur.
// Liste skorla tutmuyorsa (bkz. lib/matchEvents.js) hiçbir şey çizilmez.
export default function MatchKeyEvents({ fixtureId, initialEvents, isLive }) {
  const [events, setEvents] = useState(initialEvents);
  const [live, setLive] = useState(isLive);

  useEffect(() => {
    if (!live) return undefined;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/live-events?fixture=${fixtureId}`, { cache: 'no-store' });
        const json = await res.json();
        if (json.status == null) return;
        setEvents(json.events);
        if (json.status !== 'live') setLive(false);
      } catch {
        // Bir sonraki tick'te tekrar denenir.
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [fixtureId, live]);

  if (!Array.isArray(events) || events.length === 0) return null;

  return (
    <div className="match-key-events" aria-label="Goller ve kırmızı kartlar">
      {events.map((ev, i) => (
        <div className={`event-row event-row-${ev.team}`} key={`${ev.type}-${ev.minute}-${i}`}>
          <div className="event-content">
            <span className="event-icon">{ICON[ev.type]}</span>
            <span className="event-text">
              {ev.player ?? (ev.type === 'red' ? 'Kırmızı kart' : 'Gol')}
              {NOTE[ev.type] ?? ''}
            </span>
            {ev.minute != null ? (
              <span className="event-minute">{`${ev.minute}${ev.extra ? `+${ev.extra}` : ''}'`}</span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
