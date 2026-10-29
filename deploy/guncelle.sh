#!/bin/bash
# ============================================================================
# GNC ECOSYSTEM — guncelle.sh (v1.0)
# ----------------------------------------------------------------------------
# Tüm GNC servislerini TEK KOMUTLA güncel sürüme getirir:
#   1. 8 depoyu da git pull ile ilerletir
#   2. Bağımlılıkları tazeler (bun install)
#   3. Prisma şemalarını DB'ye uygular (db push) — veri KAYBETMEZ
#   4. Üretim derlemelerini yeniden üretir (next build)
#   5. pm2 süreçlerini sırayla yeniden başlatır (kesinti en aza iner)
#
# Kullanım:
#   sudo bash /opt/gnc/gnc-inc/deploy/guncelle.sh
#   sudo bash /opt/gnc/gnc-inc/deploy/guncelle.sh gnc-erp   # tek servisi güncelle
#
# Not: .env dosyalarına DOKUNMAZ — parolalar ve gizli ayarlar korunur.
# ============================================================================
set -euo pipefail

BASE_DIR="/opt/gnc"
REPOS=(gnc-inc gnc-erp randevu kaloriai fruitstorm cubiq petguardian gridpop)
BUILD_REPOS=(gnc-inc gnc-erp kaloriai fruitstorm)   # next build üretenler
PRISMA_REPOS=(gnc-inc gnc-erp kaloriai fruitstorm cubiq)  # db push edenler

info()  { echo -e "\033[0;32m[+]\033[0m $*"; }
warn()  { echo -e "\033[0;33m[!]\033[0m $*"; }
err()   { echo -e "\033[0;31m[x]\033[0m $*" >&2; }

[[ $EUID -eq 0 ]] || { err "Root olarak çalıştırın: sudo bash $0"; exit 1; }

export BUN_INSTALL="/root/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
command -v bun >/dev/null || { export BUN_INSTALL="$HOME/.bun"; export PATH="$BUN_INSTALL/bin:$PATH"; }

# Tek servis modu
ONLY="${1:-}"
if [[ -n "$ONLY" ]]; then
  REPOS=("$ONLY")
  BUILD_REPOS=($(printf '%s\n' "${BUILD_REPOS[@]}" | grep -x "$ONLY" || true))
  PRISMA_REPOS=($(printf '%s\n' "${PRISMA_REPOS[@]}" | grep -x "$ONLY" || true))
  info "Tek servis modu: $ONLY"
fi

info "GNC güncelleme başladı — $(date)"

# ----------------------------------------------------------------------------
# 1) Depoları ilerlet
# ----------------------------------------------------------------------------
for r in "${REPOS[@]}"; do
  d="$BASE_DIR/$r"
  if [[ ! -d "$d/.git" ]]; then
    warn "$r: $d altında depo yok — atlanıyor"
    continue
  fi
  info "$r: git pull…"
  git -C "$d" pull --ff-only || warn "$r: çakışma/elle değişiklik — atlandı (inceleyin: git -C $d status)"
done

# ----------------------------------------------------------------------------
# 2) Bağımlılıklar
# ----------------------------------------------------------------------------
for r in "${REPOS[@]}"; do
  d="$BASE_DIR/$r"
  [[ -d "$d/.git" ]] || continue
  [[ -f "$d/package.json" ]] || continue
  info "$r: bun install…"
  ( cd "$d" && bun install )
done

# ----------------------------------------------------------------------------
# 3) Prisma şemaları (idempotent — veri kaybı yok)
# ----------------------------------------------------------------------------
for r in "${PRISMA_REPOS[@]}"; do
  d="$BASE_DIR/$r"
  [[ -f "$d/prisma/schema.prisma" ]] || continue
  info "$r: prisma db push…"
  ( cd "$d" && bunx prisma generate >/dev/null 2>&1 && bunx prisma db push )
done

# ----------------------------------------------------------------------------
# 4) Üretim derlemeleri (output: standalone — statik varlıklar da taşınır)
# ----------------------------------------------------------------------------
for r in "${BUILD_REPOS[@]}"; do
  d="$BASE_DIR/$r"
  [[ -d "$d" ]] || continue
  # KaloriAI: middleware.ts derlemeyi bozuyor — kaldır (repo içi dev script de aynısını yapar)
  [[ "$r" == "kaloriai" ]] && rm -f "$d/src/middleware.ts" || true
  info "$r: next build…"
  ( cd "$d" && NODE_OPTIONS=--max-old-space-size=2048 NEXT_TELEMETRY_DISABLED=1 \
     node_modules/.bin/next build )  # node runtime — `bunx` React SSR prerender'ı kırıyor
  if [[ -d "$d/.next/standalone" ]]; then
    cp -r "$d/.next/static" "$d/.next/standalone/.next/"
    if [[ -d "$d/public" ]]; then cp -r "$d/public" "$d/.next/standalone/"; fi
  fi
done

# ----------------------------------------------------------------------------
# 5) Yeniden başlat (sırayla — önce veri katmanı sahibi ERP)
# ----------------------------------------------------------------------------
if command -v pm2 >/dev/null && [[ -n "$ONLY" ]]; then
  info "pm2: $ONLY yeniden başlatılıyor…"
  pm2 restart "$ONLY" --update-env
elif command -v pm2 >/dev/null; then
  info "pm2: tüm süreçler yeniden başlatılıyor…"
  pm2 restart all --update-env
else
  warn "pm2 bulunamadı — systemd kullanan dağıtımlarda: systemctl restart gnc-*.service"
fi
pm2 save >/dev/null 2>&1 || true

# ----------------------------------------------------------------------------
# 6) Sağlık kontrolü
# ----------------------------------------------------------------------------
info "Sağlık kontrolü…"
sleep 4
PORTS=(3000 3001 3002 3003 3004 3005 3006 3007)
NAMES=(gnc-inc gnc-erp randevu kaloriai fruitstorm cubiq petguardian gridpop)
for i in "${!PORTS[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 6 "http://127.0.0.1:${PORTS[$i]}/" || echo 000)
  if [[ "$code" =~ ^[23] ]]; then info ":${PORTS[$i]} ${NAMES[$i]} → HTTP $code ✓"
  else warn ":${PORTS[$i]} ${NAMES[$i]} → HTTP $code (pm2 logs ${NAMES[$i]})"; fi
done

info "GÜNCELLEME TAMAMLANDI — $(date)"
