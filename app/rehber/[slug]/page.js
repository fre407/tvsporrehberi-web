import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '../../../components/JsonLd';
import { GUIDES, guideBySlug, guideUrl } from '../../../lib/guides';
import { SITE_URL } from '../../../lib/links';
import { breadcrumbJsonLd } from '../../../lib/structuredData';

export const revalidate = false;
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return { title: 'Yazı bulunamadı' };
  const url = `${SITE_URL}${guideUrl(guide)}`;
  return {
    title: { absolute: `${guide.title} | TV Spor Rehberi` },
    description: guide.description,
    alternates: { canonical: url },
    openGraph: { type: 'article', url, title: guide.title, description: guide.description, publishedTime: guide.publishedAt },
  };
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();
  const url = `${SITE_URL}${guideUrl(guide)}`;
  // Yazar kurum (sahte kişi yok) — bkz. predictionArticleJsonLd.
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    dateModified: guide.publishedAt,
    inLanguage: 'tr-TR',
    articleSection: 'Rehber',
    author: { '@type': 'Organization', name: 'TV Spor Rehberi', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'TV Spor Rehberi', url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
  const others = GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <>
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Ana Sayfa', url: SITE_URL },
        { name: 'Rehber', url: `${SITE_URL}/rehber` },
        { name: guide.title, url },
      ])} />
      <div className="crumb wrap">
        <Link href="/">Ana Sayfa</Link> › <Link href="/rehber">Rehber</Link> › {guide.title}
      </div>
      <div className="hero" style={{ paddingBottom: 10 }}>
        <div className="wrap">
          <div className="eyebrow">Rehber · TV Spor Rehberi Editörü</div>
          <h1>{guide.title}</h1>
          <p className="page-desc">{guide.intro}</p>
        </div>
      </div>
      <section style={{ paddingTop: 8 }}>
        <article className="wrap legal-text">
          {guide.sections.map((section) => (
            <div key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
          ))}
          <h2>Diğer rehber yazıları</h2>
          <ul>
            {others.map((g) => (
              <li key={g.slug}>
                <Link href={guideUrl(g)}>{g.title}</Link>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}
