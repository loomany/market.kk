# Lemon tokens — recheck after env/price fix

Date: 2026-05-21  
No payment, no deploy, no push to main.

---

## Summary

| Area | Result |
|------|--------|
| **Env** (`336165` / `1683775`) | **OK** |
| **Lemon API** (price, published, one-time) | **OK** |
| **Owner share checkout link** (HTTP) | **FAIL** — still `302` → `/checkout` → **404** |
| **Site `POST /api/tokens/checkout`** | **BLOCKER** — Lemon API rejects `custom.tokens` / `custom.amount_cents` as numbers; must be **strings** |
| **Webhook / ledger / no success credit** | **OK** (code review) |
| **`npm run build`** | **OK** |
| **`npm run test:tokens`** | Script exists; **not** in `package.json` scripts (run via `node … scripts/test-tokens-ledger.ts` — ok) |
| **Deploy / live-smoke** | **After** small checkout custom_data fix + hosting env mirror + manual browser check of share link |

---

## 1. Checkout link (owner)

URL:

`https://scholarshiptop.lemonsqueezy.com/checkout/buy/264e6563-f4da-46c1-8a54-13f8a30ddad6?media=0&logo=0&discount=0`

### HTTP (automated, no payment)

| Step | Status |
|------|--------|
| `GET …/checkout/buy/264e6563-…` | **302** |
| Follow to `…/checkout` | **404** |

Could not confirm on live HTML: Vitrina Tokens, 10 Tokens, $10.00 (page not rendered).

### Lemon API (variant **1683775**) — confirms product setup

| Field | Value |
|-------|--------|
| Product | Vitrina Tokens |
| Variant name | Vitrina Tokens (API; owner expects label «10 Tokens» — verify in dashboard UI) |
| `slug` | `264e6563-f4da-46c1-8a54-13f8a30ddad6` (matches share URL) |
| Price | **1000** cents = **$10.00** |
| `is_subscription` | **false** |
| `status` | **published** |
| Store | **336165** |

**Recommendation:** Open the same link once in a normal browser (not only curl). If it still 404, re-copy **Share** link from Lemon for variant **1683775** or use only in-app checkout (below).

Domain `scholarshiptop.lemonsqueezy.com` remains the store slug (ScholarshipTop); acceptable for MVP if checkout copy is Vitrina-only when the page loads.

---

## 2. Env

Checked `.env.local` (values compared to expected, secrets not logged):

| Variable | Expected | Actual | OK |
|----------|----------|--------|-----|
| `LEMON_SQUEEZY_STORE_ID` | `336165` | `336165` | yes |
| `LEMON_TOKENS_VARIANT_ID` | `1683775` | `1683775` | yes |
| Product id `1074150` in variant env | must not | no | yes |
| UUID slug in variant env | must not | no | yes |
| `LEMON_SQUEEZY_VARIANT_ID_MONTHLY` in token checkout code | unused | not referenced in `lib/payments/lemonSqueezy.ts` | yes |

`NEXT_PUBLIC_SITE_URL` present (used for success redirect `…/tokens?checkout=success`).

---

## 3. Site checkout `POST /api/tokens/checkout`

Code path: `lib/payments/lemonSqueezy.ts` → `createTokenTopupCheckout`.

Intended `checkout_data.custom`:

- `purpose: "token_topup"`
- `user_id` (session UUID)
- `tokens: 10`
- `amount_cents: 1000`

### Lemon API probe (preview checkout, no payment)

| `custom` shape | API result |
|----------------|------------|
| `tokens: 10`, `amount_cents: 1000` (numbers, **as in app code today**) | **422** — must be string |
| `tokens: "10"`, `amount_cents: "1000"` (strings) | **201** — checkout URL returned |

**Blocker:** In-app button «Купить 10 токенов» will likely fail until `tokens` and `amount_cents` are sent as **strings** in `checkout_data.custom` (one-line fix in `lemonSqueezy.ts`; webhook parser already uses `Number()` and is fine).

Other fields (`purpose`, `user_id`) match expectations.

---

## 4. Webhook (code)

| Check | Status |
|-------|--------|
| Credit only in `app/api/webhooks/route.ts` | OK — not on `/tokens?checkout=success` |
| HMAC on raw body + `X-Signature` | OK |
| Unsigned → **401** | OK |
| Non-token events → `{ handled: false }` | OK |
| Idempotency `provider_order_id` / `provider_event_id` | OK in `credit_purchased_tokens` SQL |
| Package validation 10 tokens / ≥1000 cents USD | OK |
| Requires `user_id` in custom_data | OK |

---

## 5. Commands

```bash
node --experimental-strip-types --import=./scripts/lib/registerTsAlias.mjs scripts/test-tokens-ledger.ts
# ok

npm run build
# ok
```

`npm run test:tokens` — **missing** from `package.json`; script file still passes when invoked directly.

---

## 6. Remaining blockers

1. **Code:** stringify `tokens` and `amount_cents` in Lemon checkout `custom` (required for `/api/tokens/checkout`).
2. **Share link:** automated fetch still **404** after redirect — verify in browser or use API checkout only.
3. **Hosting:** production env must mirror local: `LEMON_SQUEEZY_STORE_ID=336165`, `LEMON_TOKENS_VARIANT_ID=1683775`, plus webhook secret, Supabase service role, `APP_SESSION_SECRET` (recommended dedicated secret on host).
4. **Supabase migration** on production (if not yet applied) — see `vitrina-token-production-readiness-2026-05-21.md`.
5. **Live-smoke:** real payment only when owner explicitly allows; confirm webhook → +10, repeat webhook → still 10.

---

## 7. Deploy / live-smoke verdict

| Gate | Ready? |
|------|--------|
| Env + Lemon product/variant (API) | **Yes** |
| Build | **Yes** |
| In-app Lemon checkout API | **No** — custom_data types |
| Owner static share URL (HTTP) | **Unverified live** — fails in script |
| End-to-end paid smoke | **After** fix + deploy + owner-approved test payment |

**Suggested order:** fix string `custom` → deploy to preview → logged-in purchase on `/ru/tokens` → webhook balance check (no reliance on share link alone).

---

Related: `vitrina-lemon-checkout-verify-2026-05-21.md`, `vitrina-token-production-readiness-2026-05-21.md`.
