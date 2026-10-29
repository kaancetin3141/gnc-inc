#!/usr/bin/env bash
# ============================================================
# GNC Inc — PostgreSQL 17 kullanıcı-modu "self-heal" sağlayıcı
# Sıra: binary'ler → veri dizini → sunucu → rol + 5 veritabanı
# Her adım idempotent: sandbox sıfırlansa bile bu script her şeyi geri getirir.
# Kullanım: bash scripts/pg-ensure.sh  (çıkış kodu 0 = PostgreSQL hazır)
# ============================================================
set -u

PGBIN=/home/z/pgdeb/root/usr/lib/postgresql/17/bin
PGBIN_PARENT=/home/z/pgdeb/root/usr/lib/postgresql/17
LIBDIR=/home/z/pgdeb/root/usr/lib/x86_64-linux-gnu
DATA=/home/z/pgdata
PASS='tvDeCsv34LR3XtQLpm2i'
ROLE=gnc_inc_user
DBS=(gnc_inc gnc_erp kaloriai fruitstorm cubiq)

log() { echo "[pg-ensure $(date +%H:%M:%S)] $*"; }

# ------------------------------------------------------------
# 1) Binary'ler — silinmişse deb paketlerini yeniden indir/çıkar
# ------------------------------------------------------------
if [ ! -x "$PGBIN/pg_ctl" ]; then
  log "PostgreSQL binary'leri yok — deb paketleri indiriliyor…"
  mkdir -p /home/z/pgdeb/debs /home/z/pgdeb/root
  cd /home/z/pgdeb/debs || exit 1
  if ! apt-get download postgresql-17 postgresql-client-17 libpq5 libllvm19 > /tmp/pg-ensure-download.log 2>&1; then
    log "HATA: paket indirilemedi (ağ?)."
    exit 1
  fi
  for f in *.deb; do dpkg-deb -x "$f" /home/z/pgdeb/root; done
  log "Binary'ler kuruldu."
fi
export LD_LIBRARY_PATH="$LIBDIR${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

# ------------------------------------------------------------
# 2) Veri dizini — yoksa initdb + pg_hba (lokal trust, TCP şifreli)
# ------------------------------------------------------------
if [ ! -f "$DATA/PG_VERSION" ]; then
  log "Veri dizini yok — initdb çalışıyor…"
  mkdir -p "$DATA"
  if ! "$PGBIN/initdb" -D "$DATA" -U postgres --encoding=UTF8 --locale=C > /tmp/pg-ensure-initdb.log 2>&1; then
    log "HATA: initdb başarısız."
    exit 1
  fi
  cat > "$DATA/pg_hba.conf" << 'HBA'
# Yerel socket — trust (kullanıcı modu, sandbox)
local   all             all                                     trust
# TCP localhost — şifreli
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256
HBA
  log "Veri dizini hazır (pg_hba: lokal trust / TCP scram)."
fi

# ------------------------------------------------------------
# 3) Sunucu — çalışmıyorsa başlat (pg_ctl daemonize eder → PPID 1)
# ------------------------------------------------------------
if ! "$PGBIN/pg_ctl" -D "$DATA" status > /dev/null 2>&1; then
  log "PostgreSQL başlatılıyor…"
  if ! "$PGBIN/pg_ctl" -D "$DATA" -l "$DATA/postgres.log" -w -t 30 start \
      -o "-p 5432 -k /tmp -c listen_addresses=127.0.0.1" > /dev/null 2>&1; then
    log "HATA: PostgreSQL başlatılamadı — $DATA/postgres.log"
    exit 1
  fi
  log "PostgreSQL 17 ayakta (:5432)."
else
  log "PostgreSQL zaten çalışıyor."
fi

# ------------------------------------------------------------
# 4) Rol + veritabanları (lokal socket trust üzerinden, idempotent)
# ------------------------------------------------------------
if ! "$PGBIN/psql" -h /tmp -U postgres -d postgres -v ON_ERROR_STOP=1 > /tmp/pg-ensure-roles.log 2>&1 << SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$ROLE') THEN
    CREATE ROLE $ROLE LOGIN PASSWORD '$PASS';
  ELSE
    ALTER ROLE $ROLE WITH LOGIN PASSWORD '$PASS';
  END IF;
END
\$\$;
SQL
then
  log "HATA: rol oluşturulamadı."
  exit 1
fi

for db in "${DBS[@]}"; do
  if [ "$("$PGBIN/psql" -h /tmp -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$db'" 2>/dev/null | tr -d '[:space:]')" != "1" ]; then
    "$PGBIN/psql" -h /tmp -U postgres -d postgres -c \
      "CREATE DATABASE $db OWNER $ROLE LC_COLLATE 'C' LC_CTYPE 'C' TEMPLATE template0" \
      > /dev/null 2>&1 || { log "HATA: $db oluşturulamadı."; exit 1; }
    log "Veritabanı oluşturuldu: $db"
  fi
done

# ------------------------------------------------------------
# 5) Uyumluluk dosyaları — /home/z/pg altındaki yardımcılar
#    (sandbox sıfırlanmasında silinir; her koşuda tazelenir)
# ------------------------------------------------------------
mkdir -p /home/z/pg
cat > /home/z/pg/start.sh << 'EOF'
#!/usr/bin/env bash
# Basit başlatıcı (asıl mantık: my-project/scripts/pg-ensure.sh)
set -u
export PGBIN=/home/z/pgdeb/root/usr/lib/postgresql/17/bin
export LD_LIBRARY_PATH=/home/z/pgdeb/root/usr/lib/x86_64-linux-gnu
export DATA=/home/z/pgdata
if "$PGBIN/pg_ctl" -D "$DATA" status >/dev/null 2>&1; then
  echo "[pg] zaten çalışıyor"; exit 0
fi
exec "$PGBIN/pg_ctl" -D "$DATA" -l "$DATA/postgres.log" -w -t 30 start \
  -o "-p 5432 -k /tmp -c listen_addresses=127.0.0.1"
EOF
chmod +x /home/z/pg/start.sh

umask 077
cat > /home/z/pg/credentials.md << EOF
# GNC PostgreSQL 17 — Kimlik Bilgileri (kullanıcı modu)

| Rol | Şifre | Veritabanları |
|---|---|---|
| gnc_inc_user | \`$PASS\` | gnc_inc, gnc_erp, kaloriai, fruitstorm, cubiq |
| postgres (socket) | trust | yönetim |

## Bağlantı URL'leri
- gnc_inc:    \`postgresql://$ROLE:$PASS@127.0.0.1:5432/gnc_inc\`
- gnc_erp:    \`postgresql://$ROLE:$PASS@127.0.0.1:5432/gnc_erp\`
- kaloriai:   \`postgresql://$ROLE:$PASS@127.0.0.1:5432/kaloriai\`
- fruitstorm: \`postgresql://$ROLE:$PASS@127.0.0.1:5432/fruitstorm\`
- cubiq:      \`postgresql://$ROLE:$PASS@127.0.0.1:5432/cubiq\`
EOF
chmod 600 /home/z/pg/credentials.md
umask 022

log "PostgreSQL hazır: rol=$ROLE, ${#DBS[@]} veritabanı."
exit 0
