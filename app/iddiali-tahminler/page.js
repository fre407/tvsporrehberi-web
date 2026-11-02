import Link from 'next/link';
import JsonLd from '../../components/JsonLd';
import { getFixturesInWindow } from '../../lib/data';
import { competitionLabel } from '../../lib/competitions';
import { istDateLong, istTime, matchSlug } from '../../lib/format';
import { SITE_URL } from '../../lib/links';
import { PREDICTIONS_PATH, allPredictions, isUpcoming, predictionUrl } from '../../lib/predictions';

export const revalidate = 600;

export const metadata = {
  title: { absolute: 'İddialı Tahminler: Galatasaray, Fenerbahçe, Beşiktaş ve Trabzonspor Maç Tahminleri | TV Spor Rehberi' },
  description:
    'Galatasaray, Fenerbahçe, Beşiktaş ve Trabzonspor maçları için skor tahmini, ilk yarı-ikinci yarı beklentisi ve iddaa yorumları. Form, sakat ve cezalılara dayalı maç önü analizler.',
  alternates: { canonical: `${SITE_URL}${PREDICTIONS_PATH}` },
  openGraph: { type: 'website', url: `${SITE_URL}${PREDICTIONS_PATH}`, title: 'İddialı Tahminler | TV Spor Rehberi' },
};

function Card({ article, result }) {
  const { home, away } = article.scorePrediction;
  const exact = result && result.home === home && result.away === away;
  return (
    <li className="pred-card">
      <Link href={predictionUrl(article)}>
        <span className="pred-card-meta">
          {competitionLabel(article.competition)} · {istDateLong(article.kickoff)} · {istTime(article.kickoff)}
        </span>
        <b className="pred-card-title">{article.title}</b>
        <span className="pred-card-desc">{article.description}</span>
        <span className="pred-card-foot">
          <span className="pred-card-score">Tahmin {home}-{away}</span>
          {result ? (
            <span className={`pred-card-result${exact ? ' is-hit' : ''}`}>
              Sonuç {result.home}-{result.away}{exact ? ' · tam isabet' : ''}
            </span>
          ) : (
            <span className="pred-card-read">Yazıyı oku →</span>
          )}
        </span>
      </Link>
    </li>
  );
}

export default async function PredictionsIndexPage() {
  const articles = allPredictions();
  const upcoming = articles.filter((a) => isUpcoming(a));
  const past = articles.filter((a) => !isUpcoming(a)).reverse();

  // Geçmiş tahminlerin gerçek sonuçları tek sorguyla.
  const results = new Map();
  if (past.length) {
    try {
      const start = new Date(new Date(past[past.length - 1].kickoff).getTime() - 86400000).toISOString();
      const rows = await getFixturesInWindow(start, new Date().toISOString());
      for (const r of rows) {
        if (r.home_score != null && r.away_score != null) {
          results.set(matchSlug(r.home_team, r.away_team, r.kickoff_at), { home: r.home_score, away: r.away_score });
        }
      }
    } catch {
      // sonuçlar opsiyonel
    }
  }

  const listLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: articles.slice(-20).reverse().map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}${predictionUrl(a)}`,
      name: a.title,
    })),
  };

  return (
    <>
      <JsonLd data={listLd} />
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">Maç önü analiz · skor tahmini · iddaa yorumu</div>
          <h1>İddialı <em>Tahminler</em></h1>
          <p className="page-desc">
            Galatasaray, Fenerbahçe, Beşiktaş ve Trabzonspor&apos;un her resmi maçı için form durumu, sakat ve
            cezalılar, ilk yarı-ikinci yarı beklentisi ve iddaa tercihleriyle maç önü tahmin yazıları. Yazılar maçtan
            bir gün önce yayımlanır; maç bitince tahminin tutup tutmadığı da burada görünür.
          </p>
        </div>
      </div>
      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="sec-head"><div className="sec-title">Yaklaşan <span>maçlar</span></div></div>
          {upcoming.length ? (
            <ul className="pred-grid">{upcoming.map((a) => <Card key={a.slug} article={a} />)}</ul>
          ) : (
            <p className="page-desc">Yaklaşan maçların tahmin yazıları maçtan bir gün önce burada olacak.</p>
          )}
          {past.length ? (
            <>
              <div className="sec-head" style={{ marginTop: 30 }}><div className="sec-title">Geçmiş <span>tahminler</span></div></div>
              <ul className="pred-grid">{past.map((a) => <Card key={a.slug} article={a} result={results.get(a.matchSlug)} />)}</ul>
            </>
          ) : null}
          <p className="pred-disclaimer">
            Tahminler maç öncesi yorumdur, sonuç garantisi vermez. Bahis oynamak 18 yaşından küçükler için yasaktır.
          </p>
        </div>
      </section>
    </>
  );
}
