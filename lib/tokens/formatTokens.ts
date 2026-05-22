import type { IndexableLocale } from "@/lib/i18n/localeConfig";

export function formatTokenBalanceDisplay(count: number, locale: IndexableLocale): string {
  const n = Math.max(0, count);
  const isWhole = Math.abs(n - Math.round(n)) < 0.005;
  if (isWhole) {
    const whole = Math.round(n);
    if (locale === "ru") return `${whole} ${ruTokenWord(whole)}`;
    if (locale === "kk") return `${whole} ${kkTokenWord(whole)}`;
    return `${whole} ${enTokenWord(whole)}`;
  }
  return formatExactTokenAmount(n, locale);
}

/** Numeric part for «К списанию 1.69» — always dot as decimal separator. */
export function formatTokenChargeNumber(tokenCount: number): string {
  const n = Math.max(0, tokenCount);
  if (n <= 0) return "0";
  const isWhole = Math.abs(n - Math.round(n)) < 0.005;
  if (isWhole) return String(Math.round(n));
  return (Math.round(n * 100) / 100).toFixed(2).replace(/\.?0+$/, "");
}

/** Exact token amount for cost hints (fractional when 1 token = $1). */
export function formatExactTokenAmount(
  tokenCount: number,
  locale: IndexableLocale
): string {
  const n = Math.max(0, tokenCount);
  if (n <= 0) {
    return formatTokenBalanceDisplay(0, locale);
  }

  const isWhole = Math.abs(n - Math.round(n)) < 0.005;
  const numStr = isWhole
    ? String(Math.round(n))
    : formatTokenDecimal(n, locale);

  if (locale === "ru") {
    return `${numStr} ${ruTokenWordForAmount(n)}`;
  }
  if (locale === "kk") {
    return `${numStr} ${kkTokenWord(Math.round(n))}`;
  }
  return `${numStr} ${enTokenWord(isWhole ? Math.round(n) : 2)}`;
}

function formatTokenDecimal(n: number, locale: IndexableLocale): string {
  const rounded = Math.round(n * 100) / 100;
  let s = rounded.toFixed(2).replace(/\.?0+$/, "");
  if (locale === "ru" || locale === "kk") {
    s = s.replace(".", ",");
  }
  return s;
}

function ruTokenWordForAmount(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  if (rounded === 0) return "токенов";
  if (Math.abs(rounded - 1) < 0.005) return "токен";
  const whole = Math.floor(rounded);
  const hasFraction = Math.abs(rounded - whole) >= 0.01;
  if (hasFraction) return "токена";
  return ruTokenWord(whole);
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
