'use client';

import { useEffect, useRef, useState } from 'react';
import Guide from './Guide';

const POLL_MS = 25000;

// /canli sayfası için: ilk render sunucu tarafında (SEO/hızlı ilk boya) gelir,
// bu bileşen sonra periyodik olarak /api/live'dan tazeliyor — sayfa yenileme
// yok. Sadece BU sayfada polling var (kullanıcı isteği: "canlı skor sayfası
// hariç gereksiz polling yapma").
export default function LiveGuide({ initialRows }) {
  const [rows, setRows] = useState(initialRows);
  const [updatedAt, setUpdatedAt] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    async function tick() {
      try {
        const res = await fetch('/api/live', { cache: 'no-store' });
        const json = await res.json();
        setRows(json.rows ?? []);
        setUpdatedAt(new Date());
      } catch {
        // Bir sonraki tick'te tekrar denenir — sessizce geç.
      }
    }
    timerRef.current = setInterval(tick, POLL_MS);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <>
      {rows.length === 0 ? (
        <div className="guide">
          <div className="empty-note">
            Şu anda canlı maç yok. ⚽
            <br />
            <a href="/bugun" className="sec-link" style={{ display: 'inline-block', marginTop: 10 }}>
              Bugünün maç programına göz at →
            </a>
          </div>
        </div>
      ) : (
        <Guide rows={rows} />
      )}
      <div className="live-refresh-note">
        {updatedAt ? `Son güncelleme: ${updatedAt.toLocaleTimeString('tr-TR')}` : 'Skorlar otomatik güncellenir.'}
      </div>
    </>
  );
}
