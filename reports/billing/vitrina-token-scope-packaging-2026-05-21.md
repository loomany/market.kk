# Vitrina Tokens — token-scoped commit/push readiness

Date: 2026-05-21  
Branch: `release/vitrina-seo-audience-pages`  
**Commit / push / deploy / payment: NOT performed** (await owner command).

---

## Verdict

**Verdict: READY FOR TOKEN-SCOPED PUSH/DEPLOY after owner confirms production env + Supabase migration — but only with selective `git add`, not `git add -A`.**

Code gates pass (`test:tokens`, `build`, 11 AI routes wrapped, pill mounted).  
**Git packaging risk:** working tree is **mixed** (tokens + Studio i18n pass2 + SEO). `StudioShell.tsx` bundles ~349 lines of i18n refactor with a few token lines.

---

## 1. Git scope audit

### Commands

```bash
git status --short
git branch --show-current   # → release/vitrina-seo-audience-pages
git diff --name-only
```

### Summary counts

| Category | Tracked modified (M) | Untracked (??) |
|----------|----------------------|----------------|
| Token billing (core) | 11× `app/api/ai/*` wrappers, `SaasHeader`, `staticPages`, `next.config`, `package.json`, `.env.example` | tokens API, webhooks, `lib/tokens`, `lib/payments`, `lib/images`, UI, migration, scripts |
| Studio i18n (exclude from token PR) | ~40× `components/studio/*`, `lib/studio/assetDisplayLabels.ts`, `lingerieCropUiCopy.ts` | `lib/studio/i18n/**`, `StudioLocaleContext`, `StudioLanguageSwitcher` |
| SEO / noise (exclude) | `SaasFooter.tsx`, `app/icon.png` (deleted) | `audiencePathMap`, `siteIcons`, `scripts/seo/*`, `assets/`, `public/icon-*`, `.cursor/`, `reports/ai/*.json`, etc. |

**Mixed dirty tree: YES**

---

## 2. Include in token commit (allowlist)

### Core (untracked — add all)

```
lib/tokens/**
lib/payments/lemonSqueezy.ts
lib/images/applyVitrinaWatermark.ts
app/api/tokens/**
app/api/webhooks/**
app/[locale]/(marketing)/tokens/**
components/auth/TokenBalancePill.tsx
components/tokens/**
supabase/migrations/202605210001_token_ledger.sql
scripts/test-tokens-ledger.ts
scripts/billing/          # optional verify helpers
scripts/db/check-db-state.mjs
reports/billing/**        # documentation
```

### Core (modified — add)

```
app/api/ai/analyze-product-angles/route.ts
app/api/ai/generate-model/route.ts
app/api/ai/image/enhance/route.ts
app/api/ai/image/preservation-analyze/route.ts
app/api/ai/product-shot/route.ts
app/api/ai/prompt/enhance/route.ts
app/api/ai/refine-product-mask/route.ts
app/api/ai/remove-background/route.ts
app/api/ai/scene/generate/route.ts
app/api/ai/tryon/route.ts
app/api/ai/video/generate/route.ts
components/landing/SaasHeader.tsx
data/seo/staticPages.ts          # cost/pricing copy only (review diff)
next.config.ts                   # /pricing redirects only
package.json                     # test:tokens script (+ lockfile if deps changed)
.env.example                     # Lemon token env placeholders only
```

### Build dependency (minimal studio — include if PR must build on CI)

Current `npm run build` **requires** untracked studio i18n tree. If token PR is isolated from full studio i18n PR, either:

**Option A — second PR first:** merge studio i18n pass2, then token PR with thin `StudioShell` pill diff.

**Option B — bundle minimal studio deps in token PR:**

```
lib/studio/i18n/**              # full pass2 (large)
components/studio/StudioLocaleContext.tsx
components/studio/StudioLanguageSwitcher.tsx
lib/studio/i18n/index.ts        # includes minimal TS cast fix for build
components/studio/StudioShell.tsx   # ⚠ mixed: i18n + pill (see §2.1)
# + all modified components/studio/* that import useStudioCopy — or build fails
```

**Option C (recommended):** new branch `feat/vitrina-tokens` from `main`, cherry-pick only allowlist files (cleanest history).

### 2.1 `StudioShell.tsx` warning

`git diff --stat`: **349 lines** changed. Includes:

- `TokenBalancePill` (token — want)
- `StudioLocaleProvider` / removal of `useStudioLocale` (studio i18n — separate scope)

**Do not** claim “pill only” if whole file is staged. Use `git add -p` for pill hunk only **only if** rest of i18n already on target branch.

---

## 3. Exclude from token commit (denylist)

```
.env.local
.cursor/**
data/seo/audiencePages.ts
lib/seo/audiencePathMap.ts
app/[locale]/(marketing)/[hub]/**     # audience routes (if present untracked)
scripts/seo/**
assets/**
public/icon-*.png, favicon.ico      # unless separate branding PR
reports/ai/*.json
reports/_verify-256.png
reports/seo/*                       # except reports/billing/**
reports/studio/**
components/landing/SaasFooter.tsx   # unrelated footer change
app/icon.png                        # delete — unrelated
# Mass studio i18n (unless Option B above):
components/studio/* except pill-only hunks
lib/studio/assetDisplayLabels.ts
lib/studio/lingerieCropUiCopy.ts
components/studio/useStudioLocale.ts  # if only deleted in favor of context
```

---

## 4. Token behavior verification

### ripgrep

```bash
rg "wrapAiPost" app/api/ai
# → 11 files (all wrapped routes)

rg "wrapAiPost" app/api/ai/pricing app/api/ai/analyze-product-description
# → no matches (correct)
```

### Wrapped (11)

| Route | OK |
|-------|-----|
| `/api/ai/tryon` | yes |
| `/api/ai/remove-background` | yes |
| `/api/ai/image/enhance` | yes |
| `/api/ai/generate-model` | yes |
| `/api/ai/product-shot` | yes |
| `/api/ai/scene/generate` | yes |
| `/api/ai/video/generate` | yes |
| `/api/ai/prompt/enhance` | yes |
| `/api/ai/refine-product-mask` | yes |
| `/api/ai/image/preservation-analyze` | yes |
| `/api/ai/analyze-product-angles` | yes |

### Not wrapped (2)

| Route | OK |
|-------|-----|
| `/api/ai/pricing` | not wrapped |
| `/api/ai/analyze-product-description` | not wrapped |

### TokenBalancePill mounts

| Location | File |
|----------|------|
| Marketing header | `components/landing/SaasHeader.tsx` |
| Studio header | `components/studio/StudioShell.tsx` |

### Commands

```bash
npm run test:tokens   # ok
npm run build         # ok
```

---

## 5. Supabase production (re-check)

```bash
node scripts/db/check-db-state.mjs
```

| Object | Status |
|--------|--------|
| `user_token_balances` | exists |
| `token_transactions` | exists |
| `credit_purchased_tokens` | exists |
| `spend_user_tokens` | exists |

Migration already applied on project `zghgdalgtiopzsvtpsie`.

---

## 6. Owner checklist (before deploy — not done by agent)

### Hosting env (Vercel)

| Variable | Value |
|----------|--------|
| `LEMON_SQUEEZY_STORE_ID` | `336165` |
| `LEMON_TOKENS_VARIANT_ID` | `1683775` |
| `NEXT_PUBLIC_SITE_URL` | `https://vitrina.help` |
| `APP_SESSION_SECRET` | dedicated random (not `SUPABASE_SERVICE_ROLE_KEY`) |
| `LEMON_SQUEEZY_API_KEY` | set |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | set |
| `SUPABASE_SERVICE_ROLE_KEY` | set |

### Supabase SQL

```sql
select tablename from pg_tables
where schemaname = 'public'
  and tablename in ('user_token_balances', 'token_transactions');

select proname from pg_proc
where proname in ('credit_purchased_tokens', 'spend_user_tokens');
```

### Lemon dashboard

- Variant **1683775**, **$10**, one-time, **published**
- Webhook: `https://vitrina.help/api/webhooks`
- Receipt → `https://vitrina.help/ru/tokens`
- Billing via site `/ru/tokens` → checkout API (not share-link)

### After deploy

- Live-smoke: `reports/billing/vitrina-token-live-smoke-2026-05-21.md`
- Test payment **$10** only on explicit owner approval

---

## 7. Suggested owner git workflow (when command given)

```bash
# Prefer new branch from main
git fetch origin
git checkout -b feat/vitrina-tokens origin/main   # or appropriate base

# Stage allowlist only (example — adjust paths)
git add lib/tokens lib/payments lib/images
git add app/api/tokens app/api/webhooks
git add app/api/ai/analyze-product-angles/route.ts ... # all 11 wrappers
git add app/[locale]/(marketing)/tokens
git add components/auth/TokenBalancePill.tsx components/tokens
git add components/landing/SaasHeader.tsx
git add data/seo/staticPages.ts next.config.ts package.json package-lock.json
git add supabase/migrations/202605210001_token_ledger.sql
git add scripts/test-tokens-ledger.ts .env.example reports/billing

# Review StudioShell / studio i18n separately before:
# git add components/studio/StudioShell.tsx

git status
git commit -m "feat(billing): Lemon token top-up, ledger, AI billing gate"
git push -u origin feat/vitrina-tokens
# gh pr create — not main direct push
```

---

## 8. Ready for token-scoped push?

| Gate | Status |
|------|--------|
| `test:tokens` | OK |
| `npm run build` (current tree) | OK |
| AI routes wrapped | OK (11/11) |
| TokenBalancePill | OK |
| Production Supabase | OK |
| Clean git scope without discipline | **NO** (mixed tree) |
| Token-scoped push with selective add / new branch | **YES** |
| Deploy / payment | **Owner only** |

---

## One-line verdict

**Verdict: READY FOR TOKEN-SCOPED PUSH/DEPLOY after owner confirms production env + Supabase migration + uses selective commit (not `git add -A` on `release/vitrina-seo-audience-pages`).**
