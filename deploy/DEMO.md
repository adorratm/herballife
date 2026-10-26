# Sunum yayın rehberi (parent domain’e dokunma)

Reklam / canlı satış için ayrıca **[GO_LIVE.md](./GO_LIVE.md)** kontrol listesini uygulayın.

Bu stack **üç ayrı host** bekler. Ana `emrekilic.web.tr` server block’una **hiçbir şey eklemeyin / değiştirmeyin**.

## Önerilen geçici hostlar

| Rol | Host | Proxy → |
|-----|------|---------|
| Vitrin | `herbalkapida.emrekilic.web.tr` | `127.0.0.1:3200` |
| Admin | `admin.herbalkapida.emrekilic.web.tr` | `127.0.0.1:3201` |
| API | `api.herbalkapida.emrekilic.web.tr` | `127.0.0.1:3202` |

Path tabanlı (`emrekilic.web.tr/herbalkapida`) **desteklenmez** (`basePath` yok).

## DNS

Yalnızca bu üç A/AAAA kaydını ekleyin (aynı sunucu IP). Wildcard `*.emrekilic.web.tr` zaten varsa yeterli olabilir; yoksa üç kayıt açın.

## `deploy/.env` örneği

```env
FRONTEND_URL=https://herbalkapida.emrekilic.web.tr
ADMIN_URL=https://admin.herbalkapida.emrekilic.web.tr
API_URL=https://api.herbalkapida.emrekilic.web.tr
NEXT_PUBLIC_SITE_URL=https://herbalkapida.emrekilic.web.tr
NEXT_PUBLIC_ADMIN_URL=https://admin.herbalkapida.emrekilic.web.tr
NEXT_PUBLIC_API_URL=https://api.herbalkapida.emrekilic.web.tr
FRONTEND_HOST_PORT=3200
ADMIN_HOST_PORT=3201
API_HOST_PORT=3202
```

`NEXT_PUBLIC_*` build-time gömülür → env değişince **frontend/admin image rebuild** gerekir.

## Nginx (yeni server block — parent’tan bağımsız)

Her host için **ayrı** `server` bloğu oluşturun; `emrekilic.web.tr` config dosyasına include etmeyin.

```nginx
# /etc/nginx/sites-available/herbalkapida.emrekilic.web.tr
server {
  listen 443 ssl http2;
  server_name herbalkapida.emrekilic.web.tr;
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
  server_name admin.herbalkapida.emrekilic.web.tr;
  location / {
    proxy_pass http://127.0.0.1:3201;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

server {
  listen 443 ssl http2;
  server_name api.herbalkapida.emrekilic.web.tr;
  client_max_body_size 25m;
  location / {
    proxy_pass http://127.0.0.1:3202;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

TLS: `certbot --nginx -d herbalkapida.emrekilic.web.tr -d admin.herbalkapida.emrekilic.web.tr -d api.herbalkapida.emrekilic.web.tr`

## Ödeme (sunum)

Canlı kart zorunlu değil:

1. **PayTR anahtarları boş** → API otomatik **mock ödeme** kullanır; checkout sonrası `.../payments/paytr/mock-complete?...` ile sipariş `paid` olur.
2. **PayTR test** → `PAYTR_TEST_MODE=1` + test merchant bilgileri; callback URL: `https://api.herbalkapida.emrekilic.web.tr/payments/paytr/callback`
3. Seed zaten `DEMO-2026-001` / `DEMO-2026-002` ödenmiş siparişler oluşturur (admin’de gösterim için).

## Seed / demo hesap

```bash
yarn workspace @herbalkapida/api seed
```

| Ne | Değer |
|----|--------|
| Marka | Herbal Kapıda (CMS `brand.*`) |
| Demo müşteri | `demo@herbalurunleri.local` / `Demo1234!` |
| Demo siparişler | `DEMO-2026-001`, `DEMO-2026-002` |
| Wellness | Su / öğün / ölçüm + koç onay kuyruğu örnekleri |
| Kupon | `HOSGELDIN10`, kampanya kodu CMS’te `SAGLIK2026` |

## Sunum checklist

1. DNS + TLS yalnızca üç alt alan için (parent block’a dokunma)
2. `docker compose -f docker-compose.prod.yml up -d` (veya mevcut deploy script)
3. `yarn workspace @herbalkapida/api seed`
4. Admin → Site Ayarları: marka adı, logo, Herbal Kapıda, telefon, WhatsApp
5. Vitrin: ana sayfa → set → PDP → sepet → ödeme (mock) → teşekkür
6. Hesabım → Beslenme takibi / ölçümler
7. Admin → Koçluk: onay kuyruğu + toplu WhatsApp
8. OAuth / PayTR / S3 CORS callback URL’lerini yeni hostlara güncelle (kullanıyorsanız)
9. Gerçek domain gelince: yalnızca env + DNS/proxy; kod değişmez

## Marka / logo

CMS’ten değiştirilir (`brand.name`, `logoUrl`, `distributorName`). Logo URL boşsa sitede sage ikon placeholder kullanılır. Rebuild gerekmez (logo URL); domain değişince env + rebuild (`NEXT_PUBLIC_*`).

## CORS / OAuth notları

- Google OAuth callback: `https://api.herbalkapida.emrekilic.web.tr/auth/google/callback` (+ admin callback)
- S3 / CDN CORS: vitrin + admin origin’lerini ekleyin
- WhatsApp: `WHATSAPP_PROVIDER=console` sunumda log’a yazar; Meta token varsa gerçek gönderim
