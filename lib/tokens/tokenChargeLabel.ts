import type { IndexableLocale } from "@/lib/i18n/localeConfig";
import {
  formatExactTokenAmount,
  formatTokenBalanceDisplay,
  formatTokenChargeNumber,
} from "@/lib/tokens/formatTokens";

export function formatTokenChargeHint(
  tokenCount: number,
  locale: IndexableLocale
): string {
  const amount = formatTokenBalanceDisplay(tokenCount, locale);
  if (locale === "en") return `Charges ${amount}`;
  if (locale === "kk") return `${amount} есептен`;
  return `К списанию ${amount}`;
}

export function formatTokenChargeRangeHint(
  minTokens: number,
  maxTokens: number,
  locale: IndexableLocale
): string {
  if (Math.abs(minTokens - maxTokens) < 0.005) {
    return formatTokenChargeHint(maxTokens, locale);
  }
  const from = formatTokenChargeNumber(minTokens);
  const to = formatTokenChargeNumber(maxTokens);
  if (locale === "en") return `Charges ${from}–${to}`;
  if (locale === "kk") return `${from}–${to} есептен`;
  return `К списанию от ${from} до ${to}`;
}

/** Total pipeline cost for SaaS CTA (includes conditional provider steps). */
export function tokenChargePrefix(locale: IndexableLocale): string {
  if (locale === "en") return "Charge";
  if (locale === "kk") return "Есептен";
  return "К списанию";
}

export function formatTotalChargeHint(
  tokenCount: number,
  locale: IndexableLocale
): string {
  return `${tokenChargePrefix(locale)} ${formatTokenChargeNumber(tokenCount)}`;
}
