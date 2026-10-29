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
(PostgreSQL binary'leri, veritabanı, mini-services). **Kurtarma artık tek
komut ve tamamen kendini onarır:**

```bash
# gnc-inc deposu da silindiyse önce onu geri alın:
git clone https://github.com/kaancetin3141/gnc-inc.git ~/my-project

# SONRA TEK KOMUT (her şeyi kendisi onarır):
bash ~/my-project/.zscripts/dev.sh
```

Bu komut sırayla (idempotent — varolanı atlar):
1. PostgreSQL 17 `.deb`'lerini indirip kullanıcı modunda çıkarır (`~/pgdeb`)
2. `initdb` + başlatma (`~/pgdata`, 127.0.0.1:5432) + rol + 5 veritabanı
3. Ana `.env`'i PostgreSQL URL'ine sabitler, `db:push` + seed yapar
4. mini-services'in 5 web reposunu geri klonlar (token `.zscripts/.github-token`)
5. Her servisi **kendi veritabanına** izole edilmiş env'le kurar ve başlatır
6. `mini-landing/` vitrinleriyle :3006 (PetGuardian) ve :3007 (GridPop)'yi açar

Ayrıca **her normal boot'ta** `/start.sh` → `.zscripts/dev.sh` otomatik çalışır.

> Not: `.zscripts/.github-token` dosyası repoya commit edilmez (.gitignore).
> Reset sonrası özel repoların klonlanması için token'ı yeniden yerleştirin.

### Mobil ürün vitrinleri (mini-landing)

PetGuardian ve GridPop Flutter uygulamalarıdır; sunucu süreçleri yoktur.
`:3006` ve `:3007` portlarını, `mini-landing/` altındaki sıfır bağımlılık
Bun vitrin sunucuları servisler — GNC markalı ürün tanıtım sayfaları.
Kaynak kodu bu depoda olduğu için resetlerde kaybolmaz.

### Bellek notu (geliştirme sandbox'ı)
Sandbox'ın 4GB RAM'i, 5 eşzamanlı Next.js **dev** sunucusu + derleme süreçlerini
kaldıramaz (ERP dev ~1.7GB RSS yiyip OOM'a yol açıyordu). Bu yüzden `.zscripts/dev.sh`
**ağır Next.js servislerini üretim modunda** çalıştırır:

| Servis | Mod | RSS | Neden |
|---|---|---|---|
| gnc-inc (:3000) | **dev** | ~900MB | Aktif geliştirme hedefi |
| gnc-erp (:3001) | **prod** | ~235MB | Süper-app, dev'i 5 kat şişer |
| kaloriai (:3003) | **prod** | ~300MB | Aynı neden |
| fruitstorm (:3004) | **prod** | ~250MB | Aynı neden |
| randevu/cubiq/petguardian/gridpop | bun --hot | ~35MB | Zaten hafif |

Üretim derlemesi yalnızca `.next/standalone/server.js` yoksa yapılır (ilk
boot / sıfırlama sonrası birkaç dakika sürer; normal reboot'larda cache'ten
gelir). Derlemeler `flock` ile **serileştirilmiştir** — 3 paralel `next build`
4GB RAM'i aşırıp OOM yapmasın diye aynı anda yalnızca bir derleme çalışır.
Tüm Next.js uygulamaları `output: standalone` üretir; sunucu
`.next/standalone/server.js` + `PORT` env ile ayağa kalkar (`next start`
standalone ile çalışmaz).

**Bilinen tuzak:** bootstrap shell'i her seferinde `DATABASE_URL=file:…custom.db`
export eder ve `.env`'i ezebilir. `prisma`/`next` komutlarından ÖNCE doğru URL'i
export edin: `export DATABASE_URL=postgresql://gnc_inc_user:…@127.0.0.1:5432/gnc_inc`
(bknz. `~/pg/credentials.md`). `.zscripts/dev.sh` bu düzeltmeyi her açılışta otomatik yapar.
