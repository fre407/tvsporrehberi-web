import articles from './generated/analizler.json';

// "Maç Analizleri" — tahmin yazısı olan maçların maç sonu yazıları. Kaynak:
// content/analizler/*.json (her akşam otomatik görev ekler, bkz.
// content/analizler/YAZIM-REHBERI.md); derlemede scripts/analiz/derle.mjs
// ile lib/generated/analizler.json'a toplanır. Liste yeniden eskiye.

export const ANALYSES_PATH = '/mac-analizleri';

export function analysisUrl(article) {
  return `${ANALYSES_PATH}/${article.slug}`;
}

export function allAnalyses() {
  return articles;
}

export function getAnalysis(slug) {
  return articles.find((a) => a.slug === slug) ?? null;
}

export function analysisForPrediction(predictionSlug) {
  return articles.find((a) => a.predictionSlug === predictionSlug) ?? null;
}

export function analysisForMatch(matchSlug) {
  return articles.find((a) => a.matchSlug === matchSlug) ?? null;
}
