'use client';

import { useCallback, useEffect, useState } from 'react';

// Maç sayfasındaki yorum bölümü (2026-11-02). Takma ad zorunlu; küfür/argo,
// bağlantı ve spam denetimi veritabanında (supabase/site_match_comments.sql),
// buradaki mesajlar yalnızca o denetimin sonucunu ziyaretçiye açıklıyor.

const NICK_KEY = 'tvsporrehberi:comment-nickname';
const BODY_MAX = 500;
const NICK_MAX = 24;
const LIVE_REFRESH_MS = 45000;

const ERRORS = {
  nickname_length: 'Takma ad 2 ile 24 karakter arasında olmalı.',
  body_length: 'Yorum 2 ile 500 karakter arasında olmalı.',
  nickname_profanity: 'Takma adında uygun olmayan bir ifade var, lütfen değiştir.',
  profanity: 'Yorumunda küfür, hakaret veya argo bir ifade var; bu yüzden yayınlanmadı. Lütfen düzenleyip tekrar dene.',
  link: 'Yorumlarda bağlantı (link) paylaşılamıyor.',
  too_fast: 'Biraz yavaşla: iki yorum arasında en az 30 saniye olmalı.',
  too_many: 'Kısa sürede çok fazla yorum gönderdin, birkaç dakika sonra tekrar dene.',
  busy: 'Şu an bu maça çok yorum geliyor, birazdan tekrar dene.',
  duplicate: 'Bu yorum zaten gönderilmiş.',
  match: 'Bu maç için yorum gönderilemiyor.',
};

function relativeTime(iso) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'az önce';
  if (min < 60) return `${min} dk önce`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} sa önce`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} gün önce`;
  return new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', day: 'numeric', month: 'long' }).format(new Date(iso));
}

// Takma addan sabit bir renk tonu — aynı kişi her yorumda aynı renkte görünür.
function avatarHue(name) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)) % 360;
  return h;
}

export default function MatchComments({ matchKey, title, isLive = false }) {
  const [comments, setComments] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [nickname, setNickname] = useState('');
  const [body, setBody] = useState('');
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);
  const [reported, setReported] = useState(() => new Set());

  const load = useCallback(async (before) => {
    try {
      const res = await fetch(`/api/comments?match=${encodeURIComponent(matchKey)}${before ? `&before=${before}` : ''}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'unavailable');
      setUnavailable(false);
      setHasMore(Boolean(data.hasMore));
      setComments((current) => {
        if (before) return [...current, ...data.comments];
        // Yenilemede eski sayfaları koru, yalnızca yenileri başa ekle.
        const known = new Set(current.map((c) => c.id));
        const fresh = data.comments.filter((c) => !known.has(c.id));
        return current.length === 0 ? data.comments : [...fresh, ...current];
      });
    } catch {
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, [matchKey]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(NICK_KEY);
      if (saved) setNickname(saved);
    } catch {
      // localStorage kapalı olabilir — takma ad her seferinde yazılır.
    }
    load();
  }, [load]);

  useEffect(() => {
    if (!isLive) return undefined;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, LIVE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [isLive, load]);

  async function submit(event) {
    event.preventDefault();
    const nick = nickname.trim();
    const text = body.trim();
    if (nick.length < 2) {
      setMessage({ type: 'error', text: 'Yorum yazmak için önce bir takma ad gir.' });
      return;
    }
    if (text.length < 2) {
      setMessage({ type: 'error', text: 'Yorum kutusu boş olamaz.' });
      return;
    }
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match: matchKey, nickname: nick, body: text, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.ok) {
        if (data.comment) setComments((current) => [data.comment, ...current]);
        setBody('');
        setMessage({ type: 'ok', text: 'Yorumun yayınlandı.' });
        try {
          window.localStorage.setItem(NICK_KEY, nick);
        } catch {
          // önemli değil
        }
      } else {
        setMessage({ type: 'error', text: ERRORS[data?.error] ?? 'Yorum şu an gönderilemedi, birazdan tekrar dene.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Bağlantı sorunu: yorum gönderilemedi.' });
    } finally {
      setSending(false);
    }
  }

  async function report(id) {
    setReported((current) => new Set(current).add(id));
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'report', id }),
      });
    } catch {
      // Bildirim başarısız olsa da kullanıcıya tekrar sormuyoruz.
    }
  }

  return (
    <div className="comments" id="yorumlar">
      <div className="comments-head">
        <h2>Maç yorumları</h2>
        <span>{loading ? '' : `${comments.length}${hasMore ? '+' : ''} yorum`}</span>
      </div>
      <p className="comments-sub">{title} hakkında ne düşünüyorsun? Takma adınla yorumunu paylaş.</p>

      <form className="comments-form" onSubmit={submit} noValidate>
        <label className="comments-field">
          <span>Takma ad <b>*</b></span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={NICK_MAX}
            placeholder="Örn. SarıKanarya1907"
            autoComplete="nickname"
            required
          />
        </label>
        <label className="comments-field">
          <span>Yorumun</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={BODY_MAX}
            rows={3}
            placeholder="Maç hakkındaki düşüncen, tahminin…"
            required
          />
        </label>
        <input
          className="comments-hp"
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <div className="comments-form-foot">
          <small>Küfür, hakaret, argo ve bağlantı içeren yorumlar yayınlanmaz. {body.length}/{BODY_MAX}</small>
          <button type="submit" disabled={sending}>{sending ? 'Gönderiliyor…' : 'Yorumu gönder'}</button>
        </div>
        {message ? <p className={`comments-msg ${message.type}`} role="status">{message.text}</p> : null}
      </form>

      {unavailable && comments.length === 0 ? (
        <p className="comments-empty">Yorumlar şu an yüklenemedi, sayfayı yenileyip tekrar dene.</p>
      ) : !loading && comments.length === 0 ? (
        <p className="comments-empty">Henüz yorum yok. İlk yorumu sen yaz!</p>
      ) : (
        <ul className="comments-list">
          {comments.map((c) => (
            <li key={c.id}>
              <span className="comments-avatar" style={{ '--avatar-hue': avatarHue(c.nickname) }} aria-hidden="true">
                {c.nickname.slice(0, 1).toLocaleUpperCase('tr')}
              </span>
              <div className="comments-bubble">
                <div className="comments-meta">
                  <b>{c.nickname}</b>
                  <time dateTime={c.created_at}>{relativeTime(c.created_at)}</time>
                  <button type="button" className="comments-report" onClick={() => report(c.id)} disabled={reported.has(c.id)}>
                    {reported.has(c.id) ? 'Bildirildi' : 'Bildir'}
                  </button>
                </div>
                <p>{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {hasMore ? (
        <button type="button" className="comments-more" onClick={() => load(comments[comments.length - 1]?.id)}>
          Daha eski yorumlar
        </button>
      ) : null}
    </div>
  );
}
