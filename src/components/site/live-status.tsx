"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "./reveal";
import { serviceUrl } from "@/lib/site-config";

type StatusItem = {
  id: string;
  name: string;
  port: number;
  desc: string;
  prodDomain: string;
  ok: boolean;
  ms: number | null;
};

export function LiveStatus() {
  const [items, setItems] = useState<StatusItem[] | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.items)) {
        setItems(data.items);
        setUpdatedAt(data.at);
      }
    } catch {
      // sessizce bırak — son değerler kalsın
    }
  }, []);

  useEffect(() => {
    const t0 = setTimeout(load, 0); // anında ama asenkron — kurala uygun
    const t = setInterval(load, 30_000);
    return () => {
      clearTimeout(t0);
      clearInterval(t);
    };
  }, [load]);

  const upCount = items?.filter((i) => i.ok).length ?? 0;

  return (
    <section id="sistemler" className="border-y border-border/70 bg-muted/40 py-16 sm:py-20">
      <div className="section-x">
        {/* Meta tarzı: sol hizalı bölüm başlığı, ortada değil */}
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Altyapı
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Canlı Sistem Durumu
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Bu sayfa, kendi sunucumuzda attığımız {items?.length ?? 8} servisin nabzını gerçek
            zamanlı tutar.{" "}
            {items && (
              <span className="font-medium text-foreground">
                {upCount}/{items.length} sistem çalışıyor.
              </span>
            )}
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/70 sm:grid-cols-2 lg:grid-cols-4">
          {(items ?? Array.from({ length: 8 })).map((s, idx) => {
            if (!items) {
              return <Skeleton key={idx} className="h-28 rounded-none bg-muted/40" />;
            }
            const item = s as StatusItem;
            return (
              <a
                key={item.id}
                href={serviceUrl({ port: item.port, prodDomain: item.prodDomain })}
                className="group relative flex min-h-28 flex-col justify-between gap-3 bg-background p-5 transition-colors hover:bg-accent/50"
                aria-label={`${item.name} — ${item.ok ? "çalışıyor" : "erişilemiyor"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold tracking-tight">{item.name}</h3>
                  <span className="font-mono text-[10px] text-muted-foreground">:{item.port}</span>
                </div>
                <p className="line-clamp-1 text-xs text-muted-foreground">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      item.ok ? "text-primary" : "text-destructive"
                    }`}
                  >
                    <span className="relative flex size-1.5">
                      <span
                        className={`absolute inline-flex h-full w-full rounded-full ${
                          item.ok ? "animate-ping-soft bg-primary" : "bg-destructive"
                        }`}
                      />
                      <span
                        className={`relative inline-flex size-1.5 rounded-full ${
                          item.ok ? "bg-primary" : "bg-destructive"
                        }`}
                      />
                    </span>
                    {item.ok
                      ? `Çalışıyor${item.ms != null ? ` · ${item.ms}ms` : ""}`
                      : "Erişilemiyor"}
                  </span>
                  <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </a>
            );
          })}
        </div>

        <Reveal className="mt-5 text-xs text-muted-foreground">
          {updatedAt
            ? `Son kontrol: ${new Date(updatedAt).toLocaleTimeString("tr-TR")} · 30 saniyede bir yenilenir · hafif sağlık uçları üzerinden`
            : "Durum sorgulanıyor…"}
        </Reveal>
      </div>
    </section>
  );
}
