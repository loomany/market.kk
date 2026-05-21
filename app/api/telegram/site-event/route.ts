import { NextResponse } from "next/server";
import { getTelegramConfig } from "@/lib/telegram/telegramConfig";
import { checkSiteEventRateLimit } from "@/lib/telegram/rateLimit";
import { processSiteEvent } from "@/lib/telegram/siteEventProcessor";
import { siteEventBodySchema } from "@/lib/telegram/siteEventSchema";
import type { SiteEvent } from "@/lib/telegram/types";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 8 * 1024;

function countryFromHeaders(request: Request): string | undefined {
  return (
    request.headers.get("x-vercel-ip-country")?.trim() ||
    request.headers.get("cf-ipcountry")?.trim() ||
    undefined
  );
}

export async function POST(request: Request) {
  const config = getTelegramConfig();

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, errorCode: "PAYLOAD_TOO_LARGE" },
      { status: 413 }
    );
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return NextResponse.json(
      { ok: false, errorCode: "INVALID_BODY" },
      { status: 400 }
    );
  }

  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, errorCode: "PAYLOAD_TOO_LARGE" },
      { status: 413 }
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { ok: false, errorCode: "VALIDATION_ERROR", message: "Invalid JSON" },
      { status: 400 }
    );
  }

  const parsed = siteEventBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errorCode: "VALIDATION_ERROR", message: "Invalid site event" },
      { status: 400 }
    );
  }

  if (!config.enabled) {
    return NextResponse.json({ ok: true, disabled: true });
  }

  const { visitorId, sessionId } = parsed.data;
  if (!checkSiteEventRateLimit(visitorId, sessionId)) {
    return NextResponse.json({ ok: true, rateLimited: true });
  }

  const event: SiteEvent = {
    ...parsed.data,
    timestamp:
      typeof parsed.data.timestamp === "string"
        ? parsed.data.timestamp
        : new Date().toISOString(),
  };

  const country = countryFromHeaders(request);
  await processSiteEvent(event, { country });

  return NextResponse.json({ ok: true });
}
