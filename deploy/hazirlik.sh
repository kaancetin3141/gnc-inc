#!/bin/bash
# ============================================================================
# GNC ECOSYSTEM — hazirlik.sh (v1.0)
# ----------------------------------------------------------------------------
# SIFIR BİR VPS'i tek komutla GNC ekosistemine hazır hale getirir:
#   1. git + curl kurar
#   2. gnc-inc deposunu /opt/gnc/gnc-inc'e klonlar
#   3. asıl kurulumu (kurulum.sh) devreye alır — o da PostgreSQL 17'yi,
#      8 servisi, nginx'i, SSL'i ve yedeklemeyi otomatik kurar.
#
# Kullanım (taze Ubuntu 22.04/24.04 veya Debian 12 sunucusunda):
#   curl -fsSL https://raw.githubusercontent.com/kaancetin3141/gnc-inc/main/deploy/hazirlik.sh | sudo bash
#
# Veya manuel:
#   sudo bash deploy/hazirlik.sh
#
# NOT: Domain (gncinc.online) DNS A kayıtları önceden sunucunun IP'sine
#      yönlendirilmiş olmalı — aksi halde SSL adımı atlanır (sonradan
#      'certbot --nginx' ile tamamlanabilir).
# ============================================================================
set -euo pipefail

info()  { echo -e "\033[0;32m[+]\033[0m $*"; }
warn()  { echo -e "\033[0;33m[!]\033[0m $*"; }
err()   { echo -e "\033[0;31m[x]\033[0m $*" >&2; }

[[ $EUID -eq 0 ]] || { err "Root olarak çalıştırın (sudo)."; exit 1; }

BASE_DIR="/opt/gnc"
REPO_DIR="$BASE_DIR/gnc-inc"

info "GNC hazirlik başladı — $(date)"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y >/dev/null
apt-get install -y git curl ca-certificates >/dev/null

# Depoyu çek (varsa güncelle — idempotent)
if [[ -d "$REPO_DIR/.git" ]]; then
  info "gnc-inc deposu güncelleniyor…"
  git -C "$REPO_DIR" pull --ff-only || warn "gnc-inc: elle çözüm gerekli (git pull)"
else
  mkdir -p "$BASE_DIR"
  info "gnc-inc deposu klonlanıyor…"
  git clone https://github.com/kaancetin3141/gnc-inc.git "$REPO_DIR"
fi

# Asıl kurulumu devreye al
info "Asıl kurulum başlatılıyor (kurulum.sh)…"
exec bash "$REPO_DIR/deploy/kurulum.sh"
