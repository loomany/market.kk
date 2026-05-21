import { botPathGroup, detectBot } from "@/lib/telegram/botDetector";
import {
  shouldAllowImmediate,
  wasSessionEntryNotified,
} from "@/lib/telegram/eventDeduper";
import { classifyTraffic } from "@/lib/telegram/trafficClassifier";
import { getTelegramConfig, isInSilentHours } from "@/lib/telegram/telegramConfig";
import { sendTelegramHtml } from "@/lib/telegram/telegramClient";
import {
  formatImportantAction,
  formatSessionEntryAlert,
  formatSignupSuccess,
} from "@/lib/telegram/telegramFormatter";
import type { ProcessSiteEventResult, SiteEvent } from "@/lib/telegram/types";
import { buildVisitorAdminUrl } from "@/lib/telegram/visitorAdminUrl";
import {
  getOrCreateVisitorProfile,
  markNotificationSent,
  touchVisitorPageView,
} from "@/lib/telegram/visitorMemory";
import { persistVisitorEvent } from "@/lib/telegram/visitorStore";

function siteHostFromEnv(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function mapPathToDerivedEvent(path: string): SiteEvent["eventType"] | null {
  const p = path.toLowerCase().split("?")[0] ?? path;
  if (p.includes("/tokens")) return "tokens_view";
  if (p.includes("/cost") || p.includes("/pricing")) return "pricing_view";
  if (p === "/studio" || p.endsWith("/studio")) return "studio_open";
  return null;
}

function parseNotifyConversions(): boolean {
  const v = process.env.TELEGRAM_NOTIFY_CONVERSIONS?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

async function sendAndMark(
  text: string,
  profile: ReturnType<typeof getOrCreateVisitorProfile>,
  notificationKey: string,
  inlineButtons?: { text: string; url: string }[]
): Promise<boolean> {
  const config = getTelegramConfig();
  if (!config.enabled || isInSilentHours(config)) {
    return false;
  }
  const result = await sendTelegramHtml(text, config, { inlineButtons });
  if (result.ok) {
    markNotificationSent(profile, notificationKey);
    return true;
  }
  return false;
}

export async function processSiteEvent(
  event: SiteEvent,
  opts?: { country?: string }
): Promise<ProcessSiteEventResult> {
  const config = getTelegramConfig();
  if (!config.enabled) {
    return { sent: false, suppressed: "disabled" };
  }

  const bot = detectBot(event.userAgent);
  const traffic = classifyTraffic(event, siteHostFromEnv());
  const profile = getOrCreateVisitorProfile(event, traffic, bot, opts?.country);
  const pathGroup = botPathGroup(event.path);

  const derived = mapPathToDerivedEvent(event.path);
  const effectiveType =
    event.eventType === "page_view" && derived ? derived : event.eventType;

  const effectiveEvent: SiteEvent = { ...event, eventType: effectiveType };

  if (!bot.isBot && effectiveType !== "page_view") {
    await persistVisitorEvent(effectiveEvent, traffic, {
      isBot: false,
      country: opts?.country,
    });
  } else if (config.debug && bot.isBot && effectiveType !== "page_view") {
    await persistVisitorEvent(effectiveEvent, traffic, {
      isBot: true,
      botName: bot.botName,
      country: opts?.country,
    });
  }

  if (bot.isBot) {
    if (bot.tier === "noise" && !config.debug) {
      return { sent: false, suppressed: "noise_bot" };
    }
    return { sent: false, suppressed: "bot_logged_only" };
  }

  if (effectiveType === "page_view") {
    touchVisitorPageView(profile, event.path);
    const toStore = derived
      ? { ...effectiveEvent, eventType: derived }
      : effectiveEvent;
    await persistVisitorEvent(toStore, traffic, {
      isBot: false,
      country: opts?.country,
    });
    return { sent: false, suppressed: "logged_only" };
  }

  const sessionEntryTypes = new Set<SiteEvent["eventType"]>([
    "first_visit",
    "return_visit",
  ]);

  if (sessionEntryTypes.has(effectiveType)) {
    const now = Date.parse(event.timestamp) || Date.now();
    const sessionKey = `session_entry:${event.sessionId}`;
    if (wasSessionEntryNotified(profile, event.sessionId, now)) {
      return { sent: false, suppressed: "session_entry_deduped" };
    }

    const visitorType =
      effectiveType === "return_visit" ? "returning" : "new";
    const text = formatSessionEntryAlert(effectiveEvent, traffic, visitorType);
    const adminUrl = buildVisitorAdminUrl(event.visitorId);
    const buttons = adminUrl
      ? [{ text: "Открыть пользователя", url: adminUrl }]
      : undefined;

    const sent = await sendAndMark(text, profile, sessionKey, buttons);
    return { sent, notificationType: "session_entry" };
  }

  if (
    parseNotifyConversions() &&
    (effectiveType === "signup_success" || effectiveType === "payment_success")
  ) {
    const decision = shouldAllowImmediate(effectiveEvent, profile, traffic, {
      botName: bot.botName,
      pathGroup,
    });
    if (decision.allow) {
      const text =
        effectiveType === "signup_success"
          ? formatSignupSuccess(effectiveEvent, profile, traffic)
          : formatImportantAction(
              "Оплата принята",
              "✅",
              effectiveEvent,
              traffic,
              "Страница успешного возврата с оплаты"
            );
      const adminUrl = buildVisitorAdminUrl(event.visitorId);
      const sent = await sendAndMark(
        text,
        profile,
        decision.notificationKey,
        adminUrl ? [{ text: "Открыть пользователя", url: adminUrl }] : undefined
      );
      return { sent, notificationType: effectiveType };
    }
  }

  return { sent: false, suppressed: "logged_only" };
}
