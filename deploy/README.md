# GNC Inc — Deploy Dosyaları

Bu klasör, **GNC ekosisteminin tamamına ait sunucu kurulum dosyalarını** barındırır
(istek doğrultusunda tüm deploy merkezi ana site repo'sunda tutulur).

```
deploy/
├── hazirlik.sh                   # SIFIR sunucuda tek komutla hazır hale getirir (curl | sudo bash)
├── kurulum.sh                    # Tek komutla tam kurulum (PG17 + 8 servis + nginx + SSL)
├── guncelle.sh                   # Tek komutla tüm ekosistemi güncelle (git pull + build + restart)
├── servis.sh                     # Tek komutla servis yönetimi (durum | baslat | durdur | saglik | loglar)
├── backup.sh                     # Günlük PostgreSQL + upload yedeklemesi (14 gün rotasyon)
├── SUNUCU-KOMUTLARI.md           # Port haritası + operasyon referansı
├── nginx/
│   └── gncinc.online.conf         # 8 alt alan adı + wildcard randevu vhost'ları
├── systemd/
│   └── gnc-*.service             # pm2 yerine systemd tercih edenler için 8 unit
└── env/
    └── *.env.example             # Uygulama başına ortam değişken şablonları
```

## Hızlı Başlangıç — Otomatik Komutlar

### Taze bir VPS'te (her şey otomatik)
```bash
curl -fsSL https://raw.githubusercontent.com/kaancetin3141/gnc-inc/main/deploy/hazirlik.sh | sudo bash
```

### Depo zaten elinizdeyse
```bash
sudo bash deploy/kurulum.sh
```

### Günlük yönetim
```bash
sudo bash deploy/servis.sh durum      # 8 servisin renkli durum tablosu
sudo bash deploy/servis.sh saglik     # HTTP sağlık testi + yanıt süreleri
sudo bash deploy/guncelle.sh          # kod değişikliklerini canlıya al
```

## Port Haritası (özet)

```
3000 gnc-inc      3001 gnc-erp       3002 randevu      3003 kaloriai
3004 fruitstorm   3005 cubiq        3006 petguardian   3007 gridpop
```

Ayrıntılı komut referansı: [`SUNUCU-KOMUTLARI.md`](./SUNUCU-KOMUTLARI.md)

## Geliştirme Sandbox Kurtarma (makine sıfırlandıysa)

Geliştirme sandbox'ı sıfırlandığında `/home/z` altındaki her şey silinir
(PostgreSQL binary'leri, veritabanı, mini-services). **Tek komutla kurtarma:**

```bash
# gnc-inc deposu da silindiyse önce onu geri alın:
git clone https://github.com/kaancetin3141/gnc-inc.git ~/my-project
cd ~/my-project && git pull   # en güncel deploy dosyaları gelsin

# SONRA TEK KOMUT:
bash deploy/sandbox/kurtarma.sh
```

Bu komut sırayla (idempotent — varolanı atlar):
1. PostgreSQL 17 `.deb`'lerini indirip kullanıcı modunda çıkarır (`~/pgdeb`)
2. `initdb` + başlatma (`~/pgdata`, 127.0.0.1:5432)
3. 5 veritabanı + rol kurar, `~/pg/credentials.md` yazar (`deploy/sandbox/setup-databases.mjs`)
4. mini-services'in 7 reposunu geri klonlar
5. eksik `.env` dosyalarını credentials.md'den onarır
6. `.zscripts/dev.sh` ile tüm sunucuları kaldırır (ana site :3000 + :3001-:3007)

Ayrıca **her normal boot'ta** `/start.sh` → `.zscripts/dev.sh` otomatik çalışır:
PostgreSQL'i başlatır, ana `.env`'i PostgreSQL URL'ine sabitler, `db:push` + seed
yapar, 8 sunucuyu ayağa kaldırır.

**Bilinen tuzak:** bootstrap shell'i her seferinde `DATABASE_URL=file:…custom.db`
export eder ve `.env`'i ezebilir. `prisma`/`next` komutlarından ÖNCE doğru URL'i
export edin: `export DATABASE_URL=postgresql://gnc_inc_user:…@127.0.0.1:5432/gnc_inc`
(bknz. `~/pg/credentials.md`). `.zscripts/dev.sh` bu düzeltmeyi her açılışta otomatik yapar.
