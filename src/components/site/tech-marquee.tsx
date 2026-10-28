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

/** İnce mürekkep şerit — açık bölümler arasında Meta tarzı ritim geçişi */
export function TechMarquee() {
  const doubled = [...TECHS, ...TECHS];
  return (
    <section aria-label="Kullanılan teknolojiler" className="ink border-y border-white/10 py-5">
      <div className="marquee-mask overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-3 pr-3">
          {doubled.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-white/15 px-4 py-1.5 font-mono text-xs text-white/70"
            >
              <span className="size-1.5 rounded-full bg-[oklch(0.72_0.14_168)]" aria-hidden="true" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
