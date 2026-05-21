# Vitrina.help — Lemon Squeezy tokens, balance, pricing, guest watermark

Date: 2026-05-21  
Site: https://vitrina.help  
Webhook path: **`POST /api/webhooks`**

## Summary

- **1 token = $1** (`NEXT_PUBLIC_TOKEN_USD_RATE`, default 1)
- **Minimum top-up:** 10 tokens / **$10** (`TOKEN_TOPUP_PACKAGE`)
- **1 AI task = 1 token** (`TOKEN_DEFAULT_GENERATION_COST` / `getGenerationCost()`)
- **Credits only via Lemon webhook** — success URL does not mint tokens
- **Guest:** 1 free generation per signed HTTP-only cookie; result watermarked `vitrina.help`
- **Paid (logged-in, balance):** no watermark; token spent **after** successful generation (not on provider failure)

## Env variables used in code

| Variable | Purpose |
|----------|---------|
| `LEMON_SQUEEZY_API_KEY` | Checkout API (`LEMON_API_KEY` alias) |
| `LEMON_SQUEEZY_STORE_ID` | Store relationship (`LEMON_STORE_ID` alias) |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | HMAC `X-Signature` (`LEMON_WEBHOOK_SECRET` alias) |
| `LEMON_TOKENS_VARIANT_ID` | One-time 10-token variant (`LEMON_SQUEEZY_VARIANT_ID_TOKENS` alias) |
| `LEMON_TOKENS_PRODUCT_ID` | Documented / optional validation helper |
| `LEMON_SQUEEZY_VARIANT_ID_MONTHLY` | Subscription variant — **not** used for token checkout |
| `NEXT_PUBLIC_TOKEN_USD_RATE` | Balance API display |
| `NEXT_PUBLIC_MIN_TOKEN_TOPUP` | UI copy / package docs (10) |
| `TOKEN_DEFAULT_GENERATION_COST` | Default 1 token per task |
| `GUEST_FREE_GENERATION_LIMIT` | Default 1 |
| `NEXT_PUBLIC_SITE_URL` | Checkout redirect URLs |
| `SUPABASE_SERVICE_ROLE_KEY` | Ledger RPC (admin) |
| `APP_SESSION_SECRET` | Session + guest cookie signing |

**Owner `.env.local` today:** has `LEMON_SQUEEZY_*` but **`LEMON_TOKENS_VARIANT_ID` is not set** — checkout returns a clear error until the 10-token product variant ID is added in Lemon and env.

## Migrations

- `supabase/migrations/202605210001_token_ledger.sql`
  - `user_token_balances`, `token_transactions`
  - RLS: user read own rows only; no user writes
  - RPC: `credit_purchased_tokens`, `spend_user_tokens` (service_role, idempotent on `provider_order_id` / `provider_event_id`)

## Main files

| Area | Files |
|------|--------|
| Ledger | `lib/tokens/tokenLedger.ts`, `lib/tokens/config.ts`, `lib/tokens/formatTokens.ts` |
| Guest | `lib/tokens/guestGeneration.ts` |
| Billing gate | `lib/tokens/generationBilling.ts` |
| Watermark | `lib/images/applyVitrinaWatermark.ts` (uses `sharp`) |
| Lemon | `lib/payments/lemonSqueezy.ts` |
| API | `app/api/webhooks/route.ts`, `app/api/tokens/checkout/route.ts`, `app/api/tokens/balance/route.ts` |
| UI | `components/auth/TokenBalancePill.tsx`, `components/tokens/TokensPageClient.tsx`, `app/[locale]/(marketing)/tokens/page.tsx`, `components/auth/WhatsAppLoginModal.tsx` (account block) |
| Pricing SEO | `data/seo/staticPages.ts` (cost), `app/[locale]/(marketing)/[slug]/page.tsx` (CTA), `next.config.ts` (`/pricing` → `/*/cost`) |
| Studio header | `components/studio/StudioShell.tsx` |
| AI routes | All `app/api/ai/**/route.ts` POST handlers wrapped with `withGenerationBilling` except `pricing` and `analyze-product-description` |

## AI endpoints with token / guest billing

Connected (real AI mode, non-mock):

- `/api/ai/tryon`
- `/api/ai/remove-background`
- `/api/ai/image/enhance`
- `/api/ai/generate-model`
- `/api/ai/product-shot`
- `/api/ai/scene/generate`
- `/api/ai/video/generate`
- `/api/ai/prompt/enhance`
- `/api/ai/refine-product-mask`
- `/api/ai/image/preservation-analyze`
- `/api/ai/analyze-product-angles`

**Not wrapped:** `/api/ai/pricing` (estimate only), `/api/ai/analyze-product-description` (text helper).

**Mock mode (`AI_MOCK_MODE≠0`):** billing skipped; no token spend / guest watermark path in gate.

## Guest limit limitations

- **Server:** signed HTTP-only cookie `vitrina_guest_gen` (HMAC with `APP_SESSION_SECRET`).
- **Not** IP/fingerprint anti-fraud — clearing cookies or another browser grants another trial (documented limitation).
- Watermark: fetch image → `sharp` composite → re-upload to Fal storage for guest responses.

## Subscriptions

- No existing Lemon subscription webhook code in repo before this change.
- Webhook returns `{ handled: false }` for non-token events so future subscription handlers can be added without breaking token flow.

## Lemon dashboard checklist (owner)

1. Create **one-time** product: 10 tokens / $10 USD.
2. Set variant ID in `LEMON_TOKENS_VARIANT_ID` (not `LEMON_SQUEEZY_VARIANT_ID_MONTHLY`).
3. Webhook URL: `https://vitrina.help/api/webhooks`, events at least `order_created` / `order_updated`, secret = `LEMON_SQUEEZY_WEBHOOK_SECRET`.
4. Custom checkout data is sent as `purpose: token_topup`, `user_id`, `tokens: 10`, `amount_cents: 1000`.
5. Run migration on Supabase project.
6. Test: checkout → webhook → balance 10 → one generation → balance 9.

## QA commands

```bash
npm run test:tokens
npm run tsc -- --noEmit
npm run build
```

## Studio / AI pipeline

- No prompt, FASHN, or Fal model changes.
- Only pre-check (`beginGenerationBilling`) and post-success (`finalizeGenerationBilling`: spend + optional watermark).
- Existing `ALLOW_PAID_AI_RUNS` / `MAX_AI_TEST_SPEND_USD` guards remain after token gate.
