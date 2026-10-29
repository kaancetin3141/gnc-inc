"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Globe, Loader2, Mail } from "lucide-react";
import { SERVICES, SITE, serviceUrl } from "@/lib/site-config";

/** Meta.com footer'ındaki bülten bloğu: başlık + e-posta + kaydol */
function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        toast.error(data?.error ?? "Kayıt alınamadı.");
        return;
      }
      toast.success("Kaydoldunuz! Yeni sürümlerden ilk siz haberdar olacaksınız.");
      setEmail("");
    } catch {
      toast.error("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Bülten kayıt formu"
      className="max-w-md"
    >
      <p className="text-sm font-semibold tracking-tight">
        GNC&apos;den haberler ve güncellemeler alın
      </p>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="email"
          required
          maxLength={120}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresiniz"
          aria-label="E-posta adresiniz"
          className="h-10 w-full min-w-0 rounded-full border border-border bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary"
        />
        <button
          type="submit"
          disabled={sending}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:opacity-60"
        >
          {sending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            "Kaydol"
          )}
        </button>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Yeni sürümler, ürün duyuruları ve altyapı notları — ayda en fazla bir e-posta,
        istediğinizde tek tıkla ayrılın.
      </p>
    </form>
  );
}

/** Meta.com footer dili: açık gri zemin, kalın kolon başlıkları, küçük gri linkler */
export function SiteFooter() {
  const companyLinks = [
    { href: "#hakkimizda", label: "Hakkımızda" },
    { href: "#hizmetler", label: "Hizmetler" },
    { href: "#surec", label: "Nasıl Çalışıyoruz" },
    { href: "#sistemler", label: "Canlı Sistemler" },
    { href: "#projeler", label: "Projeler" },
    { href: "#sss", label: "S.S.S." },
    { href: "#iletisim", label: "İletişim" },
  ];

  const resourceLinks = [
    { href: `mailto:${SITE.email}`, label: "E-posta" },
    { href: serviceUrl({ port: 3001, prodDomain: "crm.gncinc.online" }), label: "ERP Girişi" },
    { href: "#sss", label: "S.S.S." },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-muted/50">
      {/* Bülten — Meta'nın footer üstündeki kayıt bloğu */}
      <div className="section-x border-b border-border/70 pt-10">
        <NewsletterForm />
      </div>
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
                href={`https://${SITE.domain}`}
                aria-label="Web sitesi"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Globe className="size-4" />
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
