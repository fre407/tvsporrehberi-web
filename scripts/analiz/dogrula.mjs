// node --no-warnings scripts/analiz/dogrula.mjs [slug...] — hata = çıkış 1 (push yok).

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateAnalysis, wordCount } from './kurallar.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = join(ROOT, 'content', 'analizler');
const predictionSlugs = new Set(
  readdirSync(join(ROOT, 'content', 'tahminler')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)),
);
const wanted = process.argv.slice(2);
let failed = false;
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  const a = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
  if (wanted.length && !wanted.includes(a.slug)) continue;
  const errors = validateAnalysis(a, file, predictionSlugs);
  if (errors.length) {
    failed = true;
    console.log(`✗ ${file}\n   - ${errors.join('\n   - ')}`);
  } else console.log(`✓ ${file} (${wordCount(a)} kelime)`);
}
process.exit(failed ? 1 : 0);
