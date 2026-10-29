#!/bin/bash
# ============================================================================
# GNC — Sandbox Kurtarma (v2.0 — ince sarmalayıcı)
# ----------------------------------------------------------------------------
# Artık tüm kurtarma mantığı .zscripts/dev.sh içinde kendini onarır:
#   PostgreSQL .deb indirme → initdb → rol + 5 DB → .env onarımı →
#   db:push + seed → eksik repoları yeniden klonlama → 8 sunucu
#
# Bu betik yalnızca dev.sh'in çalıştırılabilir olduğundan emin olur ve onu çağırır.
# ============================================================================
set -u
PROJ="${1:-/home/z/my-project}"

if [ ! -f "$PROJ/.zscripts/dev.sh" ]; then
  echo "[kurtarma] $PROJ altında depo yok — önce geri klonlayın:"
  echo "  git clone https://github.com/kaancetin3141/gnc-inc.git ~/my-project"
  exit 1
fi

echo "[kurtarma] Self-heal boot zinciri başlıyor (bash $PROJ/.zscripts/dev.sh)…"
exec bash "$PROJ/.zscripts/dev.sh"
