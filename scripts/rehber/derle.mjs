// Haftalık rehber yazılarını (content/rehber/*.json) tek JSON'da toplar:
// lib/generated/rehber.json (predev/prebuild). Kurala uymayan yazı alınmaz.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateGuide } from './kurallar.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = join(ROOT, 'content', 'rehber');
const OUT_DIR = join(ROOT, 'lib', 'generated');

const guides = [];
const seen = new Set();
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  try {
    const guide = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
    const errors = validateGuide(guide, file, seen);
    if (errors.length) {
      console.warn(`[rehber] YAYINA ALINMADI ${file}: ${errors.join('; ')}`);
      continue;
    }
    seen.add(guide.slug);
    guides.push(guide);
  } catch (e) {
    console.warn(`[rehber] okunamadı ${file}: ${e.message}`);
  }
}
guides.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'rehber.json'), JSON.stringify(guides));
console.log(`[rehber] ${guides.length} yazı derlendi → lib/generated/rehber.json`);
