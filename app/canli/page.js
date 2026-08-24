import LiveGuide from '../../components/LiveGuide';
import AppCta from '../../components/AppCta';
import { getLiveFixtures } from '../../lib/data';
import { SITE_URL } from '../../lib/links';

export const revalidate = 30;

export const metadata = {
  title: 'Canlı Maç Skorları',
  description: 'Şu an oynanan tüm maçların canlı skorları, dakikaları ve yayın kanalları — otomatik güncellenir.',
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
          <p className="page-desc">Şu an oynanan tüm maçların skoru, dakikası ve yayın kanalı — otomatik yenilenir.</p>
        </div>
      </div>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <LiveGuide initialRows={rows} />
        </div>
      </section>

      <AppCta campaign="canli_skorlar" />
    </>
  );
}
