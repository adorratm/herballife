# UX / i18n / Parity — Kabul kontrol listesi

## Faz A — UX

- [ ] Blog listesinde kart yüzeyi, sabit kapak, meta satırı görünüyor
- [ ] Ürün rozetleri alt alta dikdörtgen yığını değil; max 2 (ribbon + pill)
- [ ] İndirimli üründe listede üstü çizili fiyat + güncel fiyat + % görünüyor
- [ ] WhatsApp popup açıkken yukarı kaydır FAB popup üstünde; kapanınca WA üstünde
- [ ] Mobil alt nav Lucide ikonlar (Home, Package, ShoppingBag, Heart, User)
- [ ] Mobil hamburger: Blog, Koçluk, Medya, İletişim, SSS, Sipariş sorgula
- [ ] Ürünler mobil: filtre varsayılan kapalı, “Filtrele / Ara” ile açılır
- [ ] Marka adı Herbal Kapıda (admin + vitrin); Emine / Herbal Ürünleri yok
- [ ] Site Ayarları’nda `distributorCode` (Herbal Kapıda ID); doluysa logo yanı + ürün detay

## Faz B — i18n

- [ ] `yarn seed` sonrası ürün/kategori/blog/kampanyada en/de/fr/es dolu
- [ ] Admin kayıt eksik dilde 400 / form engeli
- [ ] `/en/...` sayfalarında Türkçe ürün/blog metni yok
- [ ] `useSharedImage=true` → tek görsel; `false` → dil başına görsel

## Faz C — Rakip parity

- [ ] “Son 30 günün en iyi fiyatı” indirimli kart/detayda
- [ ] Kampanya geçerlilik tarih şeridi (startsAt/endsAt varsa)
- [ ] Benefits: aynı gün kargo / koçluk / iade günü CMS’ten
- [ ] Footer + ürün detay takviye / kilo disclaimer
- [ ] myHerbal Kapıda üyelik CTA + yasal uyarı
- [ ] Kategori hub ürün sayısı
- [ ] Footer’da distributorCode

## Operasyon

1. API restart + `DATABASE_SYNCHRONIZE=true` (dev) veya migration  
2. Kök dizinde `yarn seed` (workspace `@herbalkapida/api` seed + i18n migrate)  
3. Admin → Site Ayarları: marka Herbal Kapıda, distributorCode (gelince), promises/legal  
4. Frontend `/tr` ve `/en` smoke test  

## 2026-10 düzeltmeleri

- Dil bayrakları: Windows emoji yerine SVG (`LocaleFlag`)  
- Blog kapak: ürün stok fallback kaldırıldı (`blogCoverImage` + placeholder)  
- Anasayfa / blog öne çıkan: kart grid + dergi kartı  
- Scroll-to-top: WA popup yüksekliği ResizeObserver ile; popup üstü + gap, kapanınca eski ofset  
- `package.json` kök `seed` scripti eklendi  

Bkz. [13-PHASE-competitor-parity.md](./13-PHASE-competitor-parity.md), [02-PHASE-i18n-currency.md](./02-PHASE-i18n-currency.md).
