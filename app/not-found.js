import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="hero">
      <div className="wrap">
        <div className="eyebrow">404</div>
        <h1>Bu sayfa bulunamadı</h1>
        <p className="page-desc">
          Aradığın maç, takım veya lig sayfası artık mevcut değil ya da hiç var olmadı.{' '}
          <Link href="/" className="sec-link">
            Ana sayfaya dön
          </Link>{' '}
          ya da{' '}
          <Link href="/bugun" className="sec-link">
            bugünün maçlarına
          </Link>{' '}
          göz at.
        </p>
      </div>
    </div>
  );
}
