"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <section id="sistemler" className="section-x py-20 sm:py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Canlı Sistem Durumu
        </h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          Bu sayfa, kendi sunucumuzda attığımız {items?.length ?? 8} servisin nabzını gerçek
          zamanlı tutar.{" "}
          {items && (
            <span className="text-primary font-medium">
              {upCount}/{items.length} sistem çalışıyor.
            </span>
          )}
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(items ?? Array.from({ length: 8 })).map((s, idx) => {
          if (!items) {
            return <Skeleton key={idx} className="h-[148px] rounded-2xl" />;
          }
          const item = s as StatusItem;
          return (
            <Reveal key={item.id} delay={Math.min(idx * 0.05, 0.3)}>
              <a
                href={serviceUrl({ port: item.port, prodDomain: item.prodDomain })}
                className="group flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="relative flex size-2">
                        <span
                          className={`absolute inline-flex h-full w-full rounded-full ${
                            item.ok ? "bg-primary animate-ping-soft" : "bg-destructive"
                          }`}
                        />
                        <span
                          className={`relative inline-flex size-2 rounded-full ${
                            item.ok ? "bg-primary" : "bg-destructive"
                          }`}
                        />
                      </span>
                      <h3 className="truncate text-sm font-semibold">{item.name}</h3>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="shrink-0 font-mono text-[10px] tracking-tight"
                  >
                    :{item.port}
                  </Badge>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span
                      className={`size-1.5 rounded-full ${
                        item.ok ? "bg-primary" : "bg-destructive"
                      }`}
                    />
                    {item.ok
                      ? `Çalışıyor${item.ms != null ? ` · ${item.ms}ms` : ""}`
                      : "Erişilemiyor"}
                  </span>
                  <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </a>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="mt-6 text-center text-xs text-muted-foreground">
        {updatedAt
          ? `Son kontrol: ${new Date(updatedAt).toLocaleTimeString("tr-TR")} · 30 saniyede bir yenilenir`
          : "Durum sorgulanıyor…"}
      </Reveal>
    </section>
  );
}
