import { notFound } from 'next/navigation';
import Link from 'next/link';
import Guide from '../../../components/Guide';
import AppCta from '../../../components/AppCta';
import { getFixturesForChannelSlug, windowIso } from '../../../lib/data';
import { SITE_URL } from '../../../lib/links';

export const revalidate = 600;

async function loadChannel(slug) {
  const { startIso, endIso } = windowIso(1, 14);
  try {
    return await getFixturesForChannelSlug(slug, { startIso, endIso });
  } catch {
    return { matches: [], displayName: null };
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { displayName } = await loadChannel(slug);
  if (!displayName) return { title: 'Kanal Bulunamadı' };
  return {
    title: `${displayName} Yayın Akışı — Hangi Maçlar Var?`,
    description: `${displayName} kanalında/platformunda yayınlanan maçlar, saatleri ve karşılaşma detayları.`,
    alternates: { canonical: `${SITE_URL}/kanal/${slug}` },
  };
}

export default async function ChannelDetailPage({ params }) {
  const { slug } = await params;
  const { matches, displayName } = await loadChannel(slug);
  if (!displayName) notFound();

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: displayName, item: `${SITE_URL}/kanal/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <div className="crumb wrap">
        <Link href="/">Ana Sayfa</Link> › {displayName}
      </div>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">Kanal Rehberi</div>
          <h1>{displayName}</h1>
          <p className="page-desc">{displayName}&apos;da yayınlanan maçlar ve saatleri.</p>
        </div>
      </div>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <Guide rows={matches} />
        </div>
      </section>

      <AppCta campaign="kanal_sayfasi" />
    </>
  );
}
