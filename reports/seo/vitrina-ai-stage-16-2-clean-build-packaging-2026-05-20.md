# Vitrina AI — Stage 16.2 Clean Build + SEO-Only Branch Packaging

**Date:** 2026-05-20  
**Branch:** `release/vitrina-seo-audience-pages`  
**Audience commit:** `a9df2eb` — `seo: add RU EN KK audience landing pages`  
**Push:** yes → `origin/release/vitrina-seo-audience-pages` (not `main`)  
**Deploy:** not performed

---

## 1. Build and checks

| Check | Result |
|-------|--------|
| Stale `.next` removed | yes |
| `npm run audience:build` | **PASS** |
| `npm run check:seo:audience-pages` | **PASS** |
| `npm run check:seo:content` | **PASS** |
| `npm run check:seo:trust` | **PASS** |
| `npm run check:seo:examples` | **PASS** |
| `npm run smoke:seo:public` | **PASS** |
| `npm run smoke:seo:hreflang` | **PASS** |
| `NEXT_PUBLIC_SITE_URL=https://vitrina.help npm run smoke:seo:prelaunch` | **PASS** |
| `npx tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** (after clean `.next`; 1281 static pages) |

**Note:** Production build on commit `a9df2eb` uses branch base `6c64179` (includes prior Studio commit in **history**, not in the audience commit diff). Build on `7611ea0` alone failed TypeScript in `StudioShell` (missing `FAL_MODEL_ASPECT_RATIOS` import); audience packaging rebased onto `6c64179` so `npm run build` stays green without editing `components/studio/**`.

---

## 2. Sitemap

| Metric | Value |
|--------|------:|
| Total URLs | **250** |
| ru | 103 |
| en | 103 |
| kk | 44 |
| Audience delta vs Stage 15 | **+30** |

---

## 3. SEO commit (`a9df2eb`) — included files

**Core audience (user list):**

- `data/seo/audiencePages.ts`
- `scripts/seo/build-audience-pages.mjs`
- `scripts/seo/check-seo-audience-pages.ts`
- `components/seo-pages/AudienceSeoPage.tsx`
- `components/landing/SaasLanding.tsx`
- `lib/seo/audiencePaths.ts`
- `lib/seo/audiencePagePaths.ts`
- `lib/seo/audienceDetailRoute.tsx`
- `app/[locale]/(marketing)/dlya-kogo/[slug]/page.tsx`
- `app/[locale]/(marketing)/who-it-is-for/[slug]/page.tsx`
- `app/[locale]/(marketing)/kimge/[slug]/page.tsx`
- `app/sitemap.ts`
- `lib/seo/kkIndexPolicy.ts`
- `package.json` (only `audience:build`, `check:seo:audience-pages`)
- `reports/seo/vitrina-ai-stage-16-audience-pages-2026-05-20.md`
- `reports/seo/vitrina-ai-stage-16-1-audience-acceptance-2026-05-20.md`

**Route migration required for build (Stage 16.1 fix, documented here):**

- `app/[locale]/(marketing)/layout.tsx`
- `app/[locale]/(marketing)/page.tsx`, `[slug]`, `blog`, `examples`, `features`, `platforms`, `use-cases`, `ai-summary` (moved from `app/[locale]/…`)
- `components/landing/MarketingShell.tsx`
- `components/landing/SaasHeader.tsx`
- `lib/landing/marketingFooterProps.ts`

**Not staged:** `package-lock.json` (no new dependencies for audience scripts).

---

## 4. Excluded from SEO commit (left in working tree / other branches)

- `components/studio/**`, `lib/studio/**`, `lib/ai/**`, `app/api/ai/**`
- `app/api/tokens/**`, `app/api/webhooks/**`, `lib/payments/**`, `lib/tokens/**`, `components/tokens/**`
- `app/[locale]/(marketing)/tokens/page.tsx` (billing UI)
- `supabase/migrations/*token*`
- `reports/ai/fal-*.json`, other `reports/ai/**`
- `.env*`, `.cursor/`
- Icon pipeline: `scripts/seo/generate-site-icons.mjs`, `lib/seo/siteIcons.ts`, `public/favicon*.png`, `sharp` / `to-ico` in `package.json`
- Helper scripts not needed at runtime: `audience-pages-copy.mjs`, `_merge-audience-copy.mjs`, etc.
- `lib/seo/audiencePathMap.ts` (duplicate of `audiencePagePaths.ts`, unused)
- `components/landing/SaasFooter.tsx` WIP (not required for green build on this base)

---

## 5. Branch ancestry (for reviewers)

```
a9df2eb seo: add RU EN KK audience landing pages   ← SEO-only diff (32 files)
6c64179 feat(studio): product card workflow…       ← Studio (not in a9df2eb)
7611ea0 seo: prepare RU/EN/KK marketing site…      ← Stages 1–13 SEO
```

To merge **only** audience SEO onto `main` without Studio: cherry-pick `a9df2eb` onto a clean base, or open a PR from this branch and exclude `6c64179` via target branch strategy.

---

## 6. Verdict

| Criterion | Status |
|-----------|--------|
| `npm run build` PASS | yes |
| `tsc` PASS | yes |
| SEO commit free of Studio/auth/billing/token/AI file changes | yes (`a9df2eb` diff) |
| Push only to `release/vitrina-seo-audience-pages` | yes |
| Deploy | **no** |

**Stage 16.2:** accepted for packaging. Safe next step: PR review / cherry-pick to production branch — **not deploy** until product sign-off.
