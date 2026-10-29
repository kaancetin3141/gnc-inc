import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const newsletterSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta girin").max(120),
  source: z.enum(["footer", "api"]).default("footer"),
});

// POST /api/newsletter — bülten kaydı → PostgreSQL (upsert: tekrar kayıt sessizce OK)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Geçersiz istek";
      return NextResponse.json({ ok: false, error: first }, { status: 400 });
    }
    const { email, source } = parsed.data;
    await db.newsletterSubscriber.upsert({
      where: { email },
      update: {}, // mevcut abone: değişiklik yok
      create: { email, source },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Kayıt alınamadı. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}
