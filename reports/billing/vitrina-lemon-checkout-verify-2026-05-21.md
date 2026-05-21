# Lemon checkout verify — Vitrina Tokens (owner link)

Date: 2026-05-21  
Owner link:

`https://scholarshiptop.lemonsqueezy.com/checkout/buy/264e6563-f4da-46c1-8a54-13f8a30ddad6?media=0&logo=0&discount=0`

Checked via Lemon API (key from `.env.local`, values not printed) + HTTP fetch. **No payment made.**

---

## Executive summary

| Area | Verdict |
|------|---------|
| Link maps to **Vitrina Tokens** product | OK (variant slug matches) |
| One-time (not subscription) | OK |
| Price **$10** | **FAIL** — API shows **$9.99** (999 cents) |
| Variant **published** | **FAIL** — status **Pending** |
| Hosted checkout opens | **FAIL** — `302` → `/checkout` → **404** |
| Env `LEMON_TOKENS_VARIANT_ID` | **FAIL** — set to **product** id `1074150`, need **variant** `1683775` |
| Env `LEMON_SQUEEZY_STORE_ID` | **FAIL** — `1683778` has 0 products; real store is **`336165`** (ScholarshipTop) |
| Static link alone for production | **FAIL** — no `user_id` / `token_topup` custom data → webhook cannot credit user |
| Site `POST /api/tokens/checkout` | Ready **after** env + price + publish fixes |

---

## 1. Owner checkout link vs Lemon API

### What `264e6563-f4da-46c1-8a54-13f8a30ddad6` is

This is **not** the numeric API variant id. It is the variant **`slug`** (share URL id).

| Field | Value |
|-------|--------|
| Store | **336165** — `ScholarshipTop` (`scholarshiptop.lemonsqueezy.com`) |
| Product | **1074150** — `Vitrina Tokens` |
| Variant (numeric, for env/API) | **1683775** |
| Variant slug (in share URL) | **`264e6563-f4da-46c1-8a54-13f8a30ddad6`** |
| Second variant on same product | **1683776** — slug `45c45562-5583-49e7-9535-3a2ef135035e`, name `Default` (duplicate; owner link uses **1683775**) |

### Product copy (API)

- Name: **Vitrina Tokens**
- Description: `10 Tokens`
- Product status: **Published**
- Not Dordoi product text on this SKU

### Variant 1683775 (owner link)

- `is_subscription`: **false** — one-time OK
- `price`: **999** → **$9.99** — code expects **1000** cents ($10) → webhook will reject with `Insufficient paid amount` unless Lemon price or code threshold is aligned
- `status`: **Pending** — likely why hosted URL redirects and cart 404s
- `interval`: null

### HTTP check (no payment)

```
GET /checkout/buy/264e6563-... → 302 → /checkout → 404
```

Page body mentions **ScholarshipTop** (store name on domain). **Vitrina** / **vitrina.help** / **View my tokens** not seen on error page. Receipt/thank-you fields were **empty** on variant via API (`product_options` not set on variant resource).

**Branding:** Domain `scholarshiptop.lemonsqueezy.com` = old store slug. Acceptable for MVP if checkout copy is Vitrina-only; today checkout **does not load** (404). Recommend: publish variant, set receipt button **View my tokens** → `https://vitrina.help/ru/tokens`, thank-you note without Dordoi.help (in Lemon product/variant settings).

---

## 2. Env vs code (`LEMON_TOKENS_VARIANT_ID`)

Code (`lib/payments/lemonSqueezy.ts`) uses env value as **numeric Lemon variant id** in:

- `relationships.variant.id`
- `product_options.enabled_variants: [Number(variantId)]`
- webhook match: `variantId === lemonTokensVariantId()`

### Current `.env.local` (observed)

| Variable | Current | Should be |
|----------|---------|-----------|
| `LEMON_SQUEEZY_STORE_ID` | `1683778` | **`336165`** (ScholarshipTop). `1683778` is a variant id, not a store — API returns **0 products** for that store filter |
| `LEMON_TOKENS_VARIANT_ID` | `1074150` | **`1683775`** (numeric). `1074150` is **product** id → API variant lookup **404**, checkout creation wrong |

**Do not** put share-url UUID in `LEMON_TOKENS_VARIANT_ID` unless code is changed to accept slug (today it expects numeric id).

**Do not** use `LEMON_SQUEEZY_VARIANT_ID_MONTHLY` for tokens.

---

## 3. Static link vs site checkout (critical)

Production flow on vitrina.help:

1. User logged in → **`POST /api/tokens/checkout`**
2. Lemon checkout with **custom_data**: `purpose: token_topup`, `user_id`, `tokens: 10`, `amount_cents: 1000`
3. Webhook **`POST /api/webhooks`** credits balance (not success URL)

The owner **share link** does **not** inject `user_id`. Orders from that link alone will hit webhook with `isTokenTopup` maybe true (if variant id matches) but **`Missing user_id` → 422** — **no tokens credited**.

**Conclusion:** Share link is OK for **manual QA of Lemon UI/price** only. Live billing must use **in-app checkout button** on `/ru/tokens`.

---

## 4. Code readiness (unchanged logic)

| Check | Status |
|-------|--------|
| Missing variant env → 503 message (not 500) | OK |
| No credit on `?checkout=success` | OK |
| Webhook HMAC raw body | OK |
| Package hardcoded 10 / $10 | OK — conflicts with Lemon **$9.99** until aligned |
| Monthly variant unused in token checkout | OK |

---

## 5. Owner actions (Lemon dashboard)

1. **Publish** variant **1683775** (or delete duplicate **1683776** and keep one variant).
2. Set price to **$10.00** USD (1000 cents), not $9.99.
3. Confirm one-time, name e.g. **10 Tokens**.
4. Receipt / thank you:
   - Button: **View my tokens**
   - URL: `https://vitrina.help/ru/tokens`
   - Note: Vitrina tokens, no Dordoi.help
5. Optional UX: rename store display name away from ScholarshipTop (Lemon store settings).

## 6. Owner actions (env — hosting + local)

```env
LEMON_SQUEEZY_STORE_ID=336165
LEMON_TOKENS_VARIANT_ID=1683775
```

Keep existing `LEMON_SQUEEZY_API_KEY`, `LEMON_SQUEEZY_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL=https://vitrina.help`, Supabase keys, `APP_SESSION_SECRET`.

---

## 7. Re-test after fixes

1. Open owner link again → checkout page loads (not 404), shows Vitrina / 10 tokens / **$10**.
2. Logged-in on vitrina.help → **Купить 10 токенов** → Lemon opens (API checkout).
3. Test payment only when owner explicitly allows → webhook → balance +10.
4. Repeat webhook → still 10 tokens.

---

No deploy, no push to main, no code changes in this verification pass.
