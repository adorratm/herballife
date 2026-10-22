# Canlıya çıkış kontrol listesi

Bu repo demo/sunum varsayılanlarıyla gelir. **Reklam açmadan önce** aşağıdaki maddeleri tamamlayın.

## 1. Ödeme (zorunlu)

- [ ] `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT` dolu
- [ ] `PAYTR_TEST_MODE=0` (canlı)
- [ ] `PAYTR_DEBUG_ON=0` (canlı)
- [ ] PayTR panelinde bildirim / callback URL: `{API_URL}/payments/paytr/callback`
- [ ] **Production’da mock ödeme kapalıdır** (`NODE_ENV=production` iken yalnızca `PAYTR_ALLOW_MOCK=true` ile açılır — reklam ortamında açmayın)
- [ ] Test siparişi: gerçek kart / test kartı ile uçtan uca ödeme

## 2. Ortam ve güvenlik

- [ ] `JWT_SECRET` güçlü, benzersiz
- [ ] Postgres + Redis production credentials
- [ ] `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_ADMIN_URL` gerçek domain
- [ ] Frontend / admin rebuild (public env build-time)
- [ ] HTTPS + doğru CORS

## 3. CMS / iletişim (güven)

Admin → **Site Ayarları**:

- [ ] Logo
- [ ] Gerçek telefon, e-posta, adres
- [ ] WhatsApp numarası + sohbet açık
- [ ] Google yorum / Maps URL (varsa)
- [ ] Sosyal hesaplar
- [ ] Yasal metinlerin güncelliği (KVKK, iade, mesafeli satış)

Placeholder (`+90 500…`, `info@ornek.com`) ile reklam açmayın.

## 4. Kargo

- [ ] Kargo API credentials **veya** bilinçli politika: prod’da mock yalnızca `SHIPPING_ALLOW_MOCK=true`
- [ ] `FREE_SHIPPING_OVER` ve `NEXT_PUBLIC_FREE_SHIPPING_OVER` aynı eşik (ör. `750`); `0` = ücretsiz kargo vaadi kapalı, vitrin “Hızlı kargo” gösterir
- [ ] `DEFAULT_SHIPPING_FEE` gerçek ücretle uyumlu

## 5. Mail / bildirim

- [ ] `MAIL_HOST` / `MAIL_USER` / `MAIL_PASS`
- [ ] `ORDER_ALERT_EMAILS` veya aktif admin allowlist
- [ ] (Opsiyonel) Meta WhatsApp Cloud API: `WHATSAPP_PROVIDER=meta` + token

## 6. Analitik / reklam ölçümü

- [ ] `NEXT_PUBLIC_GTM_ID` veya GA4
- [ ] Google Ads conversion (`NEXT_PUBLIC_GOOGLE_ADS_ID` + label)
- [ ] Meta Pixel (remarketing)
- [ ] Cookie banner onayı ile script’lerin açıldığını doğrula
- [ ] Misafir ödeme başarı sayfasında purchase event’i test et

## 7. İçerik / katalog

- [ ] Seed demo ürünleri gözden geçir veya gerçek katalog yükle
- [ ] `yarn workspace @herballife/api seed` (veya proje seed komutu) — blog + yorumlar
- [ ] Yanıltıcı kampanya metinleri yok (kapıda ödeme yok; “en düşük fiyat” iddiası yok)
- [ ] Ürün görselleri CDN / S3

## 8. Son duman testi

- [ ] Kayıt / giriş / Google OAuth (prod callback URL)
- [ ] Sepet → ödeme → başarı / başarısız
- [ ] Sipariş admin’de görünüyor
- [ ] Arama modal “Kapat” çalışıyor
- [ ] Mobil sticky CTA + bottom nav
- [ ] İade / SSS / iletişim sayfaları

## Hızlı referans env

```bash
# Production mock ödeme — KAPALI tutun
# PAYTR_ALLOW_MOCK=true   # yalnızca bilinçli demo sunucusu

PAYTR_TEST_MODE=0
FREE_SHIPPING_OVER=750
NEXT_PUBLIC_FREE_SHIPPING_OVER=750
SHIPPING_ALLOW_MOCK=false
```

Ayrıca bkz. [DEMO.md](./DEMO.md) (sunum hesabı / kuponlar).
