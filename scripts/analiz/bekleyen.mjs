// Analizi yazılacak maçlar (JSON, stdout). Ölçüt: tahmin yazısı var, maç
// BİTTİ, maç günü (TSİ) en geç dün (analiz maçtan 1 gün sonra yazılır),
// analiz yazısı henüz yok ve maç ANALIZ_BASLANGIC'tan sonra (kullanıcı
// kararı 2026-11-13: geçmiş maçlara analiz yazılmaz). Skor, olaylar ve
// istatistik sitenin Supabase verisinden YALNIZCA OKUNUR.
//
//   node --no-warnings scripts/analiz/bekleyen.mjs

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dateKeyOffset, istDateKey } from '../../lib/format.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ANALIZ_BASLANGIC = process.env.ANALIZ_BASLANGIC ?? '2026-11-13'; // test için ortam değişkeniyle geçilebilir
const SUPABASE_URL = 'https://pwpwibvomoujxokjxtlp.supabase.co/rest/v1';
const KEY = readFileSync(join(ROOT, 'lib', 'supabase.js'), 'utf8').match(/eyJ[\w.-]+/)[0];
const FINISHED = new Set(['FT', 'AET', 'PEN']);

async function rest(path) {
  const res = await fetch(`${SUPABASE_URL}/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

const yesterday = dateKeyOffset(-1);
const predictions = readdirSync(join(ROOT, 'content', 'tahminler'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(ROOT, 'content', 'tahminler', f), 'utf8')));

const out = [];
for (const p of predictions) {
  const day = istDateKey(p.kickoff);
  if (day < ANALIZ_BASLANGIC || day > yesterday) continue;
  const slug = p.slug.replace('-mac-tahmini-', '-mac-analizi-');
  if (existsSync(join(ROOT, 'content', 'analizler', `${slug}.json`))) continue;
  const rows = await rest(
    `fixtures_with_channel?select=id,home_team,away_team,status,home_score,away_score,home_penalty,away_penalty&kickoff_at=eq.${encodeURIComponent(new Date(p.kickoff).toISOString())}`,
  ).catch(() => []);
  const key = (s) => s.toLowerCase().slice(0, 4);
  const row = rows.find((r) => key(r.home_team) === key(p.homeTeam) && key(r.away_team) === key(p.awayTeam));
  if (!row || !FINISHED.has(row.status) || row.home_score == null) {
    out.push({ slug, predictionSlug: p.slug, durum: 'skor henüz kesin değil — sonraki çalışmada tekrar dene' });
    continue;
  }
  const [stats] = await rest(`fixture_stats?select=events,home_stats,away_stats&fixture_id=eq.${row.id}`).catch(() => []);
  const [live] = await rest(`fixture_live_events?select=events&fixture_id=eq.${row.id}`).catch(() => []);
  const events = (stats?.events ?? live?.events ?? []).filter((e) => e.type !== 'subst');
  out.push({
    slug,
    predictionSlug: p.slug,
    matchSlug: p.matchSlug,
    homeTeam: p.homeTeam,
    awayTeam: p.awayTeam,
    competition: p.competition,
    round: p.round,
    kickoff: p.kickoff,
    channel: p.channel,
    finalScore: { home: row.home_score, away: row.away_score },
    penaltilar: row.home_penalty != null ? { home: row.home_penalty, away: row.away_penalty } : null,
    tahminSkoru: p.scorePrediction,
    tahminTercihleri: p.picks,
    olaylar: events,
    istatistik: stats ? { ev: stats.home_stats, deplasman: stats.away_stats } : null,
  });
}
console.log(JSON.stringify({ bugun: dateKeyOffset(0), maclar: out }, null, 2));
