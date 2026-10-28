import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/portfolio — portföy projeleri (PostgreSQL)
export async function GET() {
  try {
    const projects = await db.portfolioProject.findMany({
      orderBy: [{ sortOrder: "asc" }],
    });
    return NextResponse.json({ ok: true, items: projects });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Portföy yüklenemedi", detail: (e as Error).message },
      { status: 500 },
    );
  }
}
