"use client";

import { Briefcase, Smartphone, BrainCircuit, ServerCog } from "lucide-react";
import { Reveal } from "./reveal";

const SERVICES = [
  {
    icon: Briefcase,
    title: "Kurumsal Yazılım",
    desc: "İş süreçlerinizi modelleyen çok modüllü ERP/CRM sistemleri: faturalama, stok, raporlama ve çok kiracılı mimariler.",
    tags: ["Next.js 16", "PostgreSQL", "Prisma"],
  },
  {
    icon: Smartphone,
    title: "Mobil & Çoklu Platform",
    desc: "Tek kod tabanından web, Android ve iOS'a çıkan Flutter uygulamaları; PWA ve mağaza yayın süreçleri dahil.",
    tags: ["Flutter", "PWA", "Capacitor"],
  },
  {
    icon: BrainCircuit,
    title: "Yapay Zekâ Entegrasyonu",
    desc: "Görüntü analizi, akıllı asistanlar ve içerik üretimi; üretken yapay zekâyı ürününüzün doğal bir parçası yapıyoruz.",
    tags: ["VLM", "LLM", "RAG"],
  },
  {
    icon: ServerCog,
    title: "Altyapı & DevOps",
    desc: "Sunucu kurulumu, nginx, sertifikasyon, yedekleme ve izleme — yazdığımız her sistem kendi ayağında duracak şekilde teslim edilir.",
    tags: ["Linux", "nginx", "Sistemd"],
  },
];

export function ServicesSection() {
  return (
    <section id="hizmetler" className="section-x py-16 sm:py-24">
      {/* Meta tarzı: sol hizalı bölüm başlığı */}
      <Reveal className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Ne yapıyoruz
        </p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Hizmetler
        </h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          Konseptten üretime, üretimden bakıma — ürünün tüm yaşam döngüsünde yanınızdayız.
        </p>
      </Reveal>

      {/* Meta ızgarası: ayırıcı çizgili, gölgesiz sütunlar */}
      <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {SERVICES.map((s, i) => (
          <Reveal key={s.title} delay={Math.min(i * 0.07, 0.28)}>
            <div className="group h-full border-t-2 border-foreground/10 pt-6 transition-colors hover:border-primary">
              <div className="flex size-10 items-center justify-center rounded-full border border-border text-primary transition-colors group-hover:border-primary/50 group-hover:bg-primary/10">
                <s.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              <p className="mt-4 font-mono text-[11px] text-muted-foreground/70">
                {s.tags.join(" · ")}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
