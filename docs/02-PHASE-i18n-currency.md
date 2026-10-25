# Faz 2 — i18n + para birimi

## Kararlar

- Diller: TR, EN, DE, FR, ES
- Para: TRY, USD, EUR, GBP
- TR ziyaretçi → TRY zorunlu
- DE/FR/ES → varsayılan EUR; EN → USD (GBP seçilebilir)
- Panel Türkçe

## Uygulama

- Frontend: `next-intl` + `app/[locale]/...`
- **URL her zaman locale önekli:** `/tr/...`, `/en/...` (SEO / indexleme)
- Dil seçici: bayrak + dil adı; para birimi: ₺ $ € £ + kod (özel dropdown)
- Sitemap tüm locale URL’lerini + `alternates.languages` üretir
- UI mesaj dosyaları: `frontend/messages/{locale}.json`
- Entity: `Product.prices` jsonb + `translations`
- Checkout / e-posta seçilen currency taşır

## Kabul

`/tr/urunler` vb. ile 5 dilde gezinme; fiyatlar doğru para biriminde; admin TR.
