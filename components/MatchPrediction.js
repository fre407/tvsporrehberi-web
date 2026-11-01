'use client';

import { useEffect, useState } from 'react';

// "Kim kazanır?" tahmin anketi (2026-11-02). Maç başlamadan oy verilir ve
// değiştirilebilir; maç başlayınca anket kapanır, yalnızca sonuçlar görünür.
// Maç bitince, skor biliniyorsa "doğru tahmin edenler" oranı da gösterilir.

const VOTE_KEY = (matchKey) => `tvsporrehberi:tahmin:${matchKey}`;

function percent(part, total) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

export default function MatchPrediction({ matchKey, homeTeam, awayTeam, isOpen, result = null }) {
  const [counts, setCounts] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setMyVote(window.localStorage.getItem(VOTE_KEY(matchKey)));
    } catch {
      // localStorage kapalı — oy yine de sunucuda sayılır.
    }
    fetch(`/api/predictions?match=${encodeURIComponent(matchKey)}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCounts(data?.counts ?? null))
      .catch(() => setCounts(null));
  }, [matchKey]);

  async function vote(choice) {
    if (!isOpen || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match: matchKey, choice }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.ok) {
        setCounts(data.counts);
        setMyVote(choice);
        try {
          window.localStorage.setItem(VOTE_KEY(matchKey), choice);
        } catch {
          // önemli değil
        }
      } else {
        setError(data?.error === 'busy' ? 'Şu an çok oy geliyor, birazdan tekrar dene.' : 'Oyun kaydedilemedi, birazdan tekrar dene.');
      }
    } catch {
      setError('Bağlantı sorunu: oyun kaydedilemedi.');
    } finally {
      setSending(false);
    }
  }

  const options = [
    { key: '1', label: homeTeam, sub: 'kazanır' },
    { key: 'X', label: 'Beraberlik', sub: '' },
    { key: '2', label: awayTeam, sub: 'kazanır' },
  ];
  const total = counts ? counts.home + counts.draw + counts.away : 0;
  const valueOf = { 1: counts?.home ?? 0, X: counts?.draw ?? 0, 2: counts?.away ?? 0 };
  const showResults = Boolean(myVote) || !isOpen;

  return (
    <div className="prediction">
      <div className="prediction-head">
        <h2>Kim kazanır?</h2>
        <span>
          {!isOpen ? 'Tahminler kapandı · ' : ''}
          {total > 0 ? `${total} oy` : isOpen ? 'İlk tahmini sen yap' : 'Tahmin yapılmadı'}
        </span>
      </div>
      <div className="prediction-options" role="group" aria-label="Maç sonucu tahmini">
        {options.map((o) => {
          const pct = percent(valueOf[o.key], total);
          const picked = myVote === o.key;
          const correct = result === o.key;
          return (
            <button
              key={o.key}
              type="button"
              className={`prediction-option${picked ? ' is-picked' : ''}${correct ? ' is-correct' : ''}`}
              onClick={() => vote(o.key)}
              disabled={!isOpen || sending}
              aria-pressed={picked}
            >
              {showResults ? <span className="prediction-bar" style={{ width: `${pct}%` }} aria-hidden="true" /> : null}
              <span className="prediction-label">
                <b>{o.label}</b>
                {o.sub ? <small>{o.sub}</small> : null}
              </span>
              {showResults ? <strong>%{pct}</strong> : null}
            </button>
          );
        })}
      </div>
      {error ? <p className="prediction-note error">{error}</p> : null}
      {result && total > 0 ? (
        <p className="prediction-note">
          Ziyaretçilerin %{percent(valueOf[result], total)} kadarı sonucu doğru tahmin etti{myVote ? (myVote === result ? ' — sen de bildin!' : '.') : '.'}
        </p>
      ) : isOpen && myVote ? (
        <p className="prediction-note">Tahminin kaydedildi. Maç başlayana kadar değiştirebilirsin.</p>
      ) : null}
    </div>
  );
}
