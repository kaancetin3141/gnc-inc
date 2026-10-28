"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SERVICES, serviceUrl } from "@/lib/site-config";

const STATS = [
  { value: "7", label: "Canlı Ürün" },
  { value: "100+", label: "Veri Modeli" },
  { value: "3", label: "Platform (Web · Android · iOS)" },
  { value: "17", label: "PostgreSQL Veritabanı Rolü" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16">
      {/* Arkaplan katmanları */}
      <div className="grid-pattern absolute inset-0" aria-hidden="true" />
      <div
        className="absolute -top-40 left-1/2 h-[480px] w-[880px] -translate-x-1/2 rounded-full bg-primary/12 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
        aria-hidden="true"
      />

      <div className="section-x relative flex flex-col items-center pb-16 pt-14 text-center sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge
            variant="outline"
            className="gap-2 rounded-full border-primary/40 bg-primary/10 px-4 py-1.5 text-primary"
          >
            <Activity className="size-3.5" />
            8 canlı sistem · 7 ürün · tek çatı
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mt-6 max-w-4xl text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl"
        >
          Fikirden <span className="text-gradient">canlı ürüne</span>,
          <br className="hidden sm:block" /> tek çatı altında.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          GNC Inc; ERP/CRM&apos;den yapay zekâ destekli beslenmeye, bulut oyunlarından mobil
          platformlara uzanan <strong className="font-semibold text-foreground">7 dijital ürünü</strong>{" "}
          geliştirir ve aynı sunucu altyapısında yaşatır. PostgreSQL 17, Next.js 16 ve Flutter ile.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="glow-emerald">
            <a href="#projeler">
              Projeleri Keşfet
              <ArrowDown className="size-4" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary/35">
            <a href={serviceUrl({ port: 3001, prodDomain: "crm.gncinc.online" })}>
              ERP&apos;yi Canlı Dene
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.34 }}
          className="mt-14 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              className="glass rounded-2xl border border-border/70 px-4 py-5 text-center"
            >
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-2xl font-bold tracking-tight text-primary">{s.value}</dd>
              <dd className="mt-1 text-xs text-muted-foreground">{s.label}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
