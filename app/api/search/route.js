import { NextResponse } from 'next/server';
import { searchUpcomingFixtures } from '../../../lib/data';
import { istTime, matchSlug, slugify } from '../../../lib/format';
import { COMPETITIONS, competitionSlug } from '../../../lib/competitions';

// Arama kutusu için tek uç nokta — istemci debounce yaptığı için
// (bkz. components/SearchBox.js) tuş başına değil, kullanıcı yazmayı
// bıraktıktan ~300ms sonra ve en az 2 karakterde çağrılıyor.
export async function GET(request) {
  const q = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ teams: [], leagues: [], matches: [] });
  }

  const normalized = q.toLocaleLowerCase('tr');

  const leagues = Object.entries(COMPETITIONS)
    .filter(([, v]) => v.label.toLocaleLowerCase('tr').includes(normalized) || v.short.toLocaleLowerCase('tr').includes(normalized))
    .slice(0, 5)
    .map(([key, v]) => ({ key, label: v.label, href: `/lig/${competitionSlug(key)}` }));

  let matches = [];
  try {
    matches = await searchUpcomingFixtures(q, 8);
  } catch {
    matches = [];
  }

  const teamSlugs = new Map();
  for (const m of matches) {
    for (const name of [m.home_team, m.away_team]) {
      if (name.toLocaleLowerCase('tr').includes(normalized)) {
        const slug = slugify(name);
        if (!teamSlugs.has(slug)) teamSlugs.set(slug, name);
      }
    }
  }

  return NextResponse.json({
    teams: Array.from(teamSlugs, ([slug, name]) => ({ name, href: `/takim/${slug}` })).slice(0, 5),
    leagues,
    matches: matches.slice(0, 6).map((m) => ({
      label: `${m.home_team} - ${m.away_team}`,
      time: istTime(m.kickoff_at),
      href: `/mac/${matchSlug(m.home_team, m.away_team, m.kickoff_at)}`,
    })),
  });
}
