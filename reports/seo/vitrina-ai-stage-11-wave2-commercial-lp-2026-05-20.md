# Stage 11 — Wave 2 RU/EN + commercial LP enhancements

**Date:** 2026-05-20  
**Status:** PASS (local checks + build)  
**Scope:** 20 RU/EN blog pairs, feature LP enhancements, QA scripts. **No** deploy, commit, push, GSC/Yandex/IndexNow, Studio/AI/auth changes.

## Preconditions (accepted)

| Item | Status |
|------|--------|
| Stage 10 trust + examples scaffold | Accepted |
| `/examples` | noindex, not in sitemap, no hreflang |
| Studio / `lib/ai` / `app/api/ai` | Out of scope (not modified for Stage 11) |
| Production launch | Paused until Stage 16 |
| OpenAI | **Not used** (manual/deterministic generator) |
| KK Wave 2 | Deferred to Stage 13 |

## Dirty tree (before Stage 11 work)

| Bucket | Examples |
|--------|----------|
| **A — SEO Stages 1–11** | `data/seo/*`, `app/sitemap.ts`, `robots.ts`, `lib/seo/*`, `lib/i18n/*`, `components/landing`, `app/[locale]/examples`, `scripts/seo/`, `reports/seo/` |
| **B — Studio/AI (out of scope)** | `components/studio/**`, `lib/ai/**`, `lib/studio/**`, `app/api/ai/**` |
| **C — Auth/billing (out of scope)** | Supabase/Lemon routes (unchanged in Stage 11) |
| **D — noise** | `.next/`, unrelated reports |

Stage 11 touched only bucket **A** (+ smoke script counts).

## Wave 2 topic IDs (20)

`6, 7, 9, 10, 19, 20, 29, 34, 35, 36, 49, 55, 60, 61, 63, 67, 75, 77, 94, 96`

Slugs follow `blogTopics` seeds (`slug.ru` / `slug.en` from English title slugify where no RU override).

### Topic table (Stage 9 Wave 2 plan)

| topic id | RU title | EN title | cluster | reason | target landing | status |
|----------|----------|----------|---------|--------|----------------|--------|
| blog_006 | Как AI помогает продавцам маркетплейсов | How AI helps marketplace sellers | marketplace workflow | MOFU trust + workflow | product-photo-for-marketplaces | published |
| blog_007 | Ошибки в товарных фото | Product photo mistakes that hurt sales | quality / trust | TOFU mistakes | exact-product-card | published |
| blog_009 | Почему AI меняет товар | Why AI can change a product | trust | quality warning | ai-product-photo-studio | published |
| blog_010 | Сохранить цвет и форму в AI-фото | Preserve color and shape in AI photos | quality | reduce distortion | exact-product-card | published |
| blog_019 | Каталог одежды без фотосессии | Clothing catalog without a photoshoot | clothing | B2B catalog | clothing-on-model | published |
| blog_020 | Подготовка фото для AI-примерки | Prepare clothing for AI try-on | clothing | try-on prep | clothing-on-model | published |
| blog_029 | Фото сумки для маркетплейса | Bag photos for marketplace | marketplace | P0 category | bags-product-photos | published |
| blog_034 | Фото товаров для eBay | Product photos for eBay | platform | export seller | platform eBay | published |
| blog_035 | Фото товаров для Amazon | Product photos for Amazon | platform | export seller | platform Amazon | published |
| blog_036 | Фото товаров для Etsy | Product photos for Etsy | platform | craft/export | platform Etsy | published |
| blog_049 | Подготовить фото для Instagram | Prepare photos for Instagram | social | MOFU prep (no fake video) | instagram-product-photos | published |
| blog_055 | Менеджер маркетплейса: ускорить контент | Speed up marketplace content | B2B workflow | ops MOFU | content-manager-workflow | published |
| blog_060 | Когда AI-фото лучше фотосессии | When AI beats a photoshoot | comparison | honest compare | feature hub | published |
| blog_061 | Когда AI-фото не подходит | When AI is not a fit | trust | limitations | /quality | published |
| blog_063 | Проверка качества AI-карточек | Check AI card quality | QA | links blog_008 | studio + quality | published |
| blog_067 | Убрать лишние предметы с фото | Remove unwanted objects | cleanup | P0 cleanup | product-photo-cleanup | published |
| blog_075 | Product Shot или одежда на модели | Product shot vs clothing on model | comparison | BOFU | fashion + exact-card | published |
| blog_077 | AI-модель или реальная модель | AI model vs real model | comparison | BOFU | fashion-model-photos | published |
| blog_094 | Prompt для товарного фото | Prompt for product photography | prompts | MOFU | creative-product-scene | published |
| blog_096 | Описать модель для одежды | Describe model for clothing | prompts | clothing | clothing-on-model | published |

## Files created

| Path | Role |
|------|------|
| `scripts/seo/build-wave2-blog-stage11.mjs` | Build entry: writes TS content files |
| `scripts/seo/wave2-blog-stage11-lib.mjs` | Shared helpers, link maps, word count |
| `scripts/seo/wave2-blog-stage11-articles.mjs` | Hand-authored `blog_006` + merge |
| `scripts/seo/wave2-blog-stage11-generate.mjs` | Generated bodies for topics 7–96 (19) |
| `data/seo/ruBlogStage11Wave2.ts` | `ruBlogStage11Wave2` export |
| `data/seo/enBlogStage11Wave2.ts` | `enBlogStage11Wave2` export |
| `scripts/seo/check-seo-wave2.ts` | Wave 2 word-count / structure gate |
| `reports/seo/vitrina-ai-stage-11-wave2-commercial-lp-2026-05-20.md` | This report |

## Files updated

- `data/seo/blogTopics.ts` — `publishedRuNumbers` / `publishedEnNumbers` +20 IDs each (40 published blog topics total per locale)
- `data/seo/blogArticles.ts` — `applyStage11Wave2Ru` / `applyStage11Wave2En`
- `data/seo/ruFeatureLandingEnhancements.ts` — keys: `aiProductPhotoStudio`, `productPhotoForMarketplaces`, `fashionModelPhotos`, `backgroundGenerator`, `jewelryProductPhotos` (Wave 2 blog links, `/quality`, `/how-it-works`, text-only examples note; no `/examples` links)
- `data/seo/enFeatureLandingEnhancements.ts` — same keys (EN paths)
- `package.json` — `"check:seo:wave2"`

## Word count ranges (body: intro + shortAnswer + section bodies)

| Locale | Min | Max | Target |
|--------|-----|-----|--------|
| RU | 1,033 (`blog_007`) | 1,327 (`blog_009`) | ≥1,000 |
| EN | 910 (`blog_007`) | 1,206 (`blog_010`) | ≥900 |

Per-topic build log (2026-05-20):

- `blog_006`: RU=1209 EN=1104  
- `blog_007`: RU=1033 EN=910  
- `blog_009`–`blog_096`: RU≈1269–1317, EN≈1145–1198 (generated cluster)

## Content conventions

- `RuBlogArticleContent` / `EnBlogArticleContent` aligned with `ruBlogStage2Content.ts`
- 6 sections × 4 body paragraphs; checklist 5; FAQ 5 (4 base + 1 Wave 2)
- Disclaimers: no 100% guarantee; not official Kaspi/WB/Ozon/Amazon/eBay/Etsy partner; video/Reels in development where relevant
- Internal links: `/studio`, `/ru/cost` or `/en/cost`, trust `/quality` & `/how-it-works`, published Stage 1–2 blog slugs only (no Wave 2 cross-links at authoring time)

## Published numbers

`publishedRuNumbers` / `publishedEnNumbers` in `blogTopics.ts`: **40** each (Wave 1: 20 + Wave 2: 20). KK remains **10** approved topics.

## Sitemap / hreflang (before → after)

| Metric | Before Stage 11 | After Stage 11 | Δ |
|--------|-----------------|----------------|---|
| Sitemap URLs (`NEXT_PUBLIC_SITE_URL=https://vitrina.help`) | ~169 | **209** | **+40** |
| ru sitemap locale | ~73 | 93 | +20 blog |
| en sitemap locale | ~73 | 93 | +20 blog |
| kk sitemap locale | 23 | 23 | 0 |
| ru/en blog hreflang pairs | 20 | **40** | +20 |
| ru/en/kk triads | 10 | 10 | 0 |
| ru/en-only blog pairs | 10 | **30** | +20 |
| Examples in sitemap | 0 | 0 | — |
| x-default | ru | ru | — |

## Commercial LP enhancements

| P0 cluster | Implementation |
|------------|----------------|
| AI product photos | `aiProductPhotoStudio` — trust links, Wave 2 blogs, text-only examples note |
| Marketplace photos | `productPhotoForMarketplaces` — Kaspi platform link, mistakes/Amazon blogs |
| Clothing on model / try-on | `fashionModelPhotos` — catalog, try-on prep, AI vs real model blogs |
| Background removal | `backgroundGenerator` — cleanup, prompt, unwanted objects blogs |
| Lingerie | Covered in `fashionModelPhotos` section + existing blog_016 links |
| Kaspi | Platform URL from marketplace LP; dedicated blog_031 (Wave 1) |
| Product card AI | Cross-links via blogs + `exact-product-card` use case in articles |
| Jewelry | `jewelryProductPhotos` — Etsy, QA, when-AI-not-fit |

No fake screenshots; no `/examples` links on indexable feature pages.

## Validation (all passed)

```text
node scripts/seo/build-wave2-blog-stage11.mjs
npm run check:seo:wave2
npm run check:seo:ru-content
npm run check:seo:en-content
npm run check:seo:kk-content
npm run check:seo:content      # RU=40 EN=40 published
npm run check:seo:trust
npm run smoke:seo:public
npm run smoke:seo:hreflang     # 40 ru/en pairs
npm run smoke:seo:prelaunch    # 209 sitemap URLs (after script update)
npx tsc --noEmit
npm run build                  # 1221 static pages; blog [slug] +87 paths vs pre-Wave-2
```

**Note:** `smoke-prelaunch-gate.ts` updated for 40 ru/en pairs (was hardcoded 20).

## Stage 12+ (not done)

- KK Wave 2 subset (5–8 topics, Stage 13)
- Examples real assets + optional index policy review
- Remaining 60 RU/EN backlog topics (P1/P2)
- Production deploy + GSC/Yandex (Stage 16 gate)
- **Commit / push / deploy:** not performed

## Sitemap / hreflang estimate

| Metric | Before Wave 2 | After Wave 2 | Delta |
|--------|---------------|--------------|-------|
| Published RU blog topics | 20 | 40 | +20 |
| Published EN blog topics | 20 | 40 | +20 |
| Indexable blog URLs (ru + en) | ~40 | ~80 | **+40** |
| New `ru`/`en` hreflang pairs (blog) | — | — | **+40** |

KK blog remains at 10 published topics (unchanged).

## Feature LP enhancements (commercial)

- Wave 2 blog deep-links per feature cluster (marketplace mistakes, Amazon/Etsy, catalog/try-on, prompts, QA)
- Trust links on indexable LPs only (`/quality`, `/how-it-works`)
- Examples: prose-only “case write-ups may expand” — no hard links to `/examples` from indexable feature pages

## Regenerate content

```bash
node scripts/seo/build-wave2-blog-stage11.mjs
```

Then run `npm run check:seo:wave2` and `npm run check:seo:content`.
