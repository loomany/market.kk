const buckets = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 5 * 60 * 1000;
const MAX_EVENTS = 60;

export function checkSiteEventRateLimit(visitorId: string, sessionId: string): boolean {
  const key = `${visitorId}:${sessionId}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (current.count >= MAX_EVENTS) {
    return false;
  }

  current.count += 1;
  return true;
}
