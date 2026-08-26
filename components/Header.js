import Link from 'next/link';
import SearchBox from './SearchBox';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { t } from '../lib/i18n';

const NAV_ITEMS = [
  {
    href: '/bugun',
    label: 'today',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </svg>
    ),
  },
  {
    href: '/canli',
    label: 'live',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12h4l3 8 4-16 3 8h4" />
      </svg>
    ),
  },
  {
    href: '/ligler',
    label: 'leagues',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 21h8M12 17v4M6 4h12v3a6 6 0 0 1-12 0V4Z" />
        <path d="M6 5H3v1a4 4 0 0 0 3 3.87M18 5h3v1a4 4 0 0 1-3 3.87" />
      </svg>
    ),
  },
  {
    href: '/takimlar',
    label: 'teams',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3 4 6v6c0 4.5 3.4 7.9 8 9 4.6-1.1 8-4.5 8-9V6l-8-3Z" />
      </svg>
    ),
  },
  {
    href: '/kanallar',
    label: 'channels',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="m8 7 4-4 4 4M3 20h18" />
      </svg>
    ),
  },
];

export default function Header({ locale }) {
  return (
    <header className="site">
      <div className="wrap nav-row1">
        <Link className="brand" href="/">
          <div className="brand-mark">TV</div>
          <div className="brand-name">
            SPOR<span>REHBERİ</span>
          </div>
        </Link>
        <SearchBox />
        <div className="header-preferences"><LanguageToggle /><ThemeToggle /></div>
      </div>
      <div className="nav-row2-outer">
        <div className="wrap nav-row2">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="nav-chip">
              <span className="nav-chip-icon">{item.icon}</span>
              {t(locale, `nav.${item.label}`)}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
