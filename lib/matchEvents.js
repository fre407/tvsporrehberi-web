// Maç kartındaki "goller ve kırmızı kartlar" listesi için olay süzgeci.
//
// Kaynaklar (ikisi de AYNI olay şekli — FutbolMaclari get-live-events /
// sync-match-stats buildEvents): canlıyken `fixture_live_events` (uygulama
// maçı açtıkça dolan paylaşılan önbellek; site ASLA API'ye gitmez), maç
// bitince `fixture_stats.events`.
//
// Canlı tablo yalnızca uygulamada biri o maça bakarken tazeleniyor — liste
// eski/eksik kalabilir. Yanlış bilgi göstermemek için (kullanıcı kararı,
// 2026-11-07) gollerin takım takım sayısı skorla BİREBİR tutmuyorsa liste
// hiç gösterilmez (null). `team` alanı golün yazıldığı taraftır (kendi
// kalesine gol dahil — veride doğrulandı).

function isGoal(ev) {
  if (ev?.type === 'own_goal') return true;
  return ev?.type === 'goal' && !/missed/i.test(ev.detail ?? '');
}

function isRedCard(ev) {
  return ev?.type === 'card' && ev.cardType === 'red';
}

export function keyMatchEvents(events, homeScore, awayScore) {
  if (!Array.isArray(events) || homeScore == null || awayScore == null) return null;
  const goals = events.filter(isGoal);
  const homeGoals = goals.filter((ev) => ev.team === 'home').length;
  const awayGoals = goals.filter((ev) => ev.team === 'away').length;
  if (homeGoals !== Number(homeScore) || awayGoals !== Number(awayScore)) return null;

  return events
    .filter((ev) => (isGoal(ev) || isRedCard(ev)) && (ev.team === 'home' || ev.team === 'away'))
    .map((ev) => ({
      type: isRedCard(ev) ? 'red' : ev.type === 'own_goal' ? 'own_goal' : ev.detail === 'Penalty' ? 'penalty' : 'goal',
      team: ev.team,
      player: ev.player ?? null,
      minute: ev.minute ?? null,
      extra: ev.extra ?? null,
    }))
    .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0) || (a.extra ?? 0) - (b.extra ?? 0));
}
