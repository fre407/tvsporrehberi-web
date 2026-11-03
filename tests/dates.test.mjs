// node --test tests/  — "Bugün" sayfasının dayandığı Türkiye saati tarih
// hesapları: gece yarısı, ay sonu, yıl sonu geçişleri. Sunucu UTC'de çalışır;
// tarih her zaman Europe/Istanbul'a göre belirlenmeli.
import test from 'node:test';
import assert from 'node:assert/strict';
import { dateKeyOffset, istDateKey, istKeyToUtcRange, matchSlug } from '../lib/format.js';

function at(isoUtc, fn) {
  const RealDate = Date;
  const fixed = new RealDate(isoUtc).getTime();
  globalThis.Date = class extends RealDate {
    constructor(...a) { super(...(a.length ? a : [fixed])); }
    static now() { return fixed; }
  };
  try { return fn(); } finally { globalThis.Date = RealDate; }
}

const cases = [
  ['23:55 TSİ', '2026-11-03T20:55:00Z', '2026-11-03', '2026-11-04'],
  ['00:00 TSİ', '2026-11-03T21:00:00Z', '2026-11-04', '2026-11-05'],
  ['00:05 TSİ', '2026-11-03T21:05:00Z', '2026-11-04', '2026-11-05'],
  ['ay sonu 23:59', '2026-11-30T20:59:00Z', '2026-11-30', '2026-12-01'],
  ['yıl sonu 00:01', '2026-12-31T21:01:00Z', '2027-01-01', '2027-01-02'],
];

for (const [label, now, today, tomorrow] of cases) {
  test(`bugün/yarın anahtarı — ${label}`, () => {
    at(now, () => {
      assert.equal(dateKeyOffset(0), today);
      assert.equal(dateKeyOffset(1), tomorrow);
    });
  });
}

test('Türkiye günü UTC aralığı (00:00 TSİ = 21:00 UTC önceki gün)', () => {
  const { startIso, endIso } = istKeyToUtcRange('2026-11-04');
  assert.equal(startIso, '2026-11-03T21:00:00.000Z');
  assert.equal(endIso, '2026-11-04T21:00:00.000Z');
});

test('gece yarısından sonraki maç ertesi güne yazılır (slug ve gün)', () => {
  // 21:30 UTC = 00:30 TSİ → maç Türkiye takviminde ertesi gün
  assert.equal(istDateKey('2026-11-04T21:30:00Z'), '2026-11-05');
  assert.equal(matchSlug('Galatasaray', 'Fenerbahçe', '2026-11-04T21:30:00Z'), 'galatasaray-fenerbahce-2026-11-05');
});
