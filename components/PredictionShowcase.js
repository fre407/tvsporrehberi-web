'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { competitionLabel } from '../lib/competitions';
import { istDateLong, istTime } from '../lib/format';

// Ana sayfadaki "İddialı Tahminler" kutusu: en yakın tarihteki tahmin
// yazısının TAMAMI. Aynı güne birden fazla büyük maç denk gelirse yazılar
// yan yana durur; ok düğmeleri, noktalar ya da parmakla kaydırarak geçilir.

function Slide({ article }) {
  const { home, away } = article.scorePrediction;
  const [firstSentence, ...rest] = article.intro.split(/(?<=\.)\s/);
  return (
    <article className="showcase-slide">
      <div className="showcase-meta">
        <span>{competitionLabel(article.competition)}</span>
        <span>{istDateLong(article.kickoff)} · {istTime(article.kickoff)} TSİ</span>
        {article.channel ? <span>📺 {article.channel}</span> : null}
      </div>
      <h3 className="showcase-title">
        <Link href={`/iddiali-tahminler/${article.slug}`}>{article.title}</Link>
      </h3>
      <div className="showcase-score">
        <span>{article.homeTeam}</span>
        <strong>{home} - {away}</strong>
        <span>{article.awayTeam}</span>
      </div>
      <p className="showcase-intro"><strong>{firstSentence}</strong> {rest.join(' ')}</p>
      <ul className="showcase-picks" aria-label="İddaa tercihleri">
        {article.picks.map((p) => (
          <li key={`${p.market}-${p.pick}`}><small>{p.market}</small><b>{p.pick}</b></li>
        ))}
      </ul>
      {article.sections.map((s) => (
        <div key={s.heading} className="showcase-section">
          <h4>{s.heading}</h4>
          {s.paragraphs.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
        </div>
      ))}
      <div className="showcase-section">
        <h4>Son söz</h4>
        <p>{article.closing}</p>
      </div>
      <Link className="showcase-link" href={`/iddiali-tahminler/${article.slug}`}>Yazının sayfasını aç →</Link>
    </article>
  );
}

export default function PredictionShowcase({ items }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const many = items.length > 1;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !many) return undefined;
    const onScroll = () => setActive(Math.round(track.scrollLeft / track.clientWidth));
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [many]);

  // Seçili maçın sekmesi şeridin dışında kalmasın (telefonda sekmeler taşar).
  // Yalnızca şerit yatay kaydırılıyor; scrollIntoView sayfayı da dikey
  // kaydırabileceği için kullanılmıyor.
  useEffect(() => {
    if (!many) return;
    const strip = trackRef.current?.parentElement?.querySelector('.showcase-tabs');
    const tab = strip?.querySelectorAll('button')[active];
    if (!strip || !tab) return;
    strip.scrollTo({ left: tab.offsetLeft - strip.offsetLeft - (strip.clientWidth - tab.clientWidth) / 2, behavior: 'smooth' });
  }, [active, many]);

  function go(index) {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.max(0, Math.min(items.length - 1, index));
    track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
    setActive(next);
  }

  if (!items?.length) return null;

  return (
    <section className="showcase" aria-label="İddialı Tahminler">
      <div className="wrap">
        <div className="showcase-head">
          <div>
            <div className="showcase-kicker">⚡ İDDİALI TAHMİNLER</div>
            <h2>{many ? 'Günün büyük maçlarının tahminleri' : 'Sıradaki büyük maçın tahmini'}</h2>
          </div>
          <Link className="sec-link" href="/iddiali-tahminler">Tüm tahminler →</Link>
        </div>

        {many ? (
          <div className="showcase-nav">
            <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Önceki tahmin">‹</button>
            <div className="showcase-tabs" role="tablist">
              {items.map((a, i) => (
                <button
                  key={a.slug}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  className={i === active ? 'is-active' : ''}
                  onClick={() => go(i)}
                >
                  {a.homeTeam} - {a.awayTeam}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => go(active + 1)} disabled={active === items.length - 1} aria-label="Sonraki tahmin">›</button>
          </div>
        ) : null}
        {many ? <p className="showcase-hint">👉 Sağa-sola kaydırarak diğer maçın tahminini görebilirsin</p> : null}

        <div className={`showcase-track${many ? ' is-many' : ''}`} ref={trackRef}>
          {items.map((a) => <Slide key={a.slug} article={a} />)}
        </div>
      </div>
    </section>
  );
}
