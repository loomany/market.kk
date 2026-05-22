import type { IndexableLocale } from "@/lib/i18n/localeConfig";
import type { TokenBillingErrorPayload } from "@/lib/tokens/billingErrorPayload";
import { formatStudioString } from "@/lib/studio/i18n";
import {
  formatExactTokenAmount,
  formatTokenChargeNumber,
} from "@/lib/tokens/formatTokens";

export type TokenPreflightCopy = {
  insufficientTitle: string;
  insufficientBody: string;
  topUpBalance: string;
};

type BalanceResponse = {
  ok?: boolean;
  balanceTokens?: number;
};

/** Returns balance for signed-in users; `null` if guest / not signed in. */
export async function fetchUserTokenBalance(
  locale: IndexableLocale
): Promise<number | null> {
  const me = await fetch("/api/auth/me").then(
    (r) => r.json() as Promise<{ user: unknown }>
  );
  if (!me.user) return null;

  const balance = await fetch("/api/tokens/balance", {
    headers: { "x-vitrina-locale": locale },
  }).then((r) => r.json() as Promise<BalanceResponse>);

  if (balance.ok && typeof balance.balanceTokens === "number") {
    return balance.balanceTokens;
  }
  return 0;
}

export function buildInsufficientTokensPayload(
  balance: number,
  requiredTokens: number,
  locale: IndexableLocale,
  copy: TokenPreflightCopy
): TokenBillingErrorPayload {
  const requiredLabel = formatExactTokenAmount(requiredTokens, locale);
  return {
    errorCode: "INSUFFICIENT_TOKENS",
    title: copy.insufficientTitle,
    message: formatStudioString(copy.insufficientBody, { required: requiredLabel }),
    balanceTokens: balance,
    requiredTokens,
    cta: { label: copy.topUpBalance, href: `/${locale}/tokens` },
  };
}

/**
 * Client-side balance gate before starting loading UI.
 * Skips in mock mode and when cost is 0 (guest flows use server guest limits).
 */
export async function preflightTokenGeneration(params: {
  requiredTokens: number;
  locale: IndexableLocale;
  mockMode: boolean;
  copy: TokenPreflightCopy;
}): Promise<TokenBillingErrorPayload | null> {
  if (params.mockMode) return null;

  const required = params.requiredTokens;
  if (!Number.isFinite(required) || required <= 0) return null;

  const balance = await fetchUserTokenBalance(params.locale);
  if (balance === null) return null;

  if (balance + 1e-6 < required) {
    return buildInsufficientTokensPayload(balance, required, params.locale, params.copy);
  }

  return null;
}

/** For logging / debug — numeric charge without locale word forms. */
export function formatRequiredTokensShort(requiredTokens: number): string {
  return formatTokenChargeNumber(requiredTokens);
}
