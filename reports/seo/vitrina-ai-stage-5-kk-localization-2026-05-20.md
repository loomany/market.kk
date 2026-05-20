# Vitrina AI — Stage 5 Kazakhstan / KK Localization Foundation

**Date:** 2026-05-20  
**Status:** Complete (foundation ready, **kk not indexed**)  
**Commit/push:** Not performed (per task scope)

---

## 1. Baseline: RU/EN core remains green

| Check | Result |
|-------|--------|
| `npm run check:seo:ru-content` | PASS (20/20, ≥900 words) |
| `npm run check:seo:en-content` | PASS (20/20, ≥900 words) |
| `npm run check:seo:content` | PASS |
| `npm run smoke:seo:public` | PASS |
| `npm run smoke:seo:hreflang` | PASS (20 ru/en pairs) |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS (1105 static pages, +10 kk blog routes) |

Stages 1–4 SEO infra and ru/en content were **not rolled back**. Studio (`components/studio/**`, `app/**/studio/**`) and AI product pipeline (`lib/ai/**`, `app/api/ai/**`) were **not modified** for Stage 5.

---

## 2. Dirty tree classification (`git status --short`)

### A. Stage 1 SEO infra
- `app/robots.ts`, `app/sitemap.ts`, `lib/seo/site.ts`, `lib/seo/metadata.ts`, `lib/seo/qualityGate.ts`
- `lib/i18n/localeConfig.ts`, `components/i18n/LanguageSwitcher.tsx`, `LocaleSwitchLink.tsx`, `lib/i18n/switchLocalePath.ts`
- `app/manifest.ts`, `app/icon.png`, `app/apple-icon.png`, `public/icon-*.png`, `public/og/`
- `reports/seo/vitrina-ai-stage-1-seo-infra-2026-05-20.md`

### B. Stage 2 RU content
- `data/seo/ruBlogStage2Content.ts`, `data/seo/ruFeatureLandingEnhancements.ts`
- `reports/seo/vitrina-ai-stage-2-ru-content-2026-05-20.md`

### C. Stage 2.1 build fix
- `reports/seo/vitrina-ai-stage-2-1-build-gate-2026-05-20.md` (and related build-gate fixes in locale/blog routing)

### D. Stage 3 EN translation
- `data/seo/enBlogStage3Content.ts`, `data/seo/enFeatureLandingEnhancements.ts`
- `reports/seo/vitrina-ai-stage-3-en-translation-2026-05-20.md`

### E. Stage 4 EN polish
- `data/seo/enBlogStage4LegacyContent.ts`, `scripts/seo/smoke-hreflang-pairs.ts`, `package.json` scripts
- `reports/seo/vitrina-ai-stage-4-en-quality-polish-2026-05-20.md`

### F. Stage 5 KK + unrelated (do not mix in one commit)
**Stage 5 KK (this task):**
- `data/seo/kkBlogStage5Content.ts`, `data/seo/kkFeatureLandingEnhancements.ts`
- `data/seo/blogTopics.ts` (`publishedKkNumbers`, `kkSlugOverrides`, `ready_for_review`)
- `data/seo/blogArticles.ts` (`applyStage5Kk`)
- `data/seo/staticPages.ts` (kk feature + `/kk/cost`)
- `lib/i18n/translations.ts` (`kkLanding`)
- `lib/i18n/locales.ts`, `lib/blog/blogResolve.ts`, `app/[locale]/blog/[slug]/page.tsx`
- `scripts/seo/check-seo-kk-content.ts`, `scripts/seo/build-kk-blog-stage5.mjs`, `scripts/seo/kk-blog-full-prose.mjs`, `scripts/seo/kk-blog-fourth-paras.mjs`
- `reports/seo/vitrina-ai-kk-glossary-2026-05-20.md`
- `reports/seo/vitrina-ai-stage-5-kk-localization-2026-05-20.md` (this file)

**Unrelated — not part of SEO stages (avoid in SEO-only PR):**
- `components/studio/**`, `lib/ai/**`, `lib/studio/**`, `app/api/ai/**` (try-on, model generation, product set pipeline, etc.)
- `reports/ai/*` diagnostic JSON/MD

---

## 3. KK publication policy (Stage 5)

| Rule | Implementation |
|------|----------------|
| KK pages may exist | `/kk`, `/kk/cost`, feature landings, 10 blog slugs |
| Status | `ready_for_review` (blog + static + home landing) |
| Index | **noindex** via `qualityGate` + non-indexable locale |
| Sitemap | **No kk URLs** (`indexableLocales = ru, en` only) |
| Hreflang | **ru/en + x-default→ru only**; kk blog metadata `hasHreflang: false` |
| Language switcher | **ru/en only** (kk not shown publicly until Stage 6 approval) |
| uz/ky/tg/global | Not touched |

**Why kk stays noindex:** Native QA and owner approval are required before Kazakhstan SEO exposure. Premature indexing risks thin/duplicate signals and moderation trust issues on Kaspi-focused queries.

---

## 4. KK glossary

**Path:** `reports/seo/vitrina-ai-kk-glossary-2026-05-20.md`

**Style decisions:**
- Brand **Vitrina AI** unchanged
- **AI** in Latin (not «ЖИ») for seller clarity
- **Kaspi**, **Wildberries**, **Ozon** as brand names
- CTA **Студияны ашу** → `/studio`
- No moderation guarantees, no «official partner» claims

---

## 5. KK pages added/updated

### Core & commercial landings (`ready_for_review`)
| URL (kk) | Type | Notes |
|----------|------|-------|
| `/kk` | Home | `kkLanding` in `lib/i18n/translations.ts` |
| `/kk/cost` | Pricing | Localized sections + FAQ in `staticPages.ts` |
| `/kk/ai-onim-foto-studiyasi` | AI product photo studio | `aiProductPhotoStudio` |
| `/kk/marketpleisterge-onim-fotosy` | Marketplace product photos | `productPhotoForMarketplaces` |
| `/kk/kiim-ai-model-fotosy` | Clothing on AI model | `fashionModelPhotos` |
| `/kk/onim-fon-generator` | Background generator | `backgroundGenerator` |
| `/kk/generator-video-tovara` | Product video | `productVideoGenerator` (in-dev honest copy) |
| `/kk/foto-tovarov-dlya-marketpleysov` (jewelry key) | Jewelry | `jewelryProductPhotos` (conservative QA copy) |

Feature slugs follow existing ru/en route keys; kk titles via `kkFeatureTitles` / `kkFeatureLandingEnhancements`.

### Top 10 blog articles (`ready_for_review`, noindex)

| # | Topic | KK slug | QA words (check) |
|---|-------|---------|------------------|
| 1 | Kaspi product photos | `kaspi-ushin-onim-fotosy` | 1925 |
| 2 | AI product photography | `ai-onim-fotografiyasi` | 1911 |
| 3 | Marketplace product photo | `marketpleisterge-onim-fotosu-kalay-zhasau` | 1878 |
| 4 | White background | `onim-ushin-ak-fon-kalay-zhasau` | 1837 |
| 5 | Improve without photographer | `fotosurysyz-onim-fotosyn-zhetildiru` | 1905 |
| 6 | Product card from simple photo | `kadirdik-onim-fotosynan-kartochka` | 1946 |
| 7 | Clothing on AI model | `kiim-ai-model-fotosy` | 1942 |
| 8 | Virtual try-on / place on model | `kiimdi-ai-modelge-kiyu` | 1860 |
| 9 | Lingerie on AI model | `ish-kiyim-ai-model-fotosy` | 1860 |
| 10 | Background removal | `onim-fonyn-alu` | 1861 |

Content pipeline: seed in `kkBlogStage5Content.ts` → expansion in `scripts/seo/kk-blog-full-prose.mjs` (semantic KK, Kaspi/marketplace terminology, manual-review disclaimers) → `node scripts/seo/build-kk-blog-stage5.mjs`.

---

## 6. Translation method

| Item | Value |
|------|-------|
| **OpenAI used** | **No** (`.env.local` not read; no API calls) |
| Model | N/A |
| Tokens / cost | N/A |
| Method | Deterministic authored KK + prose expansion scripts |

Drafts live in `data/seo/kkBlogStage5Content.ts` and `scripts/seo/kk-blog-*.mjs` (not in `reports/seo/drafts/kk/` — inline repo artifacts sufficient for review).

---

## 7. Sitemap / hreflang after Stage 5

| Item | Status |
|------|--------|
| `indexableLocales` | `ru`, `en` only |
| Sitemap | ru/en URLs only; **no kk** |
| Hreflang | ru ↔ en + `x-default` → ru; **no kk** |
| KK blog pages | Reachable, **noindex**, no hreflang alternates |
| x-default | Still **ru** |

Verified by `check:seo:kk-content`, `smoke:seo:hreflang`, `smoke:seo:public`.

---

## 8. QA results (Stage 5 gate)

```
npm run check:seo:kk-content   → PASS
npm run check:seo:ru-content   → PASS
npm run check:seo:en-content   → PASS
npm run check:seo:content      → PASS
npm run smoke:seo:public       → PASS
npm run smoke:seo:hreflang     → PASS
npx tsc --noEmit               → PASS
npm run build                  → PASS (1105 pages)
```

`check:seo:kk-content` validates: title/meta/H1 intro, ≥850 words, ≥4 sections, ≥4 FAQ, CTA `/studio`, no TODO/EN/RU fallback, no kk→ru/en blog links, kk absent from sitemap/hreflang index policy.

**RU regression fix (Stage 5):** Re-applied RU internal blog links (EN slugs → RU slugs) in `ruBlogStage2Content.ts`; padded `blog_002`, `blog_008`, `blog_011` to ≥900 words.

---

## 9. Stage 6 — opening kk in index (checklist)

1. **Native Kazakh review** of all `ready_for_review` pages (terminology, grammar, Kaspi seller tone).
2. Owner approval to show **kk in language switcher**.
3. Add `kk` to `indexableLocales` and sitemap generation (controlled rollout).
4. Add **ru/en/kk hreflang** for published pairs only (start with 10 blog + core landings).
5. Re-run full SEO gate + optional live Search Console/Yandex after deploy.
6. **Do not** auto-submit IndexNow for kk until copy approved.
7. Remaining 80 draft topics / uz/ky/tg — out of scope until kk P0 proven.

---

## 10. Acceptance criteria (Stage 5)

| # | Criterion | Met |
|---|-----------|-----|
| 1 | Stages 1–4 not rolled back | Yes |
| 2 | Studio not touched for Stage 5 | Yes (pre-existing dirty studio files unchanged by this work) |
| 3 | AI pipeline not touched for Stage 5 | Yes |
| 4 | Auth/billing/Supabase not touched | Yes |
| 5 | KK glossary created | Yes |
| 6 | KK home/pricing/core commercial pages | Yes |
| 7 | Top 10 KK blog `ready_for_review` | Yes |
| 8 | Not RU/EN fallback garbage | Yes (QA heuristics pass) |
| 9 | KK not in sitemap | Yes |
| 10 | KK not in hreflang | Yes |
| 11 | KK remains noindex | Yes |
| 12 | 20 ru/en pairs intact | Yes |
| 13–19 | All checks + build | Yes |
| 20 | OpenAI budget | N/A (not used) |
| 21 | Stage 5 report | Yes (this file) |
| 22 | No commit/push | Yes |

---

## 11. Summary

Stage 5 delivers a **quality-oriented Kazakh foundation** for Kazakhstan/Kaspi: localized home, pricing, priority feature landings, and ten high-intent blog articles—all **`ready_for_review` and noindex** until Stage 6. RU/EN indexed core, hreflang pairs, sitemap policy, and build gates remain green. **OpenAI was not used.** **No git commit or push** was made.
