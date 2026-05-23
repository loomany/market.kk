import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isValidUserUuid, welcomeTokensForNewUser } from "@/lib/tokens/config";
import {
  resolveGenerationCost,
  type GenerationOperationType,
} from "@/lib/tokens/generationCostConfig";
import { normalizeTokenAmount } from "@/lib/tokens/tokenAmount";

export type { GenerationOperationType };

export function getGenerationCost(
  operationType: GenerationOperationType = "default"
): number {
  const fromEnv = process.env.TOKEN_DEFAULT_GENERATION_COST;
  const parsed = fromEnv ? Number(fromEnv) : NaN;
  const defaultOverride =
    Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
  return resolveGenerationCost(operationType, defaultOverride);
}

export async function getUserTokenBalance(userId: string): Promise<number> {
  if (!isValidUserUuid(userId)) return 0;
  const admin = createSupabaseAdminClient();
  if (!admin) return 0;

  const { data, error } = await admin
    .from("user_token_balances")
    .select("balance_tokens")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[tokenLedger] getUserTokenBalance:", error.message);
    return 0;
  }

  return data?.balance_tokens ?? 0;
}

export type CreditPurchasedTokensParams = {
  userId: string;
  tokens: number;
  amountCents: number;
  currency: string;
  provider?: string;
  providerOrderId?: string | null;
  providerCheckoutId?: string | null;
  providerEventId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function creditPurchasedTokens(
  params: CreditPurchasedTokensParams
): Promise<{ credited: boolean; balanceAfter: number }> {
  if (!isValidUserUuid(params.userId)) {
    throw new Error("Invalid user id for token credit");
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin client is not configured");
  }

  const tokenAmount = normalizeTokenAmount(params.tokens);
  const { data, error } = await admin.rpc("credit_purchased_tokens", {
    p_user_id: params.userId,
    p_tokens: tokenAmount.toFixed(4),
    p_amount_cents: params.amountCents,
    p_currency: params.currency,
    p_provider: params.provider ?? "lemon_squeezy",
    p_provider_order_id: params.providerOrderId ?? null,
    p_provider_checkout_id: params.providerCheckoutId ?? null,
    p_provider_event_id: params.providerEventId ?? null,
    p_metadata: params.metadata ?? {},
  });

  if (error) {
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    credited: Boolean(row?.credited),
    balanceAfter: Number(row?.balance_after ?? 0),
  };
}

/** One-time welcome grant after WhatsApp signup (idempotent per user). */
export async function creditWelcomeTokens(
  userId: string
): Promise<{ credited: boolean; balanceAfter: number }> {
  const tokens = welcomeTokensForNewUser();
  if (tokens <= 0) {
    return { credited: false, balanceAfter: await getUserTokenBalance(userId) };
  }

  try {
    return await creditPurchasedTokens({
      userId,
      tokens,
      amountCents: 0,
      currency: "USD",
      provider: "vitrina_signup",
      providerEventId: `welcome_bonus:${userId}`,
      metadata: { reason: "new_user_welcome" },
    });
  } catch (err) {
    console.error(
      "[tokenLedger] creditWelcomeTokens:",
      err instanceof Error ? err.message : err
    );
    return { credited: false, balanceAfter: await getUserTokenBalance(userId) };
  }
}

export type SpendUserTokensParams = {
  userId: string;
  tokens: number;
  type?: "spend" | "guest_free";
  metadata?: Record<string, unknown>;
};

export async function spendUserTokens(
  params: SpendUserTokensParams
): Promise<{ spent: boolean; balanceAfter: number }> {
  if (!isValidUserUuid(params.userId)) {
    return { spent: false, balanceAfter: 0 };
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin client is not configured");
  }

  const tokenAmount = normalizeTokenAmount(params.tokens);
  if (tokenAmount <= 0) {
    return { spent: false, balanceAfter: await getUserTokenBalance(params.userId) };
  }

  // Decimal string disambiguates numeric vs legacy integer overloads in Postgres.
  const { data, error } = await admin.rpc("spend_user_tokens", {
    p_user_id: params.userId,
    p_tokens: tokenAmount.toFixed(4),
    p_type: params.type ?? "spend",
    p_metadata: params.metadata ?? {},
  });

  if (error) {
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    spent: Boolean(row?.spent),
    balanceAfter: Number(row?.balance_after ?? 0),
  };
}

export type TokenTransactionRow = {
  id: string;
  type: string;
  tokens: number;
  balance_after: number | null;
  created_at: string;
};

export async function getRecentTokenTransactions(
  userId: string,
  limit = 5
): Promise<TokenTransactionRow[]> {
  if (!isValidUserUuid(userId)) return [];
  const admin = createSupabaseAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("token_transactions")
    .select("id, type, tokens, balance_after, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[tokenLedger] getRecentTokenTransactions:", error.message);
    return [];
  }

  return (data ?? []) as TokenTransactionRow[];
}
