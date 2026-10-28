#!/bin/bash
# ============================================================================
# GNC — Sandbox Kurtarma (tek komut)
# ----------------------------------------------------------------------------
# Geliştirme sandbox'ı sıfırlandığında (~/pgdeb, ~/pgdata, mini-services silinir)
# her şeyi geri getirir:
#   1) PostgreSQL 17 binary'leri (kullanıcı modu .deb çıkarımı — sudo YOK)
#   2) initdb + başlatma
#   3) 5 veritabanı + rol + credentials.md
#   4) mini-services (7 repo geri klonu)
#   5) .env onarımları
#   6) .zscripts/dev.sh ile tüm sunucular (3000-3007)
#
# Kullanım:  cd ~/my-project && bash deploy/sandbox/kurtarma.sh
# Idempotent — varolan adımları atlar.
# ============================================================================
set -uo pipefail

PROJ="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"  # …/my-project (deploy/sandbox/ün 2 üstü)
PGDIR="$HOME/pg"
PGBIN="$HOME/pgdeb/root/usr/lib/postgresql/17/bin"
LDLP="$HOME/pgdeb/root/usr/lib/x86_64-linux-gnu"
DATA="$HOME/pgdata"

ok()  { echo -e "\033[0;32m[+]\033[0m $*"; }
warn(){ echo -e "\033[0;33m[!]\033[0m $*"; }

# ----------------------------------------------------------------------------
# 1) PostgreSQL 17 binary'leri
# ----------------------------------------------------------------------------
if [ -x "$PGBIN/pg_ctl" ]; then
  ok "PostgreSQL binary'leri zaten var."
else
  warn "PostgreSQL .deb paketleri indiriliyor (kullanıcı modu, sudo yok)…"
  mkdir -p "$HOME/pgdeb/root" && cd "$HOME/pgdeb"
  apt-get update -qq 2>/dev/null || warn "apt-get update başarısız — devam denemesi"
  # Arch yanlışsa amd64'e düş
  arch=$(dpkg --print-architecture 2>/dev/null || echo amd64)
  apt-get download postgresql-17 postgresql-client-17 postgresql-common libpq5 libpq5:"$arch" \
    2>/dev/null || apt-get download postgresql-17 postgresql-client-17 postgresql-common libpq5 \
    2>/dev/null || warn "indirme kısmen başarısız — log'a bakın"
  local_debs=$(ls *.deb 2>/dev/null | wc -l)
  if [ "$local_debs" -eq 0 ]; then
    echo "HATA: .deb indirilemedi — ağ/kaynak sorununu çözüp yeniden çalıştırın." >&2
    exit 1
  fi
  for f in *.deb; do dpkg -x "$f" "$HOME/pgdeb/root"; done
  ok "$local_debs paket çıkarıldı."
fi

# ----------------------------------------------------------------------------
# 2) initdb + başlat
# ----------------------------------------------------------------------------
export LD_LIBRARY_PATH="$LDLP"
if "$PGBIN/pg_ctl" -D "$DATA" status >/dev/null 2>&1; then
  ok "PostgreSQL zaten çalışıyor."
else
  if [ ! -f "$DATA/PG_VERSION" ]; then
    ok "initdb çalıştırılıyor (ilk kurulum)…"
    "$PGBIN/initdb" -D "$DATA" -U postgres -A trust -E UTF8 --no-locale
    cat > "$DATA/pg_hba.conf" <<EOF
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     trust
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256
EOF
  fi
  "$PGBIN/pg_ctl" -D "$DATA" -l "$DATA/postgres.log" -w -t 30 start \
    -o "-p 5432 -k /tmp -c listen_addresses=127.0.0.1" || { echo "HATA: PostgreSQL başlamadı" >&2; exit 1; }
  ok "PostgreSQL başladı (127.0.0.1:5432)."
fi

# ----------------------------------------------------------------------------
# 3) 5 veritabanı + rol (gnc_inc şifresi sabit — git'teki .env ile uyumlu)
# ----------------------------------------------------------------------------
ERP_EXISTS=$("$PGBIN/psql" -h /tmp -U postgres -d postgres -t -A -c \
  "SELECT 1 FROM pg_database WHERE datname='gnc_erp'" 2>/dev/null | tr -d '[:space:]')
if [ "$ERP_EXISTS" = "1" ]; then
  ok "Veritabanları zaten kurulu."
else
  ok "Veritabanları kuruluyor (setup-databases.mjs)…"
  mkdir -p "$PGDIR"
  bun "$PROJ/deploy/sandbox/setup-databases.mjs" || { echo "HATA: DB kurulumu" >&2; exit 1; }
fi

# ----------------------------------------------------------------------------
# 4) mini-services — eksik repoları geri klonla
# ----------------------------------------------------------------------------
ok "mini-services kontrolü…"
mkdir -p "$PROJ/mini-services"
cd "$PROJ/mini-services"
declare -A REPOS=(
  [gnc-erp]=gnc-erp [randevu]=randevu [kaloriai]=KaloriAI
  [fruitstorm]=fruit-storm [cubiq]=cubiq [petguardian]=PetGuardian [gridpop]=gridpop
)
for d in "${!REPOS[@]}"; do
  if [ -d "$d/.git" ]; then
    ok "$d zaten var."
  else
    warn "$d klonlanıyor…"
    git clone -q "https://github.com/kaancetin3141/${REPOS[$d]}.git" "$d" \
      || warn "$d klonlanamadı — elle: git clone …/${REPOS[$d]}.git"
  fi
done

# ----------------------------------------------------------------------------
# 5) mini-service .env'leri — credentials.md'den onar
# ----------------------------------------------------------------------------
ok ".env onarımları…"
if [ -f "$PGDIR/credentials.md" ]; then
  for entry in gnc_erp:gnc-erp kaloriai:kaloriai fruitstorm:fruitstorm cubiq:cubiq; do
    db="${entry%%:*}"; svc="${entry##*:}"
    envfile="$PROJ/mini-services/$svc/.env"
    if [ ! -f "$envfile" ]; then
      url=$(grep -o "postgresql://[^\`]*@127.0.0.1:5432/$db\`" "$PGDIR/credentials.md" | head -1 | tr -d '\`')
      [ -n "$url" ] && printf 'DATABASE_URL="%s"\n' "$url" > "$envfile" && ok "$svc/.env yazıldı."
    else
      ok "$svc/.env zaten var."
    fi
  done
else
  warn "credentials.md yok — .env'leri elle yazın (şifreler psql \du ile görülemez; DB'leri yeniden kurun)."
fi
# Randevu: ERP API adresi
if [ ! -f "$PROJ/mini-services/randevu/.env" ] && [ -d "$PROJ/mini-services/randevu" ]; then
  printf 'CRM_BASE_URL=http://127.0.0.1:3001\n' > "$PROJ/mini-services/randevu/.env"
  ok "randevu/.env yazıldı."
fi

# ----------------------------------------------------------------------------
# 6) Tam boot: ana sunucu + mini-services
# ----------------------------------------------------------------------------
ok "Boot akışı başlatılıyor (.zscripts/dev.sh)…"
exec bash "$PROJ/.zscripts/dev.sh"
