import Link from 'next/link';
import { playStoreUrl } from '../lib/links';

export default function Header() {
  return (
    <header className="site">
      <div className="wrap nav">
        <Link className="brand" href="/">
          <div className="brand-mark">TV</div>
          <div className="brand-name">
            SPOR<span>REHBERİ</span>
          </div>
        </Link>
        <nav className="links">
          <Link href="/bugun">Bugünün Maçları</Link>
          <Link href="/lig/super-lig">Süper Lig</Link>
          <Link href="/lig/sampiyonlar-ligi">Şampiyonlar Ligi</Link>
        </nav>
        <a className="nav-cta" href={playStoreUrl('header')} target="_blank" rel="noopener noreferrer">
          📲 Uygulamayı İndir
        </a>
      </div>
    </header>
  );
}
