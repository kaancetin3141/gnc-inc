#!/bin/bash
# ============================================================
# GNC Inc — Kendini onaran boot akışı (dev.sh)
# /start.sh bu dosyayı bulursa varsayılan akış YERİNE bunu çalıştırır.
#
# Zincir: .env onarımı → PostgreSQL self-heal → ana sunucu (3000) →
#         mini-services (3001-3007; eksik repo'lar token ile yeniden klonlanır)
#
# Her şey idempotent: sandbox sıfırlansa bile tek çalışışla tüm ekosistem döner.
# Elle çalıştırma: bash /home/z/my-project/.zscripts/dev.sh
# ============================================================
set -uo pipefail

PROJ=/home/z/my-project
ZS="$PROJ/.zscripts"
PASS='tvDeCsv34LR3XtQLpm2i'
ROLE=gnc_inc_user
export NEXT_TELEMETRY_DISABLED=1

# Servis: klasör adı | repo adı | port | mod (prod=next build+start, dev=bun --hot)
#   gnc-erp / kaloriai / fruitstorm → ağır Next süper-uygulamalar, ÜRETİM modunda
#   (dev sunucusu 4GB sandbox'ta ~1.7GB RSS yiyip OOM'a yol açıyordu; prod ~235MB).
#   randevu / cubiq → hafif Bun servisleri, --hot dev.
SERVICES=(
  "gnc-erp|gnc-erp|3001|prod"
  "randevu|randevu|3002|dev"
  "kaloriai|KaloriAI|3003|prod"
  "fruitstorm|fruit-storm|3004|prod"
  "cubiq|cubiq|3005|dev"
)

log() { echo "[dev.sh $(date +%H:%M:%S)] $*"; }
port_open() { ss -tln 2>/dev/null | grep -q ":$1 "; }
kill_port() { # portu dinleyen süreci kibarca durdur
  local pid
  pid=$(lsof -ti :"$1" 2>/dev/null | head -1)
  [ -n "$pid" ] && kill "$pid" 2>/dev/null && sleep 2 && kill -9 "$pid" 2>/dev/null
  return 0
}

# ------------------------------------------------------------
# 1) .env — bootstrap her açılışta SQLite URL yazabiliyor; ÖNCE onar
# ------------------------------------------------------------
mkdir -p "$PROJ"
cat > "$PROJ/.env" <<'EOF'
DATABASE_URL=postgresql://gnc_inc_user:tvDeCsv34LR3XtQLpm2i@127.0.0.1:5432/gnc_inc
NEXT_PUBLIC_SERVICES_MODE=sandbox
EOF
export DATABASE_URL="postgresql://$ROLE:$PASS@127.0.0.1:5432/gnc_inc"
log ".env PostgreSQL URL'ine sabitlendi."

# ------------------------------------------------------------
# 2) PostgreSQL 17 — tam self-heal (binary → data → sunucu → rol + 5 DB)
# ------------------------------------------------------------
if bash "$PROJ/scripts/pg-ensure.sh"; then
  log "PostgreSQL hazır."
  export LD_LIBRARY_PATH=/home/z/pgdeb/root/usr/lib/x86_64-linux-gnu
else
  log "UYARI: PostgreSQL kurulamadı — site veritabanısız devam ediyor."
fi

# ------------------------------------------------------------
# 3) Ana sunucu (gnc-inc, :3000) — kod/şema değişince güvenli yeniden başlat
# ------------------------------------------------------------
cd "$PROJ" || exit 1
log "Ana sunucu hazırlanıyor (install → prisma → db:push → seed)…"
bun install            > /tmp/boot-main-install.log 2>&1 || log "UYARI: bun install hata verdi."
bunx prisma generate  >> /tmp/boot-main-install.log 2>&1 || log "UYARI: prisma generate hata verdi."
bun run db:push        >> /tmp/boot-main-install.log 2>&1 || log "UYARI: db:push hata verdi."
bun prisma/seed.ts     >> /tmp/boot-main-install.log 2>&1 || log "UYARI: seed hata verdi."

kill_port 3000   # eski dev sunucusu yeni Prisma client'ı görsün diye taze başlar
log "Ana sunucu başlıyor (:3000)…"
setsid --fork bash -c "cd '$PROJ' && exec bun run dev" \
  > /tmp/boot-main-dev.log 2>&1 < /dev/null

# ------------------------------------------------------------
# 4) Mini-services (3001-3007) — klasör yoksa token ile yeniden klonla
# ------------------------------------------------------------
TOKEN=$(cat "$ZS/.github-token" 2>/dev/null | tr -d '[:space:]')
mkdir -p "$PROJ/mini-services"

for entry in "${SERVICES[@]}"; do
  IFS='|' read -r name repo port mode <<< "$entry"
  dir="$PROJ/mini-services/$name"

  # 4a) Klasör yoksa klonla (reset sonrası)
  if [ ! -d "$dir" ]; then
    if [ -n "$TOKEN" ]; then
      log "$name klonlanıyor (kaancetin3141/$repo)…"
      if GIT_TERMINAL_PROMPT=0 git clone -q \
          "https://x-access-token:${TOKEN}@github.com/kaancetin3141/${repo}.git" "$dir" \
          2>>/tmp/boot-clone.log; then
        # Token'ı diskte bırakma — pull gerekirse yeniden yazılır
        git -C "$dir" remote set-url origin "https://github.com/kaancetin3141/${repo}.git"
        log "$name klonlandı."
      else
        log "HATA: $name klonlanamadı — atlanıyor."
        continue
      fi
    else
      log "UYARI: token yok, $name klonlanamadı — atlanıyor."
      continue
    fi
  fi

  [ -f "$dir/package.json" ] || { log "$name: package.json yok — atlanıyor."; continue; }

  # 4b) Port açıksa dokunma
  if port_open "$port"; then
    log "$name :$port zaten açık — atlanıyor."
    continue
  fi

  # 4c) .env — repo'da yoksa doğru DB URL'ini yaz (varsa DATABASE_URL garanti et)
  #     DB adı = klasör adının alt çizgili hali (gnc-erp → gnc_erp);
  #     randevu DB'siz çalışır (ERP API üzerinden) — sadece CRM_BASE yeter.
  db="${name//-/_}"
  if [ "$name" = "randevu" ]; then
    dburl=""   # DB'siz — CRM_BASE üzerinden ERP API'sini kullanır
  else
    dburl="postgresql://$ROLE:$PASS@127.0.0.1:5432/$db"
  fi
  if [ ! -f "$dir/.env" ] && [ -f "$dir/.env.example" ]; then
    cp "$dir/.env.example" "$dir/.env"
  fi
  if [ "$name" != "randevu" ]; then
    if ! grep -q "^DATABASE_URL=" "$dir/.env" 2>/dev/null; then
      printf 'DATABASE_URL="%s"\n' "$dburl" >> "$dir/.env" 2>/dev/null || \
        printf 'DATABASE_URL="%s"\n' "$dburl" > "$dir/.env"
    else
      sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$dburl\"|" "$dir/.env" 2>/dev/null
    fi
  fi
  # Randevu → ERP API'sine bağlanır
  if [ "$name" = "randevu" ] && ! grep -q "^CRM_BASE=" "$dir/.env" 2>/dev/null; then
    printf 'CRM_BASE=http://127.0.0.1:3001/api\n' >> "$dir/.env"
  fi

  # 4d) Kurulum + başlatma (arka planda; log: /tmp/mini-service-*.log)
  #     ÖNEMLİ: servisin KENDİ DATABASE_URL'i launcher içinde explicit export edilir —
  #     process env .env dosyasını ezdiği için miras alınan ana DB URL'i felaket olur
  #     (gnc-erp şeması gnc_inc'e basılıp ana site tablolarını düşürür).
  log "$name hazırlanıyor ($mode, :$port)…"
  setsid --fork bash -c '
    set -u
    cd "$1"
    if [ -n "${5:-}" ]; then export DATABASE_URL="$5"; else unset DATABASE_URL; fi
    export NODE_ENV=development
    bun install >> "/tmp/mini-service-$2.log" 2>&1
    if [ -f prisma/schema.prisma ] && [ -n "${5:-}" ]; then
      bunx prisma generate >> "/tmp/mini-service-$2.log" 2>&1
      bunx prisma db push --accept-data-loss >> "/tmp/mini-service-$2.log" 2>&1
    fi
    if [ "$3" = "prod" ]; then
      if [ ! -f .next/BUILD_ID ]; then
        echo "[$2] üretim derlemesi (birkaç dakika)…" >> "/tmp/mini-service-$2.log" 2>&1
        NODE_OPTIONS="--max-old-space-size=2200" NEXT_TELEMETRY_DISABLED=1 \
          bunx next build >> "/tmp/mini-service-$2.log" 2>&1
      fi
      exec env NODE_ENV=production node_modules/.bin/next start -p "$4"
    else
      exec bun run dev
    fi
  ' _ "$dir" "$name" "$mode" "$port" "$dburl" > "/tmp/mini-service-$name.log" 2>&1 < /dev/null
done

# ------------------------------------------------------------
# 5) Mobil ürün vitrinleri (Flutter repoları yerine): :3006, :3007
#    Kaynak kodu repoda (mini-landing/) — reset'te kaybolmaz.
# ------------------------------------------------------------
for landing in petguardian:3006 gridpop:3007; do
  l="${landing%%:*}"; p="${landing##*:}"
  if port_open "$p"; then
    log "$l :$p zaten açık — atlanıyor."
    continue
  fi
  log "$l vitrini başlıyor (:$p)…"
  setsid --fork bash -c "cd '$PROJ/mini-landing' && exec bun --hot '$l.ts'" \
    > "/tmp/mini-service-$l.log" 2>&1 < /dev/null
done

log "Boot akışı tamam. Ana sunucu :3000 · mini-services :3001-3007"
exit 0
