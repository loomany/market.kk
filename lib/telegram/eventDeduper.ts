import type { SiteEvent, TrafficClassification, VisitorProfile } from "@/lib/telegram/types";

const MS = {
  first_visit: 24 * 60 * 60 * 1000,
  return_visit: 12 * 60 * 60 * 1000,
  session_summary: 10 * 60 * 1000,
  bot_visit: 6 * 60 * 60 * 1000,
  pricing_view: 30 * 60 * 1000,
  tokens_view: 30 * 60 * 1000,
  studio_open: 30 * 60 * 1000,
  checkout_click: 2 * 60 * 1000,
  cta_click: 5 * 60 * 1000,
  lead_action: 5 * 60 * 1000,
  paid_traffic: 24 * 60 * 60 * 1000,
};

function wasSentWithin(
  profile: VisitorProfile,
  key: string,
  windowMs: number,
  now: number
): boolean {
  const last = profile.lastNotificationAtByType[key];
  return typeof last === "number" && now - last < windowMs;
}

export function dedupeKey(
  visitorId: string,
  eventType: string,
  path: string,
  trafficLabel: string
): string {
  return `${visitorId}:${eventType}:${path}:${trafficLabel}`;
}

export function shouldAllowImmediate(
  event: SiteEvent,
  profile: VisitorProfile,
  traffic: TrafficClassification,
  opts: { botName?: string; pathGroup?: string }
): { allow: boolean; notificationKey: string; reason?: string } {
  const now = Date.parse(event.timestamp) || Date.now();
  const type = event.eventType;

  if (type === "signup_success" || type === "payment_success") {
    return { allow: true, notificationKey: type };
  }

  if (type === "login_success") {
    const key = `login_success:${event.sessionId}`;
    if (wasSentWithin(profile, key, MS.return_visit, now)) {
      return { allow: false, notificationKey: key, reason: "login_already_sent" };
    }
    return { allow: true, notificationKey: key };
  }

  if (type === "checkout_click") {
    const key = `checkout_click:${event.visitorId}`;
    if (wasSentWithin(profile, key, MS.checkout_click, now)) {
      return { allow: false, notificationKey: key, reason: "checkout_deduped" };
    }
    return { allow: true, notificationKey: key };
  }

  if (type === "first_visit") {
    const key = `first_visit:${event.visitorId}`;
    if (wasSentWithin(profile, key, MS.first_visit, now)) {
      return { allow: false, notificationKey: key, reason: "first_visit_deduped" };
    }
    return { allow: true, notificationKey: key };
  }

  if (type === "return_visit") {
    const key = `return_visit:${event.visitorId}`;
    if (wasSentWithin(profile, key, MS.return_visit, now)) {
      return { allow: false, notificationKey: key, reason: "return_visit_deduped" };
    }
    return { allow: true, notificationKey: key };
  }

  if (type === "signup_start") {
    const key = `signup_start:${event.sessionId}`;
    if (wasSentWithin(profile, key, 30 * 60 * 1000, now)) {
      return { allow: false, notificationKey: key, reason: "signup_start_deduped" };
    }
    return { allow: true, notificationKey: key };
  }

  const sessionScoped = ["pricing_view", "tokens_view", "studio_open"] as const;
  if (sessionScoped.includes(type as (typeof sessionScoped)[number])) {
    const windowMs = MS[type as keyof typeof MS] ?? 30 * 60 * 1000;
    const key = `${type}:${event.visitorId}:${event.sessionId}`;
    if (wasSentWithin(profile, key, windowMs, now)) {
      return { allow: false, notificationKey: key, reason: `${type}_deduped` };
    }
    return { allow: true, notificationKey: key };
  }

  if (type === "cta_click" || type === "lead_action") {
    const label = event.label ?? event.path;
    const key = `${type}:${event.visitorId}:${label}`;
    const windowMs = MS[type] ?? 5 * 60 * 1000;
    if (wasSentWithin(profile, key, windowMs, now)) {
      return { allow: false, notificationKey: key, reason: `${type}_deduped` };
    }
    return { allow: true, notificationKey: key };
  }

  if (profile.isBot && opts.botName) {
    const pathGroup = opts.pathGroup ?? event.path;
    const key = `bot:${opts.botName}:${pathGroup}`;
    if (wasSentWithin(profile, key, MS.bot_visit, now)) {
      return { allow: false, notificationKey: key, reason: "bot_deduped" };
    }
    return { allow: true, notificationKey: key };
  }

  if (traffic.isPaid) {
    const key = `paid_traffic:${event.visitorId}:${traffic.label}`;
    if (wasSentWithin(profile, key, MS.paid_traffic, now)) {
      return { allow: false, notificationKey: key, reason: "paid_traffic_deduped" };
    }
    return { allow: true, notificationKey: key };
  }

  return { allow: false, notificationKey: type, reason: "not_immediate_type" };
}

export function shouldAllowSessionSummary(
  profile: VisitorProfile,
  sessionId: string,
  now: number
): { allow: boolean; notificationKey: string } {
  const key = `session_summary:${profile.visitorId}:${sessionId}`;
  if (wasSentWithin(profile, key, MS.session_summary, now)) {
    return { allow: false, notificationKey: key };
  }
  if (profile.pageCount < 2) {
    return { allow: false, notificationKey: key };
  }
  return { allow: true, notificationKey: key };
}

export function paidTrafficSourceChanged(
  profile: VisitorProfile,
  traffic: TrafficClassification
): boolean {
  return (
    traffic.isPaid &&
    profile.firstTrafficKind !== traffic.kind &&
    profile.pageCount <= 2
  );
}
