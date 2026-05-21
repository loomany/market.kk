import type { SiteEvent, TrafficClassification, VisitorProfile } from "@/lib/telegram/types";

const VISITOR_TTL_MS = 48 * 60 * 60 * 1000;
const MAX_PATHS = 12;
const MAX_IMPORTANT = 8;

const visitors = new Map<string, VisitorProfile>();

function sweepExpired(now: number) {
  for (const [id, profile] of visitors) {
    if (now - profile.lastSeenAt > VISITOR_TTL_MS) {
      visitors.delete(id);
    }
  }
}

export function isBlogOrArticlePath(path: string): boolean {
  const p = path.toLowerCase();
  return (
    p.includes("/blog") ||
    p.includes("/articles") ||
    p.startsWith("/blog") ||
    /\/[a-z]{2}\/blog\//i.test(p)
  );
}

export function isImportantPath(path: string): boolean {
  const p = path.toLowerCase().split("?")[0] ?? path;
  if (isBlogOrArticlePath(p)) return false;
  return (
    p.includes("/tokens") ||
    p.includes("/cost") ||
    p.includes("/pricing") ||
    p.includes("/studio") ||
    p === "/studio"
  );
}

function pushUnique(list: string[], value: string, max: number) {
  const filtered = list.filter((x) => x !== value);
  filtered.push(value);
  while (filtered.length > max) filtered.shift();
  return filtered;
}

export function getOrCreateVisitorProfile(
  event: SiteEvent,
  traffic: TrafficClassification,
  bot: { isBot: boolean; botName?: string },
  country?: string
): VisitorProfile {
  const now = Date.parse(event.timestamp) || Date.now();
  sweepExpired(now);

  const existing = visitors.get(event.visitorId);
  if (existing) {
    existing.lastSeenAt = now;
    existing.lastTrafficSource = traffic.label;
    existing.lastTrafficKind = traffic.kind;
    existing.pageCount += event.eventType === "page_view" ? 1 : 0;
    existing.lastPaths = pushUnique(existing.lastPaths, event.path, MAX_PATHS);
    if (isImportantPath(event.path)) {
      existing.importantPaths = pushUnique(existing.importantPaths, event.path, MAX_IMPORTANT);
    }
    if (event.locale) existing.locale = event.locale;
    if (country) existing.country = country;
    if (existing.sessionId !== event.sessionId) {
      existing.sessionId = event.sessionId;
      existing.sessionStartedAt = now;
    }
    if (bot.isBot) {
      existing.isBot = true;
      existing.botName = bot.botName ?? existing.botName;
    }
    return existing;
  }

  const profile: VisitorProfile = {
    visitorId: event.visitorId,
    firstSeenAt: now,
    lastSeenAt: now,
    firstTrafficSource: traffic.label,
    lastTrafficSource: traffic.label,
    firstTrafficKind: traffic.kind,
    lastTrafficKind: traffic.kind,
    isBot: bot.isBot,
    botName: bot.botName,
    pageCount: event.eventType === "page_view" ? 1 : 0,
    importantPaths: isImportantPath(event.path) ? [event.path] : [],
    lastPaths: [event.path],
    lastNotificationAtByType: {},
    sessionId: event.sessionId,
    sessionStartedAt: now,
    locale: event.locale,
    country,
  };

  visitors.set(event.visitorId, profile);
  return profile;
}

export function touchVisitorPageView(profile: VisitorProfile, path: string) {
  const now = Date.now();
  const last = profile.lastPaths[profile.lastPaths.length - 1];
  if (last === path) {
    profile.lastSeenAt = now;
    return;
  }
  profile.lastSeenAt = now;
  profile.pageCount += 1;
  profile.lastPaths = pushUnique(profile.lastPaths, path, MAX_PATHS);
  if (isImportantPath(path)) {
    profile.importantPaths = pushUnique(profile.importantPaths, path, MAX_IMPORTANT);
  }
}

export function markNotificationSent(
  profile: VisitorProfile,
  notificationType: string,
  at = Date.now()
) {
  profile.lastNotificationAtByType[notificationType] = at;
}

export function getVisitorProfile(visitorId: string): VisitorProfile | undefined {
  return visitors.get(visitorId);
}
