export default function Footer() {
  return (
    <footer className="site">
      <div className="wrap foot-grid">
        <div>
          <div className="brand" style={{ marginBottom: 10 }}>
            <div className="brand-mark" style={{ width: 28, height: 28, fontSize: 13 }}>
              TV
            </div>
            <div className="brand-name" style={{ fontSize: 15 }}>
              SPOR<span style={{ color: 'var(--accent)' }}>REHBERİ</span>
            </div>
          </div>
          <div className="foot-note">© {new Date().getFullYear()} TV Spor Rehberi</div>
        </div>
        <div className="foot-links">
          <a href="/hakkimizda">Hakkımızda</a>
          <a href="/gizlilik-politikasi">Gizlilik Politikası</a>
          <a href="https://fre407.github.io/yasal-bilgilendirme.html" target="_blank" rel="noopener noreferrer">
            Yasal Bilgilendirme
          </a>
          <a href="/bugun">Bugünün Maçları</a>
        </div>
      </div>
    </footer>
  );
}
