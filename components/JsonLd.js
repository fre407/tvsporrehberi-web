// Schema.org yapısal verisini <script type="application/ld+json"> olarak
// basar.
//
// NEDEN AYRI BİR BİLEŞEN: JSON.stringify çıktısındaki "<" karakteri HAM
// olarak geçer, yani veride "</script>" geçen bir metin (ör. bozuk/kötü
// niyetli bir takım adı) script bloğunu erkenden kapatıp kalanını HTML
// olarak çalıştırabilir — klasik bir XSS vektörü. Takım adları bizim
// yazdığımız değil, dış veri sağlayıcısından (SoccersAPI) gelen içerik
// olduğu için "<" ve ">" karakterlerini unicode kaçışına çeviriyoruz;
// JSON semantiği aynı kalır, HTML ayrıştırıcısı script'i erken kapatmaz.
// U+2028/U+2029 de JS string literal'ini bozabildiği için kaçırılıyor
// (regex'te kaçış dizisiyle yazılı — kaynak dosyada ham karakter yok).
function safeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
