import Link from 'next/link';
import AppCta from '../../components/AppCta';
import { getDistinctChannels, windowIso } from '../../lib/data';
import { SITE_URL } from '../../lib/links';

export const revalidate = 1800;

export const metadata = {
  title: 'TV Kanalları',
  description: 'S Sport, beIN Sports, TRT Tabii ve maç yayınlayan tüm Türkiye kanal/platformları — hangi kanalda hangi maçlar var.',
  alternates: { canonical: `${SITE_URL}/kanallar` },
};

export default async function ChannelsIndexPage() {
  let channels = [];
  try {
    const { startIso, endIso } = windowIso(1, 14);
    channels = await getDistinctChannels({ startIso, endIso });
  } catch {
    channels = [];
  }

  return (
    <>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">Kanallar</div>
          <h1>
            Yayın <em>kanalları</em>
          </h1>
          <p className="page-desc">Bir kanala tıkla, o kanalda yayınlanan maçları ve saatlerini gör.</p>
        </div>
      </div>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          {channels.length === 0 ? (
            <div className="guide empty-note">Şu an listelenecek kanal bilgisi bulunamadı.</div>
          ) : (
            <div className="index-grid">
              {channels.map((c) => (
                <Link key={c.slug} href={`/kanal/${c.slug}`} className="index-card">
                  <span className="index-card-name">{c.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <AppCta campaign="kanallar_sayfasi" />
    </>
  );
}
