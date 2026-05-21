# Vitrina Lemon Tokens — production readiness

Date: 2026-05-21  
Site: https://vitrina.help  
Scope: deploy prep + live-smoke only (no new features, no push to main).

---

## Local gate (passed)

```bash
npm run test:tokens   # ok
npm run build         # ok
```

---

## 1. Production / hosting env — checklist

Set these in Vercel (or your host) **before** deploy. Do not commit real values.

| Variable | Required | Notes |
|----------|----------|--------|
| `LEMON_SQUEEZY_API_KEY` | yes | Server-only |
| `LEMON_SQUEEZY_STORE_ID` | yes | Store ID (not product id) |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | yes | Same as Lemon webhook signing secret |
| `LEMON_TOKENS_VARIANT_ID` | **yes** | **One-time** variant `10 Tokens / $10` — **not** monthly |
| `NEXT_PUBLIC_SITE_URL` | yes | `https://vitrina.help` (no trailing slash) |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Ledger RPC + admin auth |
| `APP_SESSION_SECRET` | **yes** | **Dedicated** random secret (32+ bytes). Do **not** rely on fallback to `SUPABASE_SERVICE_ROLE_KEY` in production |

Also keep existing app env (unchanged by this task):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or anon key)
- `FAL_KEY`, `OPENAI_API_KEY`, WhatsApp/Green API, etc.

### Do NOT use for token checkout

- `LEMON_SQUEEZY_VARIANT_ID_MONTHLY` — subscription only; code uses `LEMON_TOKENS_VARIANT_ID` only.

### Local `.env.local` snapshot (keys only, pre-prod)

Present: `LEMON_SQUEEZY_API_KEY`, `LEMON_SQUEEZY_STORE_ID`, `LEMON_SQUEEZY_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `LEMON_SQUEEZY_VARIANT_ID_MONTHLY`.

**Missing locally (must be in production):**

- `LEMON_TOKENS_VARIANT_ID`
- `APP_SESSION_SECRET`

Until `LEMON_TOKENS_VARIANT_ID` is set, `POST /api/tokens/checkout` returns **503** `CHECKOUT_NOT_CONFIGURED` (not 500).

### Generate `APP_SESSION_SECRET` (owner)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste result into hosting env as `APP_SESSION_SECRET`. Rotate invalidates existing login + guest trial cookies (users re-login once).

---

## 2. Supabase production migration

**File:** `supabase/migrations/202605210001_token_ledger.sql`

Run in **production** project → SQL Editor (if not already applied).

### Verify (copy-paste)

```sql
-- Tables
select tablename
from pg_tables
where schemaname = 'public'
  and tablename in ('user_token_balances', 'token_transactions');

-- RPC
select proname, prosecdef
from pg_proc
where proname in ('credit_purchased_tokens', 'spend_user_tokens');

-- RLS on
select relname, relrowsecurity
from pg_class
where relname in ('user_token_balances', 'token_transactions');

-- Policies (expect read-only for authenticated user)
select tablename, policyname, cmd
from pg_policies
where tablename in ('user_token_balances', 'token_transactions')
order by tablename, policyname;
```

**Expected:**

- 2 tables, 2 functions (`prosecdef` = true), `relrowsecurity` = true
- Policies: `SELECT` only for `authenticated` / `auth.uid() = user_id` — no INSERT/UPDATE/DELETE for users

---

## 3. Lemon Squeezy dashboard (owner)

### Product (one-time)

| Field | Value |
|-------|--------|
| Product name | Vitrina Tokens (or similar) |
| Variant name | 10 Tokens |
| Price | $10 USD |
| Type | **One-time payment** (not subscription) |

Copy **Variant ID** → hosting `LEMON_TOKENS_VARIANT_ID`.

### Webhook

| Field | Value |
|-------|--------|
| URL | `https://vitrina.help/api/webhooks` |
| Signing secret | = `LEMON_SQUEEZY_WEBHOOK_SECRET` |
| Events | At least paid order flow: `order_created`, `order_updated` (paid status) |

Custom data on checkout (set by app): `purpose: token_topup`, `user_id`, `tokens: 10`, `amount_cents: 1000`.

**Tokens are credited only via webhook**, not via `?checkout=success`.

---

## 4. Deploy order (safe)

1. Apply Supabase migration on **production** DB.
2. Set all env vars on hosting (especially `LEMON_TOKENS_VARIANT_ID`, `APP_SESSION_SECRET`).
3. Configure Lemon product + webhook.
4. Deploy app (after owner approves push).
5. Run live-smoke below on https://vitrina.help.

---

## 5. Live-smoke (after deploy)

Use a **test user** with WhatsApp login and real Supabase UUID.

### A. UI

- [ ] `/ru/studio` — token pill left of «Аккаунт», shows `0 токенов` if empty
- [ ] Pill → `/ru/tokens`
- [ ] `/ru/cost` — pack 10 tokens / $10
- [ ] `/pricing` → redirects to `/en/cost` (no SEO break)

### B. Checkout (logged in)

- [ ] `POST /api/tokens/checkout` from UI → Lemon checkout opens
- [ ] Pay test $10 (Lemon test mode if enabled)
- [ ] Land on `/ru/tokens?checkout=success` — message shown; balance still 0 until webhook
- [ ] Within ~30s balance → **10** (poll or refresh)

### C. Webhook idempotency

- [ ] Lemon dashboard → resend same `order_created` webhook → balance stays **10** (not 20)
- [ ] `token_transactions` has one `purchase` row with `provider_order_id`

### D. Spend

- [ ] With `AI_MOCK_MODE=0` and balance 10, run one real AI job (e.g. remove background)
- [ ] Success → balance **9**, no watermark on result
- [ ] Force failure (e.g. invalid input) → balance still **9**

### E. Guest

- [ ] Logout / incognito — one free generation → image has **vitrina.help** watermark
- [ ] Second attempt → blocked with guest-limit message

### F. Security quick

- [ ] `POST /api/tokens/checkout` without session → **401**
- [ ] `POST /api/webhooks` without `X-Signature` → **401**

---

## 6. Rollback notes

- Removing env `LEMON_TOKENS_VARIANT_ID` disables checkout (503) but does not break studio.
- DB migration is additive; rollback = stop crediting via webhook (disable webhook in Lemon), not required to drop tables immediately.

---

## Related

- Implementation report: `reports/billing/vitrina-token-lemon-payments-2026-05-21.md`
- SQL migration copy: `supabase/migrations/202605210001_token_ledger.sql`
