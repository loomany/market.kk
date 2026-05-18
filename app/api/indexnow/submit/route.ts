import { NextResponse } from "next/server";
import { submitIndexNowUrls } from "@/lib/seo/indexNow";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const entries = (requestLog.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  entries.push(now);
  requestLog.set(ip, entries);
  return entries.length > MAX_REQUESTS;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "RATE_LIMITED" },
      { status: 429 }
    );
  }

  const body = (await request.json().catch(() => null)) as { urls?: unknown } | null;
  if (!body || !Array.isArray(body.urls)) {
    return NextResponse.json(
      { ok: false, error: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const urls = body.urls.filter((url): url is string => typeof url === "string");
  const result = await submitIndexNowUrls(urls);

  return NextResponse.json({
    ok: result.submitted,
    enabled: result.enabled,
    status: result.status,
    message: result.message,
  });
}
