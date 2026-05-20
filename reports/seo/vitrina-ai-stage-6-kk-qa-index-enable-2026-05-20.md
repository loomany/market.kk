# Vitrina AI — Stage 6 KK QA + Controlled Index Enable

**Date:** 2026-05-20  
**Status:** Complete — approved KK pages indexable; controlled rollout  
**Commit/push:** Not performed

---

## 1. Baseline (Stages 1–5 intact)

| Area | Status |
|------|--------|
| RU/EN 20+20 articles, hreflang pairs | PASS |
| Stage 1 SEO infra (robots, icons, OG) | Unchanged policy + kk extension |
| Studio / AI pipeline / auth / billing | Not modified for Stage 6 |
| uz/ky/tg/global | Not opened |

---

## 2. Dirty tree (`git status --short`)

### A. Stage 1 SEO infra
`app/robots.ts`, `app/sitemap.ts`, `lib/seo/site.ts`, `lib/seo/metadata.ts`, `lib/seo/qualityGate.ts`, `lib/i18n/localeConfig.ts`, language switcher, manifest/icons/OG, Stage 1 report.

### B. Stage 2 RU content
`data/seo/ruBlogStage2Content.ts`, `ruFeatureLandingEnhancements.ts`, Stage 2 report.

### C. Stage 2.1 build fix
Stage 2.1 report, locale/blog routing fixes.

### D. Stage 3 EN content
`enBlogStage3Content.ts`, `enFeatureLandingEnhancements.ts`, Stage 3 report.

### E. Stage 4 EN polish
`enBlogStage4LegacyContent.ts`, `smoke-hreflang-pairs.ts`, Stage 4 report.

### F. Stage 5 KK foundation
`kkBlogStage5Content.ts`, `kkFeatureLandingEnhancements.ts`, `kk-glossary`, `check-seo-kk-content.ts`, Stage 5 report.

### G. Stage 6 (this task)
- `lib/seo/kkIndexPolicy.ts` — approved KK scope registry
- `lib/i18n/localeConfig.ts` — `indexableLocales`: ru, en, **kk**
- `data/seo/blogTopics.ts` — kk status **published** (10 topics)
- `lib/i18n/translations.ts` — kk home **published**
- `data/seo/staticPages.ts` — kk approved features **published**; video **ready_for_review** + `indexPolicy: noindex`
- `app/sitemap.ts` — dynamic paths per `indexableLocales` + `shouldIndexPage`
- `app/[locale]/page.tsx`, `[slug]/page.tsx`, `blog/[slug]/page.tsx` — hreflang via indexable locales
- `lib/i18n/switchLocalePath.ts` — kk triads + noindex video fallback → `/kk`
- `scripts/seo/check-seo-kk-content.ts`, `smoke-hreflang-pairs.ts`, `smoke-public-routes.ts`
- `scripts/seo/kk-blog-full-prose.mjs` — prose expansion restored (850+ words)
- This report

### H. Unrelated (exclude from SEO-only commit)
`components/studio/**`, `lib/ai/**`, `app/api/ai/**`, `lib/studio/**`, `reports/ai/*`

---

## 3. KK QA table

Automated QA: `npm run check:seo:kk-content` + manual review of glossary/terms. **OpenAI not used.**

| URL | Type | QA status | Issues | approved_for_index |
|-----|------|-----------|--------|-------------------|
| `/kk` | Home | approved_for_index | KK Cyrillic, CTA localized, no EN/RU fallback | **true** |
| `/kk/cost` | Pricing | approved_for_index | Kaspi disclaimer, FAQ kk | **true** |
| `/kk/ai-onim-foto-studiyasi` | Feature | approved_for_index | Glossary terms, FAQ, Studio CTA | **true** |
| `/kk/marketpleisterge-onim-fotosy` | Feature | approved_for_index | Marketplace/Kaspi tone | **true** |
| `/kk/kiim-ai-model-fotosy` | Feature | approved_for_index | Adult catalog notes | **true** |
| `/kk/onim-fon-generator` | Feature | approved_for_index | Background workflow | **true** |
| `/kk/zergerlik-onim-fotosy` | Feature | approved_for_index | Jewelry QA copy | **true** |
| `/kk/onim-video-generator` | Feature | keep_noindex | In-dev honest copy; `indexPolicy: noindex` | **false** |
| `/kk/blog/kaspi-ushin-onim-fotosy` | Blog | approved_for_index | 1586 words, Kaspi focus | **true** |
| `/kk/blog/ai-onim-fotografiyasi` | Blog | approved_for_index | 1329 words | **true** |
| `/kk/blog/marketpleisterge-onim-fotosu-kalay-zhasau` | Blog | approved_for_index | 1254 words | **true** |
| `/kk/blog/onim-ushin-ak-fon-kalay-zhasau` | Blog | approved_for_index | 1294 words | **true** |
| `/kk/blog/fotosurysyz-onim-fotosyn-zhetildiru` | Blog | approved_for_index | 1253 words | **true** |
| `/kk/blog/kadirdik-onim-fotosynan-kartochka` | Blog | approved_for_index | 1229 words | **true** |
| `/kk/blog/kiim-ai-model-fotosy` | Blog | approved_for_index | 1229 words | **true** |
| `/kk/blog/kiimdi-ai-modelge-kiyu` | Blog | approved_for_index | 1149 words | **true** |
| `/kk/blog/ish-kiyim-ai-model-fotosy` | Blog | approved_for_index | 1162 words, adult-only | **true** |
| `/kk/blog/onim-fonyn-alu` | Blog | approved_for_index | 1183 words | **true** |
| Other `/kk/*` (platforms, use-cases, legal, uz/ky…) | Various | keep_noindex | No kk published content / needs_review | **false** |

**Minor fixes applied in Stage 6:** Restored KK blog prose expansion pipeline (`kk-blog-full-prose.mjs` + `kk-blog-fourth-paras.mjs`) so all 10 articles meet ≥850 words and meta ≤170 chars after rebuild.

---

## 4. Approved vs noindex summary

### Approved for index (18 URL groups + section indexes)
- Home, cost, 5 feature landings (not video)
- 10 blog articles (ru/en/kk **triads**)
- Section hubs: `/kk/features`, `/kk/blog`, `/kk/platforms`, `/kk/use-cases`, `/kk/ai-summary` (indexable when locale published — kk home published)

### Remain noindex
- `/kk/onim-video-generator` — `ready_for_review` + `indexPolicy: noindex`
- Legal pages (privacy, terms, …) — `needs_review`
- Platform/use-case detail pages — no kk **published** copy
- 90 blog topics without kk translation
- uz/ky/tg/global locales

---

## 5. Hreflang / sitemap policy (after Stage 6)

| Rule | Implementation |
|------|----------------|
| `indexableLocales` | `ru`, `en`, `kk` |
| Sitemap | Only URLs passing `shouldIndexPage` for each locale |
| Blog triads (10) | hreflang `ru` + `en` + `kk` + `x-default` → **ru** |
| Blog pairs (10) | hreflang `ru` + `en` + `x-default` → **ru** (no kk) |
| x-default | **ru** (unchanged) |
| kk in sitemap | Yes, for approved pages only |
| No draft/404 in sitemap | Enforced by `shouldIndexPage` + path builders |

---

## 6. Language switcher

- **Public switcher:** ru / en / **kk** (`indexableLocales` in `LanguageSwitcher.tsx`)
- **Path preservation:** `resolveLocaleSwitchPath` — kk blog triads, static features, cost
- **Safe fallback:** RU product video → `/kk` (not noindex kk video page)
- **No 404** to unpublished kk blog slugs (falls back to `/kk/blog`)

---

## 7. OpenAI

| Item | Value |
|------|-------|
| Used | **No** |
| Model / cost | N/A |
| Method | Automated heuristics + deterministic QA scripts |

---

## 8. QA results

```
npm run check:seo:ru-content   → PASS
npm run check:seo:en-content   → PASS
npm run check:seo:kk-content   → PASS
npm run check:seo:content      → PASS
npm run smoke:seo:public       → PASS
npm run smoke:seo:hreflang     → PASS (20 pairs + 10 triads)
npx tsc --noEmit               → PASS
npm run build                  → PASS (1105 pages)
```

`npm run lint` — not run (pre-existing studio/auth debt out of scope).

---

## 9. GSC / Yandex / IndexNow plan (update only — no submit)

**After production deploy** (owner approval required):

1. Set `NEXT_PUBLIC_SITE_URL` to production domain (not localhost / placeholder).
2. Submit **only** `https://<domain>/sitemap.xml` once — sitemap already excludes noindex URLs.
3. **Do not** bulk-submit individual URLs until sitemap is verified in GSC/Yandex.
4. **KK URLs** go live with the same sitemap wave as ru/en (no separate IndexNow batch for kk-only).
5. Avoid submitting: `/kk/onim-video-generator`, legal drafts, uz/ky/tg paths, studio routes.
6. Verification env (placeholders — enable only after owner approval):
   - `GOOGLE_SITE_VERIFICATION` / meta tag in layout if configured
   - Yandex verification meta/file if configured
   - IndexNow key route — only after index policy confirmed in production

**Pre-flight:** Fetch `robots.txt`, `sitemap.xml`, sample `/kk`, `/kk/blog/kaspi-ushin-onim-fotosy` — confirm `index, follow` and hreflang triad.

---

## 10. Stage 7 (remaining)

1. Native Kazakh speaker spot-check of top 3 URLs (Kaspi blog, home, cost).
2. Production deploy + sitemap submit (manual).
3. Expand kk: remaining 10 ru/en blog pairs, platform pages, use-cases.
4. uz/ky/tg markets — separate stages.
5. Optional: kk in `manifest`/OG locale alternates audit.

---

## 11. Acceptance criteria

| # | Criterion | Met |
|---|-----------|-----|
| 1–4 | Stages 1–5, Studio, AI, auth untouched | Yes |
| 5 | KK QA completed | Yes |
| 6 | Only approved kk indexable | Yes |
| 7 | Non-approved kk noindex | Yes |
| 8 | Sitemap no draft/404/noindex | Yes |
| 9 | Hreflang kk only on triads | Yes |
| 10 | x-default ru | Yes |
| 11 | Switcher ru/en/kk safe | Yes |
| 12 | No uz/ky/tg/global | Yes |
| 13–20 | All checks + build | Yes |
| 21 | OpenAI budget | N/A |
| 22 | Stage 6 report | Yes |
| 23 | No commit/push | Yes |

---

## 12. Summary

Stage 6 completed **controlled KK index enablement**: QA passed for Stage 5 scope, `kk` added to `indexableLocales`, language switcher, sitemap, and hreflang **only where ru/en/kk content is published and approved**. Product video kk page stays **noindex** with honest in-dev messaging. RU/EN core unchanged and green. **No commit/push.**
