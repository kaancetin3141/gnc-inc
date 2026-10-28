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
