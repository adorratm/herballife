# Sunucu kurulumu — Ubuntu 25.10 + Docker (herbalkapida.com)

Sıralı checklist. Her maddeyi bitirmeden sonrakine geçme.

İlgili: [SECRETS.md](./SECRETS.md) · [GO_LIVE.md](./GO_LIVE.md) · [.env.production.example](./.env.production.example)

---

## 1. Sunucu erişimi

1. VPS IP adresini not et.
2. Root veya sudo kullanıcısıyla SSH aç: `ssh kullanici@SUNUCU_IP`
3. Sistemi güncelle:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
4. Deploy için ayrı kullanıcı önerilir (ör. `deploy`):
   ```bash
   sudo adduser deploy
   sudo usermod -aG sudo deploy
   ```
5. SSH key ile giriş kur (şifre yerine key):
   - Bilgisayarında: `ssh-keygen -t ed25519 -C "herbalkapida-deploy"`
   - Public key’i sunucuya: `~/.ssh/authorized_keys`
   - Private key’i **GitHub Secret** olarak saklayacaksın (`DEPLOY_SSH_KEY`)

---

## 2. Firewall

1. UFW aç:
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   sudo ufw status
   ```
2. **Açma:** 3200 / 3201 / 3202 / 5434 / 6381 dışarıya — bunlar yalnızca localhost + Nginx üzerinden kullanılacak.

---

## 3. Docker kurulumu

1. Paketler:
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose-v2
   ```
2. Servisi aç:
   ```bash
   sudo systemctl enable --now docker
   docker --version
   docker compose version
   ```
3. Kullanıcıyı Docker grubuna ekle (logout/login gerekir):
   ```bash
   sudo usermod -aG docker "$USER"
   ```
4. Yeni oturumda doğrula: `docker ps` (sudo istemeden çalışmalı).

> `docker.io` / compose sürümü Ubuntu 25.10 deposundan gelir. Sorun olursa [Docker resmi repo](https://docs.docker.com/engine/install/ubuntu/) alternatifidir.

---

## 4. Deploy dizini

1. Proje kökünü oluştur:
   ```bash
   sudo mkdir -p /opt/herbalkapida
   sudo chown "$USER":"$USER" /opt/herbalkapida
   ```
2. Bu yol GitHub’da `DEPLOY_PATH` varsayılanıdır (`/opt/herbalkapida`). Değiştirirsen Secret’ı da güncelle.

---

## 5. DNS (domain paneli)

Aşağıdaki kayıtları sunucu IP’ye yönlendir:

| Tip | Host | Değer |
|-----|------|--------|
| A | `@` (herbalkapida.com) | SUNUCU_IP |
| A | `www` | SUNUCU_IP |
| A | `admin` | SUNUCU_IP |
| A | `api` | SUNUCU_IP |

Yayılmayı bekle: `dig herbalkapida.com +short`

---

## 6. Nginx + TLS

1. Kur:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```
2. Site config oluştur (`/etc/nginx/sites-available/herbalkapida.com`) — örnek bloklar [GO_LIVE.md](./GO_LIVE.md).
3. Proxy hedefleri (compose host portları):
   - Vitrin → `127.0.0.1:3200`
   - Admin → `127.0.0.1:3201`
   - API → `127.0.0.1:3202` (`client_max_body_size 25m`)
4. Aktif et:
   ```bash
   sudo ln -sf /etc/nginx/sites-available/herbalkapida.com /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
5. Sertifika:
   ```bash
   sudo certbot --nginx -d herbalkapida.com -d www.herbalkapida.com \
     -d admin.herbalkapida.com -d api.herbalkapida.com
   ```

> İlk deploy’dan önce container’lar ayakta olmayabilir; Nginx `502` normal. Önce DNS + HTTP site, sonra Certbot, sonra deploy.

---

## 7. `deploy/.env` — ne girmelisin?

İlk CI deploy örnek dosyayı kopyalar; **yayından önce** sunucuda veya `DEPLOY_ENV` secret’ında doldur:

### Zorunlu

| Değişken | Ne yazılacak |
|----------|----------------|
| `JWT_SECRET` | Uzun rastgele string (`openssl rand -hex 32`) |
| `POSTGRES_PASSWORD` | Güçlü DB şifresi |
| `FRONTEND_URL` | `https://herbalkapida.com` |
| `ADMIN_URL` | `https://admin.herbalkapida.com` |
| `API_URL` | `https://api.herbalkapida.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://herbalkapida.com` |
| `NEXT_PUBLIC_ADMIN_URL` | `https://admin.herbalkapida.com` |
| `NEXT_PUBLIC_API_URL` | `https://api.herbalkapida.com` |

### Mail (info@)

| Değişken | Ne yazılacak |
|----------|----------------|
| `MAIL_FROM` | `"Herbal Kapıda <info@herbalkapida.com>"` |
| `MAIL_HOST` | SMTP host (hosting / Gmail / vs.) |
| `MAIL_PORT` | genelde `465` |
| `MAIL_SECURE` | `true` |
| `MAIL_USER` | `info@herbalkapida.com` |
| `MAIL_PASS` | SMTP şifresi / uygulama şifresi |
| `ORDER_ALERT_EMAILS` | `info@herbalkapida.com` |

### Ödeme (canlı öncesi)

| Değişken | Ne yazılacak |
|----------|----------------|
| `PAYTR_MERCHANT_ID` / `KEY` / `SALT` | PayTR panelinden |
| `PAYTR_TEST_MODE` | canlıda `0` |
| `PAYTR_ALLOW_MOCK` | `false` |
| PayTR callback | `https://api.herbalkapida.com/payments/paytr/callback` |

### Opsiyonel ama sık kullanılan

| Değişken | Ne yazılacak |
|----------|----------------|
| `GOOGLE_CLIENT_ID` / `SECRET` | Google Cloud OAuth |
| `GOOGLE_CALLBACK_URL` | `https://api.herbalkapida.com/auth/google/callback` |
| `GOOGLE_ADMIN_CALLBACK_URL` | `https://api.herbalkapida.com/auth/google/admin/callback` |
| `AWS_*` | S3/CDN kullanıyorsan |
| `NEXT_PUBLIC_GTM_ID` / GA4 / Ads / Meta | analitik |
| `WHATSAPP_*` | Meta Cloud API kullanıyorsan |

Portlar varsayılan kalsın: `3200` / `3201` / `3202` / `5434` / `6381`.

Tam şablon: `deploy/.env.production.example`

---

## 8. GitHub’da girilecekler

**Settings → Secrets and variables → Actions** (veya Environment: `production`)

### Secrets (zorunlu)

1. `DEPLOY_HOST` → sunucu IP veya hostname  
2. `DEPLOY_USER` → SSH kullanıcı (`deploy` vb.)  
3. `DEPLOY_SSH_KEY` → private key’in tamamı (`-----BEGIN ... KEY-----` …)

### Secrets (önerilir)

4. `DEPLOY_ENV` → hazır `deploy/.env` içeriği (çok satır; ilk kurulumda otomatik yazılır)  
5. `GHCR_PULL_TOKEN` → private paket pull sorununda PAT (`read:packages`)  
6. `GHCR_PULL_USER` → GitHub kullanıcı adı  

### Variables (önerilir)

7. `NEXT_PUBLIC_SITE_URL` = `https://herbalkapida.com`  
8. `NEXT_PUBLIC_API_URL` = `https://api.herbalkapida.com`  
9. `NEXT_PUBLIC_ADMIN_URL` = `https://admin.herbalkapida.com`  

Opsiyonel: `DEPLOY_PORT` (varsayılan 22), `DEPLOY_PATH` (varsayılan `/opt/herbalkapida`).

Detay tablo: [SECRETS.md](./SECRETS.md)

---

## 9. GHCR (ilk push sonrası)

1. `main`’e push → Actions **Build & Deploy** çalışır.
2. GitHub → **Packages**: `api`, `frontend`, `admin` görünür.
3. Private repo ise paket visibility / Actions access’i kontrol et.
4. Sunucu `docker login ghcr.io` ile workflow üzerinden login olur (manuel gerekmez).

---

## 10. İlk deploy ve doğrulama

1. Actions yeşil mi bak; deploy adımı SSH + rolling recreate yapar.
2. Sunucuda:
   ```bash
   cd /opt/herbalkapida
   docker compose -f docker-compose.prod.yml --env-file deploy/.env ps
   ```
3. Health:
   - `https://herbalkapida.com`
   - `https://admin.herbalkapida.com`
   - `https://api.herbalkapida.com/health`
4. Boş DB’de otomatik seed çalışır; dolu Postgres volume’daki veriler korunur.
5. Admin → Site Ayarları: logo, telefon, `info@herbalkapida.com`.
6. Test siparişi + mail + PayTR (canlı anahtarlar hazırsa).

Manuel zorla seed: Actions → **Build & Deploy** → `seed: true`  
Yerel: `SEED_ON_DEPLOY=1 bash deploy/deploy.sh`

---

## 11. Kısa özet — “neyi nereye”

| Nerede | Ne |
|--------|-----|
| DNS paneli | A kayıtları → sunucu IP |
| Ubuntu | Docker, Nginx, Certbot, UFW, `/opt/herbalkapida` |
| `deploy/.env` veya `DEPLOY_ENV` | JWT, DB şifresi, domain URL’leri, mail, PayTR |
| GitHub Secrets | `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` |
| GitHub Variables | `NEXT_PUBLIC_*` URL’ler |
| PayTR / Google panelleri | callback URL’ler (`api.herbalkapida.com`) |

Canlı checklist: [GO_LIVE.md](./GO_LIVE.md)
