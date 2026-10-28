"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { serviceUrl, SITE } from "@/lib/site-config";

// Meta.com navigasyon dili: kısa, kategorik, sağa yaslı
const NAV = [
  { href: "#projeler", label: "Projeler" },
  { href: "#sistemler", label: "Sistemler" },
  { href: "#hizmetler", label: "Hizmetler" },
  { href: "#hakkimizda", label: "Şirket" },
  { href: "#iletisim", label: "İletişim" },
];

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="GNC Inc ana sayfa">
      <span className="relative flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm tracking-tighter shadow-sm transition-transform group-hover:scale-105">
        gnc
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-semibold text-[15px] tracking-tight">GNC Inc</span>
        <span className="text-[10px] text-muted-foreground tracking-wide">
          YAZILIM & DİJİTAL ÜRÜNLER
        </span>
      </span>
    </Link>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Klasik "mounted" deseni: ilk client render'ı SSR ile AYNI olmalı (hydration uyumu).
  // (Bu yüzden setState effect içinde — next-themes'in kanonik yaklaşımı.)
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount sonrası tema ikonu senkronizasyonu; alternatifler hydration bozuluyor
  useEffect(() => setMounted(true), []);
  // SSR ile client ilk render'ı birebir aynı olmalı → mounted=false iken koyu varsay
  const dark = mounted && resolvedTheme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? "Açık temaya geç" : "Koyu temaya geç"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="text-muted-foreground"
    >
      {mounted ? (
        dark ? (
          <Sun className="size-4.5" />
        ) : (
          <Moon className="size-4.5" />
        )
      ) : (
        <span className="size-4.5" />
      )}
    </Button>
  );
}

export function SiteHeader() {
  // Meta header'ı her zaman katıdır (cam efekti YOK); scroll'da sadece saç-teli gölge eklenir
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const raf = requestAnimationFrame(onScroll); // ilk durum — async, kurala uygun
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm transition-shadow duration-300 ${
        scrolled ? "shadow-[0_1px_12px_oklch(0.14_0.012_175/8%)]" : ""
      }`}
    >
      <div className="section-x flex h-16 items-center justify-between gap-4">
        <Logo />

        {/* Meta dili: nav ortaya-hizalı, sade metin, hover'da yumuşak zemin */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Ana menü">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Meta'nın sağdaki küçük yuvarlak aksiyon butonu */}
          <Button
            asChild
            size="sm"
            className="hidden rounded-full px-4 sm:inline-flex"
            variant="default"
          >
            <a href={serviceUrl({ port: 3001, prodDomain: "crm.gncinc.online" })}>
              ERP Girişi
              <ArrowUpRight className="size-3.5" />
            </a>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menüyü aç">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">GNC Inc</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Mobil menü">
                {NAV.map((n) => (
                  <a
                    key={n.href}
                    href={n.href}
                    className="rounded-full px-3 py-3 text-base font-medium text-foreground/90 transition-colors hover:bg-accent"
                  >
                    {n.label}
                  </a>
                ))}
                <a
                  href={serviceUrl({ port: 3001, prodDomain: "crm.gncinc.online" })}
                  className="mt-3 rounded-full bg-primary px-3 py-3 text-center text-sm font-semibold text-primary-foreground"
                >
                  ERP Girişi
                </a>
                <a
                  href={`mailto:${SITE.email}`}
                  className="rounded-full px-3 py-3 text-sm text-muted-foreground"
                >
                  {SITE.email}
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
