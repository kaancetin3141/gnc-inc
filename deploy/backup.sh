#!/bin/bash
# GNC ekosistemi — günlük yedekleme
# Tüm PostgreSQL veritabanları + kullanıcı yüklemeleri, 14 günlük rotasyon.
set -euo pipefail

BACKUP_ROOT="/var/backups/gnc"
DATE=$(date +%F)
DEST="$BACKUP_ROOT/$DATE"
mkdir -p "$DEST"

info() { echo "[$(date '+%H:%M:%S')] $*"; }

info "PostgreSQL dump başlıyor…"
for db in gnc_inc gnc_erp kaloriai fruitstorm cubiq; do
  sudo -u postgres pg_dump "$db" | gzip > "$DEST/$db.sql.gz"
  info "  $db → $DEST/$db.sql.gz ($(du -h "$DEST/$db.sql.gz" | cut -f1))"
done

# Kullanıcı yüklemeleri (ERP faturaları, oyun temaları vs.)
for dir in /opt/gnc/gnc-erp/public/uploads /opt/gnc/kaloriai/public/uploads; do
  [[ -d "$dir" ]] && tar -czf "$DEST/$(basename "$(dirname "$dir")")-uploads.tar.gz" -C "$dir" . \
    && info "  $dir arşivlendi"
done

info "Eski yedekler temizleniyor (14 gün)…"
find "$BACKUP_ROOT" -maxdepth 1 -type d -name "20*" | sort | head -n -14 | xargs -r rm -rf

info "Yedekleme tamamlandı: $DEST ($(du -sh "$DEST" | cut -f1))"
