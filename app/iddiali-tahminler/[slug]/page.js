import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '../../../components/JsonLd';
import { channelDisplay, getFixtureByMatchSlug, matchStatus } from '../../../lib/data';
import { competitionLabel, competitionSlug } from '../../../lib/competitions';
import { istDateLong, istTime } from '../../../lib/format';
import { SITE_URL } from '../../../lib/links';
import { roundText } from '../../../lib/rounds';
import {
  PREDICTIONS_PATH,
  allPredictions,
  evaluatePick,
  getPrediction,
  isUpcoming,
  predictionUrl,
  readingMinutes,
} from '../../../lib/predictions';

// Tek bir "İddialı Tahminler" yazısı. Metin derlemede sabit (statik sayfa,
// hızlı); maç bilgisi (logo, canlı/biten skor) 10 dakikada bir tazelenir —
// maç bitince "tahmin tuttu mu?" kutusu kendiliğinden çıkar.
export const revalidate = 600;
export const dynamicParams = false;

export function generateStaticParams() {
  return allPredictions().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getPrediction(slug);
  if (!article) return { title: 'Tahmin bulunamadı' };
  const url = `${SITE_URL}${predictionUrl(article)}`;
  return {
    title: { absolute: article.seoTitle },
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: article.title,
      description: article.description,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      section: 'İddialı Tahminler',
      tags: [article.homeTeam, article.awayTeam, 'maç tahmini', 'iddaa tahmini'],
    },
    twitter: { card: 'summary_large_image', title: article.title, description: article.description },
  };
}

function ScoreCard({ article, row, status }) {
  const finished = (status === 'finished' || status === 'finished_unknown') && row?.home_score != null;
  const live = status === 'live' && row?.home_score != null;
  const { home, away } = article.scorePrediction;
  const exact = finished && row.home_score === home && row.away_score === away;
  return (
    <div className="pred-score">
      <div className="pred-score-team">
        {row?.home_logo ? <img src={row.home_logo} alt="" width="56" height="56" /> : null}
        <span>{article.homeTeam}</span>
      </div>
      <div className="pred-score-center">
        <small>Skor tahminim</small>
        <strong>{home} - {away}</strong>
        {finished ? (
          <em className={exact ? 'is-hit' : ''}>Maç sonucu {row.home_score}-{row.away_score}{exact ? ' · tam isabet' : ''}</em>
        ) : live ? (
          <em className="is-live">● Canlı {row.elapsed != null ? `${row.elapsed}'` : ''} · {row.home_score}-{row.away_score}</em>
        ) : (
          <em>{istDateLong(article.kickoff)} · {istTime(article.kickoff)} TSİ</em>
        )}
      </div>
      <div className="pred-score-team">
        {row?.away_logo ? <img src={row.away_logo} alt="" width="56" height="56" /> : null}
        <span>{article.awayTeam}</span>
      </div>
    </div>
  );
}

export default async function PredictionArticlePage({ params }) {
  const { slug } = await params;
  const article = getPrediction(slug);
  if (!article) notFound();

  let row = null;
  try {
    row = await getFixtureByMatchSlug(article.matchSlug);
  } catch {
    row = null;
  }
  const status = row ? matchStatus(row) : null;
  const finished = (status === 'finished' || status === 'finished_unknown') && row?.home_score != null;
  const channel = row ? channelDisplay(row) : article.channel;
  const round = roundText(article.round);
  const url = `${SITE_URL}${predictionUrl(article)}`;
  const others = allPredictions()
    .filter((a) => a.slug !== article.slug)
    .sort((a, b) => Number(isUpcoming(b)) - Number(isUpcoming(a)) || new Date(b.kickoff) - new Date(a.kickoff))
    .slice(0, 4);

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: [`${url}/opengraph-image`],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    inLanguage: 'tr-TR',
    articleSection: 'İddialı Tahminler',
    keywords: (article.keywords ?? []).join(', '),
    author: { '@type': 'Organization', name: 'TV Spor Rehberi', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'TV Spor Rehberi', url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    about: {
      '@type': 'SportsEvent',
      name: `${article.homeTeam} - ${article.awayTeam}`,
      startDate: article.kickoff,
      sport: 'Futbol',
      homeTeam: { '@type': 'SportsTeam', name: article.homeTeam },
      awayTeam: { '@type': 'SportsTeam', name: article.awayTeam },
      url: `${SITE_URL}/mac/${article.matchSlug}`,
    },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'İddialı Tahminler', item: `${SITE_URL}${PREDICTIONS_PATH}` },
      { '@type': 'ListItem', position: 3, name: `${article.homeTeam} - ${article.awayTeam} Maç Tahmini`, item: url },
    ],
  };

  const [firstSentence, ...restIntro] = article.intro.split(/(?<=\.)\s/);

  return (
    <>
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbLd} />
      <div className="crumb wrap">
        <Link href="/">Ana Sayfa</Link> › <Link href={PREDICTIONS_PATH}>İddialı Tahminler</Link> › {article.homeTeam} - {article.awayTeam}
      </div>

      <article className="pred-article">
        <div className="wrap pred-wrap">
          <div className="eyebrow">
            <Link href={`/lig/${competitionSlug(article.competition)}`}>{competitionLabel(article.competition)}</Link>
            {round ? ` · ${round}` : ''}
          </div>
          <h1 className="pred-title">{article.title}</h1>
          <div className="pred-byline">
            <span>{article.author}</span>
            <span>·</span>
            <time dateTime={article.publishedAt}>
              {istDateLong(article.publishedAt)} {istTime(article.publishedAt)}
            </time>
            <span>·</span>
            <span>{readingMinutes(article)} dk okuma</span>
          </div>

          <ScoreCard article={article} row={row} status={status} />

          <div className="pred-matchinfo">
            <span>📅 {istDateLong(article.kickoff)}</span>
            <span>⏰ {istTime(article.kickoff)} (TSİ)</span>
            {channel ? <span>📺 {channel}</span> : null}
            <Link href={`/mac/${article.matchSlug}`}>Maç sayfası, kadrolar ve canlı skor →</Link>
          </div>

          <p className="pred-intro">
            <strong>{firstSentence}</strong> {restIntro.join(' ')}
          </p>

          <section className="pred-picks" aria-labelledby="tercihler">
            <h2 id="tercihler">İddaa tercihlerim</h2>
            <ol>
              {article.picks.map((p) => {
                const hit = finished ? evaluatePick(p, row.home_score, row.away_score) : null;
                return (
                  <li key={`${p.market}-${p.pick}`} className={hit === true ? 'is-hit' : hit === false ? 'is-miss' : ''}>
                    <div>
                      <small>{p.market}</small>
                      <b>{p.pick}</b>
                    </div>
                    {p.note ? <p>{p.note}</p> : null}
                    {hit != null ? <span className="pred-pick-result">{hit ? '✓ Tuttu' : '✗ Tutmadı'}</span> : null}
                  </li>
                );
              })}
            </ol>
          </section>

          {article.sections.map((s) => (
            <section key={s.heading} className="pred-section">
              <h2>{s.heading}</h2>
              {s.paragraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </section>
          ))}

          <section className="pred-section">
            <h2>Son söz</h2>
            <p>{article.closing}</p>
          </section>

          <p className="pred-disclaimer">
            Bu yazı maç öncesi bir yorumdur; sonuç garantisi vermez. Bahis oynamak 18 yaşından küçükler için yasaktır,
            yalnızca yasal yollardan ve bütçeni aşmadan oyna.
          </p>

          {others.length > 0 ? (
            <section className="pred-more">
              <h2>Diğer iddialı tahminler</h2>
              <ul>
                {others.map((a) => (
                  <li key={a.slug}>
                    <Link href={predictionUrl(a)}>
                      <b>{a.homeTeam} - {a.awayTeam}</b>
                      <span>Skor tahmini {a.scorePrediction.home}-{a.scorePrediction.away} · {istDateLong(a.kickoff)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link className="sec-link" href={PREDICTIONS_PATH}>Tüm tahminler →</Link>
            </section>
          ) : null}
        </div>
      </article>
    </>
  );
}
