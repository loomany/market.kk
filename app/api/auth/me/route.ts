import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentSession();
  return NextResponse.json({
    ok: true,
    user: session ? { id: session.userId, phone: session.phone } : null,
  });
}
