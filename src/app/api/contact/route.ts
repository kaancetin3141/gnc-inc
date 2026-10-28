import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const contactSchema = z.object({
  name: z.string().trim().min(2, "İsim en az 2 karakter olmalı").max(80),
  email: z.string().trim().email("Geçerli bir e-posta girin").max(120),
  subject: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Mesaj en az 10 karakter olmalı").max(4000),
});

// POST /api/contact — iletişim formu → PostgreSQL
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Geçersiz form";
      return NextResponse.json({ ok: false, error: first }, { status: 400 });
    }
    const { name, email, subject, message } = parsed.data;
    const saved = await db.contactMessage.create({
      data: { name, email, subject: subject || null, message },
    });
    return NextResponse.json({ ok: true, id: saved.id });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Mesaj kaydedilemedi. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}
