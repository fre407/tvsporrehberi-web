import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '../../../components/JsonLd';
import { ANALYSES_PATH, allAnalyses, analysisUrl, getAnalysis } from '../../../lib/analyses';
import { evaluatePick, getPrediction, predictionUrl } from '../../../lib/predictions';
import { competitionLabel, competitionSlug } from '../../../lib/competitions';
import { istDateLong } from '../../../lib/format';
import { SITE_URL } from '../../../lib/links';
import { breadcrumbJsonLd } from '../../../lib/structuredData';

// Tek bir maç sonu analizi. Metin derlemede sabit (statik sayfa).
export const revalidate = false;
export const dynamicParams = false;

export function generateStaticParams() {
  return allAnalyses().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = getAnalysis(slug);
  if (!a) return { title: 'Analiz bulunamadı' };
  const url = `${SITE_URL}${analysisUrl(a)}`;
  return {
    title: { absolute: a.seoTitle },
    description: a.description,
    alternates: { canonical: url },
    openGraph: { type: 'article', url, title: a.title, description: a.description, publishedTime: a.publishedAt, section: 'Maç Analizleri' },
  };
}

export default async function AnalysisPage({ params }) {
  const { slug } = await params;
  const a = getAnalysis(slug);
  if (!a) notFound();
  const url = `${SITE_URL}${analysisUrl(a)}`;
  const prediction = getPrediction(a.predictionSlug);
  const others = allAnalyses().filter((x) => x.slug !== a.slug).slice(0, 5);
  const { home, away } = a.finalScore;
  const exact = prediction && prediction.scorePrediction.home === home && prediction.scorePrediction.away === away;
  // Yazar kurum (sahte kişi yok) — bkz. predictionArticleJsonLd.
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    datePublished: a.publishedAt,
    dateModified: a.updatedAt ?? a.publishedAt,
    inLanguage: 'tr-TR',
    articleSection: 'Maç Analizleri',
    author: { '@type': 'Organization', name: 'TV Spor Rehberi', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'TV Spor Rehberi', url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    about: [
      { '@type': 'SportsTeam', name: a.homeTeam },
      { '@type': 'SportsTeam', name: a.awayTeam },
    ],
  };

  return (
    <>
      <JsonLd data={articleLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Ana Sayfa', url: SITE_URL },
          { name: 'Maç Analizleri', url: `${SITE_URL}${ANALYSES_PATH}` },
          { name: a.title, url },
        ])}
      />
      <div className="crumb wrap">
        <Link href="/">Ana Sayfa</Link> › <Link href={ANALYSES_PATH}>Maç Analizleri</Link> › {a.homeTeam} - {a.awayTeam}
      </div>
      <article className="pred-article">
        <div className="wrap pred-wrap">
          <div className="eyebrow">
            <Link href={`/lig/${competitionSlug(a.competition)}`}>{competitionLabel(a.competition)}</Link> · Maç Analizi
          </div>
          <h1 className="pred-title">{a.title}</h1>
          <div className="pred-byline">
            <span>TV Spor Rehberi Editörü</span>·<span>{istDateLong(a.publishedAt)}</span>
          </div>

          <div className="pred-score">
            <div className="pred-score-team"><span>{a.homeTeam}</span></div>
            <div className="pred-score-center">
              <small>Maç sonucu</small>
              <strong>{home} - {away}</strong>
              {prediction ? (
                <em className={exact ? 'is-hit' : ''}>
                  Tahminimiz {prediction.scorePrediction.home}-{prediction.scorePrediction.away}{exact ? ' · tam isabet' : ''}
                </em>
              ) : null}
            </div>
            <div className="pred-score-team"><span>{a.awayTeam}</span></div>
          </div>

          <div className="pred-matchinfo">
            <span>📅 {istDateLong(a.kickoff)}</span>
            <Link href={`/mac/${a.matchSlug}`}>Maç sayfası, kadrolar ve istatistikler →</Link>
            {prediction ? <Link href={predictionUrl(prediction)}>Maç öncesi tahmin yazısı →</Link> : null}
          </div>

          <p className="pred-intro">{a.intro}</p>

          {prediction ? (
            <section className="pred-picks" aria-labelledby="tercihler">
              <h2 id="tercihler">Maç öncesi tercihlerimiz nasıl sonuçlandı?</h2>
              <ol>
                {prediction.picks.map((p) => {
                  const hit = evaluatePick(p, home, away);
                  return (
                    <li key={`${p.market}-${p.pick}`} className={hit === true ? 'is-hit' : hit === false ? 'is-miss' : ''}>
                      <div>
                        <small>{p.market}</small>
                        <b>{p.pick}</b>
                      </div>
                      {hit != null ? <span className="pred-pick-result">{hit ? '✓ Tuttu' : '✗ Tutmadı'}</span> : null}
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : null}

          {a.sections.map((s) => (
            <section key={s.heading} className="pred-section">
              <h2>{s.heading}</h2>
              {s.paragraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </section>
          ))}

          <section className="pred-section">
            <h2>Son söz</h2>
            <p>{a.closing}</p>
          </section>

          {others.length > 0 ? (
            <section className="pred-more">
              <h2>Diğer maç analizleri</h2>
              <ul>
                {others.map((x) => (
                  <li key={x.slug}>
                    <Link href={analysisUrl(x)}>
                      <b>{x.homeTeam} - {x.awayTeam}</b>
                      <span>Maç sonucu {x.finalScore.home}-{x.finalScore.away} · {istDateLong(x.kickoff)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link className="sec-link" href={ANALYSES_PATH}>Tüm maç analizleri →</Link>
            </section>
          ) : null}
        </div>
      </article>
    </>
  );
}
