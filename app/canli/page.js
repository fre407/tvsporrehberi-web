import Guide from '../../components/Guide';
import AppCta from '../../components/AppCta';
import { getLiveFixtures } from '../../lib/data';
import { SITE_URL } from '../../lib/links';

// Canlı skor sayfası zaten en sık yenilenmesi gereken sayfa — kısa
// revalidate (brief'teki "canlı skor sayfası hariç gereksiz polling yapma"
// kuralına uygun: bu SADECE bu sayfada kısa, diğer sayfalarda 5-10 dk).
export const revalidate = 30;

export const metadata = {
  title: 'Canlı Maç Skorları',
  description: 'Şu an oynanan tüm maçların canlı skorları, dakikaları ve yayın kanalları — anlık güncellenir.',
  alternates: { canonical: `${SITE_URL}/canli` },
};

export default async function LivePage() {
  let rows = [];
  try {
    rows = await getLiveFixtures();
  } catch {
    rows = [];
  }

  return (
    <>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">● Canlı</div>
          <h1>
            Canlı <em>maç skorları</em>
          </h1>
          <p className="page-desc">Şu an oynanan tüm maçların skoru, dakikası ve yayın kanalı.</p>
        </div>
      </div>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
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
        </div>
      </section>

      <AppCta campaign="canli_skorlar" />
    </>
  );
}
