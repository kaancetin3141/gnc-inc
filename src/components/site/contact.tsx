"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Mail, Github, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "./reveal";
import { SITE } from "@/lib/site-config";

const QUICK_LINKS = [
  { icon: Mail, label: SITE.email, href: `mailto:${SITE.email}` },
  { icon: Github, label: "GitHub — kaancetin3141", href: SITE.github, external: true },
  { icon: MapPin, label: "İstanbul, Türkiye", href: null as unknown as string, static: true },
];

export function Contact() {
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        toast.error(data?.error ?? "Mesaj gönderilemedi.");
        return;
      }
      toast.success("Mesajınız alındı! En kısa sürede dönüş yapacağız.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="iletisim" className="ink border-t-0 py-16 sm:py-24">
      <div className="section-x grid gap-12 lg:grid-cols-5 lg:gap-16">
        {/* Sol: başlık + hızlı bağlantılar — Meta footer dili */}
        <Reveal className="lg:col-span-2">
          <p className="ink-muted text-xs font-semibold uppercase tracking-[0.18em]">
            İletişim
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Bir sonraki ürününüzü birlikte konuşalım.
          </h2>
          <p className="ink-muted mt-4 max-w-sm text-pretty leading-relaxed">
            Proje teklifi, iş birliği ya da sadece merak — mesajınız doğrudan veritabanımıza
            düşer ve mesai saatlerinde ortalama 2 saat içinde yanıt alırsınız.
          </p>

          <ul className="mt-8 space-y-4">
            {QUICK_LINKS.map((q) => (
              <li key={q.label}>
                {q.href && !q.static ? (
                  <a
                    href={q.href}
                    target={q.external ? "_blank" : undefined}
                    rel={q.external ? "noreferrer" : undefined}
                    className="meta-link inline-flex items-center gap-3 text-sm"
                  >
                    <span className="flex size-8 items-center justify-center rounded-full border border-white/15">
                      <q.icon className="size-3.5" />
                    </span>
                    {q.label}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-3 text-sm">
                    <span className="flex size-8 items-center justify-center rounded-full border border-white/15">
                      <q.icon className="size-3.5" />
                    </span>
                    <span className="ink-muted">{q.label}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Sağ: form — Meta sadeliği, çerçeve YOK, alt çizgili input'lar */}
        <Reveal delay={0.1} className="lg:col-span-3">
          <form onSubmit={onSubmit} aria-label="İletişim formu" className="max-w-xl">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="ct-name" className="ink-muted text-xs font-medium">
                  İsim *
                </label>
                <Input
                  id="ct-name"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Adınız Soyadınız"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border-0 border-b border-white/20 bg-transparent px-0 rounded-none text-base focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/30 h-10"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="ct-email" className="ink-muted text-xs font-medium">
                  E-posta *
                </label>
                <Input
                  id="ct-email"
                  type="email"
                  required
                  maxLength={120}
                  placeholder="ornek@firma.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border-0 border-b border-white/20 bg-transparent px-0 rounded-none text-base focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/30 h-10"
                />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <label htmlFor="ct-subject" className="ink-muted text-xs font-medium">
                Konu
              </label>
              <Input
                id="ct-subject"
                maxLength={120}
                placeholder="Örn: Özel yazılım projesi"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="border-0 border-b border-white/20 bg-transparent px-0 rounded-none text-base focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/30 h-10"
              />
            </div>

            <div className="mt-6 space-y-2">
              <label htmlFor="ct-message" className="ink-muted text-xs font-medium">
                Mesaj *
              </label>
              <Textarea
                id="ct-message"
                required
                minLength={10}
                maxLength={4000}
                rows={5}
                placeholder="Projenizden, ihtiyacınızdan bahsedin…"
                className="resize-none border-0 border-b border-white/20 bg-transparent px-0 rounded-none text-base focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/30"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={sending}
              className="mt-8 rounded-full bg-[oklch(0.97_0.004_168)] px-7 text-[oklch(0.14_0.012_175)] hover:bg-[oklch(0.97_0.004_168)]/85"
            >
              {sending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Gönderiliyor…
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Mesajı Gönder
                </>
              )}
            </Button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
