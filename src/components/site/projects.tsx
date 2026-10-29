"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "./reveal";
import { serviceUrl } from "@/lib/site-config";

export type ProjectData = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  port: number | null;
  prodDomain: string | null;
  techStack: string;
  image: string | null;
  status: string;
  featured: boolean;
};

const CATEGORY_LABEL: Record<string, string> = {
  product: "Ürün",
  game: "Oyun",
  platform: "Platform",
};

/**
 * Meta.com vitrin dili: öne çıkan her ürün tam genişlik, dönüşümlü açık/mürekkep
 * zeminli bölümde — solda dev başlık + kısa metin + pill CTA, sağda büyük görsel.
 */
function Showcase({ p, index }: { p: ProjectData; index: number }) {
  const dark = index % 2 === 1; // 2. ve 4. vitrin mürekkep siyahı
  const flip = index % 2 === 1; // görsel/metin sırası dönüşümlü
  const href =
    p.port != null && p.prodDomain ? serviceUrl({ port: p.port, prodDomain: p.prodDomain }) : null;

  const body = (
    <div className="flex flex-col items-start">
      {/* Meta tarzı küçük kategori başlığı */}
      <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${dark ? "ink-muted" : "text-primary"}`}>
        {CATEGORY_LABEL[p.category] ?? p.category}
        {p.status === "live" && <span className="ml-2 normal-case tracking-normal">· Canlı</span>}
      </p>

      <h2
        className={`mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${
          dark ? "" : ""
        }`}
      >
        {p.name}
      </h2>

      <p
        className={`mt-2 text-lg font-medium ${
          dark ? "text-[oklch(0.72_0.14_168)]" : "text-primary"
        }`}
      >
        {p.tagline}
      </p>

      <p
        className={`mt-4 max-w-md text-pretty leading-relaxed ${
          dark ? "ink-muted" : "text-muted-foreground"
        }`}
      >
        {p.description}
      </p>

      {/* Tech şeridi — sade mono metin, çip YOK (Meta sadeliği) */}
      <p
        className={`mt-5 font-mono text-xs leading-relaxed ${
          dark ? "ink-muted opacity-80" : "text-muted-foreground/80"
        }`}
      >
        {p.techStack}
      </p>

      {/* Meta CTA sırası: dolu pill + sade metin linki */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        {href && (
          <a href={href} className="pill pill-solid">
            Ürünü Aç
            <ArrowRight className="size-4" />
          </a>
        )}
      </div>
    </div>
  );

  const visual = (
    <div className={`relative overflow-hidden rounded-3xl ${dark ? "ring-1 ring-white/10" : "border border-border/70 shadow-2xl shadow-black/10"}`}>
      {p.image ? (
        <img
          src={p.image}
          alt={`${p.name} arayüzü`}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
        />
      ) : (
        <div className="grid-pattern aspect-[16/10] w-full bg-secondary" />
      )}
      {p.port != null && (
        <Badge
          variant="secondary"
          className={`absolute right-4 top-4 font-mono text-[10px] ${
            dark ? "bg-white/10 text-white/80" : ""
          }`}
        >
          :{p.port}
        </Badge>
      )}
    </div>
  );

  return (
    <section className={dark ? "ink" : "bg-background"}>
      <div className="section-x grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
        <Reveal className={flip ? "lg:order-2" : ""}>{body}</Reveal>
        <Reveal delay={0.1} className={flip ? "lg:order-1" : ""}>
          {visual}
        </Reveal>
      </div>
    </section>
  );
}

/** Standart ürün kartı — Meta'nın içerik kartı ızgarası */
function ProjectCard({ p }: { p: ProjectData }) {
  const href =
    p.port != null && p.prodDomain ? serviceUrl({ port: p.port, prodDomain: p.prodDomain }) : null;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
      <div className="relative aspect-[16/9] overflow-hidden">
        {p.image ? (
          <img
            src={p.image}
            alt={`${p.name} görseli`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid-pattern size-full bg-secondary" />
        )}
        <div className="absolute left-3 top-3">
          <Badge variant="secondary" className="glass text-[10px]">
            {CATEGORY_LABEL[p.category] ?? p.category}
          </Badge>
        </div>
        {p.status === "live" && (
          <div className="absolute right-3 top-3">
            <Badge className="glass gap-1 border-primary/30 bg-primary/15 text-[10px] text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Canlı
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold tracking-tight">{p.name}</h3>
        <p className="mt-0.5 text-sm text-primary/90">{p.tagline}</p>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {p.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
          {href ? (
            <a
              href={href}
              className="meta-link inline-flex items-center gap-1 text-sm text-primary"
            >
              Ürünü Aç
              <ArrowUpRight className="size-3.5" />
            </a>
          ) : (
            <span />
          )}
        </div>
      </div>
    </article>
  );
}

export function Projects({ projects }: { projects: ProjectData[] }) {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <div id="projeler" className="scroll-mt-20">
      {/* Öne çıkanlar: Meta tarzı dönüşümlü vitrinler */}
      {featured.map((p, i) => (
        <Showcase key={p.slug} p={p} index={i} />
      ))}

      {/* Diğer ürünler: Meta içerik kartı ızgarası */}
      {rest.length > 0 && (
        <section className="section-x py-16 sm:py-24">
          <Reveal className="max-w-2xl">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Ve oyunlar
            </h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              Ekosistemin eğlence kanadı — her biri oynanabilir, her biri kendi başına bir ürün.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <Reveal key={p.slug} delay={Math.min(i * 0.07, 0.28)}>
                <ProjectCard p={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
