// GNC Inc — portföy seed (idempotent upsert)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

const PROJECTS = [
  {
    slug: "gnc-erp",
    name: "GNC ERP & CRM",
    tagline: "İşletmenizin dijital sinir sistemi",
    description:
      "KOBİ'ler ve kafeler için tasarlanmış Türkçe, çok kiracılı süper uygulama: müşteri yönetimi (CRM), satış fırsatları, stok ve irsaliye, faturalama, kafe masa/menü siparişleri, market POS, randevu, aidat ve site yönetimi, sosyal medya planlayıcı, İK ve kasa — hepsi tek panelde.",
    category: "product",
    port: 3001,
    prodDomain: "crm.gncinc.online",
    repoUrl: "https://github.com/kaancetin3141/gnc-erp",
    techStack: "Next.js 16, TypeScript, PostgreSQL 17, Prisma, Tailwind CSS, shadcn/ui",
    image: "/images/proj-erp.png",
    status: "live",
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "randevu",
    name: "GNC Randevu",
    tagline: "Randevu defteriniz artık bulutta",
    description:
      "İşletmelerin müşteri randevularını çevrimiçi yönettiği, Apple estetliğinde şık bir randevu platformu. İşletme keşfi, slot seçimi, üyelik, değerlendirme, bekleme listesi, damga kartı ve ICS takvim entegrasyonu; iframe widget ve alt alan adı desteği.",
    category: "product",
    port: 3002,
    prodDomain: "randevu.gncinc.online",
    repoUrl: "https://github.com/kaancetin3141/randevu",
    techStack: "Bun, TypeScript, Sıfır bağımlılık, GNC ERP API",
    image: "/images/proj-randevu.png",
    status: "live",
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "kaloriai",
    name: "KaloriAI",
    tagline: "Fotoğraf çek, kalorini bil",
    description:
      "AI destekli kalori ve beslenme asistanı: yemek fotoğrafını çek, içerik analizi saniyeler içinde gelsin. 100+ Türk yemeği kataloğu, sporcu modu, adaptif TDEE, su takibi, PWA bildirimleri ve KVKK uyumlu veri hakları.",
    category: "product",
    port: 3003,
    prodDomain: "kaloriai.gncinc.online",
    repoUrl: "https://github.com/kaancetin3141/KaloriAI",
    techStack: "Next.js 16, AI Vision, PostgreSQL 17, Prisma, PWA",
    image: "/images/proj-kaloriai.png",
    status: "live",
    featured: true,
    sortOrder: 3,
  },
  {
    slug: "fruit-storm",
    name: "Fruit Storm!",
    tagline: "8 dilde match-3 meyve patlatma",
    description:
      "Tek dosyalık canvas oyun motoruyla geliştirilen, 8 dilde oynanabilen match-3 deneyimi. Bulut kayıt, klan sistemi ve sohbeti, küresel liderlik tablosu, 5 tema ve PWA desteğiyle tarayıcıdan mobil(platform)a kesintisiz oyun.",
    category: "game",
    port: 3004,
    prodDomain: "fruitstorm.gncinc.online",
    repoUrl: "https://github.com/kaancetin3141/fruit-storm",
    techStack: "Next.js 16, Canvas 2D, PostgreSQL 17, Prisma, PWA",
    image: "/images/proj-fruitstorm.png",
    status: "live",
    featured: false,
    sortOrder: 4,
  },
  {
    slug: "cubiq",
    name: "Cubiq",
    tagline: "Premium blok bulmaca",
    description:
      "Bağımlılık yaratan minimal blok bulmaca: 4 oyun modu, 6 tema, sıfır bağımlılık vanilla JS motoru. PostgreSQL destekli bulut yedek ve liderlik tablosuyla oynanışını kaybetmeden cihazlar arası geçiş.",
    category: "game",
    port: 3005,
    prodDomain: "cubiq.gncinc.online",
    repoUrl: "https://github.com/kaancetin3141/cubiq",
    techStack: "Vanilla JS, Canvas, PWA, Bun, PostgreSQL 17",
    image: "/images/proj-cubiq.png",
    status: "live",
    featured: false,
    sortOrder: 5,
  },
  {
    slug: "petguardian",
    name: "PetGuardian",
    tagline: "Evcil dostlar için eksiksiz platform",
    description:
      "Evcil hayvan sahiplenme, bakım, kiralama ve mağaza platformu. Haritalı sahiplenme akışı, bakıcı ağı ve Firebase altyapısıyla web, Android ve iOS'ta tek kod tabanı.",
    category: "product",
    port: 3006,
    prodDomain: "petguardian.gncinc.online",
    repoUrl: "https://github.com/kaancetin3141/PetGuardian",
    techStack: "Flutter, Firebase, Google Maps",
    image: "/images/proj-petguardian.png",
    status: "live",
    featured: false,
    sortOrder: 6,
  },
  {
    slug: "gridpop",
    name: "GridPop",
    tagline: "Özgün blok yerleştirme oyunu",
    description:
      "Klasik, zamana karşı ve günlük görev modlarıyla özgün mekanikli blok yerleştirme bulmacası. Coin ekonomisi, başarımlar ve akıcı animasyonlarla Flutter ile üç platforma derlendi.",
    category: "game",
    port: 3007,
    prodDomain: "gridpop.gncinc.online",
    repoUrl: "https://github.com/kaancetin3141/gridpop",
    techStack: "Flutter, Dart",
    image: "/images/proj-gridpop.png",
    status: "live",
    featured: false,
    sortOrder: 7,
  },
];

async function main() {
  for (const p of PROJECTS) {
    await prisma.portfolioProject.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
    console.log(`✓ ${p.name}`);
  }
  const count = await prisma.portfolioProject.count();
  console.log(`\nPortföy hazır: ${count} proje`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
