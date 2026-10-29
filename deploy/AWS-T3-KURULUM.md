# AWS EC2 t3.micro Ubuntu — GNC Ekosistemi Kurulum Rehberi

> Bu rehber, Amazon AWS'den aldığın **t3.micro** (2 vCPU · **1GB RAM** · Ubuntu)
> instance'ına GNC'nin **8 projesini** (gnc-inc, gnc-erp, randevu, kaloriai,
> fruitstorm, cubiq, petguardian, gridpop) sıfırdan kurman için adım adım yazıldı.
>
> ⚠️ **Önce şu iki cümleyi oku:**
> 1. `kurulum.sh` **t3.micro'yu otomatik algılar** ve kendini 1GB RAM'e göre
>    ayarlar (4GB swap, PostgreSQL düşük bellek profili, 1024MB derleme limiti,
>    pm2 bellek koruması). Ekstra hiçbir şey yapmana gerek yok.
> 2. t3.micro **demo ve düşük trafik için yeterlidir**. Gerçek müşteri kullanımı
>    (ERP canlı veri + randevu + diğerleri) için en az **t3.small (2GB, ~$15/ay)**
>    önerilir. 1GB'da 8 servis + PostgreSQL çalışır ama yoğun anlarda yavaşlar.

---

## Bölüm 1 — AWS Console'da Sunucuyu Hazırla (SSH'ten önce)

### 1.1 Instance başlat
1. AWS Console → **EC2 → Launch Instance**
2. **Name:** `gnc-production`
3. **AMI:** *Ubuntu Server 22.04 LTS* veya *24.04 LTS* (Free Tier eligible rozetli)
4. **Instance type:** `t2.micro`/`t3.micro` (Free Tier: 750 saat/ay, 12 ay)
5. **Key pair:** *Create new key pair* → ad: `gnc-key` → `.pem` dosyasını **indir ve güvenli yere koy**
   (Windows'ta PuTTY kullanacaksan `.ppk` seç; terminal kullanıyorsan `.pem`)
6. **Network settings → Edit:**
   - **Auto-assign public IP:** Enable
   - **Firewall (security group):** *Create security group* — adı `gnc-sg`, kurallar:

     | Type | Port | Source | Açıklama |
     |---|---|---|---|
     | SSH | 22 | **My IP** | Sadece kendi IP'n (herkese açık yapma!) |
     | HTTP | 80 | Anywhere `0.0.0.0/0` | Web sitesi |
     | HTTPS | 443 | Anywhere `0.0.0.0/0` | SSL |

     ⛔ **3000-3007 portlarını AÇMA.** Nginx bu portları sunucu *içinde* proksiler;
     dışarıya sadece 80/443 açılır.
7. **Storage (EBS):** Varsayılan **8GB'dır — 24GB yap** (5 uygulama + node_modules +
   derlemeler + PostgreSQL ~12-16GB yer yer). *Advanced → Volume 1 → size: 24*.
8. **Launch Instance**

### 1.2 Elastic IP (IP sabitleme — DNS için şart)
Instance durdurulup açılsa bile IP değişmesin diye:
1. **EC2 → Elastic IPs → Allocate Elastic IP address** (region içinde ücretsiz havuz)
2. Alınan IP'yi seç → **Actions → Associate** → `gnc-production` instance'ını seç
3. Bu IP'i not et: `ÖRN: 3.122.45.67`

> 💰 Not: Şubat 2024'ten beri tüm public IPv4 adresleri ücretli (~**$0.005/saat ≈ $3.6/ay**).
> Free Tier bunu kapsamaz; faturanda bu kalemi göreceksin.

### 1.3 DNS kayıtları (domain sağlayıcında — gncinc.online)
`gncinc.online` domain'inin DNS panelinde **A kayıtları** olarak Elastic IP'yi gir:

| Kayıt | Tür | Değer |
|---|---|---|
| `@` | A | `3.122.45.67` (Elastic IP) |
| `www` | A | `3.122.45.67` |
| `crm` | A | `3.122.45.67` |
| `randevu` | A | `3.122.45.67` |
| `kaloriai` | A | `3.122.45.67` |
| `fruitstorm` | A | `3.122.45.67` |
| `cubiq` | A | `3.122.45.67` |
| `petguardian` | A | `3.122.45.67` |
| `gridpop` | A | `3.122.45.67` |
| `*` (wildcard) | A | `3.122.45.67` — randevu alt şirketleri (`firma.gncinc.online`) için |

> SSL sertifikaları ancak DNS yayıldıktan sonra alınabilir. Kurulumu DNS'ten
> önce yaptıysan sertifika adımı atlanır; sonra `sudo certbot --nginx` ile tamamlayabilirsin.

---

## Bölüm 2 — Sunucuya Bağlan ve Kur (tek komut)

### 2.1 SSH ile bağlan
Kendi bilgisayarında (`.pem` dosyasının olduğu klasörde):

```bash
chmod 400 gnc-key.pem          # sadece ilk sefer
ssh -i gnc-key.pem ubuntu@3.122.45.67
```
> AWS Ubuntu'da kullanıcı adı **`ubuntu`**'dur (root ile girilmez; `sudo` her yerde çalışır).

### 2.2 Sistemi güncelle (1-2 dakika)
```bash
sudo apt update && sudo apt upgrade -y
```

### 2.3 TEK KOMUTLA TAM KURULUM
```bash
curl -fsSL https://raw.githubusercontent.com/kaancetin3141/gnc-inc/main/deploy/hazirlik.sh | sudo bash
```

Bu komut şunları **otomatik** yapar:

| Adım | Ne yapar | t3.micro'ya özel |
|---|---|---|
| Sistem paketleri | nginx, PostgreSQL, git, ufw, fail2ban | — |
| **Swap** | Disk üzerinde takas alanı | **4GB** (1GB RAM'de hayati; swap'siz derleme %99 OOM olur) |
| **PostgreSQL ayarı** | — | **Düşük bellek profili** (shared_buffers 128MB, max_conn 40) |
| 5 veritabanı | gnc_inc, gnc_erp, kaloriai, fruitstorm, cubiq + ayrı kullanıcı/şifre her biri | — |
| 8 repo | GitHub'dan `/opt/gnc/` altına klonlar | — |
| `.env` dosyaları | Her uygulamaya kendi DB URL'i | — |
| `bun install` + `prisma db push` | Bağımlılıklar + şemalar | Sırayla (paralel değil) |
| `next build` | 4 Next.js uygulaması üretim derlemesi | Node heap limiti **1024MB**, **sıralı** derleme |
| pm2 süreçleri | 8 servis port 3000-3007, açılışta otomatik start | `max_memory_restart` ile şişen süreç otomatik resetlenir |
| nginx | 8 alt alan adı vhost'u | — |
| Let's Encrypt SSL | 9 alan adına ücretsiz sertifika | DNS hazır değilse atlanır |
| ufw + fail2ban | Güvenlik duvarı (22/80/443) + SSH koruması | — |
| Yedekleme cron'u | Her gün 03:30 PostgreSQL + upload yedeği (14 gün) | — |

⏱️ **Süre:** t3.micro'da toplam **20-45 dakika** sürer (derlemeler CPU paylaşımlı
olduğu için yavaştır — normaldir, kesme). Kurulum canlı log akıtır ve
`/var/log/gnc-kurulum.log` dosyasına da yazılır.

---

## Bölüm 3 — Kurulum Sonrası Kontroller

```bash
# 8 servisin renkli durum tablosu
sudo bash /opt/gnc/gnc-inc/deploy/servis.sh durum

# HTTP sağlık testi + yanıt süreleri
sudo bash /opt/gnc/gnc-inc/deploy/servis.sh saglik

# Bellek durumu — swap kullanımına bak
free -h

# Disk durumu
df -h /
```

Tarayıcıdan test et:
- `https://www.gncinc.online` → ana kurumsal site
- `https://crm.gncinc.online` → GNC ERP giriş ekranı
- `https://randevu.gncinc.online` → randevu sistemi
- `https://kaloriai.gncinc.online` → KaloriAI
- ... (hepsi aynı mantık)

---

## Bölüm 4 — Bellek Gerçeği ve Performans

### t3.micro'da beklenen kaynak kullanımı (kurulum sonrası)

| Bileşen | RAM (yaklaşık) |
|---|---|
| Ubuntu + sistem | ~180MB |
| PostgreSQL (düşük bellek profili) | ~130MB |
| nginx | ~15MB |
| gnc-inc (:3000) | ~150-300MB |
| gnc-erp (:3001) | ~250-400MB |
| kaloriai (:3003) | ~300-400MB |
| fruitstorm (:3004) | ~250-350MB |
| randevu + cubiq + 2 vitrin | ~120MB |
| **TOPLAM** | **~1.4-1.9GB → fiziksel 1GB + 4GB swap** |

**Sonuç:** Çalışır, ama swap'a taşan kısım diskten okunur → yoğun kullanımda
sayfa geçişleri saniyeler sürebilir. pm2 `max_memory_restart` sayaçları şişmeyi
kontrol altında tutar.

### Nasıl rahatlatılır?
1. **En etkili:** Instance'ı **t3.small (2GB)** yap → EC2 → Instance →
   Actions → *Instance settings → Change instance type* (durdurup açmak gerekir).
2. **CPU kredisi:** t3'merde "burst" kredisi biterse CPU %10'a düşer. Derleme
   sırasında yaşanabilir. AWS Console → Instance → *Actions → Instance settings →
   Change credit specification → Unlimited* (küçük ek ücretle kredi sınırı kalkar).
3. Kalıcı düşük trafik + bütçe: sadece ana 3-4 servisi çalıştır:
   ```bash
   pm2 stop kaloriai fruitstorm cubiq   # ihtiyaç olunca pm2 start <ad>
   ```

---

## Bölüm 5 — Günlük Kullanım (kısaca)

```bash
sudo bash /opt/gnc/gnc-inc/deploy/servis.sh durum     # durum tablosu
sudo bash /opt/gnc/gnc-inc/deploy/servis.sh saglik    # HTTP testleri
sudo bash /opt/gnc/gnc-inc/deploy/servis.sh loglar gnc-erp   # tek servis canlı log
sudo bash /opt/gnc/gnc-inc/deploy/guncelle.sh         # tüm projeleri güncelle (git pull + build + restart)
sudo bash /opt/gnc/gnc-inc/deploy/guncelle.sh gnc-erp # tek projeyi güncelle
sudo gnc-backup                                       # elle yedek
pm2 status                                            # süreç listesi
```

Ayrıntılı referans: [`SUNUCU-KOMUTLARI.md`](./SUNUCU-KOMUTLARI.md)

---

## Bölüm 6 — Sorun Giderme

### Derleme sırasında `Killed` / OOM hatası
```bash
free -h                      # swap var mı? (Swap: 4.0Gi yazmalı)
swapon --show
# Swap yoksa elle oluştur ve o uygulamayı yeniden derle:
sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
sudo bash /opt/gnc/gnc-inc/deploy/guncelle.sh <uygulama-adı>
```

### Disk doldu (`No space left on device`)
```bash
df -h /
# 1) AWS Console → EC2 → Volumes → volume seç → Actions → Modify volume → 30GB
# 2) Sunucuda bölümü büyüt:
lsblk                                  # kök bölümü gör (ör: nvme0n1p1)
sudo growpart /dev/nvme0n1 1           # (xvda ise: sudo growpart /dev/xvda 1)
sudo resize2fs /dev/nvme0n1p1
# 3) Temizlik:
sudo apt clean && sudo journalctl --vacuum-time=3d
```

### Sitede 502 Bad Gateway
```bash
sudo bash /opt/gnc/gnc-inc/deploy/servis.sh durum   # hangi servis kırmızı?
pm2 logs gnc-erp --lines 50                          # loga bak
pm2 restart gnc-erp
```

### SSL sertifikası alınmadı (DNS geç geldi)
```bash
sudo certbot --nginx -d gncinc.online -d www.gncinc.online -d crm.gncinc.online \
  -d randevu.gncinc.online -d kaloriai.gncinc.online -d fruitstorm.gncinc.online \
  -d cubiq.gncinc.online -d petguardian.gncinc.online -d gridpop.gncinc.online \
  --redirect -n --agree-tos -m admin@gncinc.online
```

### SSH giremiyorum
- Security Group'ta 22'nin **kendi IP'ne** açık olduğunu doğrula (IP'n değişmiş olabilir → My IP'yi güncelle)
- Yedek giriş yolu: AWS Console → Instance → **Connect → EC2 Instance Connect** (tarayıcıdan SSH)

### fail2ban kendi IP'mi banladı
```bash
sudo fail2ban-client set sshd unbanip <IP'n>
```

---

## Bölüm 7 — Maliyet Özeti (tahmini, Frankfurt eu-central-1)

| Kalem | Free Tier (ilk 12 ay) | Sonrası |
|---|---|---|
| t3.micro instance (750 saat/ay) | **$0** | ~$7.5/ay |
| Public IPv4 (Elastic IP) | ~$3.6/ay | ~$3.6/ay |
| EBS 30GB gp3 | **$0** (30GB'a kadar) | ~$2.4/ay |
| **TOPLAM** | **~$3.6/ay** | **~$14/ay** |

t3.small'e geçersen: Free Tier'de instance farkı ~$0 (kredi aşımı ile),
12 aydan sonra ~$15/ay + IPv4 + EBS.

---

## Özet — 6 Komutlık Yol

```bash
# 1. AWS: instance başlat (Ubuntu 24.04, t3.micro, 24GB EBS, SG: 22/80/443)
# 2. AWS: Elastic IP al ve ilişkilendir → DNS A kayıtlarını yönlendir
# 3. Kendi makinenden:
ssh -i gnc-key.pem ubuntu@<ELASTIC_IP>
# 4. Sunucuda:
sudo apt update && sudo apt upgrade -y
# 5. Tek komutla kur:
curl -fsSL https://raw.githubusercontent.com/kaancetin3141/gnc-inc/main/deploy/hazirlik.sh | sudo bash
# 6. Kontrol et:
sudo bash /opt/gnc/gnc-inc/deploy/servis.sh saglik
```
