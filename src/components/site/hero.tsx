"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { serviceUrl } from "@/lib/site-config";

// Hero altı istatistik şeridi — Meta dili: düz sayılar, kart YOK
const STATS = [
  { value: "8", label: "Canlı Servis" },
  { value: "7", label: "Ürün" },
  { value: "17", label: "PostgreSQL Rolü" },
  { value: "3", label: "Platform" },
];

const ease = [0.21, 0.47, 0.32, 0.98] as const;

export function Hero() {
  return (
    <section className="ink relative overflow-hidden">
      {/* Görsel katmanlar — Meta hero'sundaki gibi tam kanama görsel + karartma */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src="/images/hero.png"
          alt=""
          className="size-full object-cover opacity-55"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.14_0.012_175)] via-[oklch(0.14_0.012_175/85%)] to-[oklch(0.14_0.012_175/35%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[oklch(0.14_0.012_175)] to-transparent" />
      </div>

      <div className="section-x relative flex min-h-[88svh] flex-col justify-center pt-16 pb-0 sm:min-h-[92svh]">
        <div className="max-w-3xl">
          {/* Meta tarzı kısa kategori etiketi — dev başlığın üstünde küçük gri metin */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="ink-muted text-sm font-medium uppercase tracking-[0.18em]"
          >
            GNC Inc — Yazılım & Dijital Ürünler
          </motion.p>

          {/* Meta başlığı: iki satır, kalın, sıkı harf aralığı */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease }}
            className="mt-5 text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Fikirden canlı ürüne.
            <br />
            Tek çatı altında.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease }}
            className="ink-muted mt-6 max-w-xl text-pretty text-lg leading-relaxed"
          >
            ERP/CRM&apos;den yapay zekâ destekli beslenmeye, bulut oyunlarından mobil
            platformlara — <strong className="font-semibold text-[oklch(0.97_0.004_168)]">7 dijital ürün</strong>{" "}
            geliştiriyor ve hepsini kendi sunucumuzda, PostgreSQL 17 üzerinde yaşatıyoruz.
          </motion.p>

          {/* Meta CTA dili: yuvarlak pill butonlar — solda dolu, sağda outline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a href="#projeler" className="pill pill-solid">
              Ürünleri Keşfet
              <ArrowDown className="size-4" />
            </a>
            <a
              href={serviceUrl({ port: 3001, prodDomain: "crm.gncinc.online" })}
              className="pill pill-outline"
            >
              ERP&apos;yi Canlı Dene
              <ArrowUpRight className="size-4" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* İstatistik şeridi — hero'nun dibinde saç-teli çizgiyle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative border-t border-white/10"
      >
        <div className="section-x grid grid-cols-2 gap-6 py-6 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex items-baseline gap-2.5">
              <span className="text-2xl font-bold tracking-tight text-[oklch(0.72_0.14_168)] sm:text-3xl">
                {s.value}
              </span>
              <span className="ink-muted text-sm">{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
