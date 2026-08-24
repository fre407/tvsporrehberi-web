import Link from 'next/link';
import Guide from '../components/Guide';
import AppCta from '../components/AppCta';
import { getFixturesInWindow, windowIso } from '../lib/data';
import { istDateLong } from '../lib/format';

export const revalidate = 300; // 5 dakikada bir yeniden oluştur (ISR) — canlı skor/kanal bilgisi tazeliği için

export default async function HomePage() {
  const { startIso, endIso } = windowIso(0, 1);
  let rows = [];
  try {
    rows = await getFixturesInWindow(startIso, endIso);
  } catch {
    rows = [];
  }
  // Ana sayfada en fazla 10 maçlık bir önizleme — tam liste /bugun'da.
  const preview = rows.slice(0, 10);

  return (
    <>
      <div className="hero">
        <div className="wrap">
          <div className="eyebrow">Canlı yayın rehberi</div>
          <h1>
            Hangi maç,
            <br />
            hangi <em>kanalda</em>, kaçta?
          </h1>
          <p className="page-desc">
            Trendyol Süper Lig&apos;den UEFA Şampiyonlar Ligi&apos;ne, İngiltere Premier Lig&apos;den
            İspanya LaLiga&apos;ya — günün tüm maçlarını saatiyle ve yayıncı kanalıyla tek sayfada
            topladık.
          </p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="sec-title">
                Yaklaşan <span>Maçlar</span>
              </div>
              <div className="sec-sub">{istDateLong(new Date().toISOString())}</div>
            </div>
            <Link className="sec-link" href="/bugun">
              Bugünün tüm maçları →
            </Link>
          </div>
          <Guide rows={preview} />
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="sec-title">
                Sadece yayın rehberi <span>değil</span>
              </div>
              <div className="sec-sub">Uygulamadaki her şey web&apos;de de seninle</div>
            </div>
          </div>
          <div className="feature-grid">
            <div className="feature">
              <div className="fi">⚡</div>
              <h3>Canlı Skor</h3>
              <p>Dakika dakika skor ve maç durumu, sayfa yenilemeden.</p>
            </div>
            <div className="feature">
              <div className="fi">👕</div>
              <h3>İlk 11&apos;ler</h3>
              <p>Resmi kadrolar açıklanır açıklanmaz burada.</p>
            </div>
            <div className="feature">
              <div className="fi">📊</div>
              <h3>Puan Durumu</h3>
              <p>Süper Lig ve 5 büyük Avrupa liginde güncel tablo.</p>
            </div>
            <div className="feature">
              <div className="fi">🔔</div>
              <h3>Maç Bildirimleri</h3>
              <p>Favori takımının maçını uygulamadan anında öğren.</p>
            </div>
          </div>
        </div>
      </section>

      <AppCta campaign="homepage" />
    </>
  );
}
