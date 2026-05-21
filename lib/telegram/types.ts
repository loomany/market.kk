export const SITE_EVENT_TYPES = [
  "page_view",
  "first_visit",
  "return_visit",
  "signup_start",
  "signup_success",
  "login_success",
  "pricing_view",
  "tokens_view",
  "studio_open",
  "checkout_click",
  "payment_success",
  "cta_click",
  "lead_action",
] as const;

export type SiteEventType = (typeof SITE_EVENT_TYPES)[number];

export type SiteEvent = {
  eventType: SiteEventType;
  path: string;
  title?: string;
  referrer?: string;
  userAgent?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  yclid?: string;
  fbclid?: string;
  ttclid?: string;
  visitorId: string;
  sessionId: string;
  locale?: string;
  timestamp: string;
  label?: string;
  userId?: string;
  maskedEmail?: string;
};

export type TrafficSourceKind =
  | "google_ads"
  | "yandex_direct"
  | "meta_ads"
  | "tiktok_ads"
  | "google_organic"
  | "yandex_organic"
  | "bing_organic"
  | "organic"
  | "referral"
  | "direct"
  | "internal";

export type TrafficClassification = {
  kind: TrafficSourceKind;
  label: string;
  isPaid: boolean;
  campaign?: string;
  medium?: string;
  referralHost?: string;
};

export type BotTier = "important" | "noise";

export type BotDetection = {
  isBot: boolean;
  botName?: string;
  tier?: BotTier;
};

export type VisitorProfile = {
  visitorId: string;
  firstSeenAt: number;
  lastSeenAt: number;
  firstTrafficSource: string;
  lastTrafficSource: string;
  firstTrafficKind: TrafficSourceKind;
  lastTrafficKind: TrafficSourceKind;
  isBot: boolean;
  botName?: string;
  pageCount: number;
  importantPaths: string[];
  lastPaths: string[];
  lastNotificationAtByType: Record<string, number>;
  sessionId: string;
  sessionStartedAt: number;
  locale?: string;
  country?: string;
};

export type ProcessSiteEventResult = {
  sent: boolean;
  suppressed?: string;
  notificationType?: string;
};

export type NotificationDecision =
  | { action: "send"; notificationType: string }
  | { action: "suppress"; reason: string }
  | { action: "summary"; notificationType: "session_summary" };
