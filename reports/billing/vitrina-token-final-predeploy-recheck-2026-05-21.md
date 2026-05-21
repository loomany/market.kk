# Vitrina Tokens — final pre-deploy recheck (CHECK-ONLY)

Date: 2026-05-21  
Branch: `release/vitrina-seo-audience-pages`  
Mode: verification only — **no deploy, no push, no payment, no commit**

---

## Verdict

**Verdict: NOT READY — blockers: AI billing gate not wired to API routes; TokenBalancePill not mounted in header; `/cost` copy not aligned with token pricing; optional UI gaps (account modal, sitemap `/tokens`, `/pricing` redirect).**

Lemon checkout (201), webhook code, Supabase ledger (production), local env, and `npm run build` are OK. Deploying now would allow **purchase + webhook credit** but **paid AI would not spend tokens** and **guest watermark / 402 gate would not run** on studio routes.

---

## 1. Git status and scope

### Commands

```bash
git status --short
git branch --show-current
git log --oneline -5
```

### Branch / recent commits

| Item | Value |
|------|--------|
| Branch | `release/vitrina-seo-audience-pages` |
| HEAD | `e4dd268` docs(seo): stage 16.2 clean build packaging report |

### Dirty tree (summary)

**Token billing (expected untracked / modified):**

- `app/api/tokens/`, `app/api/webhooks/`
- `app/[locale]/(marketing)/tokens/`
- `components/auth/TokenBalancePill.tsx`, `components/tokens/`
- `lib/tokens/`, `lib/payments/`
- `supabase/migrations/202605210001_token_ledger.sql`
- `scripts/test-tokens-ledger.ts`, `reports/billing/*`

**Also in tree (not token-only — review before push):**

- Studio i18n refactor (`lib/studio/i18n/`, many `components/studio/*`)
- SEO audience pages (`data/seo/audiencePages.ts`, `app/[locale]/(marketing)/...`)
- `components/landing/SaasFooter.tsx`, icons/assets, `scripts/seo/*`
- `.cursor/`, `reports/ai/*.json`, `reports/_verify-256.png`

**Not in diff vs HEAD for this check:**

- `app/sitemap.ts`, `robots.txt`, hreflang helpers — **no accidental SEO edits** in tracked diff from HEAD (token work mostly untracked).

**Must not commit:**

- `.env.local` (gitignored — OK)

**Recommendation:** split token billing into its own PR/commit; do not mix with audience SEO + studio i18n unless intentional.

---

## 2. Environment (local keys only)

Parsed `.env.local` — **secrets not logged**.

| Key | Expected | Local |
|-----|----------|-------|
| `LEMON_SQUEEZY_STORE_ID` | `336165` | OK |
| `LEMON_TOKENS_VARIANT_ID` | `1683775` | OK |
| `NEXT_PUBLIC_SITE_URL` | `https://vitrina.help` | OK |
| `LEMON_SQUEEZY_API_KEY` | set | OK |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | set | OK |
| `SUPABASE_SERVICE_ROLE_KEY` | set | OK |
| `APP_SESSION_SECRET` | set (production-grade) | OK |

**Not used (grep):**

- `1074150` as variant — not in env (product id only in Lemon API)
- UUID slug in env — not present
- `LEMON_SQUEEZY_STORE_ID=1683778` — not present
- `LEMON_SQUEEZY_VARIANT_ID_MONTHLY` — not present

**Note:** `DATABASE_URL` points at `zghgdalgtiopzsvtpsie` (matches `NEXT_PUBLIC_SUPABASE_URL`). Direct Postgres password may be stale; REST/service role works.

### Production hosting env

**Owner verification required** — same checklist as local (especially `APP_SESSION_SECRET` on Vercel, not service-role fallback).

---

## 3. Lemon API / variant

### Commands

```bash
node scripts/billing/verify-lemon-variant.mjs
node scripts/billing/verify-lemon-checkout-preview.mjs
```

### Result (variant `1683775`)

| Field | Value | OK |
|-------|--------|-----|
| HTTP | 200 | yes |
| Variant ID | `1683775` | yes |
| Product name | Vitrina Tokens | yes |
| Product ID (API) | `1074150` | info only — **not** in env |
| `price` | 1000 ($10) | yes |
| `status` | published | yes |
| `is_subscription` | false | yes |
| `slug` | `264e6563-f4da-46c1-8a54-13f8a30ddad6` | slug only, not env |

### Checkout preview (Lemon API, `preview: true`)

| Field | Result |
|-------|--------|
| HTTP | **201** |
| `custom.tokens` | `"10"` (string) |
| `custom.amount_cents` | `"1000"` (string) |
| `custom.purpose` | `token_topup` |

### Share-link UX (non-blocking)

Static share URL was not re-checked in this run (prior reports: HTTP 302 → 404). **Not a billing blocker** if flow uses `/ru/tokens` → `POST /api/tokens/checkout`.

---

## 4. In-app checkout (code + Lemon preview)

### Code (`app/api/tokens/checkout/route.ts`, `lib/payments/lemonSqueezy.ts`)

| Check | Result |
|-------|--------|
| No session → 401 | yes (code) |
| Client cannot override tokens/amount | yes — server uses `TOKEN_TOPUP_PACKAGE` only |
| `tokens` / `amount_cents` in custom as **strings** | yes |
| `variant_id` from `LEMON_TOKENS_VARIANT_ID` | yes |
| Success URL does not credit | yes — credit only in webhook |

### Live `POST /api/tokens/checkout` with session

Not run (requires logged-in browser/session). Lemon preview **201** confirms API payload shape.

| Check | Result |
|-------|--------|
| In-app checkout 201 (Lemon API equivalent) | **OK** (preview) |
| Full route E2E with session | **Not tested** |

---

## 5. Webhook

### Code (`app/api/webhooks/route.ts`, `lib/payments/lemonSqueezy.ts`)

| Check | Result |
|-------|--------|
| `request.text()` for HMAC | yes |
| `x-signature` + `LEMON_SQUEEZY_WEBHOOK_SECRET` | yes |
| Missing/invalid signature → 401 | yes |
| Non-token event → `{ handled: false }` | yes |
| `order_created` / `order_updated` + `paid` only | yes |
| Credits fixed **10** tokens / **1000** cents / USD | yes |
| Variant mismatch → 422 | yes |
| Idempotency | RPC + unique indexes on `provider_order_id` / `provider_event_id` |
| Monthly variant not auto-credited | only if `purpose` / variant match token variant |

### Mock live POST

Dev server not required for this report. **No HTTP replay** to production (would mutate balances).

Idempotency logic confirmed in SQL migration + `credit_purchased_tokens` RPC (prior API check on production Supabase).

| Check | Result |
|-------|--------|
| Webhook HMAC (code) | **OK** |
| Webhook idempotency (code + DB) | **OK** (not live double-POST) |

---

## 6. Supabase migration

### File

`supabase/migrations/202605210001_token_ledger.sql`

### SQL design (file review)

| Item | OK |
|------|-----|
| `user_token_balances` | yes |
| `token_transactions` | yes |
| `credit_purchased_tokens` / `spend_user_tokens` | yes |
| RLS enabled | yes |
| User SELECT own rows only | yes |
| No user INSERT/UPDATE on balances | yes (no write policies) |
| `security definer` RPC, `service_role` execute | yes |
| `balance_tokens >= 0` check | yes |
| Spend: `UPDATE ... WHERE balance_tokens >= cost` | yes |

### Production (REST probe, project `zghgdalgtiopzsvtpsie`)

```bash
node scripts/db/check-db-state.mjs
```

| Object | Status |
|--------|--------|
| `user_token_balances` | exists |
| `token_transactions` | exists |
| `credit_purchased_tokens` | exists |
| `spend_user_tokens` | exists |

**Production migration applied: OK** (objects present; not re-run SQL).

---

## 7. UI

### Pages present (build output)

- `/[locale]/tokens` — ru / en / kk
- `/api/tokens/balance`, `/api/tokens/checkout`

### Code review

| Check | Result |
|-------|--------|
| `/ru|en|kk/tokens` copy (10 / $10 / 1 token = $1) | **OK** (`TokensPageClient`) |
| No Dordoi.help on token pages | **OK** (grep) |
| Token pill left of Account | **FAIL** — `TokenBalancePill` **not imported** anywhere except its own file |
| Header / marketing shell | `SaasHeader` has no pill; studio uses `WhatsAppLoginModal` only |
| `/cost` token pricing copy | **FAIL** — `staticPages.ts` `pricingPage` still generic “billing before launch” text |
| `/pricing` → `/cost` redirect | **FAIL** — `next.config.ts` has no redirects |
| Sitemap includes `/tokens` | **FAIL** — `app/sitemap.ts` has `cost`, not `tokens` |
| Marketing `[slug]` pricing CTA to `/tokens` | partial (`app/[locale]/(marketing)/[slug]/page.tsx`) |

**Local browser smoke:** not run (CHECK-ONLY).

| UI gate | Status |
|---------|--------|
| Token UI (pages) | **PARTIAL** |
| Token UI (global pill + cost alignment) | **FAIL** |

---

## 8. AI billing gate / guest watermark

### Library (`lib/tokens/generationBilling.ts`)

Logic present:

- `AI_MOCK_MODE` / `isMockMode()` → `mode: "skip"` (no billing)
- Auth + balance &lt; 1 → **402** `INSUFFICIENT_TOKENS`
- Guest → 1 free + watermark `vitrina.help` + cookie
- Paid → spend after `ok: true` only
- `applyVitrinaWatermark` text = `vitrina.help`

### **Critical: routes not wired**

```bash
rg "withGenerationBilling|beginGenerationBilling" app/
# → no matches
```

`withGenerationBilling` is **never imported** under `app/api/ai/**`.

| Endpoint | Wrapped |
|----------|---------|
| tryon | **NO** |
| remove-background | **NO** |
| image/enhance | **NO** |
| generate-model | **NO** |
| product-shot | **NO** |
| scene/generate | **NO** |
| video/generate | **NO** |
| prompt/enhance | **NO** |
| refine-product-mask | **NO** |
| preservation-analyze | **NO** |
| analyze-product-angles | **NO** |
| analyze-product-description | **NO** (expected) |
| pricing | **NO** (expected) |

| Gate | Status |
|------|--------|
| Guest watermark logic (code) | **OK** (unused) |
| Paid spend / 402 (code) | **OK** (unused) |
| AI billing in production paths | **FAIL** |

---

## 9. Commands

```bash
npm run test:tokens   # ok
npm run build         # ok (2026-05-21 recheck)
```

**Note:** `test:tokens` only checks package constants + `formatTokenBalanceDisplay` — not Supabase RPC or webhook HTTP.

---

## 10. `package.json`

```json
"test:tokens": "node --experimental-strip-types --import=./scripts/lib/registerTsAlias.mjs scripts/test-tokens-ledger.ts"
```

Runs successfully.

---

## 11. Deploy readiness table

| Gate | Status |
|------|--------|
| Build | **OK** |
| test:tokens | **OK** (shallow) |
| Lemon store id | **OK** |
| Lemon variant id | **OK** |
| Variant published | **OK** |
| Price $10 | **OK** |
| In-app checkout 201 (Lemon preview) | **OK** |
| Webhook HMAC | **OK** (code) |
| Webhook idempotency | **OK** (code + DB) |
| Supabase migration prepared | **OK** |
| Production migration applied | **OK** |
| APP_SESSION_SECRET production | **OWNER REQUIRED** |
| Token UI | **PARTIAL / FAIL** (pill, cost copy) |
| Guest watermark logic | **FAIL** (not wired to AI routes) |
| AI token spend / 402 | **FAIL** (not wired) |
| Ready for deploy | **NO** |
| Ready for test payment | **NO** (until AI gate + UI minimum fixed) |

---

## 12. What changed in this recheck session

| Action | Type |
|--------|------|
| `reports/billing/vitrina-token-final-predeploy-recheck-2026-05-21.md` | report (this file) |
| `scripts/billing/verify-lemon-variant.mjs` | check helper (optional) |
| `scripts/billing/verify-lemon-checkout-preview.mjs` | check helper (optional) |
| `scripts/billing/test-webhook-hmac.mjs` | check helper (optional) |

**No token billing product code changed** in this recheck.  
**SEO / AI prompts / subscription variant:** not modified in this recheck.

---

## 13. Owner actions

1. **Before deploy:** wire `withGenerationBilling` on all intended `app/api/ai/**` POST handlers (except `pricing`, `analyze-product-description`).
2. Mount `TokenBalancePill` in marketing header (and/or studio chrome) left of Account.
3. Update `/cost` static copy for token model (1 token = $1, 10 tokens = $10); optional `/pricing` redirect.
4. Confirm **production** Vercel env (mirror local Lemon + Supabase + `APP_SESSION_SECRET`).
5. **Do not push** mixed SEO + studio + tokens until scope is split.
6. After code fixes + deploy: live-smoke per `vitrina-token-live-smoke-2026-05-21.md`.
7. **Test payment $10** only when explicitly approved.

---

## 14. Can deploy? Can test pay?

| Question | Answer |
|----------|--------|
| Push/deploy now? | **No** — AI billing not connected; UI incomplete |
| Test payment now? | **No** — would credit tokens via webhook but studio would not spend them |
| After fixes? | Deploy after build + owner production env; then test payment with owner approval |

---

**One-line verdict (requested format):**

**Verdict: NOT READY — blockers: AI API routes missing `withGenerationBilling`; `TokenBalancePill` not in header; `/cost` copy not updated; deploy would not enforce token spend or guest watermark.**
