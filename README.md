# Herbal Kapıda (Herbal Kapıda mağaza + wellness + koç)

Monorepo: NestJS API + Next.js vitrin + Next.js admin. Botanical Vitality tasarımı; marka/domain CMS ve env ile değiştirilebilir.

## Hızlı başlangıç

```bash
cp .env.example .env
docker compose up -d postgres redis
yarn install
yarn migration:run   # veya geliştirmede synchronize açık
yarn workspace @herbalkapida/api seed
yarn dev:api
yarn dev:frontend
yarn dev:admin
```

| Servis | URL |
|--------|-----|
| Vitrin | http://localhost:3000 |
| Admin | http://localhost:3001 |
| API + Swagger | http://localhost:4000/docs |

Toptan / B2B katalog kaldırıldı. Mağaza + wellness + koç paneli odaklıdır.

## Production — herbalkapida.com (GHCR + zero-downtime)

`main` push → **ghcr.io** image build/push → SSH rolling deploy (`deploy/deploy.sh`).  
Varsayılan mail: **info@herbalkapida.com** · Domain: vitrin / `admin.` / `api.`herbalkapida.com

1. GitHub → **Settings → Secrets**: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` ([liste](deploy/SECRETS.md))
2. Variables: `NEXT_PUBLIC_SITE_URL=https://herbalkapida.com` (+ API / admin)
3. Sunucuda Docker + Nginx/TLS ([GO_LIVE.md](deploy/GO_LIVE.md)); `deploy/.env` yoksa örnekten üretilir
4. Boş DB’de otomatik seed — dolu volume’daki mevcut veriler korunur

Manuel: `bash deploy/deploy.sh` · Registry: `HERBAL_KAPIDA_USE_REGISTRY=1 IMAGE_TAG=latest bash deploy/deploy.sh`

## Sunum yayın

Geçici hostlar: `herbalkapida.emrekilic.web.tr` / `admin.` / `api.` — **parent `emrekilic.web.tr` server block’una dokunmayın.**

Detay: [`deploy/SERVER_SETUP.md`](deploy/SERVER_SETUP.md) · [`deploy/SECRETS.md`](deploy/SECRETS.md) · [`deploy/GO_LIVE.md`](deploy/GO_LIVE.md) · [`deploy/DEMO.md`](deploy/DEMO.md)

## Yapı

```
api/        NestJS + PostgreSQL + TypeORM + Redis/BullMQ + wellness/koç
frontend/   Müşteri mağazası + beslenme takibi
admin/      Yönetim + koçluk onay / WhatsApp
packages/   Ortak contracts
design/     Botanical Vitality referans ekranları
docker/     Dockerfile'lar
```

## Marka

Admin → Site Ayarları: marka adı (varsayılan Herbal Kapıda), logo, distribütör, disclaimer, WhatsApp. Domain: herbalkapida.com · info@herbalkapida.com

## Demo hesaplar (seed sonrası)

| Rol | Giriş |
|-----|--------|
| Müşteri | `demo@herbalurunleri.local` / `Demo1234!` |
| Admin | `ADMIN_ALLOWLIST` e-postası (Google/local) |

Ödeme: PayTR anahtarları boşsa checkout **mock** tamamlanır. Detay: [`deploy/DEMO.md`](deploy/DEMO.md).
