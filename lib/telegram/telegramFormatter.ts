import type { SiteEvent, TrafficClassification, VisitorProfile } from "@/lib/telegram/types";
import { summarizeUserAgent } from "@/lib/telegram/uaSummary";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return "***";
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const maskedLocal = local.length <= 1 ? "*" : `${local[0]}***`;
  return `${maskedLocal}@${domain}`;
}

export function maskIp(ip: string): string {
  const parts = ip.split(".").filter(Boolean);
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }
  return "xxx.xxx.xxx.xxx";
}

function shortId(id: string): string {
  if (id.length <= 8) return id;
  return id.slice(0, 6);
}

function formatUtm(event: SiteEvent): string {
  const parts = [
    event.utm_source,
    event.utm_medium,
    event.utm_campaign,
  ].filter(Boolean);
  return parts.length ? parts.join(" / ") : "—";
}

function referrerShort(referrer: string | undefined): string {
  if (!referrer?.trim()) return "—";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer.slice(0, 40);
  }
}

function localeLabel(locale: string | undefined): string {
  if (!locale) return "—";
  return locale.toUpperCase();
}

export function formatNewHumanVisit(
  event: SiteEvent,
  traffic: TrafficClassification,
  visitorType: "new" | "returning"
): string {
  const device = summarizeUserAgent(event.userAgent);
  const title = visitorType === "new" ? "Новый визит на Vitrina" : "Повторный визит на Vitrina";
  const emoji = visitorType === "new" ? "👤" : "🔄";

  return [
    `${emoji} <b>${escapeHtml(title)}</b>`,
    "",
    `Тип: человек`,
    `Источник: ${escapeHtml(traffic.label)}`,
    `Язык: ${escapeHtml(localeLabel(event.locale))}`,
    `Страница: ${escapeHtml(event.path)}`,
    `Referrer: ${escapeHtml(referrerShort(event.referrer))}`,
    `UTM: ${escapeHtml(formatUtm(event))}`,
    `Устройство: ${escapeHtml(device)}`,
    `Visitor: #${escapeHtml(shortId(event.visitorId))}`,
    `Session: #${escapeHtml(shortId(event.sessionId))}`,
  ].join("\n");
}

export function formatPaidTrafficVisit(
  event: SiteEvent,
  traffic: TrafficClassification,
  visitorLabel: string
): string {
  return [
    "🎯 <b>Визит с рекламы</b>",
    "",
    `Источник: ${escapeHtml(traffic.label)}`,
    traffic.campaign ? `Campaign: ${escapeHtml(traffic.campaign)}` : null,
    traffic.medium ? `Medium: ${escapeHtml(traffic.medium)}` : null,
    `Страница: ${escapeHtml(event.path)}`,
    `Язык: ${escapeHtml(localeLabel(event.locale))}`,
    `Visitor: ${escapeHtml(visitorLabel)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatBotVisit(
  event: SiteEvent,
  traffic: TrafficClassification,
  botName: string
): string {
  return [
    "🤖 <b>Визит бота</b>",
    "",
    `Бот: ${escapeHtml(botName)}`,
    `Источник: ${escapeHtml(traffic.label)}`,
    `Страница: ${escapeHtml(event.path)}`,
    `Visitor: #${escapeHtml(shortId(event.visitorId))}`,
  ].join("\n");
}

export function formatSessionSummary(
  profile: VisitorProfile,
  traffic: TrafficClassification,
  sessionMinutes: number
): string {
  const visitorType =
    Date.now() - profile.firstSeenAt > 24 * 60 * 60 * 1000
      ? "returning visitor"
      : profile.pageCount > 1 && profile.firstSeenAt < profile.sessionStartedAt
        ? "returning visitor"
        : "new visitor";

  const important =
    profile.importantPaths.length > 0
      ? profile.importantPaths.map((p) => escapeHtml(p)).join(", ")
      : "—";
  const firstPath = profile.lastPaths[0] ?? "—";
  const lastPath = profile.lastPaths[profile.lastPaths.length - 1] ?? "—";

  return [
    "👀 <b>Активная сессия</b>",
    "",
    `Пользователь: ${escapeHtml(visitorType)}`,
    `Источник: ${escapeHtml(traffic.label)}`,
    `Язык: ${escapeHtml(localeLabel(profile.locale))}`,
    profile.country ? `Страна: ${escapeHtml(profile.country)}` : null,
    `Страниц: ${profile.pageCount}`,
    `Важные страницы: ${important}`,
    `Первая: ${escapeHtml(firstPath)}`,
    `Последняя: ${escapeHtml(lastPath)}`,
    `Время: ${Math.max(1, Math.round(sessionMinutes))} мин`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatSignupSuccess(
  event: SiteEvent,
  profile: VisitorProfile,
  traffic: TrafficClassification
): string {
  const paths = profile.lastPaths
    .slice(-5)
    .map((p, i) => `${i + 1}. ${escapeHtml(p)}`)
    .join("\n");
  const userLine = event.maskedEmail
    ? escapeHtml(event.maskedEmail)
    : event.userId
      ? `#${escapeHtml(shortId(event.userId))}`
      : "—";

  return [
    "✅ <b>Регистрация</b>",
    "",
    `Источник первого визита: ${escapeHtml(profile.firstTrafficSource)}`,
    `Текущий источник: ${escapeHtml(traffic.label)}`,
    `Язык: ${escapeHtml(localeLabel(event.locale))}`,
    `User: ${userLine}`,
    `Visitor: #${escapeHtml(shortId(event.visitorId))}`,
    profile.lastPaths.length ? "До регистрации смотрел:" : null,
    paths || null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatLoginSuccess(
  event: SiteEvent,
  traffic: TrafficClassification
): string {
  const userLine = event.userId ? `#${escapeHtml(shortId(event.userId))}` : "—";
  return [
    "🔑 <b>Вход в аккаунт</b>",
    "",
    `Источник: ${escapeHtml(traffic.label)}`,
    `Язык: ${escapeHtml(localeLabel(event.locale))}`,
    `User: ${userLine}`,
    `Страница: ${escapeHtml(event.path)}`,
    `Visitor: #${escapeHtml(shortId(event.visitorId))}`,
  ].join("\n");
}

export function formatImportantAction(
  title: string,
  emoji: string,
  event: SiteEvent,
  traffic: TrafficClassification,
  extra?: string
): string {
  return [
    `${emoji} <b>${escapeHtml(title)}</b>`,
    extra ? escapeHtml(extra) : null,
    "",
    `Источник: ${escapeHtml(traffic.label)}`,
    `Страница: ${escapeHtml(event.path)}`,
    event.label ? `Метка: ${escapeHtml(event.label)}` : null,
    `Язык: ${escapeHtml(localeLabel(event.locale))}`,
    `Visitor: #${escapeHtml(shortId(event.visitorId))}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Single Telegram alert when a human enters the site (per session). */
export function formatSessionEntryAlert(
  event: SiteEvent,
  traffic: TrafficClassification,
  visitorType: "new" | "returning"
): string {
  const device = summarizeUserAgent(event.userAgent);
  const title =
    visitorType === "new" ? "Новый визит на Vitrina" : "Повторный визит на Vitrina";
  const emoji = visitorType === "new" ? "👤" : "🔄";

  return [
    `${emoji} <b>${escapeHtml(title)}</b>`,
    "",
    "Дальнейшие шаги — в карточке пользователя (кнопка ниже).",
    "",
    `Источник: ${escapeHtml(traffic.label)}`,
    `Язык: ${escapeHtml(localeLabel(event.locale))}`,
    `Страница входа: ${escapeHtml(event.path)}`,
    `Referrer: ${escapeHtml(referrerShort(event.referrer))}`,
    `UTM: ${escapeHtml(formatUtm(event))}`,
    `Устройство: ${escapeHtml(device)}`,
    `Visitor: #${escapeHtml(shortId(event.visitorId))}`,
    `Session: #${escapeHtml(shortId(event.sessionId))}`,
  ].join("\n");
}

export function formatTestMessage(siteUrl: string, envLabel: string): string {
  const time = new Date().toISOString();
  return [
    "✅ <b>Telegram notifications connected</b>",
    `Site: ${escapeHtml(siteUrl)}`,
    `Env: ${escapeHtml(envLabel)}`,
    `Time: ${escapeHtml(time)}`,
  ].join("\n");
}
