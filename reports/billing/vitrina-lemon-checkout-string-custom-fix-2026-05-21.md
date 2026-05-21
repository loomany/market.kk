# Lemon checkout — string `custom_data` fix

Date: 2026-05-21

## Problem

Lemon API rejected `POST /v1/checkouts` when `checkout_data.custom.tokens` and `amount_cents` were numbers (**422**). Webhook already uses `Number(custom.tokens)` — no webhook change needed.

## Files changed

| File | Change |
|------|--------|
| `lib/payments/lemonSqueezy.ts` | `LemonCheckoutCustomData`: `tokens` / `amount_cents` typed as `string`; `createTokenTopupCheckout` sends `String(TOKEN_TOPUP_PACKAGE.tokens)` and `String(TOKEN_TOPUP_PACKAGE.amountCents)` |
| `package.json` | Added `"test:tokens"` script |

**Not changed:** webhook route, pricing, AI, SEO, env, variant/store IDs.

## Payload (after fix)

```ts
custom: {
  purpose: "token_topup",
  user_id: "<uuid>",
  tokens: "10",
  amount_cents: "1000",
}
```

## Verification

| Check | Result |
|-------|--------|
| `npm run test:tokens` | ok |
| `npm run build` | ok |
| Lemon API preview checkout (same string shape as app) | **201**, URL returned |
| Webhook parser | unchanged — `Number(custom.tokens)` / `Number(custom.amount_cents)` |

## Deploy / live-smoke

| Gate | Ready? |
|------|--------|
| Env + variant ($10, published) | yes (see recheck report) |
| In-app `POST /api/tokens/checkout` | **yes** — API accepts payload |
| Build | yes |
| Production migration + hosting env | owner |
| Test payment + webhook | owner, when explicitly allowed |

## Remaining blockers (unchanged)

1. **Owner share link** (`/checkout/buy/264e6563-…`) may still redirect to 404 in some clients — prefer in-app checkout on `/ru/tokens`.
2. **`APP_SESSION_SECRET`** on production hosting (recommended dedicated value).
3. **Supabase migration** on production if not applied yet.
4. **Static share link** does not inject `user_id` — billing must use site checkout + webhook.

Commit / push / deploy / payment **not performed**.
