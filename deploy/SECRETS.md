# GitHub Secrets & Variables

`main` / `master` push → GHCR build → SSH zero-downtime deploy (**herbalkapida.com**).

**Settings → Secrets and variables → Actions → Repository secrets**

Deploy job **environment kullanmaz**; secret’lar yalnızca buradan okunur.

> Environments sayfasına yazılan secret’lar **okunmaz**. Oraya girdysen aynı üç ismi **Repository secrets** altına yeniden ekle.

### Sık hata: “Secret eksik” ama ben girdim

1. **Environments** altına yazdıysan → Repository secrets’a taşı.
2. **Variables** sekmesine yazdıysan → **Secrets** olmalı.
3. İsimler birebir: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`.

## Zorunlu (sunucu)

| Secret | Açıklama |
|--------|----------|
| `DEPLOY_HOST` | Sunucu IP / hostname |
| `DEPLOY_USER` | SSH kullanıcı |
| `DEPLOY_SSH_KEY` | Private SSH key (tam PEM / OpenSSH) |

Bu üçü girilince pipeline deploy adımına geçer. Eksikse build yine GHCR’ye push eder; deploy net hata verir.

## Opsiyonel sunucu

| Secret | Varsayılan | Açıklama |
|--------|------------|----------|
| `DEPLOY_PORT` | `22` | SSH port |
| `DEPLOY_PATH` | `/opt/herbalkapida` | Proje kökü (compose + deploy/) |
| `DEPLOY_SSH_PASSPHRASE` | — | Key passphrase varsa |
| `DEPLOY_ENV` | — | İlk kurulumda `deploy/.env` içeriği (çok satır). Yoksa örnek dosya kopyalanır |
| `GHCR_PULL_TOKEN` | `GITHUB_TOKEN` | Sunucuda `docker pull` için PAT (`read:packages`) |
| `GHCR_PULL_USER` | `github.actor` | GHCR kullanıcı adı |

## Build-time public URL’ler (Variables önerilir)

Frontend/admin image’a gömülür. **Variables** veya Secrets:

| Name | Örnek |
|------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://herbalkapida.com` |
| `NEXT_PUBLIC_API_URL` | `https://api.herbalkapida.com` |
| `NEXT_PUBLIC_ADMIN_URL` | `https://admin.herbalkapida.com` |
| `NEXT_PUBLIC_CDN_URL` | CDN base (opsiyonel) |
| `NEXT_PUBLIC_GTM_ID` / `GA4` / Ads / Meta / site verification | opsiyonel |
| `AWS_REGION` | `eu-central-1` |

Boş bırakılırsa Dockerfile varsayılanları (`herbalkapida.com`) kullanılır.

## Opsiyonel AWS (build args)

| Secret | Açıklama |
|--------|----------|
| `AWS_S3_BUCKET` | Bucket adı |
| `AWS_CDN_URL` | CloudFront / CDN |

## Sunucu önkoşulları

```bash
# Docker + Compose plugin
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2
sudo usermod -aG docker "$USER"

# Deploy dizini
sudo mkdir -p /opt/herbalkapida && sudo chown "$USER":"$USER" /opt/herbalkapida

# SSH: public key → ~/.ssh/authorized_keys
```

Ubuntu sunucu kurulumu (Docker, DNS, Nginx, ne girilir): [SERVER_SETUP.md](./SERVER_SETUP.md).  
Nginx / TLS checklist: [GO_LIVE.md](./GO_LIVE.md). Geçici sunum: [DEMO.md](./DEMO.md).

## İlk yayın davranışı

1. GHCR: `ghcr.io/<owner>/herbalkapida/{api,frontend,admin}:sha-…` + `:latest`
2. Sunucuya compose + `deploy.sh` kopyalanır
3. `deploy/.env` yoksa `DEPLOY_ENV` veya örnek dosya (`info@herbalkapida.com` mail varsayılanları)
4. Pull → migrate → **boş DB ise seed** (mevcut katalog / CMS verileri)
5. api → frontend → admin sırayla recreate + health; fail → `:rollback`

Manuel seed zorla: Actions → **Build & Deploy** → `seed: true`.

Yerel (registry’siz):

```bash
cp deploy/.env.production.example deploy/.env
# JWT_SECRET / POSTGRES_PASSWORD / MAIL_* düzenle
bash deploy/deploy.sh
```

## GHCR paket görünürlüğü

İlk push sonrası: **Packages** → her image → Package settings →  
*Manage Actions access* / visibility (private repo → private paket normal).  
Sunucu pull için `GITHUB_TOKEN` (workflow) veya `GHCR_PULL_TOKEN` PAT.
