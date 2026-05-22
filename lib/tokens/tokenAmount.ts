/** 1 display token = $1 by default (TOKEN_USD_RATE / NEXT_PUBLIC_TOKEN_USD_RATE). */

export function tokenUsdRate(): number {
  const raw =
    process.env.TOKEN_USD_RATE ??
    process.env.NEXT_PUBLIC_TOKEN_USD_RATE ??
    "1";
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

export function usdToTokenAmount(usd: number): number {
  if (!Number.isFinite(usd) || usd <= 0) return 0;
  return Number((usd / tokenUsdRate()).toFixed(4));
}

/** Normalize for ledger compare/spend (4 decimal places). */
export function normalizeTokenAmount(tokens: number): number {
  if (!Number.isFinite(tokens) || tokens <= 0) return 0;
  return Number(tokens.toFixed(4));
}
