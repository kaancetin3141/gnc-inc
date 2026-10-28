"use client";

import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./reveal";
import { serviceUrl } from "@/lib/site-config";

/**
 * Meta.com hero altı hızlı-link şeridi — "AI glasses / Meta VR Glasses / Meta Quest"
 * dilinin GNC karşılığı: tüm canlı ürünlere tek bakışta, sade altı çizgili metin.
 */
const LINKS = [
  { label: "GNC ERP & CRM", port: 3001, prodDomain: "crm.gncinc.online" },
  { label: "Randevu", port: 3002, prodDomain: "randevu.gncinc.online" },
  { label: "KaloriAI", port: 3003, prodDomain: "kaloriai.gncinc.online" },
  { label: "Fruit Storm!", port: 3004, prodDomain: "fruitstorm.gncinc.online" },
  { label: "Cubiq", port: 3005, prodDomain: "cubiq.gncinc.online" },
  { label: "GridPop", port: 3007, prodDomain: "gridpop.gncinc.online" },
] as const;

export function QuickLinks() {
  return (
    <section aria-label="Ürün hızlı bağlantıları" className="border-b border-border/70">
      <div className="section-x flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:gap-10">
        <Reveal className="shrink-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Canlı ürünler
          </p>
        </Reveal>
        <Reveal delay={0.05} className="min-w-0">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
            {LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={serviceUrl({ port: l.port, prodDomain: l.prodDomain })}
                  className="group inline-flex items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                >
                  <span className="underline-offset-4 group-hover:underline">{l.label}</span>
                  <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
