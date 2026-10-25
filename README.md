# Herbal Kapıda (Herbalife mağaza + wellness + koç)

Monorepo: NestJS API + Next.js vitrin + Next.js admin. Botanical Vitality tasarımı; marka/domain CMS ve env ile değiştirilebilir.

## Hızlı başlangıç

```bash
cp .env.example .env
docker compose up -d postgres redis
yarn install
yarn migration:run   # veya geliştirmede synchronize açık
yarn workspace @herbalife/api seed
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

## Production (GHCR + zero-downtime)

`main` push → image’lar **ghcr.io**’ya push → SSH ile sunucuda rolling deploy (`deploy/deploy.sh`).

1. GitHub → **Settings → Secrets** : `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` ([liste](deploy/SECRETS.md))
2. Sunucuda Docker kurulu olsun; ilk deploy `deploy/.env` yoksa örnekten üretir (veya `DEPLOY_ENV` secret)
3. Boş veritabanında **otomatik seed** (demo katalog / CMS)

Manuel: `bash deploy/deploy.sh` · Registry: `HERBALIFE_USE_REGISTRY=1 IMAGE_TAG=latest bash deploy/deploy.sh`

## Sunum yayın

Geçici hostlar: `herbalife.emrekilic.web.tr` / `admin.` / `api.` — **parent `emrekilic.web.tr` server block’una dokunmayın.**

Detay: [`deploy/DEMO.md`](deploy/DEMO.md) · Secrets: [`deploy/SECRETS.md`](deploy/SECRETS.md) · Canlı checklist: [`deploy/GO_LIVE.md`](deploy/GO_LIVE.md)

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
