import { NextResponse } from 'next/server';
import { getFixtureById, getFixtureLiveEvents, getFixtureStats, matchStatus } from '../../../lib/data';
import { keyMatchEvents } from '../../../lib/matchEvents';

// Maç sayfasındaki goller/kırmızı kartlar listesinin canlı yenilemesi
// (components/MatchKeyEvents.js). Yalnızca Supabase tablolarını okur.
export async function GET(request) {
  const fixtureId = Number(new URL(request.url).searchParams.get('fixture'));
  if (!Number.isInteger(fixtureId) || fixtureId <= 0) {
    return NextResponse.json({ status: null, events: null }, { status: 400 });
  }
  try {
    const row = await getFixtureById(fixtureId);
    if (!row) return NextResponse.json({ status: null, events: null }, { status: 404 });
    const status = matchStatus(row);
    let events = null;
    if (status === 'live' || status === 'finished' || status === 'finished_unknown') {
      const [stats, live] = await Promise.all([
        status === 'live' ? null : getFixtureStats(fixtureId),
        getFixtureLiveEvents(fixtureId),
      ]);
      events =
        keyMatchEvents(stats?.events, row.home_score, row.away_score) ??
        keyMatchEvents(live?.events, row.home_score, row.away_score);
    }
    return NextResponse.json(
      { status, events },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ status: null, events: null }, { status: 200 });
  }
}
