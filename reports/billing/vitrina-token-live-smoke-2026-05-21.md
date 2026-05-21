# Vitrina Tokens — deploy prep + live-smoke (2026-05-21)

Date: 2026-05-21  
Site: https://vitrina.help  
Scope: production env + Supabase migration + deploy gates + live-smoke checklist.  
**No deploy, no push, no test payment** — only prep and local gates unless owner explicitly orders otherwise.

Related: [string custom_data fix](./vitrina-lemon-checkout-string-custom-fix-2026-05-21.md), [Lemon recheck](./vitrina-lemon-checkout-recheck-2026-05-21.md), [production readiness](./vitrina-token-production-readiness-2026-05-21.md).

---

## Executive summary

| Gate | Status |
|------|--------|
| Lemon API checkout (string `custom_data`) | **OK** (201 in prior verify) |
| `npm run test:tokens` | **OK** |
| `npm run build` | **OK** (after small Studio/i18n TS fixes — see §8) |
| Production hosting env | **Owner verify** — checklist below |
| Supabase production migration | **Owner verify** — SQL below |
| Lemon dashboard (webhook, receipt) | **Owner verify** |
| Live checkout / payment / webhook / spend / guest | **Not run** — blocked on deploy + owner payment approval |

**Verdict:** код и локальные гейты готовы к deploy. Следующий шаг — владелец подтверждает production env + migration, даёт команду на deploy, затем live-smoke по §6.

---

## 1. Production hosting env

Агент **не имеет доступа** к Vercel/hosting dashboard. Перед deploy владелец проверяет вручную (значения не коммитить).

| Variable | Required value / rule | Production verified? |
|----------|----------------------|----------------------|
| `LEMON_SQUEEZY_API_KEY` | set (server-only) | ☐ owner |
| `LEMON_SQUEEZY_STORE_ID` | **`336165`** (не `1683778`) | ☐ owner |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | = Lemon webhook signing secret | ☐ owner |
| `LEMON_TOKENS_VARIANT_ID` | **`1683775`** (one-time 10 tokens) | ☐ owner |
| `NEXT_PUBLIC_SITE_URL` | `https://vitrina.help` | ☐ owner |
| `SUPABASE_SERVICE_ROLE_KEY` | set | ☐ owner |
| `APP_SESSION_SECRET` | **отдельный** random secret (32+ bytes), **не** fallback на service role | ☐ owner |

### Must NOT use for token checkout

| Wrong | Why |
|-------|-----|
| Product id `1074150` in `LEMON_TOKENS_VARIANT_ID` | это product id, не variant |
| Store `1683778` | старый неверный store |
| UUID slug `264e6563-f4da-46c1-8a54-13f8a30ddad6` в env | slug checkout URL, не variant id |
| `LEMON_SQUEEZY_VARIANT_ID_MONTHLY` | subscription only; token checkout uses `LEMON_TOKENS_VARIANT_ID` only |

### Local `.env.local` snapshot (keys only, 2026-05-21)

| Variable | Local |
|----------|-------|
| `LEMON_SQUEEZY_STORE_ID` | `336165` ✓ |
| `LEMON_TOKENS_VARIANT_ID` | `1683775` ✓ |
| `LEMON_SQUEEZY_API_KEY` | present ✓ |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | present ✓ |
| `NEXT_PUBLIC_SITE_URL` | `https://vitrina.help` ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | present ✓ |
| `APP_SESSION_SECRET` | **missing** locally — **must** be set on production |

Generate for production:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 2. Supabase production migration

**File:** `supabase/migrations/202605210001_token_ledger.sql`

**Если миграция не применена — deploy оплаты не делать.**

### Verify in production SQL Editor

```sql
select tablename
from pg_tables
where schemaname = 'public'
  and tablename in ('user_token_balances', 'token_transactions');

select proname
from pg_proc
where proname in ('credit_purchased_tokens', 'spend_user_tokens');
```

**Expected:**

- `user_token_balances`
- `token_transactions`
- `credit_purchased_tokens`
- `spend_user_tokens`

| Check | Production |
|-------|------------|
| Tables exist | ☐ owner |
| RPC exist | ☐ owner |

---

## 3. Lemon dashboard (owner)

| Item | Expected |
|------|----------|
| Product | Vitrina Tokens |
| Variant ID | **1683775** |
| Type | one-time |
| Price | **$10.00** |
| Status | published |
| Webhook URL | `https://vitrina.help/api/webhooks` |
| Webhook secret | = `LEMON_SQUEEZY_WEBHOOK_SECRET` |
| Receipt button | «View my tokens» → `https://vitrina.help/ru/tokens` |
| Copy | без Dordoi.help |

| Check | Verified? |
|-------|-----------|
| Dashboard matches above | ☐ owner |

**Note:** static share link `…/checkout/buy/264e6563-…` may 302→404 in HTTP probes — **не использовать** как основной billing flow. Billing только через сайт: `/ru/tokens` → **Купить 10 токенов** → `POST /api/tokens/checkout`.

---

## 4. Local pre-deploy gates

```bash
npm run test:tokens   # ok — 2026-05-21
npm run build         # ok — 2026-05-21
```

Routes present after build: `/[locale]/tokens`, `/api/tokens/checkout`, `/api/tokens/balance`, `/api/webhooks`.

---

## 5. Deploy

**Deploy только после:**

- [ ] production env (§1)
- [ ] Supabase migration (§2)
- [ ] Lemon variant published + webhook (§3)
- [ ] `npm run test:tokens` + `npm run build` ok
- [ ] **явная команда владельца** на push/deploy

**Deploy / push / payment:** not performed by agent.

---

## 6. Live-smoke (after deploy + owner payment approval)

Проверять **только через сайт**, не через Lemon share-link.

### A. Checkout

| Step | Expected | Result |
|------|----------|--------|
| Login on https://vitrina.help/ru | — | ☐ |
| Open `/ru/tokens` | page loads | ☐ |
| Click «Купить 10 токенов» | Lemon checkout opens | ☐ |
| Price | $10.00 | ☐ |
| Product | Vitrina Tokens / 10 Tokens | ☐ |

### B. Payment + webhook

**Only after owner allows test payment ($10).**

| Step | Expected | Result |
|------|----------|--------|
| Pay $10 | success | ☐ |
| Return `/ru/tokens?checkout=success` | UI ok; balance may be 0 briefly | ☐ |
| After webhook | balance **10** | ☐ |
| Supabase `token_transactions` | `type = purchase` | ☐ |

**Not credited on success URL alone** — webhook only.

### C. Idempotency

| Step | Expected | Result |
|------|----------|--------|
| Lemon → Resend webhook | balance stays **10**, not 20 | ☐ |

### D. Spend

| Step | Expected | Result |
|------|----------|--------|
| One real AI generation with balance 10 | balance **9** | ☐ |
| Paid user result | no watermark | ☐ |

### E. Guest

| Step | Expected | Result |
|------|----------|--------|
| Logout / incognito, 1 guest generation | watermark `vitrina.help` | ☐ |
| Second guest generation | blocked | ☐ |

---

## 7. Results table (fill after live-smoke)

| Question | Answer |
|----------|--------|
| Production env set correctly? | pending owner |
| Supabase migration applied? | pending owner |
| Checkout via `/ru/tokens` opened? | not tested |
| Payment succeeded? | not tested (no owner payment order) |
| Webhook received? | not tested |
| Balance became 10? | not tested |
| Webhook resend duplicated? | not tested |
| Generation spent 1 token? | not tested |
| Guest watermark + block? | not tested |

---

## 8. Code fixes applied for deploy gate (same session)

Unrelated to Lemon `custom_data`, but blocked `npm run build`:

| File | Fix |
|------|-----|
| `components/studio/StudioShell.tsx` | `resolveAiError` callback called itself; now uses `friendlyAiError` |
| `lib/studio/i18n/index.ts` | `studioCopy` satisfies `Record<"ru"\|"en"\|"kk", StudioCopy>` |
| `lib/studio/i18n/studioOptionLists.ts` | `getModelScenarioLabel` accepts any locale string (falls back via `getStudioCopy`) |
| `lib/studio/lingerieCropUiCopy.ts` | `defaultLocale` → `toStudioLocale("ru")` |

Token billing code unchanged in this pass except build unblockers.

---

## 9. Remaining blockers

1. **Owner:** confirm production env (especially `APP_SESSION_SECRET`, `LEMON_TOKENS_VARIANT_ID=1683775`, `LEMON_SQUEEZY_STORE_ID=336165`).
2. **Owner:** run Supabase migration on production if not applied.
3. **Owner:** Lemon dashboard webhook + receipt link check.
4. **Owner:** explicit command to **push + deploy**.
5. **Owner:** explicit command to run **$10 test payment** before §6 B–E.
6. **Optional:** browser-check share link (not primary flow); in-app checkout is canonical.

---

## 10. Owner command cheat sheet

When ready, owner can say:

1. «Деплой» — push/deploy with env + migration confirmed.
2. «Тестовый платёж $10» — run §6 B–C on production.
3. «Полный smoke» — run §6 A–E and update §7 in this file.

Commit / push / deploy / payment **not performed** in this session.
