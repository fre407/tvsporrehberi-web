import Link from 'next/link';
import Guide from '../components/Guide';
import AppCta from '../components/AppCta';
import JsonLd from '../components/JsonLd';
import DayTabs from '../components/DayTabs';
import Standings from '../components/Standings';
import LeagueStats from '../components/LeagueStats';
import { getFixturesInWindow, getLeagueStats, getStandings, windowIso } from '../lib/data';
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
  const [rows, standings, leagueStats] = await Promise.all([
    getFixturesInWindow(startIso, endIso).catch(() => []),
    getStandings('super_lig').catch(() => null),
    getLeagueStats('super_lig').catch(() => null),
  ]);
  const hasStandings = Array.isArray(standings?.standings) && standings.standings.length > 0;
  const hasLeagueStats = (leagueStats?.top_scorers?.length ?? 0) > 0 || (leagueStats?.top_assists?.length ?? 0) > 0;
  // Ana sayfada en fazla 10 maçlık bir önizleme — tam liste /bugun'da.
  const preview = rows.slice(0, 10);

  return (
    <>
      <div className="hero home-hero">
        <div className="wrap">
          <div className="home-hero-grid">
            <div>
              <div className="eyebrow">Canlı yayın rehberi</div>
              <h1>
                Hangi maç,
                <br />
                hangi <em>kanalda</em>, kaçta?
              </h1>
              <p className="page-desc">
                Günün maçlarını, yayıncı kanallarını ve canlı skorları tek yerde takip et.
              </p>
            </div>
            <div className="home-hero-note">
              <span className="home-hero-note-label">BUGÜN</span>
              <strong>{istDateLong(new Date().toISOString())}</strong>
              <span>Maç programını lig lig incele, aradığın karşılaşmayı saniyeler içinde bul.</span>
            </div>
          </div>
        </div>
      </div>

      <section className="home-guide-section">
        <div className="wrap">
          <DayTabs activeOffset={0} />
          <div className="home-content-grid">
            <div className="home-main-column">
              <div className="sec-head home-guide-heading">
                <div>
                  <div className="sec-title">
                    Bugünün <span>Maçları</span>
                  </div>
                  <div className="sec-sub">Saat, kanal ve canlı skor bilgisiyle</div>
                </div>
                <Link className="sec-link" href="/bugun">
                  Tüm program →
                </Link>
              </div>
              <Guide rows={preview} />
              <Link className="home-all-matches" href="/bugun">
                Bugünün tüm maç programını aç →
              </Link>
            </div>

            <aside className="home-sidebar" aria-label="Süper Lig özeti">
              <div className="sidebar-card">
                <div className="sidebar-card-head">
                  <div>
                    <span className="sidebar-kicker">TRENDYOL SÜPER LİG</span>
                    <h2>Puan Durumu</h2>
                  </div>
                  <span className="sidebar-flag" aria-hidden="true">🇹🇷</span>
                </div>
                {hasStandings ? <Standings data={standings} limit={8} /> : <div className="sidebar-empty">Puan durumu yakında güncellenecek.</div>}
                <Link className="sidebar-link" href="/lig/super-lig">
                  Tüm puan durumunu gör →
                </Link>
              </div>

              <div className="sidebar-card">
                <div className="sidebar-card-head">
                  <div>
                    <span className="sidebar-kicker">TRENDYOL SÜPER LİG</span>
                    <h2>Gol &amp; Asist</h2>
                  </div>
                  <span className="sidebar-flag" aria-hidden="true">⚽</span>
                </div>
                {hasLeagueStats ? <LeagueStats data={leagueStats} limit={5} /> : <div className="sidebar-empty">Liderlik verileri yakında güncellenecek.</div>}
                <Link className="sidebar-link" href="/lig/super-lig">
                  Tüm istatistikleri gör →
                </Link>
              </div>
            </aside>
          </div>
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
