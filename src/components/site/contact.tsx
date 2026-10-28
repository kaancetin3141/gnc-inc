"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Mail, Github, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "./reveal";
import { SITE } from "@/lib/site-config";

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
    <section id="iletisim" className="section-x py-20 sm:py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          İletişime Geçin
        </h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          Proje teklifi, iş birliği ya da sadece merak — formu doldurun, mesajınız doğrudan
          veritabanımıza düşsün.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        {/* Bilgi kartları */}
        <Reveal className="lg:col-span-2">
          <div className="flex h-full flex-col gap-3">
            <a
              href={`mailto:${SITE.email}`}
              className="group flex items-center gap-4 rounded-2xl border border-border/80 bg-card/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <Mail className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">E-posta</p>
                <p className="truncate text-sm text-muted-foreground group-hover:text-primary">
                  {SITE.email}
                </p>
              </div>
            </a>

            <a
              href={SITE.github}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-border/80 bg-card/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <Github className="size-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold">GitHub</p>
                <p className="text-sm text-muted-foreground group-hover:text-primary">
                  Tüm ürünler açık kaynak
                </p>
              </div>
            </a>

            <div className="flex items-center gap-4 rounded-2xl border border-border/80 bg-card/60 p-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <MapPin className="size-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Konum</p>
                <p className="text-sm text-muted-foreground">İstanbul, Türkiye</p>
              </div>
            </div>

            <div className="flex flex-1 items-end rounded-2xl border border-primary/25 bg-primary/5 p-5">
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-primary">Hızlı yanıt sözü:</span>{" "}
                Mesai saatlerinde ortalama yanıt süresi 2 saattir. Acil sunucu sorunlarında
                doğrudan e-posta konusuna <span className="font-mono">[ACİL]</span> yazmanız
                yeterli.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Form */}
        <Reveal delay={0.08} className="lg:col-span-3">
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8"
            aria-label="İletişim formu"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="ct-name" className="text-xs font-medium text-muted-foreground">
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
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ct-email" className="text-xs font-medium text-muted-foreground">
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
                />
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <label htmlFor="ct-subject" className="text-xs font-medium text-muted-foreground">
                Konu
              </label>
              <Input
                id="ct-subject"
                maxLength={120}
                placeholder="Örn: Özel yazılım projesi"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>

            <div className="mt-4 space-y-1.5">
              <label htmlFor="ct-message" className="text-xs font-medium text-muted-foreground">
                Mesaj *
              </label>
              <Textarea
                id="ct-message"
                required
                minLength={10}
                maxLength={4000}
                rows={5}
                placeholder="Projenizden, ihtiyacınızdan bahsedin…"
                className="resize-none"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <Button type="submit" size="lg" disabled={sending} className="mt-6 w-full sm:w-auto">
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
