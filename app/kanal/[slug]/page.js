import { notFound } from 'next/navigation';
import Link from 'next/link';
import Guide from '../../../components/Guide';
import AppCta from '../../../components/AppCta';
import JsonLd from '../../../components/JsonLd';
import { MIN_CHANNEL_MATCHES, getFixturesForChannelSlug, isForeignBroadcaster, windowIso } from '../../../lib/data';
import { SITE_URL } from '../../../lib/links';
import { getLocale } from '../../../lib/locale';

export const revalidate = 600;

async function loadChannel(slug) {
  // Site haritasıyla (lib/sitemapXml.js entityEntries: 7 gün geri / 30 ileri)
  // AYNI pencere — farklı olunca haritadaki kanal adresi 404 veriyordu (GSC,
  // 2026-11-09: /kanal/trt-1, /kanal/tabii-spor-5).
  const { startIso, endIso } = windowIso(7, 30);
  try {
    return await getFixturesForChannelSlug(slug, { startIso, endIso });
  } catch {
    return { matches: [], displayName: null };
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { displayName, matches } = await loadChannel(slug);
  if (!displayName) return { title: 'Kanal Bulunamadı' };
  return {
    title: `${displayName} Yayın Akışı — Hangi Maçlar Var?`,
    description: `${displayName} kanalında/platformunda yayınlanan maçlar, saatleri ve karşılaşma detayları.`,
    alternates: { canonical: `${SITE_URL}/kanal/${slug}` },
    ...(matches.length >= MIN_CHANNEL_MATCHES ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function ChannelDetailPage({ params }) {
  const locale = await getLocale();
  const { slug } = await params;
  const { matches, displayName } = await loadChannel(slug);
  if (!displayName) notFound();

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: locale === 'en' ? 'Home' : 'Ana Sayfa', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: displayName, item: `${SITE_URL}/kanal/${slug}` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <div className="crumb wrap">
        <Link href="/">{locale === 'en' ? 'Home' : 'Ana Sayfa'}</Link> › {displayName}
      </div>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">{locale === 'en' ? 'Channel Guide' : 'Kanal Rehberi'}</div>
          <h1>{displayName}</h1>
          <p className="page-desc">{locale === 'en' ? `Matches broadcast on ${displayName} and their kick-off times.` : `${displayName} yayın akışı: bu kanalda/platformda yayınlanacak maçlar ve saatleri (TSİ).`}
            {isForeignBroadcaster(displayName) ? (locale === 'en' ? ' Note: this is an Azerbaijani channel.' : ' Not: bu bir Azerbaycan kanalıdır.') : null}
          </p>
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
