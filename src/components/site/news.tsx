"use client";

import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./reveal";
import { serviceUrl } from "@/lib/site-config";

/**
 * Meta.com "The latest from Meta" karşılığı: görselli haber kartları.
 * Ürün duyuruları + altyapı gelişmeleri, tek ızgarada.
 */
const NEWS = [
  {
    image: "/images/news-erp.png",
    alt: "GNC ERP & CRM arayüzü — faturalama ve analiz panelleri",
    eyebrow: "Sürüm",
    title: "GNC ERP & CRM 2.0 yayında",
    desc: "Faturalama, stok, cari ve raporlama modülleri tek süper-app'te birleşti.",
    href: serviceUrl({ port: 3001, prodDomain: "crm.gncinc.online" }),
    cta: "ERP'yi Aç",
  },
  {
    image: "/images/news-kaloriai.png",
    alt: "KaloriAI — telefon kamerasıyla besin tanıma ve kalori sayımı",
    eyebrow: "Yapay Zekâ",
    title: "KaloriAI artık fotoğraftan kalori sayıyor",
    desc: "VLM destekli görüntü analiziyle besin tanıma: tabağınızı çekin, makro besinleri görün.",
    href: serviceUrl({ port: 3003, prodDomain: "kaloriai.gncinc.online" }),
    cta: "KaloriAI'yı Aç",
  },
  {
    image: "/images/news-infra.png",
    alt: "Veri merkezi rafları — PostgreSQL 17 altyapısı",
    eyebrow: "Altyapı",
    title: "Her sistem kendi PostgreSQL 17 veritabanında",
    desc: "Ayrık veri mimarisi tamamlandı: tek sunucu, bağımsız veritabanları, izole rollar.",
    href: "#sistemler",
    cta: "Duruma Bak",
  },
] as const;

export function News() {
  return (
    <section id="haberler" aria-label="GNC'den son haberler" className="section-x py-16 sm:py-24">
      {/* Meta tarzı: sol hizalı bölüm başlığı */}
      <Reveal className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Basın
        </p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          GNC&apos;den son dakika
        </h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          Ürün duyuruları, yapay zekâ denemeleri ve altyapı gelişmeleri — hepsi canlı.
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
        {NEWS.map((n, i) => (
          <Reveal key={n.title} delay={Math.min(i * 0.08, 0.24)} className="h-full">
            <a
              href={n.href}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={n.image}
                  alt={n.alt}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground backdrop-blur-sm">
                  {n.eyebrow}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-semibold leading-snug tracking-tight">
                  {n.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {n.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  <span className="underline-offset-4 group-hover:underline">{n.cta}</span>
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
