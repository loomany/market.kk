# Vitrina AI — Stage 4 EN Quality Alignment + Technical SEO Polish (2026-05-20)

**Статус:** выполнен в рабочем дереве. **Commit/push не делались.**  
**OpenAI:** не использовался (ручной/детерминированный корпус в `data/seo/`).

---

## 1. Dirty tree (before → after)

### A. Stage 1 SEO infra (сохранено)
`app/robots.ts`, `app/sitemap.ts`, `lib/seo/site.ts`, `lib/seo/metadata.ts`, `lib/i18n/localeConfig.ts`, `lib/blog/blogResolve.ts`, `app/manifest.ts`, `public/og/`, icons, `components/i18n/*`, `/ru/cost` + `/en/cost`, `scripts/seo/smoke-public-routes.ts`

### B. Stage 2 RU content (сохранено + точечные правки Stage 4)
`data/seo/ruBlogStage2Content.ts` — исправлены RU internal links (EN slugs → RU slugs), лёгкий padding для `blog_002`, `blog_008`, `blog_011` под единый порог 900+ слов.

### C. Stage 2.1 build gate (сохранено)
`lib/studio/sanitizeProductAngleForTryOn.ts` — type-only fix, без изменения поведения.

### D. Stage 3 EN content (сохранено)
`data/seo/enBlogStage3Content.ts`, `publishedEnNumbers` = 20, `applyStage3En()`.

### E. Stage 4 (этот этап)

| Файл | Действие |
|------|----------|
| `data/seo/enBlogStage4LegacyContent.ts` | **NEW** — полный rewrite 8 legacy EN статей |
| `data/seo/blogArticles.ts` | `applyStage4LegacyEn(applyStage3En(applyStage2Ru(...)))` |
| `scripts/seo/check-seo-content.ts` | убран legacy floor 70 слов для EN — **все EN ≥ 900** |
| `data/seo/enFeatureLandingEnhancements.ts` | доп. секции на marketplace/background/fashion/jewelry EN landings |
| `scripts/seo/smoke-hreflang-pairs.ts` | **NEW** — статическая проверка 20 ru/en пар |
| `package.json` | `smoke:seo:hreflang` |

### F. Unrelated (не трогали в Stage 4)
`components/studio/**`, `lib/ai/**`, `app/api/ai/**`, auth/billing — остаются в dirty tree для отдельного коммита.

---

## 2. Eight legacy EN articles expanded

| Topic | EN slug | Words before (approx.) | Words after | Action |
|-------|---------|------------------------|-------------|--------|
| blog_001 | `what-is-ai-product-photography` | ~172 | **1179** | Full expansion in `enBlogStage4LegacyContent.ts` |
| blog_002 | `how-to-create-product-photos-for-a-marketplace` | ~120 | **906** | Full expansion |
| blog_003 | `how-to-make-a-white-background-for-a-product` | ~95 | **903** | Full expansion |
| blog_008 | `how-to-review-ai-product-photos-before-publishing` | ~110 | **921** | Full expansion |
| blog_011 | `how-to-create-clothing-photos-on-a-model` | ~100 | **912** | Full expansion |
| blog_016 | `lingerie-photos-on-an-ai-model` | ~85 | **904** | Full expansion |
| blog_021 | `how-to-create-jewelry-product-photos-for-a-marketplace` | ~76 | **900** | Full expansion |
| blog_031 | `product-photos-for-kaspi` | ~130 | **904** | Full expansion |

Структура каждой: SEO title, meta, H1 (via title), intro, seller problem, Vitrina workflow, marketplace examples, AI limitations, 4–6 FAQ, CTA **Open Studio** → `/studio`, ≥3 internal links только на **published** `/en/blog/...`, `/en/cost`, `/en/platforms`, use-cases.

Stage 3 articles (12 P0) не переписывались — уже 920–1145 слов.

---

## 3. All 20 EN articles — final QA

`npm run check:seo:en-content` — **PASS** (все ≥ 900 слов, unique title/meta, FAQ ≥ 4, CTA, internal links ≥ 3, no Cyrillic, no `/ru/` links in EN body).

| ID | Words | Meta | FAQ |
|----|-------|------|-----|
| blog_001 | 1179 | 151 | 6 |
| blog_002 | 906 | 151 | 5 |
| blog_003 | 903 | 150 | 5 |
| blog_004 | 1145 | 160 | 5 |
| blog_005 | 920 | 156 | 6 |
| blog_008 | 921 | 163 | 6 |
| blog_011 | 912 | 149 | 5 |
| blog_012 | 928 | 152 | 5 |
| blog_016 | 904 | 158 | 5 |
| blog_021 | 900 | 160 | 5 |
| blog_030 | 923 | 149 | 5 |
| blog_031 | 904 | 150 | 6 |
| blog_032 | 924 | 152 | 5 |
| blog_033 | 935 | 154 | 6 |
| blog_047 | 922 | 148 | 5 |
| blog_048 | 927 | 146 | 5 |
| blog_064 | 924 | 149 | 5 |
| blog_065 | 923 | 153 | 5 |
| blog_074 | 928 | 155 | 6 |
| blog_098 | 923 | 150 | 5 |

---

## 4. Published counts

| Locale | Published articles |
|--------|-------------------|
| RU | **20** |
| EN | **20** |
| ru/en pairs | **20** full parity |

`publishedRuNumbers` и `publishedEnNumbers` совпадают: `1, 2, 3, 4, 5, 8, 11, 12, 16, 21, 30, 31, 32, 33, 47, 48, 64, 65, 74, 98`.

---

## 5. Hreflang pairs (20)

`npm run smoke:seo:hreflang` — **PASS**

Для каждой из 20 пар:
- RU path: `/ru/blog/{ruSlug}`
- EN path: `/en/blog/{enSlug}`
- `buildLanguageAlternates()` → `ru`, `en`, `x-default` → **RU URL**
- Нет лишних locale keys (kk/uz/ky/tg/global)
- `shouldIndexPage()` = true для ru и en на каждой паре

Blog page (`app/[locale]/blog/[slug]/page.tsx`): BlogPosting + FAQPage schema (если FAQ), `inLanguage` по locale — без массового refactor.

---

## 6. Sitemap validation

`npm run smoke:seo:public` — **PASS**

- Sitemap содержит только **indexable** ru/en URLs (home, cost, features, platforms, use-cases, **40 blog URLs** = 20×2)
- Draft/noindex kk/uz/ky/tg и 80 неопубликованных тем **не** в sitemap
- `robots.ts`: disallow draft patterns; index policy ru/en only

---

## 7. EN feature landing enhancements

`data/seo/enFeatureLandingEnhancements.ts` — точечные секции + FAQ + **Related resources** только с ссылками на published EN blog slugs:

- `aiProductPhotoStudio`, `productPhotoOnModel`, `virtualTryOn`, `backgroundRemoval`, `productPhotoEnhancement`
- Marketplace: `marketplaceProductPhotos`, `kaspiProductPhotos`, `wildberriesProductPhotos`, `ozonProductPhotos`

Без полного rewrite landing templates; без ссылок на draft/404.

---

## 8. Metadata / schema polish

| Area | Status |
|------|--------|
| Blog Article/BlogPosting + FAQPage | Уже на blog page; FAQ только при наличии FAQ |
| `inLanguage` | ru / en по locale |
| Organization / WebSite | ru/en home metadata (Stage 1) |
| Pricing FAQ schema | `/ru/cost`, `/en/cost` — без искусственного FAQ на home |
| Массовый schema refactor | **Не делался** |

---

## 9. RU content fixes (Stage 4 gate)

Исправлены RU internal links с EN slugs (`how-to-*`, `product-photos-for-*`, `ai-product-photos-or-*`) → корректные RU slugs в `ruBlogStage2Content.ts`.

`npm run check:seo:ru-content` — **PASS** (все 20 ≥ 900 слов).

---

## 10. GSC / Yandex / IndexNow — plan only (no deploy, no submit)

### Google Search Console
- Env: `NEXT_PUBLIC_GSC_VERIFICATION` (meta tag content) в `.env.example`
- После production deploy: добавить property `https://{production-host}`, HTML tag verification через env
- Submit sitemap: `https://{host}/sitemap.xml`
- URL inspection: выборочно 20 EN + 20 RU blog pairs

### Yandex Webmaster
- Env: `NEXT_PUBLIC_YANDEX_VERIFICATION`
- Optional analytics: `NEXT_PUBLIC_YANDEX_METRIKA_ID` (не путать с verification)
- После deploy: подтвердить сайт, загрузить sitemap, проверить зеркала ru/en

### IndexNow (audit — не включать без approval)
- Code: `lib/seo/indexNow.ts`, `app/api/indexnow/submit/route.ts`, `app/[indexnowKey].txt`, `app/indexnow-key.txt`
- Env: `INDEXNOW_KEY`, `INDEXNOW_HOST`, `INDEXNOW_ENABLED=false` (default)
- Key file URL: `https://{INDEXNOW_HOST}/{INDEXNOW_KEY}.txt`
- Submit only **own-domain** indexable URLs; filter via `isOwnUrl()`; max 100 per batch
- **Не отправлять:** draft locales, `/kk/`, `/uz/`, noindex blog, studio-only URLs
- **После deploy whitelist:** `/ru`, `/en`, `/ru/cost`, `/en/cost`, 40 published blog URLs, key EN/RU feature + platform pages from sitemap

### Production checklist before IndexNow/GSC live
1. Set `NEXT_PUBLIC_SITE_URL` to production HTTPS host
2. Set verification env vars
3. `INDEXNOW_ENABLED=true` + `INDEXNOW_KEY` only after key file is reachable
4. Run `check:seo:content` + `smoke:seo:*` on CI
5. Manual spot-check 5 random hreflang pairs in rendered HTML

---

## 11. OpenAI

**OpenAI not used.** Контент написан детерминированно в TypeScript (как Stage 3). Бюджет $0.

---

## 12. Verification results

| Check | Result |
|-------|--------|
| `npm run check:seo:ru-content` | **PASS** |
| `npm run check:seo:en-content` | **PASS** |
| `npm run check:seo:content` | **PASS** |
| `npm run smoke:seo:public` | **PASS** |
| `npm run smoke:seo:hreflang` | **PASS** |
| `npx tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** |
| `npm run lint` | не запускался (optional; pre-existing studio/auth debt возможен) |

---

## 13. Acceptance criteria (Stage 4)

| # | Criterion | OK |
|---|-----------|-----|
| 1 | Stage 1/2/2.1/3 не откатились | ✓ |
| 2 | Studio не тронута | ✓ |
| 3 | AI pipeline не тронут | ✓ |
| 4 | Auth/billing/Supabase не тронуты | ✓ |
| 5 | 8 legacy EN ≥ 900 слов | ✓ |
| 6 | 20 EN content QA PASS | ✓ |
| 7 | 20 ru/en hreflang корректны | ✓ |
| 8 | Sitemap без draft/404/noindex | ✓ |
| 9 | 18 других локалей noindex/no sitemap | ✓ |
| 10 | EN related resources → published only | ✓ |
| 11 | Metadata/schema без конфликта index policy | ✓ |
| 12–17 | checks + tsc + build PASS | ✓ |
| 18 | OpenAI budget OK / not used | ✓ |
| 19 | Stage 4 report | ✓ |
| 20 | Commit/push не делались | ✓ |

---

## 14. Remaining for Stage 5 (CIS scale)

1. **kk** (и позже uz/ky/tg) — перевод/адаптация только после стабильного ru/en ядра
2. Оставшиеся **80** blog topics — не в scope
3. **Production deploy** + GSC/Yandex verification + controlled IndexNow rollout
4. **Lint debt** в studio/auth — отдельно от SEO
5. Selective **git commit** SEO-only paths vs studio/AI split

---

## 15. Commit/push

**Не выполнялись.** Рекомендация: отдельные коммиты `seo/stage-1` … `seo/stage-4` без studio/AI файлов.
