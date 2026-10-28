#!/bin/bash
# ============================================================
# GNC Inc — Boot akışı (dev.sh)
# /start.sh bu dosyayı bulursa varsayılan akış YERİNE bunu çalıştırır.
# Sıra: PostgreSQL → (gerekirse) DB+rol kurulumu → .env onarımı →
#       ana sunucu (3000) → mini-services (3001-3007)
# Çalıştırma: /start.sh boot'ta otomatik — `bash .zscripts/dev.sh` ile elle de olur.
# ============================================================
set -uo pipefail

PROJ=/home/z/my-project
export PGBIN=/home/z/pgdeb/root/usr/lib/postgresql/17/bin
export LD_LIBRARY_PATH=/home/z/pgdeb/root/usr/lib/x86_64-linux-gnu
export DATA=/home/z/pgdata
export NEXT_TELEMETRY_DISABLED=1

# Port haritası — servis klasörü adı → sabit port (site-config ile uyumlu)
declare -A PORTS=(
  [gnc-inc]=3000 [gnc-erp]=3001 [randevu]=3002 [kaloriai]=3003
  [fruitstorm]=3004 [cubiq]=3005 [petguardian]=3006 [gridpop]=3007
)

log() { echo "[dev.sh $(date +%H:%M:%S)] $*"; }

port_open() { ss -tln 2>/dev/null | grep -q ":$1 " ; }

# ------------------------------------------------------------
# 1) PostgreSQL 17 — binary yoksa (sandbox sıfırlanmış) devam edemediğimizi
#    net söyle, kalan adımlar yine denensin.
# ------------------------------------------------------------
PG_OK=0
if [ -x "$PGBIN/pg_ctl" ]; then
  if "$PGBIN/pg_ctl" -D "$DATA" status >/dev/null 2>&1; then
    log "PostgreSQL zaten çalışıyor."
    PG_OK=1
  else
    if bash /home/z/pg/start.sh; then
      log "PostgreSQL başlatıldı."
      PG_OK=1
    else
      log "HATA: PostgreSQL başlatılamadı — $DATA/postgres.log'a bakın."
    fi
  fi
else
  log "UYARI: PostgreSQL binary'leri yok (/home/z/pgdeb). Kurtarma: deploy/README.md → Sandbox Kurtarma."
fi

# ------------------------------------------------------------
# 2) Veritabanları + rollar — SADECE eksikse kurulum çalışsın
#    (setup-db.mjs her koşuda rastgele şifre üretir; varolanı BOZMAMAK için
#     yalnızca gnc_erp DB'si yokken çalıştır.)
# ------------------------------------------------------------
if [ "$PG_OK" = "1" ]; then
  ERP_EXISTS=$("$PGBIN/psql" -h /tmp -U postgres -d postgres -t -A -c \
    "SELECT 1 FROM pg_database WHERE datname='gnc_erp'" 2>/dev/null | tr -d '[:space:]')
  if [ "$ERP_EXISTS" != "1" ]; then
    log "Veritabanları eksik — setup-db.mjs çalışıyor (5 DB + rol)…"
    bun /home/z/pg/setup-db.mjs || log "HATA: DB kurulumu başarısız."
  else
    log "Veritabanları hazır (gnc_inc, gnc_erp, kaloriai, fruitstorm, cubiq)."
  fi

  # Mini-service .env'leri eksikse credentials.md'den onar
  for entry in gnc_erp:gnc-erp kaloriai:kaloriai fruitstorm:fruitstorm cubiq:cubiq; do
    db="${entry%%:*}"; svc="${entry##*:}"
    envfile="$PROJ/mini-services/$svc/.env"
    if [ ! -f "$envfile" ] && [ -f /home/z/pg/credentials.md ]; then
      url=$(grep -o "postgresql://[^\`]*@127.0.0.1:5432/$db\`" /home/z/pg/credentials.md \
        | head -1 | tr -d '\`')
      if [ -n "$url" ]; then
        printf 'DATABASE_URL="%s"\n' "$url" > "$envfile"
        log "$svc/.env onarıldı (credentials.md)."
      fi
    fi
  done
fi

# ------------------------------------------------------------
# 3) Ana .env — bootstrap sıfırlamada SQLite URL yazabiliyor; her açılışta
#    doğru PostgreSQL URL'ini garanti et (env var da export ediliyor ki
#    shell'e bulaşmış eski değer ezilsin).
# ------------------------------------------------------------
cat > "$PROJ/.env" <<'EOF'
DATABASE_URL=postgresql://gnc_inc_user:tvDeCsv34LR3XtQLpm2i@127.0.0.1:5432/gnc_inc
NEXT_PUBLIC_SERVICES_MODE=sandbox
EOF
export DATABASE_URL=postgresql://gnc_inc_user:tvDeCsv34LR3XtQLpm2i@127.0.0.1:5432/gnc_inc
log ".env PostgreSQL URL'ine sabitlendi."

# ------------------------------------------------------------
# 4) Ana sunucu (gnc-inc, port 3000)
# ------------------------------------------------------------
cd "$PROJ"
if port_open "${PORTS[gnc-inc]}"; then
  log "Ana sunucu :3000 zaten açık — atlanıyor."
else
  log "Ana sunucu hazırlanıyor: bun install…"
  bun install > /tmp/boot-main-install.log 2>&1 || log "UYARI: bun install hata verdi."
  bunx prisma generate > /tmp/boot-main-prisma.log 2>&1 || log "UYARI: prisma generate hata verdi."
  bun run db:push >> /tmp/boot-main-prisma.log 2>&1 || log "UYARI: db:push hata verdi."
  bun prisma/seed.ts >> /tmp/boot-main-prisma.log 2>&1 || log "UYARI: seed hata verdi."
  log "Ana sunucu başlıyor (:3000)…"
  ( bun run dev > /tmp/boot-main-dev.log 2>&1 & )
fi

# ------------------------------------------------------------
# 5) Mini-services (3001-3007) — her bağımsız repo kendi .env'iyle
# ------------------------------------------------------------
for dir in "$PROJ"/mini-services/*/; do
  name=$(basename "$dir")
  [ -f "$dir/package.json" ] || { log "$name: package.json yok, atlandı."; continue; }
  port="${PORTS[$name]:-}"
  if [ -n "$port" ] && port_open "$port"; then
    log "$name :$port zaten açık — atlanıyor."
    continue
  fi
  log "$name başlıyor (:${port:-?})…"
  (
    cd "$dir"
    bun install > /tmp/mini-service-install.log 2>&1
    if grep -q '"dev"' package.json; then
      bun run dev
    fi
  ) > "/tmp/mini-service-$name.log" 2>&1 &
  # port yetişsin — sıralı çakışma olmasın
  sleep 1
done

log "Boot akışı tamam. Ana sunucu: :3000 · mini-services: :3001-:3007"
wait
