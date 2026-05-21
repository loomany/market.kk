# Vitrina Tokens — pre-deploy blockers fix

Date: 2026-05-21  
Follows: [final pre-deploy recheck](./vitrina-token-final-predeploy-recheck-2026-05-21.md)

**No deploy / no push / no test payment.**

---

## Verdict

**Verdict: READY FOR DEPLOY after owner confirms production env + re-run smoke checklist.**

Token billing is wired to AI routes; UI pill mounted; `/cost` copy updated; `/pricing` redirect added. `npm run build` and `npm run test:tokens` pass.

---

## What was fixed

### 1. AI billing gate (11 routes)

Added `lib/tokens/wrapAiPost.ts` and wrapped POST handlers:

| Route | `operationType` |
|-------|-----------------|
| `/api/ai/tryon` | `try-on` |
| `/api/ai/remove-background` | `background` |
| `/api/ai/image/enhance` | `enhance` |
| `/api/ai/generate-model` | `model-generation` |
| `/api/ai/product-shot` | `product-shot` |
| `/api/ai/scene/generate` | `scene` |
| `/api/ai/video/generate` | `video` |
| `/api/ai/prompt/enhance` | `prompt-enhance` |
| `/api/ai/refine-product-mask` | `mask-refine` |
| `/api/ai/image/preservation-analyze` | `preservation-analyze` |
| `/api/ai/analyze-product-angles` | `angles-analyze` |

**Not wrapped (unchanged):** `/api/ai/pricing`, `/api/ai/analyze-product-description`

Behavior (from `generationBilling.ts`):

- `AI_MOCK_MODE ≠ "0"` skip → no spend / no guest watermark path
- Logged-in, balance &lt; 1 → **402** `INSUFFICIENT_TOKENS`
- Logged-in, success → spend 1 token after `ok: true`
- Guest → 1 free run + `vitrina.help` watermark; 2nd blocked
- Provider failure (`ok: false`) → no spend

### 2. TokenBalancePill in UI

- `components/landing/SaasHeader.tsx` — pill + `WhatsAppLoginModal` (marketing)
- `components/studio/StudioShell.tsx` — pill before account modal (studio)

Pill shows only when signed in; links to `/{locale}/tokens`.

### 3. `/cost` copy (ru / en / kk)

Updated `data/seo/staticPages.ts` `pricingPage`:

- 1 token = $1
- 1 AI task = 1 token
- 10 tokens / $10 top-up
- guest + demo notes
- CTA link to `/{locale}/tokens`

**Not changed:** audience pages, sitemap, robots, hreflang.

### 4. `/pricing` redirect

`next.config.ts`:

- `/pricing` → `/ru/cost`
- `/:locale/pricing` → `/:locale/cost`

### 5. Build blocker (microfix, studio i18n)

`lib/studio/i18n/index.ts` — relaxed `mergePass2` / `mergeCopy` types so EN/KK pass2 literals compile. **No copy/prompt changes.**

---

## Commands run

```bash
npm run test:tokens   # ok
npm run build         # ok
```

---

## Unchanged (per constraints)

- Lemon env / variant / webhook route
- Supabase migration
- AI prompts / FASHN / Fal / OpenAI logic
- Monthly Lemon subscription flow
- Success URL does not credit tokens

---

## Git scope review (before push)

**Token billing — include in token PR:**

- `lib/tokens/wrapAiPost.ts` (new)
- `lib/tokens/*`, `lib/payments/*`
- `app/api/tokens/*`, `app/api/webhooks/*`
- `app/api/ai/**` (wrap only)
- `app/[locale]/(marketing)/tokens/`
- `components/auth/TokenBalancePill.tsx`, `components/tokens/*`
- `components/landing/SaasHeader.tsx`, `components/studio/StudioShell.tsx` (pill only)
- `data/seo/staticPages.ts` (cost section only)
- `next.config.ts` (redirects only)
- `supabase/migrations/202605210001_token_ledger.sql`

**Split out if possible (not required for tokens):**

- Full studio i18n pass2 (`lib/studio/i18n/**`, many `components/studio/*`)
- SEO audience pages (`data/seo/audiencePages.ts`, marketing routes)
- Reports, `scripts/seo/*`, icon assets

Do **not** commit `.env.local`.

---

## Owner next steps

1. Confirm production env (Lemon + Supabase + `APP_SESSION_SECRET`).
2. Push/deploy **token-scoped** commit(s) only.
3. Live-smoke: [vitrina-token-live-smoke-2026-05-21.md](./vitrina-token-live-smoke-2026-05-21.md)
4. Test payment **$10** only when explicitly approved.

---

## One-line verdict

**Verdict: READY FOR DEPLOY after owner confirms production env + Supabase migration + live-smoke.**
