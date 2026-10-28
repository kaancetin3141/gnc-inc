#!/bin/bash
# GNC PostgreSQL 17 — kullanıcı modu başlatıcı (sudo YOK)
# Binary kaynakları: Debian trixie resmi .deb'ler → /home/z/pgdeb/root
set -e

export PGBIN=/home/z/pgdeb/root/usr/lib/postgresql/17/bin
export LD_LIBRARY_PATH=/home/z/pgdeb/root/usr/lib/x86_64-linux-gnu
export DATA=/home/z/pgdata

mkdir -p "$DATA"

if [ ! -f "$DATA/PG_VERSION" ]; then
  echo "[pg] initdb — ilk kez kuruluyor..."
  "$PGBIN/initdb" -D "$DATA" -U postgres -A trust -E UTF8 --no-locale
  # TCP için scram-sha-256, lokal socket için trust (yönetim kolaylığı)
  cat > "$DATA/pg_hba.conf" <<EOF
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     trust
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256
EOF
fi

if "$PGBIN/pg_ctl" -D "$DATA" status > /dev/null 2>&1; then
  echo "[pg] zaten çalışıyor."
else
  echo "[pg] başlatılıyor..."
  "$PGBIN/pg_ctl" -D "$DATA" -l "$DATA/postgres.log" -w -t 30 start \
    -o "-p 5432 -k /tmp -c listen_addresses=127.0.0.1"
fi

"$PGBIN/pg_isready" -h 127.0.0.1 -p 5432
echo "[pg] OK"
