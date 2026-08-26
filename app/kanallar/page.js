import Link from 'next/link';
import AppCta from '../../components/AppCta';
import { getDistinctChannels, windowIso } from '../../lib/data';
import { SITE_URL } from '../../lib/links';
import { slugify } from '../../lib/format';
import FavoriteButton from '../../components/FavoriteButton';

export const revalidate = 1800;

export const metadata = {
  title: 'Maç Yayınlayan TV Kanalları ve Yayın Platformları',
  description: 'S Sport, beIN Sports, TRT Tabii ve maç yayınlayan tüm Türkiye kanal/platformları — hangi kanalda hangi maçlar var, ne zaman oynanıyor.',
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
                <div key={c.slug} className="index-card channel-index-card">
                  <Link href={`/kanal/${c.slug}`} className="channel-index-link">
                    <span className="index-card-name">{c.name}</span>
                  </Link>
                  <FavoriteButton favoriteId={`channel:${slugify(c.name)}`} label={c.name} compact />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <AppCta campaign="kanallar_sayfasi" />
    </>
  );
}
