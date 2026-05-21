import "server-only";

export type TokenTopupPackage = {
  tokens: number;
  amountCents: number;
  currency: "USD";
};

export const TOKEN_TOPUP_PACKAGE: TokenTopupPackage = {
  tokens: 10,
  amountCents: 1000,
  currency: "USD",
};

export function tokenUsdRate(): number {
  const raw = process.env.NEXT_PUBLIC_TOKEN_USD_RATE ?? "1";
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

export function minTokenTopup(): number {
  const raw = process.env.NEXT_PUBLIC_MIN_TOKEN_TOPUP ?? "10";
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : 10;
}

export function guestFreeGenerationLimit(): number {
  const raw = process.env.GUEST_FREE_GENERATION_LIMIT ?? "0";
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

export function welcomeTokensForNewUser(): number {
  const raw = process.env.NEW_USER_WELCOME_TOKENS ?? "2";
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 2;
}

export function lemonApiKey(): string | null {
  return (
    process.env.LEMON_SQUEEZY_API_KEY?.trim() ||
    process.env.LEMON_API_KEY?.trim() ||
    null
  );
}

export function lemonStoreId(): string | null {
  return (
    process.env.LEMON_SQUEEZY_STORE_ID?.trim() ||
    process.env.LEMON_STORE_ID?.trim() ||
    null
  );
}

export function lemonWebhookSecret(): string | null {
  return (
    process.env.LEMON_SQUEEZY_WEBHOOK_SECRET?.trim() ||
    process.env.LEMON_WEBHOOK_SECRET?.trim() ||
    null
  );
}

/** One-time token top-up variant (not subscription monthly variant). */
export function lemonTokensVariantId(): string | null {
  return (
    process.env.LEMON_TOKENS_VARIANT_ID?.trim() ||
    process.env.LEMON_SQUEEZY_VARIANT_ID_TOKENS?.trim() ||
    null
  );
}

export function lemonTokensProductId(): string | null {
  return (
    process.env.LEMON_TOKENS_PRODUCT_ID?.trim() ||
    process.env.LEMON_SQUEEZY_PRODUCT_ID_TOKENS?.trim() ||
    null
  );
}

/** Subscription variant — existing Lemon flow; do not use for token checkout. */
export function lemonSubscriptionVariantId(): string | null {
  return process.env.LEMON_SQUEEZY_VARIANT_ID_MONTHLY?.trim() || null;
}

export function assertTokensCheckoutConfigured(): { ok: true } | { ok: false; message: string } {
  if (!lemonApiKey()) {
    return { ok: false, message: "LEMON_SQUEEZY_API_KEY не настроен." };
  }
  if (!lemonStoreId()) {
    return { ok: false, message: "LEMON_SQUEEZY_STORE_ID не настроен." };
  }
  const variantId = lemonTokensVariantId();
  if (!variantId) {
    return {
      ok: false,
      message:
        "LEMON_TOKENS_VARIANT_ID (или LEMON_SQUEEZY_VARIANT_ID_TOKENS) не настроен. Добавьте variant для пакета 10 токенов в Lemon Squeezy.",
    };
  }
  return { ok: true };
}

export function isValidUserUuid(userId: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    userId
  );
}
