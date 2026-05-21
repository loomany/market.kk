import type { IndexableLocale } from "@/lib/i18n/localeConfig";

export function formatTokenBalanceDisplay(count: number, locale: IndexableLocale): string {
  const n = Math.max(0, Math.floor(count));
  if (locale === "ru") {
    return `${n} ${ruTokenWord(n)}`;
  }
  if (locale === "kk") {
    return `${n} ${kkTokenWord(n)}`;
  }
  return `${n} ${enTokenWord(n)}`;
}

function ruTokenWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return "токенов";
  if (mod10 === 1) return "токен";
  if (mod10 >= 2 && mod10 <= 4) return "токена";
  return "токенов";
}

function enTokenWord(n: number): string {
  return n === 1 ? "token" : "tokens";
}

function kkTokenWord(n: number): string {
  return "токен";
}

export function tokenNavLabel(locale: IndexableLocale): string {
  if (locale === "ru") return "Токены";
  if (locale === "kk") return "Токендер";
  return "Tokens";
}

export function topUpLabel(locale: IndexableLocale): string {
  if (locale === "ru") return "Пополнить";
  if (locale === "kk") return "Толтыру";
  return "Top up";
}
