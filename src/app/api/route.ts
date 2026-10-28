import { NextResponse } from "next/server";

// GET /api — hafiza sağlık ucu (gateway/monitoring için)
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "gnc-inc",
    port: 3000,
    at: new Date().toISOString(),
  });
}
