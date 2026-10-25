# .env vs Panel Site Ayarları

## `.env`’de kalacaklar (sistem secret / altyapı)

- `DATABASE_*` / `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET` / `JWT_EXPIRES_IN`
- `API_PORT` / `API_URL` / `FRONTEND_URL` / `ADMIN_URL`
- AWS S3 credentials (`AWS_*`)
- OAuth client secret’lar (Google / Apple)
- PayTR merchant key/salt (isterse panel’e de taşınabilir; secret olarak env tercih)
- Meta WA token / phone number id (secret)
- SMTP `MAIL_PASS` (secret)

## Panele taşınanlar (Site Ayarları)

| Anahtar grubu | Örnek |
|---------------|--------|
| brand | name, slogan, logoUrl, legalDisclaimer |
| contact | email (info@herbalkapida.com), phone, address |
| whatsapp | phone, greeting, presets, popupMessages |
| shipping | defaultFee, freeShippingOver, dhl credentials (non-secret + API key encrypted) |
| tax | ratePercent, includedByDefault |
| analytics | ga4Id, gtmId, googleAdsId, metaPixelId, yandexMetrikaId, tiktokPixelId, facebookCapi (token ayrı) |
| mail | from address, host, port, user (pass env veya encrypted) |
| localization | defaultLocale, enabledLocales, defaultCurrency, currencyByLocale |
| seo | title, description, keywords |

Build-time `NEXT_PUBLIC_*` analytics ID’leri kaldırılır; vitrin API’den `/cms/settings` ile yükler.
