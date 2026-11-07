// node --test tests/  — maç kartındaki goller/kırmızı kartlar süzgeci:
// skorla tutmayan (eksik/eski) liste ASLA gösterilmemeli.
import test from 'node:test';
import assert from 'node:assert/strict';
import { keyMatchEvents } from '../lib/matchEvents.js';

const events = [
  { team: 'away', type: 'card', minute: 17, player: 'A', cardType: 'yellow' },
  { team: 'home', type: 'goal', minute: 13, player: 'B', detail: 'Normal Goal' },
  { team: 'home', type: 'card', minute: 25, player: 'B', cardType: 'red' },
  { team: 'away', type: 'goal', minute: 41, player: 'C', detail: 'Penalty' },
  { team: 'home', type: 'goal', minute: 60, player: 'D', detail: 'Missed Penalty' },
  { team: 'home', type: 'own_goal', minute: 90, extra: 3, player: 'E', detail: 'Own Goal' },
  { team: 'home', type: 'subst', minute: 70, playerIn: 'F', playerOut: 'G' },
];

test('skorla tutan liste: yalnız goller ve kırmızı kartlar, dakika sırasıyla', () => {
  const out = keyMatchEvents(events, 2, 1);
  assert.deepEqual(
    out.map((e) => [e.type, e.team, e.player, e.minute]),
    [
      ['goal', 'home', 'B', 13],
      ['red', 'home', 'B', 25],
      ['penalty', 'away', 'C', 41],
      ['own_goal', 'home', 'E', 90],
    ],
  );
});

test('skorla tutmayan (eksik ya da eski) liste gösterilmez', () => {
  assert.equal(keyMatchEvents(events, 3, 1), null);
  assert.equal(keyMatchEvents(events, 1, 2), null);
});

test('veri yoksa ya da skor yoksa gösterilmez', () => {
  assert.equal(keyMatchEvents(null, 0, 0), null);
  assert.equal(keyMatchEvents(events, null, null), null);
});

test('golsüz maç: yalnız kırmızı kart varsa o görünür', () => {
  const out = keyMatchEvents([{ team: 'away', type: 'card', minute: 50, player: 'X', cardType: 'red' }], 0, 0);
  assert.deepEqual(out.map((e) => e.type), ['red']);
  assert.deepEqual(keyMatchEvents([], 0, 0), []);
});
