'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function SearchBox() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleChange(value) {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value.trim())}`);
        const json = await res.json();
        setResults(json);
      } catch {
        setResults({ teams: [], leagues: [], matches: [] });
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  const hasResults = results && (results.teams.length || results.leagues.length || results.matches.length);

  return (
    <div className="searchbox" ref={boxRef}>
      <span className="searchbox-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        type="text"
        placeholder="Takım, lig veya maç ara…"
        value={q}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setOpen(true)}
        aria-label="Site içinde ara"
      />
      {open && q.trim().length >= 2 ? (
        <div className="searchbox-panel">
          {loading ? <div className="searchbox-empty">Aranıyor…</div> : null}
          {!loading && !hasResults ? <div className="searchbox-empty">Sonuç bulunamadı.</div> : null}
          {!loading && results?.teams.length ? (
            <div className="searchbox-group">
              <div className="searchbox-group-label">Takımlar</div>
              {results.teams.map((t) => (
                <Link key={t.href} href={t.href} className="searchbox-item" onClick={() => setOpen(false)}>
                  {t.name}
                </Link>
              ))}
            </div>
          ) : null}
          {!loading && results?.leagues.length ? (
            <div className="searchbox-group">
              <div className="searchbox-group-label">Ligler</div>
              {results.leagues.map((l) => (
                <Link key={l.href} href={l.href} className="searchbox-item" onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              ))}
            </div>
          ) : null}
          {!loading && results?.matches.length ? (
            <div className="searchbox-group">
              <div className="searchbox-group-label">Yaklaşan Maçlar</div>
              {results.matches.map((m) => (
                <Link key={m.href} href={m.href} className="searchbox-item" onClick={() => setOpen(false)}>
                  <span>{m.label}</span>
                  <span className="searchbox-item-time">{m.time}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
