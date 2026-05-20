# Stage 13 — KK Wave 2 subset + commercial copy

**Date:** 2026-05-20  
**Status:** PASS (local checks + build)  
**OpenAI:** not used (manual/deterministic KK generator)

## Preconditions

| Item | Status |
|------|--------|
| Stage 12 accepted | Examples asset system, noindex preserved |
| Studio / AI pipeline | Out of scope |
| Production deploy | Not performed |
| KK trust pages (`/kk/how-it-works`, `/quality`, `/faq`) | Still `ready_for_review` / noindex — **not** mass-linked from indexable kk LPs (Stage 13.1) |

## Dirty tree

| Bucket | Notes |
|--------|--------|
| **A — SEO 1–13** | `data/seo/kkBlogStage13Wave2.ts`, `blogTopics.ts`, `blogArticles.ts`, `kkIndexPolicy.ts`, `kkFeatureLandingEnhancements.ts`, `scripts/seo/build-kk-blog-stage13-wave2.mjs`, `check-seo-kk-wave2.ts`, smoke script counts |
| **B — Studio/AI** | Unchanged |
| **C — Auth/billing** | Unchanged |

## Wave 2 topic selection (8 of 20)

Excluded from Stage 13: eBay/Amazon/Etsy (34–36), Instagram/Reels (49), B2B manager (55), catalog-without-shoot (19), bags (29), photoshoot compare (60), cleanup (67), product-shot vs model (75), prompt (94), and other low-KZ-intent topics.

| topic id | RU title | EN title | KK title | reason | index status |
|----------|----------|----------|----------|--------|--------------|
| blog_006 | Как AI помогает продавцам маркетплейсов | How AI helps marketplace sellers | AI маркетплейс сатушыларына қалай көмектеседі | Kaspi/marketplace workflow MOFU | **published / index** |
| blog_007 | Ошибки в товарных фото | Product photo mistakes | Сату түсіретін тауар фотосы қателері | Trust + conversion | **published / index** |
| blog_009 | Почему AI меняет товар | Why AI can change a product | AI неге тауарды өзгертуі мүмкін | Quality/trust | **published / index** |
| blog_010 | Сохранить цвет и форму | Preserve color and shape | AI фотода түс пішін сақтау | Core QA for listings | **published / index** |
| blog_020 | Подготовка к AI-примерке | Prepare clothing for try-on | AI виртуалды примерка үшін киім фотосын дайындау | Clothing/Kaspi catalog | **published / index** |
| blog_061 | Когда AI-фото не подходит | When AI is not a fit | AI тауар фотосы қашан сәйкес келмейді | Honest limitations | **published / index** |
| blog_063 | Проверка качества AI-карточек | Check AI card quality | AI карточкасының сапасын қалай тексеруге болады | QA process | **published / index** |
| blog_077 | AI-модель или реальная | AI model vs real model | AI модель ме, нақты модель ме | Clothing sellers KZ | **published / index** |

## Content & word counts

| topic | words | meta len | FAQ |
|-------|------:|---------:|----:|
| blog_006 | 1243 | 136 | 5 |
| blog_007 | 1221 | 99 | 4 |
| blog_009 | 1216 | 100 | 4 |
| blog_010 | 1135 | 130 | 4 |
| blog_020 | 1143 | 99 | 4 |
| blog_061 | 1168 | 93 | 4 |
| blog_063 | 1103 | 95 | 5 |
| blog_077 | 1156 | 112 | 4 |

All ≥850 words. Regenerate: `node scripts/seo/build-kk-blog-stage13-wave2.mjs`

## Publication / index

- `publishedKkNumbers`: 10 → **18**
- `KK_APPROVED_BLOG_TOPIC_NUMBERS`: same 18 IDs
- `blogArticles` merge order fixed: **`applyStage13KkWave2` after Wave 2 ru/en** so kk content attaches to new topics
- ru/en: **40 pairs** unchanged
- kk triads: **10 → 18**
- ru/en-only blog pairs: **30 → 22**
- x-default: **ru**
- examples: noindex, not in sitemap

## Sitemap / hreflang

| Metric | Before | After | Δ |
|--------|--------|-------|---|
| Sitemap URLs | 209 | **217** | +8 |
| kk locale URLs | 23 | **31** | +8 blog |
| ru/en | 93 each | 93 each | 0 |

## KK commercial copy

Updated `kkFeatureLandingEnhancements.ts`:

- `aiProductPhotoStudio` — links to blog_006, blog_010, Kaspi article
- `productPhotoForMarketplaces` — mistakes + QA articles, Kaspi LP
- `fashionModelPhotos` — try-on prep, AI vs real model
- `backgroundGenerator` — color preservation, AI change article

No links to `/examples` or noindex kk trust pages.

## Glossary (Stage 5 + Stage 13 appendix)

Unchanged core: **AI** (Latin), **тауар фотосы**, **маркетплейс**, **тауар карточкасы**, **виртуалды примерка**, **фонды алу**, **Студияны ашу**, **Kaspi**, **қолмен тексеру**.

Stage 13 additions (use consistently):

| concept | KK |
|---------|-----|
| marketplace sellers | маркетплейс сатушылары |
| photo mistakes | тауар фотосы қателері |
| preserve color/shape | түс пішін сақтау |
| QA checklist | сапа тізімі / қолмен тексеру |
| AI limitations | AI шектеулері |
| not a fit | сәйкес келмейді |

## Files

| Path | Role |
|------|------|
| `data/seo/kkBlogStage13Wave2.ts` | Generated KK bodies |
| `scripts/seo/kk-blog-stage13-wave2-*.mjs` | Authoring + build |
| `scripts/seo/check-seo-kk-wave2.ts` | `npm run check:seo:kk-wave2` |
| `lib/seo/kkIndexPolicy.ts` | Approved topic IDs |
| `data/seo/blogTopics.ts` | published kk + slugs/titles |
| `data/seo/blogArticles.ts` | applyStage13KkWave2 |

## Checks (all PASS)

```text
npm run check:seo:kk-wave2
npm run check:seo:kk-content      # 18 published kk
npm run check:seo:ru-content
npm run check:seo:en-content
npm run check:seo:trust
npm run check:seo:examples
npm run smoke:seo:public
npm run smoke:seo:hreflang        # 18 kk triads
npm run smoke:seo:prelaunch       # 217 sitemap URLs
npx tsc --noEmit
npm run build                     # 1229 pages (+8 blog routes)
```

## Stage 14+ (not done)

- KK trust pages index + hreflang (Stage 13.1)
- Remaining Wave 2 ru/en (12 topics) + remaining 60 RU/EN backlog
- Examples index after owner assets
- Production deploy / GSC / Yandex (Stage 16)

## Commit / deploy

**Not performed.**
