"use client";

import { ArrowUpRight, Github, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  repoUrl: string | null;
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

function TechChips({ stack }: { stack: string }) {
  const chips = stack.split(",").map((t) => t.trim()).filter(Boolean);
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <Badge key={c} variant="secondary" className="font-mono text-[10px] font-normal">
          {c}
        </Badge>
      ))}
    </div>
  );
}

function ProjectCard({ p, big = false }: { p: ProjectData; big?: boolean }) {
  const href =
    p.port != null && p.prodDomain
      ? serviceUrl({ port: p.port, prodDomain: p.prodDomain })
      : null;

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/60 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 ${
        big ? "md:col-span-2" : ""
      }`}
    >
      {/* Görsel */}
      <div className={`relative overflow-hidden ${big ? "aspect-[21/10]" : "aspect-[16/9]"}`}>
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
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge variant="secondary" className="glass text-[10px]">
            {CATEGORY_LABEL[p.category] ?? p.category}
          </Badge>
          {p.status === "live" && (
            <Badge className="glass gap-1 border-primary/30 bg-primary/15 text-[10px] text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Canlı
            </Badge>
          )}
        </div>
        {p.featured && (
          <div className="absolute right-3 top-3">
            <Badge variant="secondary" className="glass gap-1 text-[10px]">
              <Star className="size-3 fill-primary text-primary" />
              Amiral Gemisi
            </Badge>
          </div>
        )}
      </div>

      {/* İçerik */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">{p.name}</h3>
            <p className="mt-0.5 text-sm text-primary/90">{p.tagline}</p>
          </div>
          {p.port != null && (
            <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
              :{p.port}
            </Badge>
          )}
        </div>

        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {p.description}
        </p>

        <TechChips stack={p.techStack} />

        <div className="mt-5 flex items-center gap-2">
          {href && (
            <Button asChild size="sm" className="flex-1">
              <a href={href}>
                Ürünü Aç
                <ArrowUpRight className="size-3.5" />
              </a>
            </Button>
          )}
          {p.repoUrl && (
            <Button asChild size="sm" variant="outline" aria-label={`${p.name} GitHub reposu`}>
              <a href={p.repoUrl} target="_blank" rel="noreferrer">
                <Github className="size-3.5" />
                Kod
              </a>
            </Button>
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
    <section id="projeler" className="section-x py-20 sm:py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Projeler & Ürünler
        </h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          GNC ekosisteminin tamamı; her biri kendi PostgreSQL veritabanıyla, bağımsız birer
          ürün olarak tasarlandı ve hayata geçti.
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        {featured.map((p, i) => (
          <Reveal key={p.slug} delay={Math.min(i * 0.06, 0.3)} className={featured.length === 1 && i === 0 ? "md:col-span-2" : ""}>
            <ProjectCard p={p} big />
          </Reveal>
        ))}
        {rest.map((p, i) => (
          <Reveal key={p.slug} delay={Math.min(0.1 + i * 0.06, 0.36)}>
            <ProjectCard p={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
