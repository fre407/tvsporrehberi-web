// İddialı Tahminler — yazı yazılmadan önce maç verisini toplar.
//
//   node --no-warnings scripts/tahmin/mac-verisi.mjs   → önümüzdeki 54 saat
//   node scripts/tahmin/mac-verisi.mjs --hours 96
//   node scripts/tahmin/mac-verisi.mjs --all      → yazısı olanları da göster
//
// Çıktı (stdout, JSON): 4 büyüklerin (GS, FB, BJK, TS) ve Türkiye A Milli
// Takımı'nın yazısı HENÜZ
// OLMAYAN resmi maçları; her biri için kanal, iki takımın son resmi maçları,
// puan durumundaki yerleri ve aralarındaki son maçlar. Veri sitenin kendi
// Supabase görünümünden (herkese açık anon anahtar — lib/supabase.js ile aynı).

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { istDateKey, istTime, matchSlug, slugify } from '../../lib/format.js';
import { canonicalTeamName, teamNameVariants } from '../../lib/teamNames.js';
import { competitionLabel, COMPETITION_TO_LEAGUE_API_ID } from '../../lib/competitions.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CONTENT_DIR = join(ROOT, 'content', 'tahminler');
const SUPABASE_URL = 'https://pwpwibvomoujxokjxtlp.supabase.co/rest/v1';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cHdpYnZvbW91anhva2p4dGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMjI3ODUsImV4cCI6MjEwMDY5ODc4NX0.xijK0Hd1x0DQQ4q4p03k2_4XIyU8_5ZSOYQAnN8i83Q';

// 4 büyükler + Türkiye A Milli Takımı (kullanıcı isteği, 2026-11-12).
const BIG_FOUR = new Set(['galatasaray', 'fenerbahce', 'besiktas', 'trabzonspor', 'turkiye']);
const EXCLUDED_COMPETITIONS = new Set(['hazirlik_maci']);
const FINISHED = new Set(['FT', 'AET', 'PEN']);

const args = process.argv.slice(2);
const hours = Number(args[args.indexOf('--hours') + 1]) || 54;
const includeWritten = args.includes('--all');

async function rest(path) {
  const res = await fetch(`${SUPABASE_URL}/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

function normalize(row) {
  return { ...row, home_team: canonicalTeamName(row.home_team), away_team: canonicalTeamName(row.away_team) };
}

const isBig = (name) => BIG_FOUR.has(slugify(name));

function articleSlug(row) {
  return `${slugify(row.home_team)}-${slugify(row.away_team)}-mac-tahmini-${istDateKey(row.kickoff_at)}`;
}

function resultLine(row, team) {
  const home = row.home_team === team;
  const gf = home ? row.home_score : row.away_score;
  const ga = home ? row.away_score : row.home_score;
  const letter = gf > ga ? 'G' : gf < ga ? 'M' : 'B';
  return `${istDateKey(row.kickoff_at)} ${competitionLabel(row.competition_key)}: ${row.home_team} ${row.home_score}-${row.away_score} ${row.away_team} (${home ? 'iç saha' : 'deplasman'}, ${letter})`;
}

const BIG_OR = encodeURIComponent(
  '(home_team.ilike.*galatasaray*,away_team.ilike.*galatasaray*,home_team.ilike.*fenerbah*,away_team.ilike.*fenerbah*,' +
    'home_team.ilike.*ikta*,away_team.ilike.*ikta*,home_team.ilike.*trabzonspor*,away_team.ilike.*trabzonspor*,' +
    'home_team.eq.Türkiye,away_team.eq.Türkiye)',
);

const now = Date.now();
const fromIso = new Date(now - 120 * 86400000).toISOString();
const toIso = new Date(now + hours * 3600000).toISOString();

const raw = await rest(
  `fixtures_with_channel?select=*&kickoff_at=gte.${fromIso}&kickoff_at=lte.${toIso}&or=${BIG_OR}&order=kickoff_at`,
);
const rows = raw.map(normalize).filter((r) => !EXCLUDED_COMPETITIONS.has(r.competition_key));

const upcoming = rows.filter(
  (r) => new Date(r.kickoff_at).getTime() > now && !FINISHED.has(r.status) && (isBig(r.home_team) || isBig(r.away_team)),
);
const finished = rows.filter((r) => FINISHED.has(r.status) && r.home_score != null && r.away_score != null);

const standingsCache = new Map();
async function standingFor(competitionKey, team) {
  const leagueApiId = COMPETITION_TO_LEAGUE_API_ID[competitionKey];
  if (!leagueApiId) return null;
  if (!standingsCache.has(leagueApiId)) {
    const data = await rest(`league_standings?select=standings,updated_at&league_api_id=eq.${leagueApiId}`).catch(() => []);
    standingsCache.set(leagueApiId, data[0]?.standings ?? []);
  }
  const list = standingsCache.get(leagueApiId);
  const found = list.find((s) => slugify(canonicalTeamName(s.team?.name)) === slugify(team));
  if (!found) return null;
  return {
    sira: found.rank,
    puan: found.points,
    oynanan: found.all?.played,
    galibiyet: found.all?.win,
    beraberlik: found.all?.draw,
    maglubiyet: found.all?.lose,
    averaj: found.goalsDiff ?? null,
    formEnYeniSolda: found.form,
  };
}

async function headToHead(home, away) {
  const raw2 = await rest(
    `fixtures_with_channel?select=*&kickoff_at=lt.${new Date(now).toISOString()}&or=${encodeURIComponent(
      `(and(home_team.ilike.*${slugify(home).slice(0, 6)}*,away_team.ilike.*${slugify(away).slice(0, 6)}*),and(home_team.ilike.*${slugify(away).slice(0, 6)}*,away_team.ilike.*${slugify(home).slice(0, 6)}*))`,
    )}&order=kickoff_at.desc&limit=5`,
  ).catch(() => []);
  return raw2
    .map(normalize)
    .filter((r) => r.home_score != null)
    .map((r) => `${istDateKey(r.kickoff_at)} ${competitionLabel(r.competition_key)}: ${r.home_team} ${r.home_score}-${r.away_score} ${r.away_team}`);
}

// Bir takımın son resmi maçları (en yeni önce). 4 büyük dışındaki rakip
// için ayrı sorgu (yukarıdaki toplu sorgu yalnızca 4 büyüğün maçlarını getiriyor).
async function teamRows(team, limit = 6) {
  if (isBig(team)) {
    return finished.filter((r) => r.home_team === team || r.away_team === team).slice(-limit).reverse();
  }
  const names = teamNameVariants(team).map((n) => `"${n.replace(/"/g, '')}"`).join(',');
  const data = await rest(
    `fixtures_with_channel?select=*&kickoff_at=gte.${fromIso}&kickoff_at=lt.${new Date(now).toISOString()}` +
      `&or=${encodeURIComponent(`(home_team.in.(${names}),away_team.in.(${names}))`)}&order=kickoff_at.desc&limit=${limit + 4}`,
  ).catch(() => []);
  return data
    .map(normalize)
    .filter((r) => FINISHED.has(r.status) && r.home_score != null && !EXCLUDED_COMPETITIONS.has(r.competition_key))
    .slice(0, limit);
}

// --- Kaba istatistiksel gol beklentisi -----------------------------------
// Yazarın HAREKET NOKTASI, tahminin kendisi değil. Son 6 resmi maçın attığı/
// yediği gol ortalaması, lig seviyesi farkıyla (Süper Lig takımı Premier Lig
// takımına karşı gibi) ve iç saha avantajıyla düzeltilir; Poisson ile skor
// olasılıkları çıkar. Hoca değişikliği, kriz, sakatlık, motivasyon gibi
// konjonktürü BİLMEZ — yazar bunlarla yukarı/aşağı düzeltir (bkz. rehber).
const UEFA_KEYS = new Set(['sampiyonlar_ligi', 'avrupa_ligi', 'konferans_ligi', 'uefa_super_kupa']);
const LEAGUE_STRENGTH = {
  premier_lig: 1.0, la_liga: 0.95, serie_a: 0.9, bundesliga: 0.9, ligue_1: 0.82,
  eredivisie: 0.74, primeira_liga: 0.74, super_lig: 0.7, belcika_ligi: 0.7,
};
const DEFAULT_STRENGTH = 0.6;

function domesticLeague(rows) {
  const counts = new Map();
  for (const r of rows) if (!UEFA_KEYS.has(r.competition_key)) counts.set(r.competition_key, (counts.get(r.competition_key) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function averages(rows, team) {
  if (!rows.length) return { atilan: 1.3, yenilen: 1.3 };
  let gf = 0;
  let ga = 0;
  for (const r of rows) {
    const home = r.home_team === team;
    gf += home ? r.home_score : r.away_score;
    ga += home ? r.away_score : r.home_score;
  }
  return { atilan: gf / rows.length, yenilen: ga / rows.length };
}

function poisson(k, l) {
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return (Math.exp(-l) * l ** k) / f;
}

function goalExpectation(home, away, homeRows, awayRows) {
  const h = averages(homeRows, home);
  const a = averages(awayRows, away);
  const hLeague = domesticLeague(homeRows);
  const aLeague = domesticLeague(awayRows);
  const ratio = ((LEAGUE_STRENGTH[hLeague] ?? DEFAULT_STRENGTH) / (LEAGUE_STRENGTH[aLeague] ?? DEFAULT_STRENGTH)) ** 0.8;
  const lh = Math.max(0.2, ((h.atilan + a.yenilen) / 2) * 1.1 * ratio);
  const la = Math.max(0.2, ((a.atilan + h.yenilen) / 2) * 0.9 / ratio);
  const grid = [];
  let p1 = 0, px = 0, p2 = 0, over25 = 0, btts = 0;
  for (let i = 0; i <= 7; i++) {
    for (let j = 0; j <= 7; j++) {
      const p = poisson(i, lh) * poisson(j, la);
      grid.push({ skor: `${i}-${j}`, p });
      if (i > j) p1 += p; else if (i === j) px += p; else p2 += p;
      if (i + j > 2.5) over25 += p;
      if (i > 0 && j > 0) btts += p;
    }
  }
  const pct = (x) => Math.round(x * 100);
  return {
    not: 'Kaba istatistiksel taban — konjonktürle (hoca, kriz, sakatlık, motivasyon) düzeltilmeli.',
    evSahibiLig: hLeague,
    deplasmanLig: aLeague,
    evSahibiSon6Ortalama: { atilan: +h.atilan.toFixed(2), yenilen: +h.yenilen.toFixed(2) },
    deplasmanSon6Ortalama: { atilan: +a.atilan.toFixed(2), yenilen: +a.yenilen.toFixed(2) },
    beklenenGol: { evSahibi: +lh.toFixed(2), deplasman: +la.toFixed(2) },
    olasilikYuzde: { ms1: pct(p1), msX: pct(px), ms2: pct(p2), ust25: pct(over25), kgVar: pct(btts) },
    enOlasiSkorlar: grid.sort((x, y) => y.p - x.p).slice(0, 8).map((g) => `${g.skor} (%${pct(g.p)})`),
  };
}

// İç ligdeki yer (UEFA maçlarında da takımın kendi liginde nerede olduğu
// konjonktür için önemli).
async function domesticStanding(team, rows) {
  const league = domesticLeague(rows);
  return league ? { lig: competitionLabel(league), ...(await standingFor(league, team)) } : null;
}

const out = [];
for (const r of upcoming) {
  const slug = articleSlug(r);
  const written = existsSync(join(CONTENT_DIR, `${slug}.json`));
  if (written && !includeWritten) continue;
  out.push({
    slug,
    yaziVar: written,
    matchSlug: matchSlug(r.home_team, r.away_team, r.kickoff_at),
    homeTeam: r.home_team,
    awayTeam: r.away_team,
    competition: r.competition_key,
    competitionLabel: competitionLabel(r.competition_key),
    round: r.round ?? null,
    kickoff: r.kickoff_at,
    tarihTSI: istDateKey(r.kickoff_at),
    saatTSI: istTime(r.kickoff_at),
    channel: [r.channel, r.channel2, r.platform].filter(Boolean).join(' / ') || null,
    ...(await (async () => {
      const homeRows = await teamRows(r.home_team);
      const awayRows = await teamRows(r.away_team);
      return {
        evSahibiSonMaclar: homeRows.map((x) => resultLine(x, r.home_team)),
        deplasmanSonMaclar: awayRows.map((x) => resultLine(x, r.away_team)),
        buTurnuvadaPuanDurumu: {
          evSahibi: await standingFor(r.competition_key, r.home_team),
          deplasman: await standingFor(r.competition_key, r.away_team),
        },
        kendiLigindekiYeri: {
          evSahibi: await domesticStanding(r.home_team, homeRows),
          deplasman: await domesticStanding(r.away_team, awayRows),
        },
        golBeklentisi: goalExpectation(r.home_team, r.away_team, homeRows, awayRows),
      };
    })()),
    aralarindakiSonMaclar: await headToHead(r.home_team, r.away_team),
  });
}

console.log(JSON.stringify({ olusturuldu: new Date(now).toISOString(), saatPenceresi: hours, maclar: out }, null, 2));
