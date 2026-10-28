"use client";

import Link from "next/link";
import { Github, Mail, ArrowUpRight } from "lucide-react";
import { SERVICES, SITE, serviceUrl } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-card/40">
      <div className="section-x grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Marka */}
        <div className="max-w-xs">
          <Link href="/" className="flex items-center gap-2.5" aria-label="GNC Inc ana sayfa">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm tracking-tighter">
              gnc
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-semibold tracking-tight">GNC Inc</span>
              <span className="text-[10px] text-muted-foreground tracking-wide">
                YAZILIM & DİJİTAL ÜRÜNLER
              </span>
            </span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {SITE.legal} — {SITE.domain} çatısı altında 7 canlı ürün, 8 servis ve PostgreSQL
            tabanlı ayrık veri mimarisi.
          </p>
        </div>

        {/* Ürünler */}
        <nav aria-label="Ürünler">
          <h3 className="text-sm font-semibold">Ürünler</h3>
          <ul className="mt-4 space-y-2.5">
            {SERVICES.filter((s) => s.port !== 3000).map((s) => (
              <li key={s.id}>
                <a
                  href={serviceUrl(s)}
                  className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {s.name}
                  <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Şirket */}
        <nav aria-label="Şirket">
          <h3 className="text-sm font-semibold">Şirket</h3>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a href="#hakkimizda" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Hakkımızda
              </a>
            </li>
            <li>
              <a href="#hizmetler" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Hizmetler
              </a>
            </li>
            <li>
              <a href="#sistemler" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Canlı Sistemler
              </a>
            </li>
            <li>
              <a href="#iletisim" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                İletişim
              </a>
            </li>
          </ul>
        </nav>

        {/* Bağlantılar */}
        <div>
          <h3 className="text-sm font-semibold">Bağlantılar</h3>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail className="size-3.5" />
                {SITE.email}
              </a>
            </li>
            <li>
              <a
                href={SITE.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <Github className="size-3.5" />
                GitHub — kaancetin3141
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="section-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {SITE.year} {SITE.legal}. Tüm hakları saklıdır.
          </p>
          <p className="inline-flex items-center gap-1.5">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-primary" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            Sunucu durumu: 8/8 sistem aktif — PostgreSQL 17
          </p>
        </div>
      </div>
    </footer>
  );
}
