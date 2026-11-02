import { ImageResponse } from 'next/og';
import { allPredictions, getPrediction } from '../../../lib/predictions';
import { istDateLong, istTime } from '../../../lib/format';

// Paylaşım ve Google Discover görseli: takımlar + skor tahmini, sitenin
// sarı-siyah kimliğiyle. Her yazı için derlemede üretilir.
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Maç tahmini';

export function generateStaticParams() {
  return allPredictions().map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }) {
  const { slug } = await params;
  const a = getPrediction(slug);
  const home = a?.homeTeam ?? '';
  const away = a?.awayTeam ?? '';
  const score = a ? `${a.scorePrediction.home} - ${a.scorePrediction.away}` : '';
  const when = a ? `${istDateLong(a.kickoff)} · ${istTime(a.kickoff)} TSİ` : '';
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 64px',
          background: '#0a0a08',
          color: '#f7f5ee',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', width: 64, height: 64, borderRadius: 14, background: '#ffe812', color: '#17140a', fontSize: 30, fontWeight: 800, alignItems: 'center', justifyContent: 'center' }}>TV</div>
            <div style={{ display: 'flex', fontSize: 32, fontWeight: 800 }}>SPOR<span style={{ color: '#ffe812' }}>REHBERİ</span></div>
          </div>
          <div style={{ display: 'flex', padding: '10px 20px', borderRadius: 12, background: '#ffe812', color: '#17140a', fontSize: 26, fontWeight: 800 }}>
            İDDİALI TAHMİN
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, lineHeight: 1.05 }}>{home} - {away}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
            <span style={{ fontSize: 34, color: '#cfc8b2' }}>Skor tahminim</span>
            <span style={{ fontSize: 96, fontWeight: 800, color: '#ffe812' }}>{score}</span>
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#cfc8b2' }}>{when} · tvsporrehberi.com</div>
      </div>
    ),
    size,
  );
}
