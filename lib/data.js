import { supabase } from './supabase';
import { slugify } from './format';

// `fixtures_with_channel` — tv-spor-rehberi-app'in kullandığı AYNI view
// (bkz. o repodaki src/data/liveFootball.js: fetchUpcomingFootballFixtures).
// Kolonlar: id, competition_key, round, home_team, away_team, home_logo,
// away_logo, kickoff_at, channel, channel2, platform, confirmed_unavailable,
// status, home_score, away_score, home_penalty, away_penalty, elapsed.

const FINISHED = new Set(['FT', 'AET', 'PEN']);
const LIVE = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT']);
const NOT_HAPPENING = new Set(['PST', 'CANC', 'ABD', 'AWD', 'WO', 'SUSP']);
const MAX_PLAUSIBLE_LIVE_MS = 2.5 * 60 * 60 * 1000;

export function matchStatus(row) {
  if (row.status) {
    if (FINISHED.has(row.status)) {
      return row.home_score != null && row.away_score != null ? 'finished' : 'finished_unknown';
    }
    if (NOT_HAPPENING.has(row.status)) return 'not_happening';
    if (LIVE.has(row.status)) {
      const kickoffMs = new Date(row.kickoff_at).getTime();
      if (Date.now() - kickoffMs > MAX_PLAUSIBLE_LIVE_MS) return 'finished_unknown';
      return 'live';
    }
  }
  const kickoff = new Date(row.kickoff_at).getTime();
  const now = Date.now();
  if (now >= kickoff + 2 * 60 * 60 * 1000) return 'finished_unknown';
  if (now >= kickoff) return 'live';
  return 'upcoming';
}

// Basitleştirilmiş kanal metni — uygulamadaki getChannelDisplay'in çok
// dilli/favori-takım istisnası olmayan sürümü (site tek dil: Türkçe).
export function channelDisplay(row) {
  if (row.channel) return row.channel2 ? `${row.channel} / ${row.channel2}` : row.channel;
  if (row.platform) return row.platform;
  const status = matchStatus(row);
  if (status === 'finished' || status === 'finished_unknown') return 'Yayınlanmadı';
  if (row.confirmed_unavailable) return 'Yayınlanmıyor';
  if (status === 'live') return 'Yayınlanmıyor';
  return 'Kanal bilgisi yakında eklenecek';
}

export function teamSlug(name) {
  return slugify(name);
}

export async function getFixturesInWindow(startIso, endIso) {
  const { data, error } = await supabase
    .from('fixtures_with_channel')
    .select('*')
    .gte('kickoff_at', startIso)
    .lte('kickoff_at', endIso)
    .order('kickoff_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getFixtureById(id) {
  const { data, error } = await supabase
    .from('fixtures_with_channel')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getFixturesForCompetition(competitionKey, { startIso, endIso }) {
  const { data, error } = await supabase
    .from('fixtures_with_channel')
    .select('*')
    .eq('competition_key', competitionKey)
    .gte('kickoff_at', startIso)
    .lte('kickoff_at', endIso)
    .order('kickoff_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// Takım sayfası: takım adını slug'dan tam olarak bilemediğimiz için (Türkçe
// karakter/boşluk kaybı geri döndürülemiyor) geniş bir pencerede tüm
// fikstürleri çekip slugify eşleşmesiyle süzüyoruz.
export async function getFixturesForTeamSlug(slug, { startIso, endIso }) {
  const rows = await getFixturesInWindow(startIso, endIso);
  const matches = rows.filter((r) => teamSlug(r.home_team) === slug || teamSlug(r.away_team) === slug);
  const displayName =
    matches.find((r) => teamSlug(r.home_team) === slug)?.home_team ??
    matches.find((r) => teamSlug(r.away_team) === slug)?.away_team ??
    null;
  return { matches, displayName };
}

export function windowIso(daysBack, daysForward) {
  const now = new Date();
  const start = new Date(now.getTime() - daysBack * 86400000).toISOString();
  const end = new Date(now.getTime() + daysForward * 86400000).toISOString();
  return { startIso: start, endIso: end };
}
