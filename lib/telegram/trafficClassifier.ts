import type { SiteEvent, TrafficClassification, TrafficSourceKind } from "@/lib/telegram/types";

const PAID_MEDIUMS = new Set([
  "cpc",
  "paid",
  "ppc",
  "paid_search",
  "paid-social",
  "paidsocial",
  "display",
  "cpm",
]);

function norm(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function isPaidMedium(medium: string): boolean {
  return PAID_MEDIUMS.has(medium) || medium.includes("paid");
}

function hostFromReferrer(referrer: string | undefined): string | null {
  if (!referrer?.trim()) return null;
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function isSearchHost(host: string): boolean {
  return (
    host.includes("google.") ||
    host.includes("yandex.") ||
    host.includes("bing.") ||
    host.includes("duckduckgo.") ||
    host.includes("yahoo.") ||
    host.includes("baidu.")
  );
}

function classifyGoogleAds(event: SiteEvent): boolean {
  if (event.gclid) return true;
  const source = norm(event.utm_source);
  const medium = norm(event.utm_medium);
  return source === "google" && isPaidMedium(medium);
}

function classifyYandexDirect(event: SiteEvent): boolean {
  if (event.yclid) return true;
  const source = norm(event.utm_source);
  const medium = norm(event.utm_medium);
  return (
    (source === "yandex" || source === "ya" || source === "yandex_direct") &&
    isPaidMedium(medium)
  );
}

function classifyMetaAds(event: SiteEvent): boolean {
  if (event.fbclid) return true;
  const source = norm(event.utm_source);
  const medium = norm(event.utm_medium);
  return (
    (source === "facebook" ||
      source === "instagram" ||
      source === "meta" ||
      source === "fb" ||
      source === "ig") &&
    isPaidMedium(medium)
  );
}

function classifyTikTokAds(event: SiteEvent): boolean {
  if (event.ttclid) return true;
  const source = norm(event.utm_source);
  const medium = norm(event.utm_medium);
  return source === "tiktok" && isPaidMedium(medium);
}

function labelForKind(
  kind: TrafficSourceKind,
  opts: { campaign?: string; medium?: string; referralHost?: string }
): { label: string; isPaid: boolean } {
  switch (kind) {
    case "google_ads":
      return { label: "Google Ads 🎯", isPaid: true };
    case "yandex_direct":
      return { label: "Yandex Direct 🎯", isPaid: true };
    case "meta_ads":
      return { label: "Meta Ads 🎯", isPaid: true };
    case "tiktok_ads":
      return { label: "TikTok Ads 🎯", isPaid: true };
    case "google_organic":
      return { label: "Google Organic", isPaid: false };
    case "yandex_organic":
      return { label: "Yandex Organic", isPaid: false };
    case "bing_organic":
      return { label: "Bing Organic", isPaid: false };
    case "organic":
      return { label: "Organic search", isPaid: false };
    case "referral":
      return {
        label: opts.referralHost ? `Referral: ${opts.referralHost}` : "Referral",
        isPaid: false,
      };
    case "internal":
      return { label: "Internal", isPaid: false };
    case "direct":
    default:
      return { label: "Direct / unknown", isPaid: false };
  }
}

export function classifyTraffic(
  event: SiteEvent,
  siteHost?: string
): TrafficClassification {
  const campaign = event.utm_campaign?.trim() || undefined;
  const medium = event.utm_medium?.trim() || undefined;
  const referralHost = hostFromReferrer(event.referrer);

  let kind: TrafficSourceKind = "direct";

  if (classifyGoogleAds(event)) kind = "google_ads";
  else if (classifyYandexDirect(event)) kind = "yandex_direct";
  else if (classifyMetaAds(event)) kind = "meta_ads";
  else if (classifyTikTokAds(event)) kind = "tiktok_ads";
  else if (referralHost) {
    if (siteHost && (referralHost === siteHost || referralHost.endsWith(`.${siteHost}`))) {
      kind = "internal";
    } else if (referralHost.includes("google.")) kind = "google_organic";
    else if (referralHost.includes("yandex.")) kind = "yandex_organic";
    else if (referralHost.includes("bing.")) kind = "bing_organic";
    else if (isSearchHost(referralHost)) kind = "organic";
    else kind = "referral";
  } else if (
    !event.referrer?.trim() &&
    !event.utm_source &&
    !event.gclid &&
    !event.yclid &&
    !event.fbclid &&
    !event.ttclid
  ) {
    kind = "direct";
  }

  const { label, isPaid } = labelForKind(kind, {
    campaign,
    medium,
    referralHost: referralHost ?? undefined,
  });

  return {
    kind,
    label,
    isPaid,
    campaign,
    medium,
    referralHost: referralHost ?? undefined,
  };
}
