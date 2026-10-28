"use client";

const TECHS = [
  "Next.js 16",
  "TypeScript",
  "PostgreSQL 17",
  "Prisma",
  "Bun",
  "Flutter",
  "Tailwind CSS 4",
  "shadcn/ui",
  "React 19",
  "Canvas 2D",
  "Firebase",
  "PWA",
  "Framer Motion",
  "Zustand",
  "Socket.IO",
  "Nginx",
];

export function TechMarquee() {
  const doubled = [...TECHS, ...TECHS];
  return (
    <section aria-label="Kullanılan teknolojiler" className="border-y border-border/70 py-6">
      <div className="marquee-mask overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-3 pr-3">
          {doubled.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-border/80 bg-card/50 px-4 py-2 font-mono text-xs text-muted-foreground"
            >
              <span className="size-1.5 rounded-full bg-primary/70" aria-hidden="true" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
