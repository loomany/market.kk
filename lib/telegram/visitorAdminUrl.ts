import { timingSafeEqual } from "crypto";

export function getVisitorAdminViewSecret(): string | null {
  return process.env.TELEGRAM_ADMIN_VIEW_SECRET?.trim() || null;
}

export function verifyVisitorAdminKey(provided: string | null | undefined): boolean {
  const secret = getVisitorAdminViewSecret();
  if (!secret || !provided) return false;
  try {
    const a = Buffer.from(secret, "utf8");
    const b = Buffer.from(provided, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function buildVisitorAdminUrl(visitorId: string): string | null {
  const secret = getVisitorAdminViewSecret();
  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, "");
  if (!secret || !base) return null;
  const url = new URL(`/admin/visitor/${encodeURIComponent(visitorId)}`, base);
  url.searchParams.set("key", secret);
  return url.toString();
}
