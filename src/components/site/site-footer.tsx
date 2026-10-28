"use client";

import Link from "next/link";
import { Github, Mail } from "lucide-react";
import { SERVICES, SITE, serviceUrl } from "@/lib/site-config";

/** Meta.com footer dili: açık gri zemin, kalın kolon başlıkları, küçük gri linkler */
export function SiteFooter() {
  const companyLinks = [
    { href: "#hakkimizda", label: "Hakkımızda" },
    { href: "#hizmetler", label: "Hizmetler" },
    { href: "#sistemler", label: "Canlı Sistemler" },
    { href: "#projeler", label: "Projeler" },
    { href: "#iletisim", label: "İletişim" },
  ];

  const resourceLinks = [
    { href: SITE.github, label: "GitHub", external: true },
    { href: `mailto:${SITE.email}`, label: "E-posta" },
    { href: serviceUrl({ port: 3001, prodDomain: "crm.gncinc.online" }), label: "ERP Girişi" },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-muted/50">
      <div className="section-x py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Marka — Meta'nın sol geniş bloğu */}
          <div className="lg:col-span-4">
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
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {SITE.legal} — {SITE.domain} çatısı altında 7 canlı ürün, 8 servis ve PostgreSQL
              tabanlı ayrık veri mimarisi.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href={SITE.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Github className="size-4" />
              </a>
              <a
                href={`mailto:${SITE.email}`}
                aria-label="E-posta"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>

          {/* Ürünler — iki sütun halinde dar link listesi (Meta footer ritmi) */}
          <nav aria-label="Ürünler" className="lg:col-span-3">
            <h3 className="text-sm font-semibold tracking-tight">Ürünler</h3>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
              {SERVICES.filter((s) => s.port !== 3000).map((s) => (
                <li key={s.id}>
                  <a
                    href={serviceUrl(s)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Şirket */}
          <nav aria-label="Şirket" className="lg:col-span-3">
            <h3 className="text-sm font-semibold tracking-tight">Şirket</h3>
            <ul className="mt-4 space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bağlantılar */}
          <nav aria-label="Bağlantılar" className="lg:col-span-2">
            <h3 className="text-sm font-semibold tracking-tight">Bağlantılar</h3>
            <ul className="mt-4 space-y-2.5">
              {resourceLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    {...("external" in l && l.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Alt bar — Meta'nın ince telif şeridi */}
      <div className="border-t border-border">
        <div className="section-x flex flex-col items-start justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center">
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
