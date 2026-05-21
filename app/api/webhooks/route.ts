import { NextResponse } from "next/server";
import {
  parseTokenTopupFromWebhook,
  verifyLemonWebhookSignature,
} from "@/lib/payments/lemonSqueezy";
import { creditPurchasedTokens } from "@/lib/tokens/tokenLedger";
import {
  isValidUserUuid,
  lemonTokensVariantId,
  TOKEN_TOPUP_PACKAGE,
} from "@/lib/tokens/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyLemonWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, message: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  const meta = (payload as { meta?: { event_name?: string } })?.meta;
  const eventName = meta?.event_name ?? "";

  const parsed = parseTokenTopupFromWebhook(payload);

  if (!parsed.isTokenTopup) {
    // Non-token events (e.g. subscription) — acknowledge without breaking existing flows.
    return NextResponse.json({ ok: true, handled: false, event: eventName });
  }

  if (eventName !== "order_created" && eventName !== "order_updated") {
    return NextResponse.json({ ok: true, handled: false, event: eventName });
  }

  const attrs = (payload as { data?: { attributes?: { status?: string } } })?.data?.attributes;
  const status = attrs?.status;
  if (status && status !== "paid") {
    return NextResponse.json({ ok: true, handled: false, reason: "not_paid", status });
  }

  const { userId, tokens, amountCents, currency, orderId, checkoutId, eventId, variantId } =
    parsed;

  if (!userId || !isValidUserUuid(userId)) {
    return NextResponse.json({ ok: false, message: "Missing user_id" }, { status: 422 });
  }

  const expectedVariant = lemonTokensVariantId();
  if (expectedVariant && variantId && variantId !== expectedVariant) {
    return NextResponse.json({ ok: false, message: "Variant mismatch" }, { status: 422 });
  }

  if (tokens !== TOKEN_TOPUP_PACKAGE.tokens) {
    return NextResponse.json({ ok: false, message: "Invalid token amount" }, { status: 422 });
  }

  const paidCents = amountCents ?? 0;
  if (paidCents < TOKEN_TOPUP_PACKAGE.amountCents) {
    return NextResponse.json({ ok: false, message: "Insufficient paid amount" }, { status: 422 });
  }

  if (currency && currency.toUpperCase() !== TOKEN_TOPUP_PACKAGE.currency) {
    return NextResponse.json({ ok: false, message: "Invalid currency" }, { status: 422 });
  }

  try {
    const result = await creditPurchasedTokens({
      userId,
      tokens: TOKEN_TOPUP_PACKAGE.tokens,
      amountCents: TOKEN_TOPUP_PACKAGE.amountCents,
      currency: TOKEN_TOPUP_PACKAGE.currency,
      providerOrderId: orderId ?? null,
      providerCheckoutId: checkoutId ?? null,
      providerEventId: eventId ?? null,
      metadata: { event_name: eventName, variant_id: variantId },
    });

    return NextResponse.json({
      ok: true,
      handled: true,
      credited: result.credited,
      balanceAfter: result.balanceAfter,
    });
  } catch (error) {
    console.error("[webhook] token credit failed:", error);
    return NextResponse.json({ ok: false, message: "Credit failed" }, { status: 500 });
  }
}
