# Stage 16.1 — Audience SEO acceptance regression

**Date:** 2026-05-20  
**Mode:** Acceptance audit + **one route fix** (blocker)  
**Production deploy/push:** not performed

---

## Executive verdict

**READY WITH CONDITIONS** for SEO-only branch push.

| Area | Result |
|------|--------|
| Automated SEO gates | **PASS** |
| Sitemap / hreflang / canonical (policy) | **PASS** (+30 audience URLs) |
| Local HTTP 200 / 404 (after fix) | **PASS** on `:3007` |
| `npm run build` in this session | **NOT RE-RUN** (concurrent Turbopack lock / disk error) |
| Live `vitrina.help` | **Not verified** (out of scope) |

**Blocker found and fixed during 16.1:** Next.js could not compile routes because `(marketing)/[slug]` and `(marketing)/[hub]/[slug]` used different dynamic segment names at the same level (`slug` vs `hub`). Dev server on `:3006` had exited with that error.

**Fix (minimal):** Removed `[hub]/[slug]`; added literal hubs `dlya-kogo/`, `who-it-is-for/`, `kimge/` each with `[slug]/page.tsx` sharing `lib/seo/audienceDetailRoute.tsx`.

Re-run `npm run build` once locally before push (clean `.next` if lock persists).

---

## 1. URL HTTP checks (localhost:3007, after route fix)

| URL | Status |
|-----|--------|
| `/ru/dlya-kogo/prodavtsy-marketpleysov` | **200** |
| `/ru/dlya-kogo/prodavtsy-odezhdy` | **200** |
| `/ru/dlya-kogo/prodavtsy-bizhuterii` | **200** |
| `/en/who-it-is-for/marketplace-sellers` | **200** |
| `/en/who-it-is-for/clothing-sellers` | **200** |
| `/en/who-it-is-for/jewelry-sellers` | **200** |
| `/kk/kimge/marketplace-satushylary` | **200** |
| `/kk/kimge/kiim-satushylary` | **200** |
| `/kk/kimge/bizhuteriya-satushylary` | **200** |
| `/ru/dlya-kogo/test-not-exist` | **404** |
| `/en/who-it-is-for/test-not-exist` | **404** |
| `/kk/kimge/test-not-exist` | **404** |

Initial check on `:3006` failed (connection refused) — old dev process had crashed on the route conflict.

---

## 2. Landing `#audiences` links

| Check | Result |
|-------|--------|
| RU chip → `/ru/dlya-kogo/...` | **OK** (sample href in `/ru` HTML) |
| `getAudienceChips` | 10 chips per ru/en/kk (`check:seo:audience-pages`) |
| Locale-specific hubs | RU `dlya-kogo`, EN `who-it-is-for`, KK `kimge` |

Hover/focus classes present on chips (not manually screenshot-tested).

---

## 3. SEO metadata sample

Page: `/ru/dlya-kogo/prodavtsy-marketpleysov` (dev `:3007`, `.env.local` with production-shaped site URL)

| Field | Value |
|-------|--------|
| title | Unique (`AI-фото товаров для продавцов маркетплейсов — Vitrina AI Studio`) |
| description | Present (238 chars) |
| canonical | `https://vitrina.help/ru/dlya-kogo/prodavtsy-marketpleysov` (no localhost) |
| robots | `index, follow` |
| hreflang | `ru`, `en`, `kk`, `x-default` → vitrina.help triad |
| uz/ky/tg/global | **Absent** |

Note: title template may append `| Vitrina AI Studio` twice — cosmetic, not a gate failure.

---

## 4. Hreflang

Sample triad for `marketplace-sellers` id:

- `ru` → `/ru/dlya-kogo/prodavtsy-marketpleysov`
- `en` → `/en/who-it-is-for/marketplace-sellers`
- `kk` → `/kk/kimge/marketplace-satushylary`
- `x-default` → RU path (project policy)

`npm run smoke:seo:hreflang` — **PASS** (blog + trust; audience uses same `buildLanguageAlternates` + `audiencePathByLocale`).

---

## 5. Sitemap (`NEXT_PUBLIC_SITE_URL=https://vitrina.help`)

| Metric | Stage 14 baseline | After Stage 16 |
|--------|-------------------|----------------|
| **Total** | 220 | **250** (+30) |
| **RU** | 93 | **103** (+10) |
| **EN** | 93 | **103** (+10) |
| **KK** | 34 | **44** (+10) |

**Audience URLs added:** 30 (10 × ru/en/kk), published + indexable via `KK_APPROVED_AUDIENCE_IDS`.

`npm run smoke:seo:prelaunch` — **0 failures**, `isProductionSiteUrl: true`, no `/studio`, no localhost/your-domain in sitemap audit.

---

## 6. Full command matrix

| Command | Result |
|---------|--------|
| `npm run audience:build` | **PASS** |
| `npm run check:seo:audience-pages` | **PASS** |
| `npm run check:seo:content` | **PASS** (RU+EN 40+40 blog) |
| `npm run check:seo:trust` | **PASS** |
| `npm run check:seo:examples` | **PASS** |
| `npm run smoke:seo:public` | **PASS** |
| `npm run smoke:seo:hreflang` | **PASS** |
| `NEXT_PUBLIC_SITE_URL=https://vitrina.help npm run smoke:seo:prelaunch` | **PASS** |
| `npx tsc --noEmit` | **Not clean** (stale `.next/dev/types` after route change; run after clean build) |
| `npm run build` | **Blocked** in session (parallel build / Turbopack write error) |

---

## 7. Code changes in 16.1 (bugfix only)

| File | Change |
|------|--------|
| `lib/seo/audienceDetailRoute.tsx` | **NEW** shared route handlers |
| `app/[locale]/(marketing)/dlya-kogo/[slug]/page.tsx` | **NEW** |
| `app/[locale]/(marketing)/who-it-is-for/[slug]/page.tsx` | **NEW** |
| `app/[locale]/(marketing)/kimge/[slug]/page.tsx` | **NEW** |
| `app/[locale]/(marketing)/[hub]/[slug]/page.tsx` | **DELETED** (conflict) |

No Studio / auth / billing / AI / `.env*` changes.

---

## 8. Git status (summary)

**Stage 16 audience SEO (representative):**

- `data/seo/audiencePages.ts`
- `lib/seo/audiencePaths.ts`, `audiencePagePaths.ts`, `audienceDetailRoute.tsx`
- `app/[locale]/(marketing)/dlya-kogo/`, `who-it-is-for/`, `kimge/`
- `components/seo-pages/AudienceSeoPage.tsx`
- `components/landing/SaasLanding.tsx` (clickable chips)
- `app/sitemap.ts`, `lib/seo/kkIndexPolicy.ts`
- `scripts/seo/build-audience-pages.mjs`, `check-seo-audience-pages.ts`
- `package.json` (`audience:build`, `check:seo:audience-pages`)

**Also dirty (not Stage 16 core):** landing shell/icons, `(marketing)` route group moves, studio files, token migration, `reports/ai/fal-*.json`, etc. — **exclude from SEO-only commit**.

---

## 9. Push recommendation

| Action | Allowed now? |
|--------|----------------|
| SEO-only commit to **dedicated branch** | **Yes**, after local `npm run build` passes once |
| Push `main` blind | **No** (mixed tree / studio) |
| Deploy production | **No** (separate owner approval) |

Stage 16 audience work is **accepted** for branch packaging once build is green on the fixed routes.
