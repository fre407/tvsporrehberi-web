// node --no-warnings scripts/rehber/dogrula.mjs [slug...]  — hata = çıkış 1.
// Elle yazılmış (lib/guides*) yazıların slug'larıyla çakışmayı da kontrol eder.

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateGuide, wordCount } from './kurallar.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = join(ROOT, 'content', 'rehber');
const staticSlugs = new Set();
for (const f of ['lib/guides.js', ...readdirSync(join(ROOT, 'lib', 'guides')).map((x) => `lib/guides/${x}`)]) {
  for (const m of readFileSync(join(ROOT, f), 'utf8').matchAll(/slug: '([a-z0-9-]+)'/g)) staticSlugs.add(m[1]);
}
const wanted = process.argv.slice(2);
let failed = false;
const seen = new Set(staticSlugs);
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.json')).sort()) {
  const guide = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
  const errors = validateGuide(guide, file, seen);
  seen.add(guide.slug);
  if (wanted.length && !wanted.includes(guide.slug)) continue;
  if (errors.length) {
    failed = true;
    console.log(`✗ ${file}\n   - ${errors.join('\n   - ')}`);
  } else console.log(`✓ ${file} (${wordCount(guide)} kelime)`);
}
process.exit(failed ? 1 : 0);
