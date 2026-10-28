#!/bin/bash
# ============================================================================
# GNC ECOSYSTEM — Tek Komutla Sunucu Kurulumu (v4.0 — PostgreSQL edisyonu)
# ----------------------------------------------------------------------------
# Tüm GNC sistemlerini bir Ubuntu/Debian VPS'e kurar:
#   PostgreSQL 17 · Node 20 · Bun · pm2 · nginx · certbot
#   8 servis: gnc-inc(3000) gnc-erp(3001) randevu(3002) kaloriai(3003)
#            fruitstorm(3004) cubiq(3005) petguardian(3006) gridpop(3007)
#
# Kullanım:  sudo bash deploy/kurulum.sh
# Yeniden çalıştırılabilir (idempotent).
# ============================================================================
set -euo pipefail

DOMAIN="gncinc.online"
BASE_DIR="/opt/gnc"
LOG_FILE="/var/log/gnc-kurulum.log"
DB_PASS_PREFIX="gnc"

info()  { echo -e "\033[0;32m[+]\033[0m $*"; }
warn()  { echo -e "\033[0;33m[!]\033[0m $*"; }
err()   { echo -e "\033[0;31m[x]\033[0m $*" >&2; }

[[ $EUID -eq 0 ]] || { err "Root olarak çalıştırın: sudo bash $0"; exit 1; }

mkdir -p "$(dirname "$LOG_FILE")"
exec > >(tee -a "$LOG_FILE") 2>&1

info "GNC ekosistemi kurulumu başlıyor — $(date)"

# ----------------------------------------------------------------------------
# 1) Sistem paketleri
# ----------------------------------------------------------------------------
info "Sistem paketleri güncelleniyor…"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git nginx postgresql postgresql-contrib \
  ca-certificates gnupg build-essential pkg-config ufw fail2ban

# Swap (2GB — 4GB RAM'li VPS'ler için kritik)
if ! swapon --show | grep -q .; then
  info "2GB swap oluşturuluyor…"
  fallocate -l 2G /swapfile && chmod 600 /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo 'vm.swappiness=20' > /etc/sysctl.d/99-gnc.conf
  echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.d/99-gnc.conf
  sysctl -p /etc/sysctl.d/99-gnc.conf
fi

# ----------------------------------------------------------------------------
# 2) Node 20 + Bun
# ----------------------------------------------------------------------------
if ! command -v node >/dev/null || [[ "$(node -v | cut -c2-3)" -lt 20 ]]; then
  info "Node.js 20 kuruluyor…"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

if ! command -v bun >/dev/null; then
  info "Bun kuruluyor…"
  curl -fsSL https://bun.sh/install | bash || npm i -g bun
fi
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

if ! command -v pm2 >/dev/null; then
  info "pm2 kuruluyor…"
  npm i -g pm2
  pm2 startup systemd -u root --hp /root >/dev/null
fi

# ----------------------------------------------------------------------------
# 3) PostgreSQL 17 + veritabanları
# ----------------------------------------------------------------------------
info "PostgreSQL servisleri…"
systemctl enable --now postgresql

DBs=(
  "gnc_inc:gnc_inc_user"
  "gnc_erp:gnc_erp_user"
  "kaloriai:kaloriai_user"
  "fruitstorm:fruitstorm_user"
  "cubiq:cubiq_user"
)
declare -A PASS
for pair in "${DBs[@]}"; do
  db="${pair%%:*}"; user="${pair##*:}"
  pass="$(openssl rand -hex 12 2>/dev/null || head -c12 /dev/urandom | xxd -p)"
  PASS[$db]="$pass"
  sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$user'" | grep -q 1 \
    || sudo -u postgres psql -c "CREATE ROLE $user LOGIN PASSWORD '$pass';"
  sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$db'" | grep -q 1 \
    || sudo -u postgres psql -c "CREATE DATABASE $db OWNER $user ENCODING 'UTF8';"
  sudo -u postgres psql -c "ALTER DATABASE $db OWNER TO $user;" >/dev/null
  sudo -u postgres psql -c "ALTER ROLE $user WITH LOGIN PASSWORD '$pass';" >/dev/null
  info "Veritabanı hazır: $db (sahip: $user)"
done

# ----------------------------------------------------------------------------
# 4) Depoları çek
# ----------------------------------------------------------------------------
mkdir -p "$BASE_DIR"
clone() {
  local name="$1" url="$2"
  if [[ -d "$BASE_DIR/$name/.git" ]]; then
    info "$name güncelleniyor…"
    git -C "$BASE_DIR/$name" pull --ff-only || warn "$name: elle müdahale gerekli"
  else
    info "$name klonlanıyor…"
    git clone "https://github.com/kaancetin3141/$url.git" "$BASE_DIR/$name"
  fi
}
clone gnc-inc      gnc-inc
clone gnc-erp      gnc-erp
clone randevu      randevu
clone kaloriai     KaloriAI
clone fruitstorm   fruit-storm
clone cubiq        cubiq
clone petguardian  PetGuardian
clone gridpop      gridpop

# ----------------------------------------------------------------------------
# 5) Uygulamalar: .env + kurulum + build
# ----------------------------------------------------------------------------
write_env() { # $1=dizin $2=DATABASE_URL
  local f="$1/.env"
  [[ -f "$f" ]] && return 0
  cat > "$f" <<EOF
DATABASE_URL="$2"
NODE_ENV=production
EOF
  info "$1/.env yazıldı"
}
PGURL() { echo "postgresql://$1:$2@127.0.0.1:5432/$3"; }

# --- gnc-inc (3000) ---
write_env "$BASE_DIR/gnc-inc" "$(PGURL gnc_inc_user "${PASS[gnc_inc]}" gnc_inc)"
# --- gnc-erp (3001) ---
write_env "$BASE_DIR/gnc-erp" "$(PGURL gnc_erp_user "${PASS[gnc_erp]}" gnc_erp)"
# --- randevu (3002) — kendi DB'si yok, ERP API'sine bağlanır ---
[[ -f "$BASE_DIR/randevu/.env" ]] || cat > "$BASE_DIR/randevu/.env" <<EOF
CRM_BASE_URL=http://127.0.0.1:3001
BASE_DOMAIN=$DOMAIN
EOF
# --- kaloriai (3003) ---
write_env "$BASE_DIR/kaloriai" "$(PGURL kaloriai_user "${PASS[kaloriai]}" kaloriai)"
# --- fruitstorm (3004) ---
write_env "$BASE_DIR/fruitstorm" "$(PGURL fruitstorm_user "${PASS[fruitstorm]}" fruitstorm)"
# --- cubiq (3005) ---
write_env "$BASE_DIR/cubiq" "$(PGURL cubiq_user "${PASS[cubiq]}" cubiq)"

info "Bağımlılıklar ve derlemeler (uzun sürebilir)…"
for app in gnc-inc gnc-erp kaloriai fruitstorm; do
  ( cd "$BASE_DIR/$app" && bun install --frozen-lockfile 2>/dev/null || bun install \
      && bunx prisma generate \
      && bunx prisma db push --accept-data-loss )
done
( cd "$BASE_DIR/cubiq" && bun install && bunx prisma db push --accept-data-loss )
( cd "$BASE_DIR/randevu" && bun install 2>/dev/null || true )

info "Üretim derlemeleri…"
for app in gnc-inc gnc-erp kaloriai fruitstorm; do
  ( cd "$BASE_DIR/$app" && NODE_OPTIONS=--max-old-space-size=2048 bunx next build )
done

# Flutter statikleri (Flutter SDK varsa)
if ! command -v flutter >/dev/null; then
  warn "Flutter SDK bulunamadı — petguardian/gridpop web build atlanıyor."
  warn "Kurulum: https://docs.flutter.dev/get-started/install/linux ardından yeniden çalıştırın."
else
  for app in petguardian gridpop; do
    ( cd "$BASE_DIR/$app" && flutter pub get && flutter build web --release )
  done
fi

# Seed'ler
info "Seed verileri…"
( cd "$BASE_DIR/gnc-inc" && bun run prisma/seed.ts || true )
( cd "$BASE_DIR/kaloriai" && bun run prisma/seed.ts || bunx prisma db seed || true )
( cd "$BASE_DIR/gnc-erp" && curl -s -X POST http://127.0.0.1:3001/api/seed >/dev/null || true )

# ----------------------------------------------------------------------------
# 6) pm2 ile servisler
# ----------------------------------------------------------------------------
info "pm2 süreçleri tanımlanıyor…"
cat > "$BASE_DIR/ecosystem.config.cjs" <<'EOF'
// GNC ekosistemi — pm2 süreç tanımları (port 3000-3007)
module.exports = {
  apps: [
    { name: "gnc-inc",     cwd: "/opt/gnc/gnc-inc",     script: "node_modules/next/dist/bin/next", args: "start -p 3000", env: { NODE_ENV: "production" } },
    { name: "gnc-erp",     cwd: "/opt/gnc/gnc-erp",     script: "node_modules/next/dist/bin/next", args: "start -p 3001", env: { NODE_ENV: "production" } },
    { name: "randevu",     cwd: "/opt/gnc/randevu",     script: "bun", args: "index.ts",          env: { NODE_ENV: "production", CRM_BASE_URL: "http://127.0.0.1:3001", BASE_DOMAIN: "gncinc.online", PORT: "3002" } },
    { name: "kaloriai",    cwd: "/opt/gnc/kaloriai",    script: "node_modules/next/dist/bin/next", args: "start -p 3003", env: { NODE_ENV: "production" } },
    { name: "fruitstorm",  cwd: "/opt/gnc/fruitstorm",  script: "node_modules/next/dist/bin/next", args: "start -p 3004", env: { NODE_ENV: "production" } },
    { name: "cubiq",       cwd: "/opt/gnc/cubiq",       script: "bun", args: "server.ts",         env: { NODE_ENV: "production" } },
    { name: "petguardian", cwd: "/opt/gnc/petguardian", script: "bun", args: "server.ts",         env: { NODE_ENV: "production" } },
    { name: "gridpop",     cwd: "/opt/gnc/gridpop",     script: "bun", args: "server.ts",         env: { NODE_ENV: "production" } },
  ],
};
EOF
pm2 start "$BASE_DIR/ecosystem.config.cjs" --update-env
pm2 save

# ----------------------------------------------------------------------------
# 7) nginx + sertifikalar
# ----------------------------------------------------------------------------
info "nginx yapılandırması…"
cp deploy/nginx/gncinc.online.conf /etc/nginx/sites-available/gncinc.online.conf
ln -sf /etc/nginx/sites-available/gncinc.online.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

info "Let's Encrypt sertifikaları…"
apt-get install -y certbot python3-certbot-nginx
for sub in "" www crm randevu kaloriai fruitstorm cubiq petguardian gridpop; do
  host="$sub.$DOMAIN"; [[ -z "$sub" ]] && host="$DOMAIN"
  dig +short "$host" | grep -q . || warn "$host DNS kaydı yok — atlanıyor"
done
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" -d "crm.$DOMAIN" -d "randevu.$DOMAIN" \
  -d "kaloriai.$DOMAIN" -d "fruitstorm.$DOMAIN" -d "cubiq.$DOMAIN" \
  -d "petguardian.$DOMAIN" -d "gridpop.$DOMAIN" --redirect -n --agree-tos \
  -m "admin@$DOMAIN" || warn "certbot ilk denemede sertifika alamadı — DNS'i kontrol edip 'certbot --nginx' ile tekrar deneyin"

# ----------------------------------------------------------------------------
# 8) Güvenlik duvarı + yedekleme zamanlayıcısı
# ----------------------------------------------------------------------------
info "Güvenlik duvarı…"
ufw allow 22,80,443/tcp >/dev/null; ufw --force enable

info "Yedekleme cron'u (günlük 03:30)…"
install -m 755 deploy/backup.sh /usr/local/bin/gnc-backup
( crontab -l 2>/dev/null | grep -v gnc-backup; \
  echo "30 3 * * * /usr/local/bin/gnc-backup >> /var/log/gnc-backup.log 2>&1" ) | crontab -

# ----------------------------------------------------------------------------
# 9) Sağlık kontrolü
# ----------------------------------------------------------------------------
info "Port sağlık kontrolü…"
sleep 5
for port in 3000 3001 3002 3003 3004 3005 3006 3007; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "http://127.0.0.1:$port/" || echo 000)
  if [[ "$code" =~ ^[23] ]]; then info ":$port → HTTP $code ✓";
  else warn ":$port → HTTP $code (pm2 logs ile inceleyin)"; fi
done

echo
info "KURULUM TAMAMLANDI — https://www.$DOMAIN"
info "Komut referansı: deploy/SUNUCU-KOMUTLARI.md"
