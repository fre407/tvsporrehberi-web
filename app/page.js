import Link from 'next/link';
import Guide from '../components/Guide';
import AppCta from '../components/AppCta';
import JsonLd from '../components/JsonLd';
import { getFixturesInWindow, windowIso } from '../lib/data';
import { istDateLong } from '../lib/format';
import { SITE_URL } from '../lib/links';

export const revalidate = 300; // 5 dakikada bir yeniden oluştur (ISR) — canlı skor/kanal bilgisi tazeliği için

// Ana sayfada canonical YOKTU (diğer tüm sayfalarda vardı). Bu, sitenin
// birden fazla adresten (www'lu/www'suz, ?utm_source=... eklenmiş linkler,
// eski *.vercel.app adresi) erişilebildiği durumlarda Google'ın hangisini
// "asıl" sayacağını kendi tahminine bırakıyordu.
export const metadata = {
  alternates: { canonical: `${SITE_URL}/` },
};

const FAQ = [
  {
    q: 'TV Spor Rehberi nedir?',
    a: 'Süper Lig, Şampiyonlar Ligi ve Avrupa’nın büyük liglerindeki maçların hangi kanalda, saat kaçta yayınlandığını ve canlı skorlarını tek yerde topladığımız ücretsiz bir yayın rehberidir.',
  },
  {
    q: 'Yayın kanalı bilgileri ne sıklıkla güncelleniyor?',
    a: 'Maç programı ve kanal bilgileri düzenli aralıklarla otomatik olarak tazelenir; bir değişiklik olduğunda site de kısa süre içinde güncellenir.',
  },
  {
    q: 'Canlı skorlar gerçek zamanlı mı?',
    a: 'Canlı Skorlar sayfası, oynanan maçların skorunu ve dakikasını sayfa yenilenmeden otomatik olarak periyodik biçimde günceller.',
  },
  {
    q: 'Hangi ligler ve turnuvalar yer alıyor?',
    a: 'Trendyol Süper Lig başta olmak üzere Premier Lig, LaLiga, Serie A, Bundesliga, Ligue 1, Şampiyonlar Ligi, Avrupa Ligi, Konferans Ligi ve daha fazlası kapsanıyor.',
  },
  {
    q: 'TV Spor Rehberi mobil uygulamasını nereden indirebilirim?',
    a: 'Uygulamayı Google Play Store üzerinden ücretsiz indirebilir, favori takımın için maç bildirimlerini açabilirsin.',
  },
];

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

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

      <section>
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-title">
              Sıkça Sorulan <span>Sorular</span>
            </div>
          </div>
          <div className="faq-list">
            {FAQ.map((item) => (
              <details className="faq-item" key={item.q}>
                <summary className="faq-q">{item.q}</summary>
                <p className="faq-a">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <JsonLd data={FAQ_JSON_LD} />

      <AppCta campaign="homepage" />
    </>
  );
}
