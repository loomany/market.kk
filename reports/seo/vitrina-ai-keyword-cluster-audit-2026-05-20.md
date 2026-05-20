# Vitrina AI — Keyword Cluster Audit (Stage 0)

**Date:** 2026-05-20  
**Method:** Internal keyword map + route/content inventory (no external SERP tools in this stage)

---

## Cluster coverage map

Legend: **LP** = landing/use-case/feature page | **Blog** = published article | **FAQ** = embedded FAQ | **CTA** = studio link | **Loc** = ru/en/kk/…

| Cluster (RU primary) | LP | Blog | FAQ | Commercial | CTA | Loc | Priority | Gap |
|----------------------|----|------|-----|------------|-----|-----|----------|-----|
| AI фото товара | ✅ feature studio | ✅ #1 | ✅ | MOFU | ✅ | ru,en | P0 | Expand LP words |
| AI фото для маркетплейса | ✅ product-photo-for-marketplaces | ✅ #1,#2 | ✅ | BOFU | ✅ | ru,en | P0 | kk missing |
| фото товара на модели | ✅ fashion-model + use case | ✅ #11 | ✅ | BOFU | ✅ | ru,en | P0 | — |
| AI примерка одежды | ✅ clothing-on-model | ✅ #11 | ✅ | BOFU | ✅ | ru,en | P0 | No dedicated “virtual try-on” EN cluster page |
| виртуальная примерка одежды | ⚠️ same as above | draft #12 | partial | MOFU | ✅ | ru,en | P1 | Publish #12 |
| одежда на AI-модели | ✅ use case + feature | ✅ #11 | ✅ | BOFU | ✅ | ru,en | P0 | — |
| бельё на AI-модели | ✅ use case lingerie | ✅ #16 | ✅ | BOFU | ✅ | ru,en | P0 | — |
| AI модель для одежды | ✅ generate-model in studio* | draft #96 | partial | MOFU | ✅ | ru,en | P1 | *Studio not audited |
| удалить фон товара | ✅ background-generator | draft #64 | ✅ | MOFU | ✅ | ru,en | P0 | Publish #64 |
| заменить фон товара | ✅ ai-background-replacement | draft #65 | ✅ | MOFU | ✅ | ru,en | P0 | Publish #65 |
| улучшить фото товара | ✅ product-photo-cleanup | draft #4 | partial | MOFU | ✅ | ru,en | P1 | Publish #4 |
| фото для Kaspi | ✅ platform kaspi | ✅ #31 | ✅ | BOFU | ✅ | ru,en | P0 | kk Kaspi article |
| фото для Wildberries | ✅ platform WB | draft #32 | partial | BOFU | ✅ | ru,en | P0 | Publish #32 |
| фото для Ozon | ✅ platform Ozon | draft #33 | partial | BOFU | ✅ | ru,en | P0 | Publish #33 |
| карточка товара AI | ✅ exact-product-card | ✅ #2 | ✅ | BOFU | ✅ | ru,en | P0 | — |
| видео из фото товара | ⚠️ noindex feature | draft #48 | partial | MOFU | ✅ | ru,en | P1 | Honest “in dev” |
| AI видео товара | same | draft #48,#95 | partial | MOFU | ✅ | ru,en | P2 | After video ships |
| рекламные креативы | ✅ creative-product-scene | draft #50 | partial | MOFU | ✅ | ru,en | P2 | Publish #50 |
| ecommerce product photography AI | ✅ EN pages | ✅ #1 EN | ✅ | TOFU | ✅ | en | P1 | — |
| virtual try-on | ✅ EN use case | draft EN | partial | MOFU | ✅ | en | P1 | Avoid duplicate thin page |
| AI fashion photoshoot | ✅ fashion pages | ✅ #11 | ✅ | BOFU | ✅ | en | P1 | — |
| product photo generator | ✅ ai-product-photo-studio | ✅ #1 | ✅ | BOFU | ✅ | en | P0 | — |

---

## Coverage score

| Category | Defined in keywordMap | Published blog | Index-ready LP (ru/en) |
|----------|----------------------:|---------------:|-------------------------:|
| P0 clusters | 20 | 5–6 | ~18 |
| P1 clusters | ~43 | ~15 partial | ~35 |
| P2 clusters | ~37 | few | most have LP template |

**Overall:** Landing/use-case **coverage is good**; **blog depth is the bottleneck** (8/100 published).

---

## Locale coverage by cluster (Kaspi example)

| Asset | ru | en | kk | uz | ky | tg |
|-------|----|----|----|----|----|-----|
| Platform LP | ✅ | ✅ | EN dup | EN dup | EN dup | EN dup |
| Blog Kaspi | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Landing Kaspi mention | ✅ | ✅ | EN | EN | EN | EN |

---

## Recommended cluster → page mapping (no new thin URLs)

| Primary keyword | Canonical target | Supporting articles |
|-----------------|------------------|---------------------|
| фото для kaspi | `/ru/platforms/kaspi-foto-tovarov` | #31, #2, exact-product-card |
| одежда на ai модели | `/ru/use-cases/odezhda-na-ai-modeli` | #11, #16, fashion feature |
| белый фон товар | `/ru/use-cases/belyy-fon-dlya-marketpleysa` | #3, background feature |
| ai фото товаров | `/ru/ii-studiya-tovarnyh-foto` | #1, #8 |
| wildberries фото | `/ru/platforms/wildberries-foto-tovarov` | #32 (publish) |

---

## Clusters to **not** spin out separately

- “AI фото Kaspi Алматы” geo variants — use one Kaspi page + local copy in kk later
- Separate “virtual try-on” vs “clothing on model” — merge internal links
- 13 platform × 18 locale blog clones before QA

---

## External keyword research (Stage 2+ — needs approval)

Not executed in Stage 0. Recommended tools when approved:

- Yandex Wordstat (KZ/RU): kaspi фото товара, фото для маркетплейса, ai фото одежды
- Google Keyword Planner (EN): AI product photography, virtual try on clothing
- Validate intent manually for top 20 P0 terms

---

## Priority actions

1. Publish P0 marketplace blogs: WB, Ozon, Amazon, Etsy (#32–36)
2. Publish background cluster #64, #65, #67
3. Expand feature LPs to rank for “generator / studio” terms
4. kk translations for Kaspi + clothing + white background only
5. Defer global EN long-tail until ru/en Search Console data
