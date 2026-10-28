import { NextResponse } from "next/server";
import { SERVICES } from "@/lib/site-config";

export const dynamic = "force-dynamic";

// 15 sn sunucu-taraflı cache — sayfa her açılışta 8 istek atmasın
type StatusEntry = {
  id: string;
  name: string;
  port: number;
  desc: string;
  prodDomain: string;
  ok: boolean;
  ms: number | null;
};
type CacheShape = { at: number; data: StatusEntry[] };
let cache: CacheShape | null = null;
const TTL = 15_000;

async function checkOne(port: number): Promise<{ ok: boolean; ms: number | null }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 1600);
  const start = Date.now();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/`, {
      signal: ctrl.signal,
      cache: "no-store",
      headers: { "user-agent": "gnc-inc/status/1.0" },
    });
    clearTimeout(t);
    return { ok: res.status >= 200 && res.status < 500, ms: Date.now() - start };
  } catch {
    clearTimeout(t);
    return { ok: false, ms: null };
  }
}

// GET /api/status — 8 canlı sistemin sağlık kontrolü
export async function GET() {
  const now = Date.now();
  if (cache && now - cache.at < TTL) {
    return NextResponse.json({ ok: true, at: cache.at, cached: true, items: cache.data });
  }
  const results = await Promise.all(
    SERVICES.map(async (s): Promise<StatusEntry> => {
      const r = await checkOne(s.port);
      return {
        id: s.id,
        name: s.name,
        port: s.port,
        desc: s.desc,
        prodDomain: s.prodDomain,
        ok: r.ok,
        ms: r.ms,
      };
    }),
  );
  cache = { at: now, data: results };
  return NextResponse.json({ ok: true, at: now, cached: false, items: results });
}
