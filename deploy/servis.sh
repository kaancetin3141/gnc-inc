#!/bin/bash
# ============================================================================
# GNC ECOSYSTEM — servis.sh (v1.0)
# ----------------------------------------------------------------------------
# 8 servisi TEK komutla yönetin:
#
#   sudo bash deploy/servis.sh durum      # renkli durum tablosu (portlar + pm2)
#   sudo bash deploy/servis.sh baslat     # tümünü başlat
#   sudo bash deploy/servis.sh durdur     # tümünü durdur (sunucu açık kalır)
#   sudo bash deploy/servis.sh yeniden    # tümünü yeniden başlat
#   sudo bash deploy/servis.sh loglar     # son 25 satır log (hepsi)
#   sudo bash deploy/servis.sh loglar gnc-erp     # tek servisin logu
#   sudo bash deploy/servis.sh saglik     # curl sağlık kontrolü + yanıt süresi
#
# Kalıcılık: pm2 + 'pm2 save' → sunucu yeniden açıldığında 'pm2 resurrect'
# otomatik çalışır (pm2 startup systemd kayıtlıdır).
# ============================================================================
set -euo pipefail

BASE_DIR="/opt/gnc"
SERVICES=(gnc-inc gnc-erp randevu kaloriai fruitstorm cubiq petguardian gridpop)
PORTS=([gnc-inc]=3000 [gnc-erp]=3001 [randevu]=3002 [kaloriai]=3003
       [fruitstorm]=3004 [cubiq]=3005 [petguardian]=3006 [gridpop]=3007)

info()  { echo -e "\033[0;32m[+]\033[0m $*"; }
warn()  { echo -e "\033[0;33m[!]\033[0m $*"; }
err()   { echo -e "\033[0;31m[x]\033[0m $*" >&2; }

[[ $EUID -eq 0 ]] || { err "Root olarak çalıştırın: sudo bash $0"; exit 1; }

CMD="${1:-durum}"
SVC="${2:-}"

case "$CMD" in
  baslat)
    info "Tüm servisler başlatılıyor…"
    pm2 start "$BASE_DIR/ecosystem.config.cjs" --update-env >/dev/null
    pm2 save >/dev/null
    info "Tamam. Durum için: sudo bash $0 durum"
    ;;
  durdur)
    info "Tüm servisler durduruluyor…"
    pm2 stop all >/dev/null
    info "Tamam."
    ;;
  yeniden)
    info "Tüm servisler yeniden başlatılıyor…"
    pm2 restart all --update-env >/dev/null
    pm2 save >/dev/null
    info "Tamam."
    ;;
  loglar)
    if [[ -n "$SVC" ]]; then
      pm2 logs "$SVC" --lines 40
    else
      for s in "${SERVICES[@]}"; do
        echo "──── $s ────"
        pm2 logs "$s" --lines 25 --nostream 2>/dev/null | tail -n 25 || true
      done
    fi
    ;;
  saglik)
    info "HTTP sağlık kontrolü…"
    for s in "${SERVICES[@]}"; do
      p="${PORTS[$s]}"
      t=$( { curl -s -o /dev/null -w "%{time_total} %{http_code}" -m 6 "http://127.0.0.1:$p/"; } 2>/dev/null || echo "0.000 000")
      code="${t##* }"; ms=$(awk -v s="${t% *}" 'BEGIN{printf "%.0f", s*1000}')
      if [[ "$code" =~ ^[23] ]]; then info ":$p $s → HTTP $code (${ms}ms)"
      else warn ":$p $s → HTTP $code"; fi
    done
    ;;
  durum)
    echo
    printf "\033[1m%-13s %-7s %-10s %-8s %-26s\033[0m\n" "SERVİS" "PORT" "DURUM" "SÜRE" "YENİDEN BAŞLATMA"
    for s in "${SERVICES[@]}"; do
      p="${PORTS[$s]}"
      row=$(pm2 jlist 2>/dev/null | python3 -c "
import json,sys
apps={a['name']:a for a in json.load(sys.stdin)}
a=apps.get('$s')
if not a: print('yok')
else:
    pm=a.get('pm2_env',{})
    status=pm.get('status','?')
    up=pm.get('pm_uptime',0)
    restarts=pm.get('restart_time','?')
    import datetime
    dur=datetime.datetime.now().timestamp()-up if up else 0
    h=int(dur//3600); m=int((dur%3600)//60)
    print(f'{status} {h}s {m}dk {restarts}')
" 2>/dev/null || echo "yok")
      if [[ "$row" == "yok" ]]; then
        printf "%-13s %-7s \033[31m%-10s\033[0m %-8s %-26s\n" "$s" ":$p" "KAPALI" "-" "-"
      else
        st=$(echo "$row" | awk '{print $1}')
        rest=$(echo "$row" | awk '{print $2, $3, $4}')
        rst=$(echo "$row" | awk '{print $5}')
        if [[ "$st" == "online" ]]; then
          printf "%-13s %-7s \033[32m%-10s\033[0m %-8s %-26s\n" "$s" ":$p" "ÇALIŞIYOR" "$rest" "$rst"
        elif [[ "$st" == "stopped" ]]; then
          printf "%-13s %-7s \033[31m%-10s\033[0m %-8s %-26s\n" "$s" ":$p" "DURDU" "-" "$rst"
        else
          printf "%-13s %-7s \033[33m%-10s\033[0m %-8s %-26s\n" "$s" ":$p" "$st" "-" "$rst"
        fi
      fi
    done
    echo
    up=$(pm2 jlist 2>/dev/null | python3 -c "
import json,sys
apps=json.load(sys.stdin)
on=[a['name'] for a in apps if a.get('pm2_env',{}).get('status')=='online']
print(f'{len(on)}/{len(apps)}')" 2>/dev/null || echo "?")
    info "Özet: $up servis online · 'sudo bash $0 saglik' ile HTTP testi"
    ;;
  *)
    err "Bilinmeyen komut: $CMD"
    echo "Kullanılabilir: durum | baslat | durdur | yeniden | loglar [servis] | saglik"
    exit 1
    ;;
esac
