# Canlıya çıkış — herbalkapida.com

Mevcut veriler (Postgres volume / seed) korunarak **herbalkapida.com** yayını.  
Pipeline: `main` push → GHCR (`ghcr.io/.../{api,frontend,admin}`) → SSH rolling deploy (`deploy/deploy.sh`).

İletişim / sipariş maili varsayılanı: **info@herbalkapida.com**.

## 0. DNS + TLS

| Host | Hedef |
|------|--------|
| `herbalkapida.com` / `www` | sunucu IP → frontend `:3200` |
| `admin.herbalkapida.com` | sunucu IP → admin `:3201` |
| `api.herbalkapida.com` | sunucu IP → API `:3202` |

```nginx
# /etc/nginx/sites-available/herbalkapida.com
server {
  listen 443 ssl http2;
  server_name herbalkapida.com www.herbalkapida.com;
  # ssl_certificate ... (certbot)
  location / {
    proxy_pass http://127.0.0.1:3200;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

server {
  listen 443 ssl http2;
  server_name admin.herbalkapida.com;
  location / {
    proxy_pass http://127.0.0.1:3201;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

server {
  listen 443 ssl http2;
  server_name api.herbalkapida.com;
  client_max_body_size 25m;
  location / {
    proxy_pass http://127.0.0.1:3202;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

```bash
certbot --nginx -d herbalkapida.com -d www.herbalkapida.com \
  -d admin.herbalkapida.com -d api.herbalkapida.com
```

GitHub Variables (önerilir): `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_ADMIN_URL` — bkz. [SECRETS.md](./SECRETS.md).

## 1. Ödeme (zorunlu)

- [ ] `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT` dolu
- [ ] `PAYTR_TEST_MODE=0` (canlı)
- [ ] `PAYTR_DEBUG_ON=0` (canlı)
- [ ] PayTR panelinde bildirim / callback URL: `https://api.herbalkapida.com/payments/paytr/callback`
- [ ] **Production’da mock ödeme kapalıdır** (`PAYTR_ALLOW_MOCK=false`)
- [ ] Test siparişi: gerçek kart ile uçtan uca ödeme

## 2. Ortam ve güvenlik

- [ ] `JWT_SECRET` güçlü, benzersiz
- [ ] Postgres + Redis production credentials
- [ ] `NEXT_PUBLIC_*` / `FRONTEND_URL` / `API_URL` / `ADMIN_URL` → herbalkapida.com
- [ ] HTTPS + doğru CORS
- [ ] GitHub: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`

## 3. CMS / iletişim (güven)

Admin → **Site Ayarları**:

- [ ] Logo
- [ ] E-posta: `info@herbalkapida.com` (veya güncel)
- [ ] Gerçek telefon, adres
- [ ] WhatsApp numarası + sohbet açık
- [ ] Google yorum / Maps URL (varsa)
- [ ] Sosyal hesaplar
- [ ] Yasal metinlerin güncelliği (KVKK, iade, mesafeli satış)

## 4. Kargo

- [ ] Kargo API credentials **veya** bilinçli politika: prod’da mock yalnızca `SHIPPING_ALLOW_MOCK=true`
- [ ] `FREE_SHIPPING_OVER` ve `NEXT_PUBLIC_FREE_SHIPPING_OVER` aynı eşik
- [ ] `DEFAULT_SHIPPING_FEE` gerçek ücretle uyumlu

## 5. Mail / bildirim

- [ ] `MAIL_HOST` / `MAIL_USER=info@herbalkapida.com` / `MAIL_PASS`
- [ ] `MAIL_FROM="Herbal Kapıda <info@herbalkapida.com>"`
- [ ] `ORDER_ALERT_EMAILS=info@herbalkapida.com` (veya admin allowlist)
- [ ] (Opsiyonel) Meta WhatsApp Cloud API: `WHATSAPP_PROVIDER=meta` + token

## 6. Analitik / reklam ölçümü

- [ ] `NEXT_PUBLIC_GTM_ID` veya GA4
- [ ] Google Ads / Meta Pixel
- [ ] Cookie banner onayı ile script’lerin açıldığını doğrula

## 7. İçerik / katalog

- [ ] Mevcut seed / DB verileri gözden geçirildi
- [ ] Boş DB’de ilk deploy otomatik seed çalıştırır; dolu DB’ye dokunulmaz
- [ ] Ürün görselleri CDN / S3

## 8. Son duman testi

- [ ] Kayıt / giriş / Google OAuth (`https://api.herbalkapida.com/auth/google/callback`)
- [ ] Sepet → ödeme → başarı / başarısız
- [ ] Sipariş admin’de + `info@` bildirimi
- [ ] Mobil sticky CTA + bottom nav
- [ ] İade / SSS / iletişim sayfaları

## Hızlı referans env

```bash
FRONTEND_URL=https://herbalkapida.com
ADMIN_URL=https://admin.herbalkapida.com
API_URL=https://api.herbalkapida.com
NEXT_PUBLIC_SITE_URL=https://herbalkapida.com
NEXT_PUBLIC_API_URL=https://api.herbalkapida.com
NEXT_PUBLIC_ADMIN_URL=https://admin.herbalkapida.com
MAIL_FROM="Herbal Kapıda <info@herbalkapida.com>"
MAIL_USER=info@herbalkapida.com
ORDER_ALERT_EMAILS=info@herbalkapida.com
PAYTR_TEST_MODE=0
PAYTR_ALLOW_MOCK=false
```

Secrets: [SECRETS.md](./SECRETS.md) · Sunum hostları: [DEMO.md](./DEMO.md).
