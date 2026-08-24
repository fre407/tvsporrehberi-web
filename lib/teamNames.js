// Dış veri sağlayıcısı (SoccersAPI) aynı takımı farklı fikstürlerde farklı
// yazımlarla döndürebiliyor (ör. bir maçta "Everton", başka bir maçta
// "Everton FC"). Bizim tarafımızda bunlar iki AYRI /takim/[slug] sayfası
// oluşturuyordu — aynı takım için birbiriyle yarışan iki sayfa, kötü bir
// SEO sinyali. Veritabanı şemasına dokunmadan (kullanıcı isteği) burada
// TEK bir kanonik isme indiriyoruz; lib/data.js'teki tüm fikstür
// sorgularının tek çıkış noktasında (normalizeRow) uygulanıyor.
//
// Anahtar: sağlayıcıdan gelebilecek varyant. Değer: sitede göstereceğimiz
// kanonik isim. Yeni bir çakışma fark edilirse buraya eklemek yeterli.
export const TEAM_NAME_ALIASES = {
  'Everton FC': 'Everton',
  'Brentford FC': 'Brentford',
  'Como 1907': 'Como',
  'Inter Milano': 'Inter',
  'Leeds United': 'Leeds',
  'OGC Nice': 'Nice',
  'Tottenham Hotspur': 'Tottenham',
};

export function canonicalTeamName(name) {
  if (!name) return name;
  return TEAM_NAME_ALIASES[name] ?? name;
}

// Ters bakış: kanonik isim -> veritabanında gerçekten karşılaşabileceğimiz
// tüm ham yazımlar (kanonik ismin kendisi dahil). getHeadToHead gibi ismi
// doğrudan veritabanı sorgusuna (eq/or) veren yerlerde lazım — kanonik
// isimle sorgularsak DB'deki "Everton FC" yazılı satırları KAÇIRIRIZ.
const REVERSE_ALIASES = (() => {
  const map = new Map();
  for (const [alias, canonical] of Object.entries(TEAM_NAME_ALIASES)) {
    if (!map.has(canonical)) map.set(canonical, new Set([canonical]));
    map.get(canonical).add(alias);
  }
  return map;
})();

export function teamNameVariants(canonicalName) {
  const set = REVERSE_ALIASES.get(canonicalName);
  return set ? Array.from(set) : [canonicalName];
}

// Kanal adlarında da aynı sorun var (ör. "Bein Sports 1" / "beIN Sports 1").
// slugify() zaten büyük/küçük harf farkını yok sayıp aynı /kanal/[slug]
// sayfasına yönlendiriyor (o yüzden bu, ayrı URL'ler oluşturan bir SEO
// sorunu değil) ama görüntülenen isim tutarsız kalıyordu — büyük/küçük harf
// karışıklığı güven sinyali açısından iyi görünmüyor. Bilinen resmi
// yazımlara sabitliyoruz.
const CHANNEL_NAME_ALIASES = {
  'bein sports': 'beIN Sports',
  'bein sports 1': 'beIN Sports 1',
  'bein sports 2': 'beIN Sports 2',
  'bein sports 3': 'beIN Sports 3',
  'bein sports 4': 'beIN Sports 4',
  'bein sports max': 'beIN Sports MAX',
  'bein connect': 'beIN Connect',
  's sport': 'S Sport',
  's sport 2': 'S Sport 2',
  's sport plus': 'S Sport Plus',
  'trt tabii': 'TRT Tabii',
  'tabii': 'Tabii',
  'smart spor': 'Smart Spor',
  'exxen': 'Exxen',
};

export function canonicalChannelName(name) {
  if (!name) return name;
  const key = name.trim().toLocaleLowerCase('tr');
  return CHANNEL_NAME_ALIASES[key] ?? name;
}
