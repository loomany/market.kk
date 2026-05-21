import type { IndexableLocale } from "@/lib/i18n/localeConfig";
import { formatTokenBalanceDisplay } from "@/lib/tokens/formatTokens";

export function formatTokenChargeHint(
  tokenCount: number,
  locale: IndexableLocale
): string {
  const amount = formatTokenBalanceDisplay(tokenCount, locale);
  if (locale === "en") return `Charges ${amount}`;
  if (locale === "kk") return `${amount} есептен`;
  return `К списанию ${amount}`;
}
