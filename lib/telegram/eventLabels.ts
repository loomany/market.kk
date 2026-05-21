import type { SiteEventType } from "@/lib/telegram/types";

const LABELS: Record<SiteEventType, string> = {
  page_view: "Просмотр страницы",
  first_visit: "Первый визит",
  return_visit: "Повторный визит",
  signup_start: "Начата регистрация",
  signup_success: "Регистрация завершена",
  login_success: "Вход в аккаунт",
  pricing_view: "Тарифы",
  tokens_view: "Токены",
  studio_open: "Студия",
  checkout_click: "Переход к оплате",
  payment_success: "Оплата",
  cta_click: "Клик по CTA",
  lead_action: "Действие",
};

export function humanEventLabel(
  eventType: string,
  label?: string | null
): string {
  const base = LABELS[eventType as SiteEventType] ?? eventType;
  if (eventType === "cta_click" && label) {
    return `${base}: ${label}`;
  }
  if (label && eventType !== "cta_click") {
    return `${base} (${label})`;
  }
  return base;
}
