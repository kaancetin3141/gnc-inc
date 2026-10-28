"use client";

import { CheckCircle2 } from "lucide-react";
import { Reveal } from "./reveal";
import { SITE } from "@/lib/site-config";

const PRINCIPLES = [
  "Her ürün kendi veritabanıyla bağımsız yaşar — tek sistem çökse bile ekosistem ayakta kalır.",
  "Gerçek PostgreSQL, gerçek sunucu: demo değil, üretime hazır mimari.",
  "Tek kişilik ekip, uçtan uca sahiplik: analiz, tasarım, kod, altyapı, bakım.",
];

export function About() {
  return (
    <section id="hakkimizda" className="border-t border-border/70 bg-muted/40 py-16 sm:py-24">
      <div className="section-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border/70">
            <img
              src="/images/about-workspace.png"
              alt="GNC Inc geliştirici çalışma alanı — gece modunda yazılım geliştirme"
              loading="lazy"
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          {/* Meta tarzı küçük kategori başlığı */}
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Şirket
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Hakkımızda
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            GNC Inc; <strong className="font-semibold text-foreground">{SITE.founder}</strong>{" "}
            tarafından kurulmuş, ürün odaklı bir yazılım girişimidir. Amacımız basit:{" "}
            <strong className="font-semibold text-foreground">kullanıcının gerçekten açıp
            kullanabileceği</strong> sistemler kurmak. Her ürünümüz ilk günden beri gerçek
            kullanıcı geri bildirimiyle şekillenir; sunucumuzda canlı çalışır ve kendi ayağı
            üzerinde durur.
          </p>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Bugün ERP&apos;den mobil oyuna 7 ürün, 8 servis ve 17 veritabanı rolüyle{" "}
            <strong className="font-semibold text-foreground">{SITE.domain}</strong> çatısı
            altında — hepsi açık kaynaklı, hepsi ulaşılabilir.
          </p>

          <ul className="mt-7 space-y-3.5">
            {PRINCIPLES.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm leading-relaxed">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{p}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
