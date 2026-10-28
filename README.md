# GNC Inc — Kurumsal Web Platformu

**gncinc.online** — GNC Inc'in resmî kurumsal sitesi ve tüm ürünlerin çatı platformu.

Bu depo, 8 canlı dijital ürünün tanıtımını yapan kurumsal siteyi **ve tüm sunucu
altyapısının deploy dosyalarını** barındırır (bkz. [`deploy/`](./deploy)).

## Mimari

- **Next.js 16** (App Router) · **TypeScript 5** · **Tailwind CSS 4** + **shadcn/ui**
- **PostgreSQL 17** — kendi bağımsız `gnc_inc` veritabanı (Prisma ORM)
- Port **3000** — `www.gncinc.online`

### Veritabanı Modelleri
| Model | Açıklama |
|---|---|
| `PortfolioProject` | Sitede sergilenen ürünler (tekil doğruluk kaynağı) |
| `ContactMessage` | İletişim formu mesajları |

### API Uçları
| Uç | Açıklama |
|---|---|
| `GET /api/portfolio` | Portföy projeleri (PostgreSQL) |
| `GET /api/status` | 8 servisin canlı sağlık kontrolü (15 sn cache) |
| `POST /api/contact` | İletişim formu (zod doğrulamalı) |
| `GET /api` | Servis sağlık ucu |

## Bölümler
Sticky cam header → Hero (canlı istatistikler) → **Canlı Sistem Durumu** (8 servis
nabzı) → Projeler (DB'den) → Teknoloji şeridi → Hizmetler → Hakkımızda → İletişim
(DB'ye yazar) → sticky footer.

## Geliştirme

```bash
bun install
bun run db:push        # şemayı PostgreSQL'e bas
bun run seed           # 7 portföy projesini yükle
bun run dev            # http://localhost:3000
```

### Ortam Değişkenleri
```
DATABASE_URL=postgresql://gnc_inc_user:***@127.0.0.1:5432/gnc_inc
NEXT_PUBLIC_SERVICES_MODE=sandbox   # sandbox | production
```

`NEXT_PUBLIC_SERVICES_MODE` **production** olduğunda ürün linkleri alt alan adlarına
(`crm.gncinc.online` vb.), **sandbox** olduğunda gateway üzerinden
`/?XTransformPort={port}` biçimine döner.

## Sunucu Kurulumu

Tüm ekosistemin (8 servis + PostgreSQL + nginx + sertifikalar) tek komutla kurulumu:

```bash
sudo bash deploy/kurulum.sh
```

Detaylar: [`deploy/SUNUCU-KOMUTLARI.md`](./deploy/SUNUCU-KOMUTLARI.md)

## Ekosistemin Diğer Ürünleri

| Ürün | Port | Repo |
|---|---|---|
| GNC ERP & CRM | 3001 | [gnc-erp](https://github.com/kaancetin3141/gnc-erp) |
| Randevu | 3002 | [randevu](https://github.com/kaancetin3141/randevu) |
| KaloriAI | 3003 | [KaloriAI](https://github.com/kaancetin3141/KaloriAI) |
| Fruit Storm | 3004 | [fruit-storm](https://github.com/kaancetin3141/fruit-storm) |
| Cubiq | 3005 | [cubiq](https://github.com/kaancetin3141/cubiq) |
| PetGuardian | 3006 | [PetGuardian](https://github.com/kaancetin3141/PetGuardian) |
| GridPop | 3007 | [gridpop](https://github.com/kaancetin3141/gridpop) |

---

© GNC Yazılım — Kaan Çetin · [info@gncinc.online](mailto:info@gncinc.online)
