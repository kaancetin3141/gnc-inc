"use client";

import { Compass, PenTool, Code2, HeartPulse, ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

const STEPS = [
  {
    icon: Compass,
    no: "01",
    title: "Keşif",
    desc: "İhtiyacınızı birlikte netleştiriyoruz: hedef kullanıcı, iş akışı, ölçülebilir başarı kriterleri. Bu aşamanın çıktısı kalemlere ayrılmış bir kapsam dokümanı.",
  },
  {
    icon: PenTool,
    no: "02",
    title: "Tasarım",
    desc: "Önce tıklanabilir prototip, sonra piksel piksel arayüz. Onay almadan tek satır ürün kodu yazmıyoruz — beğenmediğiniz şeyi ucuzken değiştiriyoruz.",
  },
  {
    icon: Code2,
    no: "03",
    title: "Geliştirme",
    desc: "Haftalık demolarla ilerliyoruz. Next.js 16, TypeScript ve PostgreSQL 17 standartlarımız; her merge otomatik kontrolden geçer, her sürüm geri alınabilir.",
  },
  {
    icon: HeartPulse,
    no: "04",
    title: "Yaşatma",
    desc: "Yayın bitiş değil başlangıç: canlı izleme, düzenli yedek, performans takibi ve sürüm bakımı. Ürünümüz kendi ekosistemimizde her gün bu şekilde yaşıyor.",
  },
];

/**
 * Meta.com ritmi: sayılar soldan akışkan dört adım — masaüstünde yatay
 * ayraçlı kart dizisi, mobilde tek kolon. Adımlar arasında ilerleme hissi.
 */
export function Process() {
  return (
    <section id="surec" className="scroll-mt-20 border-y border-border/60 bg-background py-16 sm:py-24">
      <div className="section-x">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Nasıl Çalışıyoruz
          </p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Fikirden canlı ürüne, dört net adım.
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Kendi ürünlerimizi de aynı süreçten geçiriyoruz — bu yüzden
            sözünü verdiğimiz her aşamanın karşılığı canlıda duruyor.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.no} delay={Math.min(i * 0.08, 0.3)} className="h-full">
              <article className="group relative flex h-full flex-col rounded-3xl border border-border/70 bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
                {/* Dev sıra numarası — arka planda soluk */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-5 top-4 font-mono text-5xl font-bold tracking-tighter text-primary/10 transition-colors group-hover:text-primary/20"
                >
                  {s.no}
                </span>

                <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-primary">
                  <s.icon className="size-5" aria-hidden="true" />
                </span>

                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-10">
          <a
            href="#iletisim"
            className="meta-link inline-flex items-center gap-1.5 text-sm text-primary"
          >
            Sürecinizi bugün başlatın
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
