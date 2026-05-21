# Vitrina token PR — final review — 2026-05-21

## Verdict

**READY FOR TOKEN PR MERGE AFTER OWNER APPROVAL**

Чистый scope подтверждён. Snapshot (`91d01fa`) **не трогали**. Commit / merge / deploy / payment **не выполнялись**.

---

## Branch & commits

| Item | Value |
|------|--------|
| Worktree | `C:\dev\kaspi-vitrina-tokens` |
| Branch | `feat/vitrina-tokens` |
| Remote | `origin/feat/vitrina-tokens` |
| Base | `origin/main` @ `da461f2` |
| PR URL | https://github.com/loomany/market.kk/pull/new/feat/vitrina-tokens |

### Commits vs `origin/main`

| Hash | Message |
|------|---------|
| `46af3bf` | feat(billing): add Lemon token balance and AI usage gate |
| `89326d8` | docs(release): token worktree packaging report |
| `6cd3e2a` | docs(release): note report commit hash in packaging doc |
| **`00153a5`** | **fix(billing): make token ledger policies idempotent** |

**HEAD:** `00153a5` — migration `drop policy if exists` перед RLS policies (безопасный повторный Run в Supabase SQL Editor).

**59 paths** in `git diff --name-only origin/main...HEAD` (unchanged file count; migration content updated).

---

## Scope check — что в PR

### Token / billing (expected)

- `lib/tokens/**` (9 modules + `wrapAiPost`)
- `lib/payments/lemonSqueezy.ts`
- `lib/images/applyVitrinaWatermark.ts`
- `app/api/tokens/**`, `app/api/webhooks/**`
- `app/[locale]/(marketing)/tokens/page.tsx`
- `components/auth/TokenBalancePill.tsx`, `components/tokens/**`
- `components/studio/TokenBillingModal.tsx`, `TokenChargeHint.tsx`
- `components/landing/SaasHeader.tsx`
- `supabase/migrations/202605210001_token_ledger.sql`
- `scripts/test-tokens-ledger.ts`, `scripts/billing/**`, `scripts/db/**`
- `reports/billing/**`, `reports/release/vitrina-token-worktree-packaging-2026-05-21.md`
- `.env.example` (Lemon placeholders)
- `package.json` (`test:tokens`)

### AI billing gate — 11 routes wrapped

| Route | `wrapAiPost` |
|-------|----------------|
| `tryon` | yes |
| `remove-background` | yes |
| `image/enhance` | yes |
| `generate-model` | yes |
| `product-shot` | yes |
| `scene/generate` | yes |
| `video/generate` | yes |
| `prompt/enhance` | yes |
| `refine-product-mask` | yes |
| `image/preservation-analyze` | yes |
| `analyze-product-angles` | yes |

### Not wrapped (expected)

| Route | `wrapAiPost` |
|-------|----------------|
| `pricing` | no |
| `analyze-product-description` | no |

Uses `wrapAiPost` only (no `withGenerationBilling` / `beginGenerationBilling` in tree).

### Minimal overlaps (allowed for token PR)

| Path | Why in PR |
|------|-----------|
| `components/studio/StudioShell.tsx` | patch-only: pill, billing modal, `tryApplyTokenBillingError` |
| `components/studio/ProcessedAssetsPanel.tsx` | `onTokenBillingError` |
| `lib/studio/generateSingleStudioModel.ts` | `throwIfTokenBillingError` |
| `data/seo/staticPages.ts` | **only** `pricingPage` (/cost tokens copy) |
| `next.config.ts` | `/pricing` → `/:locale/cost` redirects |
| `lib/i18n/localeConfig.ts` | `indexableLocales` (pill + /tokens) |
| `lib/seo/metadata.ts`, `lib/seo/site.ts` | `Partial` pathByLocale for tokens page |
| `lib/studio/productPhotos.ts` | `MAX_CLOTHING_PRODUCT_SET` (angles API) |
| `lib/ai/refineGarmentSelection*.ts` | deps for wrapped `refine-product-mask` |

Note: `tryon/route.ts` matches dirty-tree try-on (incl. Try-On Max paths) for billing parity — **not** full Studio i18n / SEO audience.

---

## Scope check — чего нет в PR

| Excluded | In PR? |
|----------|--------|
| `lib/studio/i18n/**` (full pass-2) | **no** |
| Mass `components/studio/*` i18n | **no** (only 4 studio files above) |
| `data/seo/audiencePages.ts` | **no** |
| Audience routes (`dlya-kogo`, `kimge`, `who-it-is-for`) | **no** (1092 SSG pages vs 1282 on snapshot) |
| `scripts/seo/**` audience builders | **no** |
| Icons/assets (`app/icon.png`, `public/icon-*`, `assets/brand/**`) | **no** |
| `.env.local`, `backup/**`, `.cursor/**` | **no** |
| `reports/ai/*.json` | **no** |

---

## TokenBalancePill mounts

- `components/landing/SaasHeader.tsx`
- `components/studio/StudioShell.tsx`

---

## Checks (`C:\dev\kaspi-vitrina-tokens` @ `00153a5`)

| Command | Result |
|---------|--------|
| `npm run test:tokens` | **PASS** |
| `npm run build` | **PASS** (1092 static pages) |

`npm run check:studio:i18n` **не запускался** на token branch (by design: full Studio i18n вне scope).

### Known non-blocker for token-only PR

`TokenBillingModal.tsx` на token branch всё ещё с локальным `BALANCE_HINT` + hardcoded close/CTA (pre–`a67e6fc` snapshot fix). Исправление с `useStudioCopy()` **только в snapshot** (`a67e6fc`) — **не cherry-pick** в token PR (иначе потянет `studioCopyPass2` / Studio i18n). Для merge token PR это **OK**; для полного Studio i18n merge — брать из snapshot/studio branch позже.

---

## PR / merge / deploy

| Question | Answer |
|----------|--------|
| Открывать PR? | **да** — scope чистый |
| Merge в main сейчас? | **только после OK владельца** (env, migration, webhook, smoke) |
| Deploy сейчас? | **нет** |

### Owner checklist before deploy

1. Production env: `LEMON_SQUEEZY_*`, `APP_SESSION_SECRET`, Supabase service role  
2. Apply `202605210001_token_ledger.sql` on prod (prefer version with `drop policy if exists`)  
3. Lemon webhook → `/api/webhooks`  
4. Live smoke: `reports/billing/vitrina-token-live-smoke-2026-05-21.md`  
5. Apply migration on prod (file includes `drop policy if exists` @ `00153a5`)  
6. **Test payment** — только по явному OK  

---

## Relation to snapshot

| Branch | Role |
|--------|------|
| `snapshot/vitrina-all-work-2026-05-21` @ `91d01fa` | Full safety copy; green `check:studio:i18n` |
| `feat/vitrina-tokens` @ `00153a5` | Clean token-only PR |

**Не смешивать** snapshot i18n fix в token PR без отдельного решения.

---

## Recommended merge order (unchanged)

1. `feat/vitrina-tokens` ← this review  
2. `fix/vitrina-icons-seo-assets`  
3. `feat/vitrina-studio-i18n-ru-en-kk`  
4. `feat/vitrina-seo-audience-pages`

---

## Review metadata

- Snapshot branch: **not modified**
- `feat/vitrina-tokens`: migration fix `00153a5` committed + pushed; review report updated
- Main: **not touched**
- Deploy / test payment: **not done**
