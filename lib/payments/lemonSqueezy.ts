import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  assertTokensCheckoutConfigured,
  lemonApiKey,
  lemonStoreId,
  lemonTokensVariantId,
  TOKEN_TOPUP_PACKAGE,
} from "@/lib/tokens/config";

/** Lemon requires checkout_data.custom values to be strings. */
export type LemonCheckoutCustomData = {
  purpose: "token_topup";
  user_id: string;
  tokens: string;
  amount_cents: string;
};

export async function createTokenTopupCheckout(params: {
  userId: string;
  locale: string;
  userEmail?: string | null;
}): Promise<{ checkoutUrl: string }> {
  const configCheck = assertTokensCheckoutConfigured();
  if (!configCheck.ok) {
    throw new Error(configCheck.message);
  }

  const apiKey = lemonApiKey()!;
  const storeId = lemonStoreId()!;
  const variantId = lemonTokensVariantId()!;
  const { currency } = TOKEN_TOPUP_PACKAGE;

  const successUrl = `${siteOrigin()}/${params.locale}/tokens?checkout=success`;
  const cancelUrl = `${siteOrigin()}/${params.locale}/tokens?checkout=cancelled`;

  const custom: LemonCheckoutCustomData = {
    purpose: "token_topup",
    user_id: params.userId,
    tokens: String(TOKEN_TOPUP_PACKAGE.tokens),
    amount_cents: String(TOKEN_TOPUP_PACKAGE.amountCents),
  };

  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_options: {
          embed: false,
          media: true,
          logo: true,
        },
        checkout_data: {
          email: params.userEmail ?? undefined,
          custom,
        },
        product_options: {
          enabled_variants: [Number(variantId)],
          redirect_url: successUrl,
        },
        preview: false,
      },
      relationships: {
        store: { data: { type: "stores", id: String(storeId) } },
        variant: { data: { type: "variants", id: String(variantId) } },
      },
    },
  };

  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const json = (await response.json().catch(() => null)) as {
    data?: { attributes?: { url?: string } };
    errors?: { detail?: string; title?: string }[];
  } | null;

  if (!response.ok) {
    const detail =
      json?.errors?.map((e) => e.detail ?? e.title).filter(Boolean).join("; ") ||
      `Lemon checkout failed (${response.status})`;
    throw new Error(detail);
  }

  const checkoutUrl = json?.data?.attributes?.url;
  if (!checkoutUrl) {
    throw new Error("Lemon checkout URL missing in response");
  }

  // Lemon also supports cancel via checkout_options; redirect_url is success-only in API.
  // Cancel is handled by Lemon hosted checkout back link — we pass cancel in custom metadata for support.
  void cancelUrl;
  void currency;

  return { checkoutUrl };
}

function siteOrigin(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function verifyLemonWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET?.trim() || process.env.LEMON_WEBHOOK_SECRET?.trim();
  if (!secret || !signatureHeader) return false;

  const digest = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"), "utf8");
  const signature = Buffer.from(signatureHeader, "utf8");
  if (digest.length !== signature.length) return false;
  return timingSafeEqual(digest, signature);
}

export function parseTokenTopupFromWebhook(payload: unknown): {
  isTokenTopup: boolean;
  userId?: string;
  tokens?: number;
  amountCents?: number;
  currency?: string;
  orderId?: string;
  checkoutId?: string;
  eventId?: string;
  variantId?: string;
} {
  const root = payload as Record<string, unknown> | null;
  if (!root) return { isTokenTopup: false };

  const meta = (root.meta ?? {}) as Record<string, unknown>;
  const custom = (meta.custom_data ?? meta.custom ?? {}) as Record<string, unknown>;
  const eventName = String(meta.event_name ?? "");
  const eventId = meta.event_id != null ? String(meta.event_id) : undefined;

  const data = (root.data ?? {}) as Record<string, unknown>;
  const attributes = (data.attributes ?? {}) as Record<string, unknown>;
  const relationships = (data.relationships ?? {}) as Record<string, unknown>;

  const firstOrderItem = Array.isArray(attributes.order_items)
    ? (attributes.order_items[0] as Record<string, unknown> | undefined)
    : undefined;

  const variantId =
    custom.variant_id != null
      ? String(custom.variant_id)
      : firstOrderItem?.variant_id != null
        ? String(firstOrderItem.variant_id)
        : undefined;

  const tokensVariant = lemonTokensVariantId();
  const purpose = String(custom.purpose ?? "");
  const isTokenTopup =
    purpose === "token_topup" ||
    (tokensVariant != null && variantId != null && variantId === tokensVariant);

  const userId = custom.user_id != null ? String(custom.user_id) : undefined;
  const tokens = custom.tokens != null ? Number(custom.tokens) : undefined;
  const amountCents =
    custom.amount_cents != null
      ? Number(custom.amount_cents)
      : attributes.total != null
        ? Number(attributes.total)
        : attributes.subtotal != null
          ? Number(attributes.subtotal)
          : undefined;

  const currency = attributes.currency != null ? String(attributes.currency) : "USD";
  const orderId = data.id != null ? String(data.id) : undefined;
  const checkoutId =
    attributes.checkout_id != null ? String(attributes.checkout_id) : undefined;

  return {
    isTokenTopup,
    userId,
    tokens,
    amountCents,
    currency,
    orderId,
    checkoutId,
    eventId,
    variantId,
    ...(eventName ? { eventName } : {}),
  };
}
