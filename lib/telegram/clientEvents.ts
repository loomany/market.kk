import { SITE_EVENT_TYPES, type SiteEvent, type SiteEventType } from "@/lib/telegram/types";

export type { SiteEvent, SiteEventType };
export { SITE_EVENT_TYPES };

export type TrackTelegramOptions = Partial<
  Omit<SiteEvent, "eventType" | "visitorId" | "sessionId" | "timestamp" | "path">
> & {
  path?: string;
  label?: string;
};

const API_PATH = "/api/telegram/site-event";

let cachedVisitorId: string | null = null;
let cachedSessionId: string | null = null;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }
  return Math.random().toString(36).slice(2, 18);
}

const SESSION_IDLE_MS = 30 * 60 * 1000;
const LS_VISITOR = "vitrina_tid";
const LS_SESSION = "vitrina_sid";
const LS_SESSION_AT = "vitrina_sid_at";
const LS_FIRST_SEEN = "vitrina_first_seen";
const SS_ATTRIBUTION = "vitrina_attribution";

export type AttributionParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  yclid?: string;
  fbclid?: string;
  ttclid?: string;
};

export function getVisitorId(): string {
  if (cachedVisitorId) return cachedVisitorId;
  let id = readCookie("vitrina_tid");
  if (!id && typeof localStorage !== "undefined") {
    id = localStorage.getItem(LS_VISITOR);
  }
  if (!id) {
    id = randomId();
  }
  writeCookie("vitrina_tid", id, 365 * 24 * 60 * 60);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(LS_VISITOR, id);
  }
  cachedVisitorId = id;
  return id;
}

export function getSessionId(): string {
  const now = Date.now();
  if (cachedSessionId) {
    const at = Number(localStorage.getItem(LS_SESSION_AT) ?? "0");
    if (now - at < SESSION_IDLE_MS) return cachedSessionId;
  }

  let id = readCookie("vitrina_sid");
  const lastAt = Number(
    (typeof localStorage !== "undefined" ? localStorage.getItem(LS_SESSION_AT) : null) ?? "0"
  );

  if (!id || now - lastAt >= SESSION_IDLE_MS) {
    id = randomId();
  }

  writeCookie("vitrina_sid", id, 24 * 60 * 60);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(LS_SESSION, id);
    localStorage.setItem(LS_SESSION_AT, String(now));
  }
  cachedSessionId = id;
  return id;
}

export function touchSessionActivity() {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(LS_SESSION_AT, String(Date.now()));
  }
}

export function getFirstSeenAt(): number | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(LS_FIRST_SEEN);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function markFirstSeen() {
  if (typeof localStorage === "undefined") return;
  if (!localStorage.getItem(LS_FIRST_SEEN)) {
    localStorage.setItem(LS_FIRST_SEEN, String(Date.now()));
  }
}

export function isReturnVisitor(): boolean {
  const first = getFirstSeenAt();
  if (!first) return false;
  return Date.now() - first > 24 * 60 * 60 * 1000;
}

export function captureAttributionFromUrl(): AttributionParams {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const attribution: AttributionParams = {};
  const keys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "yclid",
    "fbclid",
    "ttclid",
  ] as const;
  for (const key of keys) {
    const v = params.get(key);
    if (v) attribution[key] = v;
  }
  if (Object.keys(attribution).length > 0 && typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(SS_ATTRIBUTION, JSON.stringify(attribution));
  }
  return attribution;
}

export function getStoredAttribution(): AttributionParams {
  if (typeof sessionStorage === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(SS_ATTRIBUTION);
    if (!raw) return {};
    return JSON.parse(raw) as AttributionParams;
  } catch {
    return {};
  }
}

export function detectLocaleFromPath(pathname: string): string | undefined {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (seg === "ru" || seg === "en" || seg === "kk") return seg;
  return undefined;
}

export function buildSiteEventPayload(
  eventType: SiteEventType,
  path: string,
  extra: TrackTelegramOptions = {}
): SiteEvent {
  touchSessionActivity();
  const attribution = { ...getStoredAttribution(), ...captureAttributionFromUrl() };

  return {
    eventType,
    path: extra.path ?? path,
    title: extra.title ?? (typeof document !== "undefined" ? document.title : undefined),
    referrer:
      extra.referrer ??
      (typeof document !== "undefined" ? document.referrer || undefined : undefined),
    userAgent:
      extra.userAgent ??
      (typeof navigator !== "undefined" ? navigator.userAgent : undefined),
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    timestamp: new Date().toISOString(),
    locale: extra.locale ?? detectLocaleFromPath(path),
    label: extra.label,
    userId: extra.userId,
    maskedEmail: extra.maskedEmail,
    ...attribution,
    ...extra,
  };
}

export async function postSiteEvent(
  eventType: SiteEventType,
  path: string,
  extra: TrackTelegramOptions = {}
): Promise<void> {
  if (typeof window === "undefined") return;

  const payload = buildSiteEventPayload(eventType, path, extra);

  try {
    await fetch(API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // silent — notifications must not break the site
  }
}

export function trackTelegramEvent(
  eventType: SiteEventType,
  extra: TrackTelegramOptions = {}
): void {
  const path =
    extra.path ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  void postSiteEvent(eventType, path, extra);
}
