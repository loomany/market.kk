# Vitrina AI — Content Gap Plan (Stage 0)

**Date:** 2026-05-20

---

## Current state

| Metric | Value |
|--------|------:|
| Blog topics defined | 100 |
| Topics with full article body (ru+en) | 8 |
| Topics draft (404) | 92 |
| P0 priority topics | 20 |
| P0 topics published | 5 of 20 (topics 1, 3, 11, 16, 21, 31 — note 31 is P0; 1,3,11,16,21 also P0) |
| Article URLs needing translation (18 locales × 8 published) | 144 |
| Article URLs needing generation (92 topics × 2 source locales) | 184 |

Full inventory: `vitrina-ai-article-inventory-2026-05-20.csv`

---

## Published articles (ready for index when site un-noindexed)

| ID | RU slug | EN slug | Words (approx) | FAQ | CTA | Internal links |
|----|---------|---------|----------------|-----|-----|----------------|
| blog_001 | ai-foto-tovarov-dlya-marketpleysov | what-is-ai-product-photography | ~550 | 2 | ✅ | use-case, platforms |
| blog_002 | kak-sdelat-foto-tovara-dlya-marketpleysa | how-to-create-product-photos-for-a-marketplace | ~480 | 2 | ✅ | static, use-case |
| blog_003 | kak-sdelat-belyy-fon-dlya-tovara | how-to-make-a-white-background-for-a-product | ~450 | 2 | ✅ | feature, use-case |
| blog_008 | kak-proverit-ai-foto-pered-publikatsiey | how-to-review-ai-product-photos-before-publishing | ~420 | 2 | ✅ | use-case, platforms |
| blog_011 | kak-sdelat-foto-odezhdy-na-modeli | how-to-create-clothing-photos-on-a-model | ~430 | 2 | ✅ | use-case, feature |
| blog_016 | foto-belya-na-ai-modeli | lingerie-photos-on-an-ai-model | ~440 | 2 | ✅ | use-case, terms |
| blog_021 | foto-bizhuterii-dlya-marketpleysa | how-to-create-jewelry-product-photos-for-a-marketplace | ~450 | 2 | ✅ | use-case, platform |
| blog_031 | foto-tovarov-dlya-kaspi | product-photos-for-kaspi | ~400 | 2 | ✅ | platform, use-case |

**Gap vs content standard:** All need expansion to **1000–1800 words**, **4–8 FAQ**, stronger internal links to related guides.

---

## P0 topics not yet published (write first in ru)

| # | RU title | Cluster | Target |
|---|----------|---------|--------|
| 29 | Как подготовить фото сумки для маркетплейса | accessories | blog |
| 30 | Как сделать фото обуви для карточки товара | accessories | blog |
| 32 | Фото товаров для Wildberries | marketplaces | blog + link WB platform |
| 33 | Фото товаров для Ozon | marketplaces | blog |
| 34 | Фото товаров для eBay | marketplaces | blog |
| 35 | Фото товаров для Amazon | marketplaces | blog |
| 36 | Фото товаров для Etsy | marketplaces | blog |
| 47 | Как сделать Reels из фото товара | social | blog |
| 48 | Как сделать видео товара из фотографии | social | blog (honest: video in dev) |
| 65 | Как заменить фон у товара | background | blog |
| 67 | Как убрать лишние предметы с фото товара | background | blog |
| 74 | AI-фото или фотосессия: что выбрать | comparison | blog |
| 94 | Как написать prompt для товарного фото | advanced | blog |
| 98 | Как заставить AI сохранить товар | advanced | blog |

---

## Thin pages needing rewrite (not blog)

| Page type | Count | Current words | Target |
|-----------|------:|--------------:|-------:|
| Feature SEO static pages | 6 × 20 locales | ~60–80 | 700–1200 (ru/en first) |
| Use-case pages | 20 × 20 | ~280–350 | 500–900 |
| Platform pages | 13 × 20 | ~320–380 | 600–1000 |

**Do not expand all 430 locale variants at once.** Rewrite in **ru → en → CIS batch**.

---

## Content standard (per article)

Required blocks:
1. SEO title (unique, ≤60 chars ideal)
2. Meta description (unique, 120–160 chars)
3. H1 (one, matches intent)
4. Short intro (problem context)
5. Problem section
6. Solution / workflow
7. How Vitrina AI helps (honest, no fake features)
8. Step-by-step (numbered)
9. Use cases + marketplace examples (Kaspi, WB, Ozon where relevant)
10. FAQ 4–8 questions (single language per locale)
11. CTA “Открыть студию”
12. Related articles (2–4 internal links)
13. Schema: BlogPosting + FAQPage

Style rules:
- Short paragraphs, seller-friendly Russian
- Commercial intent without hype
- State AI can err; manual review required
- No “100% acceptance” claims
- Video/Reels: mark as roadmap if not production-ready

---

## Duplication / merge recommendations

| Keep | Merge / avoid |
|------|----------------|
| `/use-cases/odezhda-na-ai-modeli` + `/foto-odezhdy-na-ai-modeli` feature page | Do not create separate “virtual try-on” doorway; link between them |
| Platform page Kaspi + blog #31 | Cross-link; don’t duplicate full content |
| blog #64 + use-case product-photo-cleanup | One canonical depth article + short use-case |
| 20 locale variants with identical EN body | **noindex** until translated; don’t count as unique pages |

---

## Priority queue (content)

### Wave 1 — ru source (2–3 weeks human+AI assist)
1. Expand 8 existing articles to standard length
2. Publish remaining 12 P0 blog topics in ru
3. Expand 6 feature SEO pages + top 5 use cases (Kaspi, clothing, lingerie, white bg, exact card)

### Wave 2 — en translation
4. Semantic en translation of Wave 1
5. Expand platform pages for Kaspi, Wildberries, Ozon, Amazon

### Wave 3 — CIS (kk, uz, ky, tg)
6. Marketplace-focused subset: Kaspi, local marketplace terms
7. Landing + top 10 URLs only — not all 100 articles

### Wave 4 — global locales (tr, es, de, …)
8. Defer until ru/en/CIS validated in Search Console

---

## Pages to **not** create (thin content risk)

- Separate slug per “AI фото товаров {city}”
- Duplicate Kaspi/WB/Ozon pages that only swap marketplace name in one paragraph
- `/cost` until real pricing model is public and stable
- Auto-generated 100-article pages in 18 locales simultaneously

---

## Pages that should stay **noindex**

- `/{locale}/studio` (product app)
- `/generator-video-tovara` (product video generator) — until feature live
- All `needs_review` locale variants until QA pass
- Draft blog slugs (currently 404 — prefer 404 over thin draft indexed)
