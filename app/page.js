import Link from 'next/link';
import Guide from '../components/Guide';
import AppCta from '../components/AppCta';
import JsonLd from '../components/JsonLd';
import DayTabs from '../components/DayTabs';
import Standings from '../components/Standings';
import LeagueStats from '../components/LeagueStats';
import LiveNowStrip from '../components/LiveNowStrip';
import DailyShareCard from '../components/DailyShareCard';
import { channelDisplay, getFixturesInWindow, getLeagueStats, getLiveFixtures, getStandings, windowIso } from '../lib/data';
import { istDateLong, istTime, slugify } from '../lib/format';
import { SITE_URL } from '../lib/links';

export const revalidate = 60;

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

// Ana sayfanın kısa programı, günün tüm fikstürlerinin küçük bir kopyası
// değildir: ziyaretçinin ilk bakışta aradığı yüksek ilgi maçlarını gösterir.
// İsimleri slug ile karşılaştırmak API-Football yazım farklarını (ş/şs,
// Fenerbahçe/Fenerbahce vb.) güvenle tolere eder.
const TURKISH_BIG_FOUR = new Set(['galatasaray', 'fenerbahce', 'besiktas', 'trabzonspor']);
const EUROPEAN_BIG_TEAMS = new Set([
  'arsenal', 'chelsea', 'liverpool', 'manchester-city', 'manchester-united', 'tottenham', 'newcastle',
  'real-madrid', 'barcelona', 'atletico-madrid',
  'juventus', 'inter', 'inter-milan', 'ac-milan', 'milan', 'napoli', 'roma',
  'bayern-munich', 'borussia-dortmund', 'bayer-leverkusen', 'rb-leipzig',
  'paris-saint-germain', 'psg', 'olympique-marseille', 'monaco', 'lyon',
]);
const TOP_FIVE_LEAGUES = new Set(['premier_lig', 'la_liga', 'serie_a', 'bundesliga', 'ligue_1']);

function matchPreviewPriority(row) {
  const teams = [slugify(row.home_team), slugify(row.away_team)];
  if (teams.some((team) => TURKISH_BIG_FOUR.has(team))) return 0;
  if (teams.some((team) => EUROPEAN_BIG_TEAMS.has(team))) return 1;
  if (TOP_FIVE_LEAGUES.has(row.competition_key)) return 2;
  return 3;
}

function featuredPreview(rows, limit = 10) {
  return [...rows]
    .sort((a, b) => {
      const priority = matchPreviewPriority(a) - matchPreviewPriority(b);
      if (priority !== 0) return priority;
      return new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime();
    })
    .slice(0, limit);
}

function FeatureIcon({ type }) {
  const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, 'aria-hidden': true };
  if (type === 'live') return <svg {...common}><path d="M3 12h4l2.1 5.5L14 5l2.4 7H21" /><path d="M4 5.5h3M17 18.5h3" opacity=".55" /></svg>;
  if (type === 'lineup') return <svg {...common}><path d="M7 4.5 4.5 7l2.1 3.1V20h10.8v-9.9L19.5 7 17 4.5l-2.7 2H9.7L7 4.5Z" /><path d="M9.5 10h5M12 10v6" /></svg>;
  if (type === 'table') return <svg {...common}><path d="M4 4.5h16v15H4z" /><path d="M4 9.5h16M9.5 4.5v15M14.5 4.5v15" /></svg>;
  return <svg {...common}><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" /><path d="M10 21h4" /></svg>;
}

export default async function HomePage() {
  const { startIso, endIso } = windowIso(0, 1);
  const [rows, standings, leagueStats, liveRows] = await Promise.all([
    getFixturesInWindow(startIso, endIso).catch(() => []),
    getStandings('super_lig').catch(() => null),
    getLeagueStats('super_lig').catch(() => null),
    getLiveFixtures().catch(() => []),
  ]);
  const hasStandings = Array.isArray(standings?.standings) && standings.standings.length > 0;
  const hasLeagueStats = (leagueStats?.top_scorers?.length ?? 0) > 0 || (leagueStats?.top_assists?.length ?? 0) > 0;
  // Ana sayfada en fazla 10 maçlık bir önizleme — tam liste /bugun'da.
  // Dört büyükler her zaman ilk sırada; yoksa büyük Avrupa takımları ve
  // beş büyük ligin maçları öne alınır.
  const preview = featuredPreview(rows);

  return (
    <>
      <div className="hero home-hero night-match-preview">
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
      <LiveNowStrip rows={liveRows} />

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
              <Guide rows={preview} preserveGroupOrder />
              <Link className="home-all-matches" href="/bugun">
                Bugünün tüm maç programını aç →
              </Link>
              {preview[0] ? <DailyShareCard match={{ homeTeam: preview[0].home_team, awayTeam: preview[0].away_team, homeLogo: preview[0].home_logo, awayLogo: preview[0].away_logo, time: istTime(preview[0].kickoff_at), channel: channelDisplay(preview[0]) }} /> : null}
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
              <div className="fi"><FeatureIcon type="live" /></div>
              <h3>Canlı Skor</h3>
              <p>Dakika dakika skor ve maç durumu, sayfa yenilemeden.</p>
            </div>
            <div className="feature">
              <div className="fi"><FeatureIcon type="lineup" /></div>
              <h3>İlk 11&apos;ler</h3>
              <p>Resmi kadrolar açıklanır açıklanmaz burada.</p>
            </div>
            <div className="feature">
              <div className="fi"><FeatureIcon type="table" /></div>
              <h3>Puan Durumu</h3>
              <p>Süper Lig ve 5 büyük Avrupa liginde güncel tablo.</p>
            </div>
            <div className="feature">
              <div className="fi"><FeatureIcon type="notification" /></div>
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
