// content/analizler/*.json → lib/generated/analizler.json (predev/prebuild).
// Kurala uymayan yazı yayına alınmaz ama derleme durmaz (uyarı yazılır).

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateAnalysis, wordCount } from './kurallar.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = join(ROOT, 'content', 'analizler');
const predictionSlugs = new Set(
  JSON.parse(readFileSync(join(ROOT, 'lib', 'generated', 'tahminler.json'), 'utf8')).map((p) => p.slug),
);

const out = [];
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  try {
    const a = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
    const errors = validateAnalysis(a, file, predictionSlugs);
    if (errors.length) {
      console.warn(`[analiz] YAYINA ALINMADI ${file}: ${errors.join('; ')}`);
      continue;
    }
    out.push({ ...a, wordCount: wordCount(a) });
  } catch (e) {
    console.warn(`[analiz] okunamadı ${file}: ${e.message}`);
  }
}
out.sort((a, b) => new Date(b.kickoff) - new Date(a.kickoff));
mkdirSync(join(ROOT, 'lib', 'generated'), { recursive: true });
writeFileSync(join(ROOT, 'lib', 'generated', 'analizler.json'), JSON.stringify(out));
console.log(`[analiz] ${out.length} yazı derlendi → lib/generated/analizler.json`);
