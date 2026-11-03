# 07 — Kullanıcının Yapacağı İşler

Sırayla:

1. **Yayın onayı.** `seo-audit-2026-11-03` dalının `main`'e birleştirilmesi Vercel'de
   otomatik yayın başlatır. Claude bunu onay olmadan yapmaz.
2. Yayından sonra (yaklaşık 5 dk):
   ```bash
   npm run seo-audit
   ```
   Canlıda P0 ve P1 sayısı 0 olmalı.
3. **Search Console → Geliştirmeler → Etkinlikler** → "location alanı eksik" →
   **Düzeltmeyi doğrula**. Google doğrulamayı birkaç gün ile iki hafta arasında yapar.
   Event öğesi kalmadığı için rapor zamanla boşalır. Bu beklenen sonuç.
4. **Search Console → URL Denetimi.** Tahmin yazılarından birini ve bir maç sayfasını
   denetle, ardından "Dizine eklenmesini iste".
5. **Search Console → Site haritaları.** `https://tvsporrehberi.com/sitemap.xml` adresini
   yeniden gönder (isteğe bağlı).
6. **PageSpeed Insights** ile ana sayfayı mobilde yeniden ölç ve CLS ile erişilebilirlik
   puanını karşılaştır (bkz. 05).
7. Bilgi: AdSense incelemesi hâlâ sürüyor. Bu çalışma reklam ayarlarına dokunmadı.
   Otomatik optimizasyon kapalı kaldı.
