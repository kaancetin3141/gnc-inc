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
    <section id="hizmetler" className="section-x py-20 sm:py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Hizmetler
        </h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          Konseptten üretime, üretimden bakıma — ürünün tüm yaşam döngüsünde yanınızdayız.
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s, i) => (
          <Reveal key={s.title} delay={Math.min(i * 0.07, 0.35)}>
            <div className="group h-full rounded-2xl border border-border/80 bg-card/60 p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <s.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] text-secondary-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
