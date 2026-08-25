import { supabase } from './supabase';
import { slugify } from './format';
import { COMPETITION_TO_LEAGUE_API_ID } from './competitions';
import { canonicalTeamName, canonicalChannelName, teamNameVariants } from './teamNames';

// Supabase'ten dönen HER fikstür satırının geçtiği tek nokta — takım ve
// kanal adlarını kanonik forma indirir (bkz. lib/teamNames.js). Slug'lar,
// arama, ilgili maç listeleri, JSON-LD hepsi bu satırlar üzerinden
// üretildiği için düzeltme burada tek seferde tüm siteye yayılıyor.
function normalizeRow(row) {
  if (!row) return row;
  return {
    ...row,
    home_team: canonicalTeamName(row.home_team),
    away_team: canonicalTeamName(row.away_team),
    channel: canonicalChannelName(row.channel),
    channel2: canonicalChannelName(row.channel2),
    platform: canonicalChannelName(row.platform),
    broadcast_services: Array.isArray(row.broadcast_services)
      ? row.broadcast_services.map(canonicalChannelName).filter(Boolean)
      : [],
  };
}

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
  if (Array.isArray(row.broadcast_services) && row.broadcast_services.length > 0) {
    return row.broadcast_services.join(' / ');
  }
  if (row.channel) return row.channel2 ? `${row.channel} / ${row.channel2}` : row.channel;
  if (row.platform) return row.platform;
  const status = matchStatus(row);
  if (status === 'finished' || status === 'finished_unknown') return 'Yayınlanmadı';
  // "Yayınlanmıyor" SADECE confirmed_unavailable ile, yani veride gerçekten
  // doğrulanmış bir "bu maç Türkiye'de yayınlanmayacak" bilgisi varsa
  // kullanılır. Kanal bilgisi henüz gelmemişse (canlı bir maç dahil) bunu
  // "yayınlanmıyor" gibi kesin bir iddiaya çevirmiyoruz — yanlış olabilir.
  if (row.confirmed_unavailable) return 'Yayınlanmıyor';
  return 'Türkiye yayın bilgisi henüz bulunamadı';
}

export function teamSlug(name) {
  return slugify(name);
}

// PostgREST'in varsayılan satır tavanı (genelde 1000) sessizce devreye
// girip veri kesebiliyor — özellikle bu geniş, tüm liglerin 90 günlük
// penceresini tek seferde çeken sorguda (bkz. getFixturesForTeamSlug).
// Anon istemciden aşabileceğimiz bir üst sınır yok ama en azından
// istemci tarafında sessizce daha da düşük bir varsayılana düşmesin
// diye açıkça yüksek bir limit istiyoruz.
const WIDE_WINDOW_LIMIT = 5000;

export async function getFixturesInWindow(startIso, endIso) {
  const { data, error } = await supabase
    .from('fixtures_with_channel')
    .select('*')
    .gte('kickoff_at', startIso)
    .lte('kickoff_at', endIso)
    .order('kickoff_at', { ascending: true })
    .limit(WIDE_WINDOW_LIMIT);
  if (error) throw error;
  return (data ?? []).map(normalizeRow);
}

export async function getFixtureById(id) {
  const { data, error } = await supabase
    .from('fixtures_with_channel')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return normalizeRow(data);
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
  return (data ?? []).map(normalizeRow);
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

// O an gerçekten canlı olan maçlar — dar bir pencere yeterli (canlı bir maç
// kickoff'tan en fazla birkaç saat sonrasında olabilir), geniş tarih
// aralığı taramaya gerek yok.
export async function getLiveFixtures() {
  const { startIso, endIso } = windowIso(1, 1);
  const rows = await getFixturesInWindow(startIso, endIso);
  return rows.filter((r) => matchStatus(r) === 'live');
}

// /takimlar için: elle bir isim listesi TUTMUYORUZ — API-Football'ın takım
// adı yazımı (ör. "CA Osasuna", "Bologna FC") tahmin edilemiyor, bu yüzden
// popüler ligler/kupalar penceresindeki GERÇEK fikstürlerden benzersiz takım
// adları çıkarılıyor. Böylece her kart her zaman gerçek bir /takim/[slug]
// sayfasına çıkar. Türkiye'nin 4 büyüğü sabit olarak en başa alınıyor.
const PINNED_TEAMS = ['Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor'];

export async function getPopularTeams({ competitionKeys, startIso, endIso }) {
  const { data, error } = await supabase
    .from('fixtures_with_channel')
    .select('home_team, away_team, competition_key')
    .in('competition_key', competitionKeys)
    .gte('kickoff_at', startIso)
    .lte('kickoff_at', endIso);
  if (error) throw error;

  const seen = new Map(); // slug -> display name
  for (const row of (data ?? []).map(normalizeRow)) {
    for (const name of [row.home_team, row.away_team]) {
      const slug = teamSlug(name);
      if (!seen.has(slug)) seen.set(slug, name);
    }
  }

  const pinned = [];
  for (const name of PINNED_TEAMS) {
    const slug = teamSlug(name);
    if (seen.has(slug)) {
      pinned.push({ slug, name: seen.get(slug) });
      seen.delete(slug);
    }
  }
  const rest = Array.from(seen, ([slug, name]) => ({ slug, name })).sort((a, b) =>
    a.name.localeCompare(b.name, 'tr')
  );
  return [...pinned, ...rest];
}

// /kanallar için aynı ilke: kanal/platform adları elle listelenmiyor,
// gerçek fikstürlerden türetiliyor.
export async function getDistinctChannels({ startIso, endIso }) {
  const { data, error } = await supabase
    .from('fixtures_with_channel')
    .select('channel, channel2, platform, broadcast_services')
    .gte('kickoff_at', startIso)
    .lte('kickoff_at', endIso);
  if (error) throw error;

  const seen = new Map(); // slug -> {name, count}
  for (const row of (data ?? []).map(normalizeRow)) {
    for (const name of [...(row.broadcast_services ?? []), row.channel, row.channel2, row.platform]) {
      if (!name) continue;
      const slug = teamSlug(name);
      const existing = seen.get(slug);
      if (existing) existing.count += 1;
      else seen.set(slug, { name, count: 1 });
    }
  }
  return Array.from(seen, ([slug, v]) => ({ slug, name: v.name, count: v.count })).sort(
    (a, b) => b.count - a.count
  );
}

export function channelSlug(name) {
  return slugify(name);
}

export async function getFixturesForChannelSlug(slug, { startIso, endIso }) {
  const rows = await getFixturesInWindow(startIso, endIso);
  const matches = rows.filter(
    (r) =>
      (r.channel && channelSlug(r.channel) === slug) ||
      (r.channel2 && channelSlug(r.channel2) === slug) ||
      (r.platform && channelSlug(r.platform) === slug) ||
      (r.broadcast_services ?? []).some((name) => channelSlug(name) === slug)
  );
  const displayName =
    matches.find((r) => r.channel && channelSlug(r.channel) === slug)?.channel ??
    matches.find((r) => r.channel2 && channelSlug(r.channel2) === slug)?.channel2 ??
    matches.find((r) => r.platform && channelSlug(r.platform) === slug)?.platform ??
    matches.find((r) => (r.broadcast_services ?? []).some((name) => channelSlug(name) === slug))?.broadcast_services.find((name) => channelSlug(name) === slug) ??
    null;
  return { matches, displayName };
}

// Arama kutusu için: yaklaşan fikstürlerde takım adı `q` ile eşleşenler.
// Tek sorgu, küçük limit — sık kullanılan bir özellik olsa da Supabase
// trafiğini gereksiz artırmamak için debounce istemci tarafında yapılıyor
// (bkz. components/SearchBox.js).
export async function searchUpcomingFixtures(q, limit = 8) {
  const now = new Date().toISOString();
  // `q` kullanıcıdan geliyor (/api/search) — PostgREST'in or() filtre
  // sözdizimi virgül/parantezle ayrılıyor, ham haliyle interpolasyon
  // filtre enjeksiyonuna açık olurdu. pgQuote ile değeri tırnaklıyoruz.
  const pattern = pgQuote(`%${q}%`);
  const { data, error } = await supabase
    .from('fixtures_with_channel')
    .select('*')
    .gte('kickoff_at', now)
    .or(`home_team.ilike.${pattern},away_team.ilike.${pattern}`)
    .order('kickoff_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(normalizeRow);
}

// ---------------------------------------------------------------------------
// Puan Durumu / Gol-Asist Kralı — tv-spor-rehberi-app'in `league_standings`
// ve `league_stats` tabloları (bkz. lib/competitions.js'teki id notu).
// ---------------------------------------------------------------------------

export async function getStandings(competitionKey) {
  const leagueApiId = COMPETITION_TO_LEAGUE_API_ID[competitionKey];
  if (!leagueApiId) return null;
  const { data, error } = await supabase
    .from('league_standings')
    .select('league_name, season, standings, updated_at')
    .eq('league_api_id', leagueApiId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getLeagueStats(competitionKey) {
  const leagueApiId = COMPETITION_TO_LEAGUE_API_ID[competitionKey];
  if (!leagueApiId) return null;
  const { data, error } = await supabase
    .from('league_stats')
    .select('top_scorers, top_assists, updated_at')
    .eq('league_api_id', leagueApiId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Maç detayı: İlk 11 + istatistik/olay akışı — `fixture_lineups` ve
// `fixture_stats` (bkz. tv-spor-rehberi-app migrations 0029/0032).
// ---------------------------------------------------------------------------

export async function getFixtureLineups(fixtureId) {
  const { data, error } = await supabase
    .from('fixture_lineups')
    .select('*')
    .eq('fixture_id', fixtureId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getFixtureStats(fixtureId) {
  const { data, error } = await supabase
    .from('fixture_stats')
    .select('*')
    .eq('fixture_id', fixtureId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function pgQuote(v) {
  return '"' + String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

// Maç detayında head-to-head: iki takımın geçmiş (bitmiş) karşılaşmaları.
// teamA/teamB bize normalizeRow'dan geçmiş (kanonik) isimlerle gelir, ama
// veritabanındaki eski satırlar hâlâ ham yazım (ör. "Everton FC") olabilir
// — kanonik isimle sorgularsak o satırları kaçırırız. Bilinen tüm
// yazım varyantlarını OR'a ekliyoruz.
export async function getHeadToHead(teamA, teamB, limit = 5) {
  const now = new Date().toISOString();
  const aVariants = teamNameVariants(teamA).map(pgQuote);
  const bVariants = teamNameVariants(teamB).map(pgQuote);
  const clauses = [];
  for (const a of aVariants) {
    for (const b of bVariants) {
      clauses.push(`and(home_team.eq.${a},away_team.eq.${b})`);
      clauses.push(`and(home_team.eq.${b},away_team.eq.${a})`);
    }
  }
  const { data, error } = await supabase
    .from('fixtures_with_channel')
    .select('*')
    .lt('kickoff_at', now)
    .or(clauses.join(','))
    .order('kickoff_at', { ascending: false })
    .limit(limit * 3); // birkaçı skorsuz/iptal olabilir, fazladan çekip süzüyoruz
  if (error) throw error;
  return (data ?? []).map(normalizeRow).filter((r) => matchStatus(r) === 'finished').slice(0, limit);
}

// Takım sayfasında "son 5 maç formu" (G/B/M noktaları) — ekstra sorgu değil,
// zaten çekilmiş fikstürlerden hesaplanıyor.
export function teamResultLetter(row, teamName) {
  if (matchStatus(row) !== 'finished' || row.home_score == null || row.away_score == null) return null;
  const isHome = row.home_team === teamName;
  const own = isHome ? row.home_score : row.away_score;
  const opp = isHome ? row.away_score : row.home_score;
  if (own > opp) return 'W';
  if (own < opp) return 'L';
  return 'D';
}
