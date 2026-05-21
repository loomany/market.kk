import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { guestFreeGenerationLimit } from "@/lib/tokens/config";

const COOKIE_NAME = "vitrina_guest_gen";

function guestSecret() {
  return (
    process.env.APP_SESSION_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "local-dev-guest-generation-secret"
  );
}

function sign(payload: string) {
  return createHmac("sha256", guestSecret()).update(payload).digest("base64url");
}

export type GuestGenerationState = {
  usedCount: number;
  limit: number;
};

function parseCookieValue(value: string | undefined): GuestGenerationState | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      usedCount?: number;
    };
    const usedCount = Number(parsed.usedCount ?? 0);
    if (!Number.isFinite(usedCount) || usedCount < 0) return null;
    return { usedCount: Math.floor(usedCount), limit: guestFreeGenerationLimit() };
  } catch {
    return null;
  }
}

export async function getGuestGenerationState(): Promise<GuestGenerationState> {
  const cookieStore = await cookies();
  const parsed = parseCookieValue(cookieStore.get(COOKIE_NAME)?.value);
  const limit = guestFreeGenerationLimit();
  if (!parsed) return { usedCount: 0, limit };
  return { usedCount: Math.min(parsed.usedCount, limit), limit };
}

export async function markGuestGenerationUsed(): Promise<void> {
  const cookieStore = await cookies();
  const current = await getGuestGenerationState();
  const nextCount = Math.min(current.usedCount + 1, current.limit + 1);
  const payload = Buffer.from(JSON.stringify({ usedCount: nextCount })).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export function guestGenerationRemaining(state: GuestGenerationState): number {
  return Math.max(0, state.limit - state.usedCount);
}
