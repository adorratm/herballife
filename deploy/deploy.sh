#!/usr/bin/env bash
# Zero-downtime production deploy (GHCR veya yerel build).
# Kullanım:
#   bash deploy/deploy.sh
#   HERBAL_KAPIDA_USE_REGISTRY=1 IMAGE_TAG=sha-abc123 bash deploy/deploy.sh
#   SEED_ON_DEPLOY=1 bash deploy/deploy.sh   # zorla seed
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COMPOSE=(docker compose -f docker-compose.prod.yml --env-file deploy/.env)
HEALTH_TIMEOUT_SEC="${HEALTH_TIMEOUT_SEC:-180}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
GHCR_OWNER="${GHCR_OWNER:-${GITHUB_REPOSITORY_OWNER:-adorratm}}"
GHCR_REPO="${GHCR_REPO:-${GITHUB_REPOSITORY_NAME:-herbalkapida}}"
# ghcr.io zorunlu küçük harf
GHCR_OWNER="$(echo "$GHCR_OWNER" | tr '[:upper:]' '[:lower:]')"
GHCR_REPO="$(echo "$GHCR_REPO" | tr '[:upper:]' '[:lower:]')"
REGISTRY_PREFIX="ghcr.io/${GHCR_OWNER}/${GHCR_REPO}"

log() { printf '[deploy] %s\n' "$*"; }
die() { printf '[deploy] ERROR: %s\n' "$*" >&2; exit 1; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "'$1' gerekli"
}

need_cmd docker
docker compose version >/dev/null 2>&1 || die "docker compose plugin gerekli"

# ── .env ──────────────────────────────────────────────────────────────────────
if [[ ! -f deploy/.env ]]; then
  log "deploy/.env yok — örnekten oluşturuluyor"
  cp deploy/.env.production.example deploy/.env
  if command -v openssl >/dev/null 2>&1; then
    gen="$(openssl rand -hex 32)"
    if grep -q '^JWT_SECRET=' deploy/.env; then
      sed -i.bak "s|^JWT_SECRET=.*|JWT_SECRET=${gen}|" deploy/.env && rm -f deploy/.env.bak
    fi
    if grep -q '^POSTGRES_PASSWORD=degistir' deploy/.env; then
      pw="$(openssl rand -hex 16)"
      sed -i.bak "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${pw}|" deploy/.env && rm -f deploy/.env.bak
    fi
  fi
  log "deploy/.env oluşturuldu — yayından önce gözden geçirin"
fi

set -a
# shellcheck disable=SC1091
source deploy/.env
set +a

[[ -n "${POSTGRES_PASSWORD:-}" ]] || die "POSTGRES_PASSWORD boş (deploy/.env)"

mkdir -p frontend/public/downloads deploy/artifacts

# ── Redis AOF onarım (opsiyonel) ──────────────────────────────────────────────
repair_redis_aof() {
  if ! docker ps --format '{{.Names}}' | grep -qx herbalkapida-prod-redis; then
    return 0
  fi
  if ! "${COMPOSE[@]}" exec -T redis redis-cli ping 2>/dev/null | grep -qi pong; then
    log "Redis yanıt vermiyor — AOF onarım deneniyor"
    "${COMPOSE[@]}" exec -T redis redis-check-aof --fix /data/appendonlydir/appendonly.aof.manifest 2>/dev/null || true
    "${COMPOSE[@]}" restart redis || true
    sleep 3
  fi
}

# ── Image etiketleri ──────────────────────────────────────────────────────────
LOCAL_API="herbalkapida-prod-api"
LOCAL_FE="herbalkapida-prod-frontend"
LOCAL_ADMIN="herbalkapida-prod-admin"

tag_exists() {
  docker image inspect "$1" >/dev/null 2>&1
}

compose_network() {
  # name: herbalkapida-prod + networks.herbalkapida → herbalkapida-prod_herbalkapida
  local n
  n="$(docker network ls --format '{{.Name}}' | grep -E '^herbalkapida-prod_herbalkapida$' || true)"
  if [[ -z "$n" ]]; then
    n="$(docker inspect herbalkapida-prod-postgres -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}' 2>/dev/null || true)"
  fi
  [[ -n "$n" ]] || die "Docker ağı bulunamadı (postgres ayakta mı?)"
  printf '%s' "$n"
}

# compose run + container_name çakışmasın diye one-shot docker run
run_api_oneshot() {
  local image="$1"
  shift
  local net
  net="$(compose_network)"
  docker run --rm \
    --network "$net" \
    --env-file deploy/.env \
    -e NODE_ENV=production \
    -e DATABASE_HOST=postgres \
    -e DATABASE_PORT=5432 \
    -e REDIS_URL=redis://redis:6379 \
    -e DATABASE_SYNCHRONIZE=false \
    -e DATABASE_MIGRATIONS_RUN=false \
    "$image" \
    "$@"
}

rollback_service() {
  local svc="$1" name="$2"
  if tag_exists "${name}:rollback"; then
    log "ROLLBACK: ${svc} → ${name}:rollback"
    docker tag "${name}:rollback" "${name}:live"
    export API_IMAGE="${LOCAL_API}:live"
    export FRONTEND_IMAGE="${LOCAL_FE}:live"
    export ADMIN_IMAGE="${LOCAL_ADMIN}:live"
    case "$svc" in
      api) API_IMAGE="${LOCAL_API}:live" ;;
      frontend) FRONTEND_IMAGE="${LOCAL_FE}:live" ;;
      admin) ADMIN_IMAGE="${LOCAL_ADMIN}:live" ;;
    esac
    export API_IMAGE FRONTEND_IMAGE ADMIN_IMAGE
    "${COMPOSE[@]}" up -d --no-deps --force-recreate "$svc" || true
  else
    log "ROLLBACK: ${name}:rollback yok — manuel müdahale gerekebilir"
  fi
}

wait_healthy() {
  local svc="$1"
  local deadline=$((SECONDS + HEALTH_TIMEOUT_SEC))
  log "Sağlık bekleniyor: ${svc} (max ${HEALTH_TIMEOUT_SEC}s)"
  while (( SECONDS < deadline )); do
    local cid
    cid="$("${COMPOSE[@]}" ps -q "$svc" 2>/dev/null || true)"
    if [[ -n "$cid" ]]; then
      local h running
      h="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$cid" 2>/dev/null || echo none)"
      running="$(docker inspect -f '{{.State.Running}}' "$cid" 2>/dev/null || echo false)"
      if [[ "$h" == "healthy" ]]; then
        log "healthy: ${svc}"
        return 0
      fi
      if [[ "$h" == "none" && "$running" == "true" ]]; then
        sleep 5
        log "running (no healthcheck): ${svc}"
        return 0
      fi
    fi
    sleep 3
  done
  log "TIMEOUT: ${svc} healthy olmadı (${HEALTH_TIMEOUT_SEC}s)"
  return 1
}

recreate_rolling() {
  local svc="$1" local_name="$2"
  log "Rolling recreate: ${svc}"
  if tag_exists "${local_name}:live"; then
    docker tag "${local_name}:live" "${local_name}:rollback"
  fi
  docker tag "${local_name}:next" "${local_name}:live"

  export API_IMAGE="${LOCAL_API}:live"
  export FRONTEND_IMAGE="${LOCAL_FE}:live"
  export ADMIN_IMAGE="${LOCAL_ADMIN}:live"

  if ! "${COMPOSE[@]}" up -d --no-deps --force-recreate "$svc"; then
    rollback_service "$svc" "$local_name"
    die "${svc} recreate başarısız"
  fi
  if ! wait_healthy "$svc"; then
    rollback_service "$svc" "$local_name"
    die "${svc} health başarısız — rollback uygulandı"
  fi
}

# ── 1) Postgres + Redis ───────────────────────────────────────────────────────
log "Postgres + Redis ayağa kalkıyor"
"${COMPOSE[@]}" up -d postgres redis
repair_redis_aof
wait_healthy postgres || die "postgres healthy değil"
wait_healthy redis || die "redis healthy değil"

# ── 2) Image pull / build ─────────────────────────────────────────────────────
if [[ "${HERBAL_KAPIDA_USE_REGISTRY:-0}" == "1" ]]; then
  log "GHCR pull: ${REGISTRY_PREFIX}:{api,frontend,admin}:${IMAGE_TAG}"
  docker pull "${REGISTRY_PREFIX}/api:${IMAGE_TAG}"
  docker pull "${REGISTRY_PREFIX}/frontend:${IMAGE_TAG}"
  docker pull "${REGISTRY_PREFIX}/admin:${IMAGE_TAG}"
  docker tag "${REGISTRY_PREFIX}/api:${IMAGE_TAG}" "${LOCAL_API}:next"
  docker tag "${REGISTRY_PREFIX}/frontend:${IMAGE_TAG}" "${LOCAL_FE}:next"
  docker tag "${REGISTRY_PREFIX}/admin:${IMAGE_TAG}" "${LOCAL_ADMIN}:next"
else
  log "Yerel build (VPS) — Node 26 / Yarn 4.18"
  docker build -f docker/api.Dockerfile -t "${LOCAL_API}:next" .
  docker build -f docker/frontend.Dockerfile \
    --build-arg "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" \
    --build-arg "NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}" \
    --build-arg "NEXT_PUBLIC_ADMIN_URL=${NEXT_PUBLIC_ADMIN_URL:-}" \
    --build-arg "NEXT_PUBLIC_CDN_URL=${NEXT_PUBLIC_CDN_URL:-}" \
    --build-arg "NEXT_PUBLIC_GA4_ID=${NEXT_PUBLIC_GA4_ID:-}" \
    --build-arg "NEXT_PUBLIC_GTM_ID=${NEXT_PUBLIC_GTM_ID:-}" \
    --build-arg "NEXT_PUBLIC_GOOGLE_ADS_ID=${NEXT_PUBLIC_GOOGLE_ADS_ID:-}" \
    --build-arg "NEXT_PUBLIC_META_PIXEL_ID=${NEXT_PUBLIC_META_PIXEL_ID:-}" \
    --build-arg "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=${NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION:-}" \
    --build-arg "AWS_S3_BUCKET=${AWS_S3_BUCKET:-}" \
    --build-arg "AWS_REGION=${AWS_REGION:-eu-central-1}" \
    --build-arg "AWS_CDN_URL=${AWS_CDN_URL:-}" \
    -t "${LOCAL_FE}:next" .
  docker build -f docker/admin.Dockerfile \
    --build-arg "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" \
    --build-arg "NEXT_PUBLIC_ADMIN_URL=${NEXT_PUBLIC_ADMIN_URL}" \
    --build-arg "NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-}" \
    --build-arg "NEXT_PUBLIC_CDN_URL=${NEXT_PUBLIC_CDN_URL:-}" \
    -t "${LOCAL_ADMIN}:next" .
fi

tag_exists "${LOCAL_API}:next" || die "${LOCAL_API}:next yok"
tag_exists "${LOCAL_FE}:next" || die "${LOCAL_FE}:next yok"
tag_exists "${LOCAL_ADMIN}:next" || die "${LOCAL_ADMIN}:next yok"

# ── 3) Migration (eski API ayakta kalır) ──────────────────────────────────────
log "Migration one-shot (yeni image)"
if ! run_api_oneshot "${LOCAL_API}:next" node dist/migrate.js; then
  die "Migration başarısız — çalışan container'lara dokunulmadı"
fi

# ── 4) Seed (boş DB veya SEED_ON_DEPLOY=1) ────────────────────────────────────
should_seed=0
if [[ "${SEED_ON_DEPLOY:-0}" == "1" ]]; then
  should_seed=1
  log "SEED_ON_DEPLOY=1 — seed zorlanıyor"
else
  product_count="$("${COMPOSE[@]}" exec -T postgres \
    psql -U "${POSTGRES_USER:-herbalkapida}" -d "${POSTGRES_DB:-herbalkapida}" -tAc \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='products';" \
    2>/dev/null | tr -d '[:space:]' || echo 0)"
  if [[ "${product_count}" == "1" ]]; then
    rows="$("${COMPOSE[@]}" exec -T postgres \
      psql -U "${POSTGRES_USER:-herbalkapida}" -d "${POSTGRES_DB:-herbalkapida}" -tAc \
      "SELECT COUNT(*) FROM products;" 2>/dev/null | tr -d '[:space:]' || echo 0)"
    if [[ "${rows}" == "0" || -z "${rows}" ]]; then
      should_seed=1
      log "products tablosu boş — varsayılan seed çalışacak"
    else
      log "Mevcut veri var (${rows} ürün) — seed atlandı"
    fi
  else
    should_seed=1
    log "products tablosu yok — varsayılan seed çalışacak"
  fi
fi

if [[ "$should_seed" == "1" ]]; then
  log "Seed (varsayılan demo veriler)"
  run_api_oneshot "${LOCAL_API}:next" node dist/seed.js || die "Seed başarısız"
fi

# ── 5) Rolling recreate ───────────────────────────────────────────────────────
# İlk deploy'da live yoksa next→live
for name in "$LOCAL_API" "$LOCAL_FE" "$LOCAL_ADMIN"; do
  if ! tag_exists "${name}:live"; then
    docker tag "${name}:next" "${name}:live"
  fi
done

export API_IMAGE="${LOCAL_API}:live"
export FRONTEND_IMAGE="${LOCAL_FE}:live"
export ADMIN_IMAGE="${LOCAL_ADMIN}:live"

recreate_rolling api "$LOCAL_API"
recreate_rolling frontend "$LOCAL_FE"
recreate_rolling admin "$LOCAL_ADMIN"

log "Tamam — api/frontend/admin healthy"
log "Image tag: ${IMAGE_TAG} (registry=${HERBAL_KAPIDA_USE_REGISTRY:-0})"
