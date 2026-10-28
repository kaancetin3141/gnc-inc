# GNC Sunucu Komutları — v4.0 (PostgreSQL Edisyonu)

> Bu dosya, **gnc-inc** deposunda tutulan deploy dosyalarının referans rehberidir.
> Tüm ekosistemin kaynak doğruluğu bu depodur (`deploy/`).

## Port Haritası (KESİN)

| Servis | Port | Alan Adı | Veritabanı (PostgreSQL 17) |
|---|---|---|---|
| **gnc-inc** (bu site) | **3000** | www.gncinc.online | `gnc_inc` |
| **GNC ERP & CRM** | **3001** | crm.gncinc.online | `gnc_erp` |
| **Randevu** | **3002** | randevu.gncinc.online + `*.{slug}` | ERP API üzerinden |
| **KaloriAI** | **3003** | kaloriai.gncinc.online | `kaloriai` |
| **Fruit Storm** | **3004** | fruitstorm.gncinc.online | `fruitstorm` |
| **Cubiq** | **3005** | cubiq.gncinc.online | `cubiq` |
| **PetGuardian** | **3006** | petguardian.gncinc.online | Firebase (client) |
| **GridPop** | **3007** | gridpop.gncinc.online | localStorage (client) |
| chat-service (ERP yardımcı) | 3012 | — | `gnc_erp` (paylaşımlı) |
| appointment-reminders | 3011 | — | `gnc_erp` |
| cron-automation | 3010 | — | `gnc_erp` |

### Veri Mimarisi Prensibi
Her sistem **kendi PostgreSQL veritabanına** sahiptir ve yalnızca kendi kullanıcısı
(`*_user`) erişebilir. Randevu, verisini ERP'nin public API'sinden okur (kendi DB'si
tasarımsal olarak yoktur). PetGuardian ve GridPop istemci taraflı depolamalıdır.

## İlk Kurulum

```bash
sudo bash deploy/kurulum.sh          # her şey: PG, 8 servis, nginx, SSL, yedek cron
```

## Günlük Operasyon

```bash
# Süreç yönetimi (pm2)
pm2 status
pm2 logs gnc-erp --lines 100
pm2 restart gnc-erp
pm2 restart all

# nginx
sudo nginx -t && sudo systemctl reload nginx

# Sertifika yenileme (otomatik: certbot timer)
sudo certbot renew --dry-run

# Yedekler
sudo gnc-backup                  # elle tetikle
ls /var/backups/gnc/$(date +%F)/
```

## Veritabanı İşlemleri

```bash
sudo -u postgres psql gnc_erp         # interaktif konsol
sudo -u postgres pg_dump gnc_erp | gzip > yedek.sql.gz

# Şema güncelleme (kod değişikliğinden sonra)
cd /opt/gnc/gnc-erp && bunx prisma db push --accept-data-loss
cd /opt/gnc/kaloriai && bunx prisma db push --accept-data-loss
cd /opt/gnc/fruitstorm && bunx prisma db push --accept-data-loss
cd /opt/gnc/cubiq && bun run db:push
cd /opt/gnc/gnc-inc && bun run db:push
```

## Bir Uygulamayı Güncelleme

```bash
cd /opt/gnc/<uygulama>
git pull
bun install
bunx prisma db push --accept-data-loss   # şema değiştiyse
bunx next build                          # Next.js uygulamaları için
pm2 restart <uygulama-adı>
```

## Yeni Proje Şablonu

`deploy/yeni-proje.sh` artık gnc-inc deposunda yaşar. Yeni bir Next.js/statik oyun
eklemek için port ayrımını bu tabloya göre yapın ve `deploy/nginx/` altına yeni bir
server bloğu ekleyin.

## Sorun Giderme

| Belirti | Çözüm |
|---|---|
| `:300x` 502 | `pm2 logs <ad>`; süreç düştüyse `pm2 restart <ad>` |
| RAM baskısı (4GB VPS) | `pm2 restart` en büyük süreç; swap'ı kontrol et: `free -m` |
| ERP seed hatası | DB doluysa `x-seed-secret` gerekir (güvenlik) — `/api/seed` kaynak kodduna bakın |
| randevu 502 | ERP ayakta mı? `curl 127.0.0.1:3001/api/public/providers` |
| Flutter statikleri 404 | `flutter build web --release` çalıştırılmış mı? `deploy/kurulum.sh` yeniden |
