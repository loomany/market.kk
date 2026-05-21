import { botPathGroup, detectBot } from "@/lib/telegram/botDetector";
import {
  paidTrafficSourceChanged,
  shouldAllowImmediate,
  shouldAllowSessionSummary,
} from "@/lib/telegram/eventDeduper";
import { classifyTraffic } from "@/lib/telegram/trafficClassifier";
import { getTelegramConfig, isInSilentHours } from "@/lib/telegram/telegramConfig";
import { sendTelegramHtml } from "@/lib/telegram/telegramClient";
import {
  formatBotVisit,
  formatImportantAction,
  formatLoginSuccess,
  formatNewHumanVisit,
  formatPaidTrafficVisit,
  formatSessionSummary,
  formatSignupSuccess,
} from "@/lib/telegram/telegramFormatter";
import type { ProcessSiteEventResult, SiteEvent } from "@/lib/telegram/types";
import {
  getOrCreateVisitorProfile,
  markNotificationSent,
  touchVisitorPageView,
} from "@/lib/telegram/visitorMemory";

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

async function sendAndMark(
  text: string,
  profile: ReturnType<typeof getOrCreateVisitorProfile>,
  notificationKey: string
): Promise<boolean> {
  const config = getTelegramConfig();
  if (!config.enabled || isInSilentHours(config)) {
    return false;
  }
  const result = await sendTelegramHtml(text, config);
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
  const now = Date.parse(event.timestamp) || Date.now();
  const pathGroup = botPathGroup(event.path);

  const derived = mapPathToDerivedEvent(event.path);
  const effectiveType =
    event.eventType === "page_view" && derived ? derived : event.eventType;

  const effectiveEvent: SiteEvent = { ...event, eventType: effectiveType };

  if (bot.isBot) {
    if (bot.tier === "noise" && !config.debug) {
      return { sent: false, suppressed: "noise_bot" };
    }
    if (effectiveType === "page_view" || effectiveType === "first_visit") {
      const decision = shouldAllowImmediate(effectiveEvent, profile, traffic, {
        botName: bot.botName,
        pathGroup,
      });
      if (!decision.allow) {
        return { sent: false, suppressed: decision.reason };
      }
      const sent = await sendAndMark(
        formatBotVisit(effectiveEvent, traffic, bot.botName ?? "Bot"),
        profile,
        decision.notificationKey
      );
      return { sent, notificationType: "bot_visit" };
    }
    return { sent: false, suppressed: "bot_non_page" };
  }

  const alwaysImmediate = new Set<SiteEvent["eventType"]>([
    "signup_start",
    "signup_success",
    "login_success",
    "checkout_click",
    "payment_success",
    "cta_click",
    "lead_action",
    "pricing_view",
    "tokens_view",
    "studio_open",
    "first_visit",
    "return_visit",
  ]);

  if (alwaysImmediate.has(effectiveType)) {
    const decision = shouldAllowImmediate(effectiveEvent, profile, traffic, {
      botName: bot.botName,
      pathGroup,
    });

    let allow = decision.allow;
    if (
      !allow &&
      traffic.isPaid &&
      (effectiveType === "first_visit" || paidTrafficSourceChanged(profile, traffic))
    ) {
      allow = true;
    }

    if (!allow && effectiveType !== "page_view") {
      return { sent: false, suppressed: decision.reason };
    }

    if (allow || traffic.isPaid) {
      let text: string;
      let key = decision.notificationKey;

      switch (effectiveType) {
        case "first_visit":
          text = formatNewHumanVisit(effectiveEvent, traffic, "new");
          break;
        case "return_visit":
          text = formatNewHumanVisit(effectiveEvent, traffic, "returning");
          break;
        case "signup_success":
          text = formatSignupSuccess(effectiveEvent, profile, traffic);
          key = "signup_success";
          break;
        case "login_success":
          text = formatLoginSuccess(effectiveEvent, traffic);
          break;
        case "checkout_click":
          text = formatImportantAction(
            "Переход к оплате",
            "💳",
            effectiveEvent,
            traffic
          );
          break;
        case "payment_success":
          text = formatImportantAction(
            "Оплата принята",
            "✅",
            effectiveEvent,
            traffic,
            "Страница успешного возврата с оплаты"
          );
          key = "payment_success";
          break;
        case "signup_start":
          text = formatImportantAction(
            "Начата регистрация",
            "📝",
            effectiveEvent,
            traffic
          );
          break;
        case "pricing_view":
          text = formatImportantAction("Просмотр тарифов", "💰", effectiveEvent, traffic);
          break;
        case "tokens_view":
          text = formatImportantAction("Просмотр токенов", "🪙", effectiveEvent, traffic);
          break;
        case "studio_open":
          text = formatImportantAction("Открыта студия", "🎨", effectiveEvent, traffic);
          break;
        case "cta_click":
          text = formatImportantAction(
            "Клик по CTA",
            "👆",
            effectiveEvent,
            traffic,
            effectiveEvent.label
          );
          break;
        case "lead_action":
          text = formatImportantAction("Важное действие", "⭐", effectiveEvent, traffic);
          break;
        default:
          if (traffic.isPaid) {
            text = formatPaidTrafficVisit(
              effectiveEvent,
              traffic,
              profile.pageCount <= 1 ? "новый" : `#${effectiveEvent.visitorId.slice(0, 6)}`
            );
            key = `paid_traffic:${effectiveEvent.visitorId}:${traffic.label}`;
          } else {
            return { sent: false, suppressed: decision.reason };
          }
      }

      const sent = await sendAndMark(text, profile, key);
      return { sent, notificationType: effectiveType };
    }
  }

  if (effectiveType === "page_view") {
    touchVisitorPageView(profile, event.path);

    if (derived) {
      const derivedEvent: SiteEvent = { ...event, eventType: derived };
      const derivedDecision = shouldAllowImmediate(derivedEvent, profile, traffic, {
        botName: bot.botName,
        pathGroup,
      });
      if (derivedDecision.allow) {
        const titles: Record<string, { title: string; emoji: string }> = {
          pricing_view: { title: "Просмотр тарифов", emoji: "💰" },
          tokens_view: { title: "Просмотр токенов", emoji: "🪙" },
          studio_open: { title: "Открыта студия", emoji: "🎨" },
        };
        const meta = titles[derived] ?? { title: derived, emoji: "📄" };
        const sent = await sendAndMark(
          formatImportantAction(meta.title, meta.emoji, derivedEvent, traffic),
          profile,
          derivedDecision.notificationKey
        );
        return { sent, notificationType: derived };
      }
    }

    const summaryDecision = shouldAllowSessionSummary(profile, event.sessionId, now);
    const hadFirst =
      profile.lastNotificationAtByType[`first_visit:${event.visitorId}`] ||
      profile.lastNotificationAtByType[`return_visit:${event.visitorId}`] ||
      profile.pageCount > 1;

    if (summaryDecision.allow && hadFirst) {
      const sessionMinutes = (now - profile.sessionStartedAt) / 60_000;
      const text = formatSessionSummary(profile, traffic, sessionMinutes);
      const sent = await sendAndMark(text, profile, summaryDecision.notificationKey);
      return { sent, notificationType: "session_summary" };
    }

    return { sent: false, suppressed: "page_view_only" };
  }

  return { sent: false, suppressed: "unhandled" };
}
