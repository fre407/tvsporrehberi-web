import Link from 'next/link';
import AppCta from '../../components/AppCta';
import JsonLd from '../../components/JsonLd';
import { getFixturesInWindow, topBroadcasters, windowIso } from '../../lib/data';
import { competitionFlag, competitionLabel, competitionSlug, MAJOR_COMPETITION_KEYS } from '../../lib/competitions';
import { SITE_URL } from '../../lib/links';

export const revalidate = 3600;

// "Şampiyonlar Ligi hangi kanalda", "Premier Lig hangi kanalda" gibi
// sezon boyu sürekli aranan sorguların cevap sayfası. Yayıncılar ELLE
// YAZILMIYOR: son 7 gün + önümüzdeki 30 günün gerçek fikstür/kanal
// verisinden sayılıyor (bkz. lib/data.js topBroadcasters). Böylece sezon
// ortasında bir hak değişse bile sayfa kendiliğinden doğru kalır ve
// uydurma bir iddia içermez.
const DAYS_BACK = 7;
const DAYS_FORWARD = 30;

function seasonLabel() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const start = now.getUTCMonth() >= 6 ? year : year - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}

export async function generateMetadata() {
  const season = seasonLabel();
  return {
    title: `Hangi Lig Hangi Kanalda? ${season} Futbol Yayın Rehberi`,
    description: `Süper Lig, Şampiyonlar Ligi, Premier Lig, LaLiga, Serie A ve Bundesliga ${season} sezonunda Türkiye'de hangi kanalda? Güncel maç verisine göre yayıncılar.`,
    alternates: { canonical: `${SITE_URL}/yayin-haklari` },
  };
}

export default async function BroadcastRightsPage() {
  const season = seasonLabel();
  const { startIso, endIso } = windowIso(DAYS_BACK, DAYS_FORWARD);
  let rows = [];
  try {
    rows = await getFixturesInWindow(startIso, endIso);
  } catch {
    rows = [];
  }

  const now = Date.now();
  const competitions = MAJOR_COMPETITION_KEYS.map((key) => {
    const leagueRows = rows.filter((r) => r.competition_key === key);
    return {
      key,
      total: leagueRows.length,
      upcoming: leagueRows.filter((r) => new Date(r.kickoff_at).getTime() > now).length,
      broadcasters: topBroadcasters(leagueRows, 4),
    };
  }).filter((c) => c.total > 0);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Hangi Lig Hangi Kanalda?', item: `${SITE_URL}/yayin-haklari` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <div className="crumb wrap">
        <Link href="/">Ana Sayfa</Link> › Hangi Lig Hangi Kanalda?
      </div>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">{season} sezonu yayın rehberi</div>
          <h1>Hangi lig <em>hangi kanalda?</em></h1>
          <p className="page-desc">
            Türkiye&apos;de futbol yayınları birden fazla kanal ve dijital platforma dağılmış durumda: bir ligin
            maçları çoğunlukla tek bir yayıncıda olsa da bazı karşılaşmalar farklı bir kanalda ya da yalnızca
            internet platformunda yayınlanabiliyor. Bu sayfa, son {DAYS_BACK} gün ve önümüzdeki {DAYS_FORWARD} günün
            gerçek maç programına bakarak her turnuvanın Türkiye&apos;deki yayıncılarını listeler.
          </p>
        </div>
      </div>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap legal-text" style={{ maxWidth: 820 }}>
          {competitions.length > 0 ? (
            <ul className="rights-list">
              {competitions.map((c) => (
                <li className="rights-item" key={c.key}>
                  <h3>
                    <Link href={`/lig/${competitionSlug(c.key)}`}>
                      {competitionFlag(c.key)} {competitionLabel(c.key)}
                    </Link>
                  </h3>
                  {c.broadcasters.length > 0 ? (
                    <p>
                      Yayıncılar:{' '}
                      {c.broadcasters.map((b, i) => (
                        <span key={b.name}>
                          {i > 0 ? ', ' : ''}
                          <strong>{b.name}</strong> ({b.count} maç)
                        </span>
                      ))}
                      .
                    </p>
                  ) : (
                    <p>Bu dönemdeki maçlar için henüz doğrulanmış bir Türkiye yayın bilgisi yok.</p>
                  )}
                  <p>
                    İncelenen dönemde {c.total} maç
                    {c.upcoming > 0 ? `, bunlardan ${c.upcoming} tanesi henüz oynanmadı` : ''}.{' '}
                    <Link href={`/lig/${competitionSlug(c.key)}`}>Maç programı ve puan durumu →</Link>
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>Yayın verisi şu anda alınamıyor, lütfen birazdan tekrar dene.</p>
          )}

          <h2>Bu bilgiler nasıl hazırlanıyor?</h2>
          <p>
            Her maçın yayıncısı, yayın akışları ve maç programı kaynakları taranarak maç maç kaydedilir;
            yukarıdaki liste bu kayıtların toplamıdır. Bir maçın yayıncısı henüz
            belli değilse tahmin yürütülmez, maç sayfasında &quot;yayın bilgisi bekleniyor&quot; yazar. Yayın
            hakları sezon içinde değişirse liste de kendiliğinden güncellenir.
          </p>

          <h2>Tek bir maçın kanalını nasıl bulurum?</h2>
          <p>
            Belirli bir karşılaşmanın kanalı ve saati için <Link href="/bugun">bugünün maç programına</Link> ya da
            ilgili takımın sayfasına bak; her maç satırında yayıncı kanal ayrıca yazıyor. Kanalların yayın akışı
            için <Link href="/kanallar">Kanallar</Link> sayfasını kullanabilirsin. Saatler her zaman Türkiye saatiyle
            (TSİ) verilir.
          </p>

          <h2>Şifreli kanal ve dijital platform farkı</h2>
          <p>
            Bazı yayıncılar maçları hem uydu/kablo kanalında hem de kendi internet platformunda verir; bazı
            karşılaşmalar ise yalnızca dijital platformda yer alır. Listede iki ad birlikte görünüyorsa maç her iki
            yerden de izlenebilir demektir. Ücretsiz (şifresiz) yayınlar genellikle ulusal kanallarda yer alır.
          </p>
        </div>
      </section>

      <AppCta campaign="yayin_haklari" />
    </>
  );
}
