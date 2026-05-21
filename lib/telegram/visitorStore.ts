import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { summarizeUserAgent } from "@/lib/telegram/uaSummary";
import type { SiteEvent, TrafficClassification, VisitorProfile } from "@/lib/telegram/types";

export type StoredVisitorEvent = {
  id: string;
  visitor_id: string;
  session_id: string;
  event_type: string;
  path: string;
  label: string | null;
  traffic_source: string | null;
  locale: string | null;
  referrer: string | null;
  user_id: string | null;
  masked_email: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

export type StoredVisitor = {
  visitor_id: string;
  first_seen_at: string;
  last_seen_at: string;
  first_traffic_source: string | null;
  last_traffic_source: string | null;
  first_traffic_kind: string | null;
  locale: string | null;
  country: string | null;
  user_agent_summary: string | null;
  is_bot: boolean;
  bot_name: string | null;
};

function eventPayload(event: SiteEvent): Record<string, unknown> {
  return {
    title: event.title,
    utm_source: event.utm_source,
    utm_medium: event.utm_medium,
    utm_campaign: event.utm_campaign,
    gclid: event.gclid,
    yclid: event.yclid,
    fbclid: event.fbclid,
    ttclid: event.ttclid,
    timestamp: event.timestamp,
  };
}

/** Persists visitor + event; fails silently when Supabase is not configured. */
export async function persistVisitorEvent(
  event: SiteEvent,
  traffic: TrafficClassification,
  opts: { isBot: boolean; botName?: string; country?: string }
): Promise<void> {
  const admin = createSupabaseAdminClient();
  if (!admin) return;

  const now = event.timestamp || new Date().toISOString();
  const uaSummary = summarizeUserAgent(event.userAgent);

  const visitorRow = {
    visitor_id: event.visitorId,
    last_seen_at: now,
    last_traffic_source: traffic.label,
    locale: event.locale ?? null,
    country: opts.country ?? null,
    user_agent_summary: uaSummary,
    is_bot: opts.isBot,
    bot_name: opts.botName ?? null,
  };

  const { data: existing } = await admin
    .from("telegram_visitors")
    .select("visitor_id")
    .eq("visitor_id", event.visitorId)
    .maybeSingle();

  if (existing) {
    await admin.from("telegram_visitors").update(visitorRow).eq("visitor_id", event.visitorId);
  } else {
    await admin.from("telegram_visitors").insert({
      ...visitorRow,
      first_seen_at: now,
      first_traffic_source: traffic.label,
      first_traffic_kind: traffic.kind,
    });
  }

  await admin.from("telegram_visitor_events").insert({
    visitor_id: event.visitorId,
    session_id: event.sessionId,
    event_type: event.eventType,
    path: event.path,
    label: event.label ?? null,
    traffic_source: traffic.label,
    locale: event.locale ?? null,
    referrer: event.referrer ?? null,
    user_id: event.userId ?? null,
    masked_email: event.maskedEmail ?? null,
    payload: eventPayload(event),
  });
}

export async function fetchVisitorTimeline(
  visitorId: string
): Promise<{ visitor: StoredVisitor | null; events: StoredVisitorEvent[] }> {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return { visitor: null, events: [] };
  }

  const { data: visitor } = await admin
    .from("telegram_visitors")
    .select("*")
    .eq("visitor_id", visitorId)
    .maybeSingle();

  const { data: events } = await admin
    .from("telegram_visitor_events")
    .select("*")
    .eq("visitor_id", visitorId)
    .order("created_at", { ascending: true })
    .limit(500);

  return {
    visitor: (visitor as StoredVisitor | null) ?? null,
    events: (events as StoredVisitorEvent[] | null) ?? [],
  };
}

/** In-memory fallback when DB is empty (same server instance only). */
export function timelineFromProfile(profile: VisitorProfile): StoredVisitorEvent[] {
  const paths = profile.lastPaths;
  return paths.map((path, i) => ({
    id: `mem-${i}`,
    visitor_id: profile.visitorId,
    session_id: profile.sessionId,
    event_type: i === 0 ? "page_view" : "page_view",
    path,
    label: null,
    traffic_source: profile.lastTrafficSource,
    locale: profile.locale ?? null,
    referrer: null,
    user_id: null,
    masked_email: null,
    payload: {},
    created_at: new Date(profile.sessionStartedAt + i * 1000).toISOString(),
  }));
}
