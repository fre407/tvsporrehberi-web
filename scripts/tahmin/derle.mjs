// Site derlemesinden önce (npm run build → prebuild) tahmin yazılarını tek
// bir JSON'da toplar: lib/generated/tahminler.json. Kurallara uymayan yazı
// yayına alınmaz ama derleme durmaz (uyarı yazılır).

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateArticle, wordCount } from './kurallar.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = join(ROOT, 'content', 'tahminler');
const OUT_DIR = join(ROOT, 'lib', 'generated');

const articles = [];
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  try {
    const article = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
    const errors = validateArticle(article, file);
    if (errors.length) {
      console.warn(`[tahmin] YAYINA ALINMADI ${file}: ${errors.join('; ')}`);
      continue;
    }
    articles.push({ ...article, wordCount: wordCount(article) });
  } catch (e) {
    console.warn(`[tahmin] okunamadı ${file}: ${e.message}`);
  }
}
articles.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'tahminler.json'), JSON.stringify(articles));
console.log(`[tahmin] ${articles.length} yazı derlendi → lib/generated/tahminler.json`);
