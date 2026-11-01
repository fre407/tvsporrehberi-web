// Ana sayfa düzeni (kullanıcı kararı, 2026-11-01: "2 + 6" = maç günü panosu
// + saat bloklarına ayrılmış maç listesi).
//   'pano'    → yeni düzen
//   'klasik'  → 2026-11-01 öncesi düzen (kod silinmedi, aynen duruyor)
// Geri dönmek için bu değeri 'klasik' yapıp push etmek yeterli. Sitenin
// tamamını o güne döndürmek gerekirse git etiketi: tasarim-oncesi-2026-11-01.
export const HOME_LAYOUT = 'pano';
