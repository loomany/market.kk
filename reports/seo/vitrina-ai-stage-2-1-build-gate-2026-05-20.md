# Vitrina AI — Stage 2.1 Build Gate (2026-05-20)

**Статус:** build gate **закрыт**. **Commit/push не делались.**

---

## 1. Dirty tree summary

### A. Stage 1 SEO infra

| Файл | Статус |
|------|--------|
| `app/robots.ts` | M |
| `app/sitemap.ts` | M |
| `app/[locale]/layout.tsx` | M |
| `app/(default)/layout.tsx` | M |
| `lib/seo/site.ts` | M |
| `lib/seo/metadata.ts` | M |
| `lib/i18n/localeConfig.ts` | M |
| `components/i18n/LanguageSwitcher.tsx` | M |
| `components/landing/SaasFooter.tsx` | M |
| `components/landing/SaasLanding.tsx` | M (blog links) |
| `data/seo/staticPages.ts` | M (`/ru/cost`, `/en/cost`) |
| `package.json` | M (`smoke:seo:public`) |
| `.env.example` | M |
| `?? app/icon.png`, `app/apple-icon.png`, `app/manifest.ts` | new |
| `?? public/icon-*.png`, `public/og/` | new |
| `?? components/i18n/LocaleSwitchLink.tsx` | new |
| `?? lib/i18n/switchLocalePath.ts` | new |
| `?? scripts/seo/smoke-public-routes.ts` | new |
| `?? reports/seo/vitrina-ai-stage-1-seo-infra-2026-05-20.md` | new |

### B. Stage 2 RU content

| Файл | Статус |
|------|--------|
| `?? data/seo/ruBlogStage2Content.ts` | new |
| `?? data/seo/ruFeatureLandingEnhancements.ts` | new |
| `data/seo/blogArticles.ts` | M |
| `data/seo/blogTopics.ts` | M |
| `data/seo/staticPages.ts` | M (enhancements) |
| `lib/blog/blogResolve.ts` | M |
| `lib/seo/site.ts` | M (partial hreflang) |
| `app/sitemap.ts` | M (blog paths) |
| `app/[locale]/[slug]/page.tsx` | M (related links) |
| `package.json` | M (`check:seo:ru-content`) |
| `?? scripts/seo/check-ru-content-quality.ts` | new |
| `?? reports/seo/vitrina-ai-stage-2-ru-content-2026-05-20.md` | new |

### C. Unrelated Studio / AI (не SEO)

| Файл | Статус |
|------|--------|
| `components/studio/*` (6 файлов) | M |
| `lib/ai/analyzeProductAngle.ts` | M |
| `app/api/ai/analyze-product-angles/route.ts` | M |
| `lib/studio/applyProductAnalysis.ts` | M |
| `lib/studio/productPhotos.ts` | M |
| `lib/studio/resolveModelAngles.ts` | M |
| `?? lib/studio/modelIdentityLock.ts` | new |
| `?? lib/studio/productSetPipeline.ts` | new |
| `?? lib/studio/sanitizeProductAngleForTryOn.ts` | new — **источник TS fail** |

### D. Other

| Файл | Статус |
|------|--------|
| `app/[locale]/page.tsx` | M (minor) |
| `reports/seo/*-audit-*.md` (7 файлов) | M |
| `?? scripts/seo/_*` (временные генераторы субагента) | optional cleanup |

**Build/tsc failure:** только `lib/studio/sanitizeProductAngleForTryOn.ts` — **не** Stage 1/2 SEO.

---

## 2. Build / tsc failure (до фикса)

### `npx tsc --noEmit`

```
lib/studio/sanitizeProductAngleForTryOn.ts(13,39): error TS2345
```

| Поле | Значение |
|------|----------|
| **Код** | TS2345 |
| **Файл** | `lib/studio/sanitizeProductAngleForTryOn.ts:13` |
| **Суть** | `deriveSourceModelOrientation()` ожидает полный `ProductSourceModel` (Zod), а передан объект только с 6 текстовыми полями |
| **Причина** | Новый untracked studio-файл; схема `ProductSourceModel` расширена (`bodyType`, `sizeClass`, `poseRu`, `crop`, `bodyVisibility`), а вызов не обновлён |
| **Связь с SEO** | **Нет** — SEO-файлы не импортируют этот модуль |
| **Pre-existing?** | Файл **новый** (`??`), ошибка появилась при добавлении studio work, не при Stage 1/2 |

### `npm run build`

Падал на том же месте на этапе «Running TypeScript» — совпадает с `tsc`.

---

## 3. Что изменено (minimal safe fix)

**Файл:** `lib/studio/sanitizeProductAngleForTryOn.ts`

В `orientationFromAngleText()` добавлены `null` для полей, которые **не читаются** в `orientationBlob()` (`lib/ai/sourceModelOrientation.ts`):

- `bodyType`, `sizeClass`, `poseRu`, `crop`, `bodyVisibility` → `null`

**Почему safe:**

- Поведение `deriveSourceModelOrientation` не меняется — blob строится только из `pose`, `cameraAngle`, `handsPosition`, `framing`, `descriptionRu`, `promptEn`
- Тот же паттерн уже используется в `deriveSourceModelOrientationFromRequest()`
- Try-on / FASHN / Fal / промпты / API routes **не трогались**

---

## 4. Результаты команд (после фикса)

| Команда | Результат |
|---------|-----------|
| `npm run check:seo:ru-content` | **PASS** — 20 RU published |
| `npm run smoke:seo:public` | **PASS** |
| `npx tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** (1083 static pages, blog ru/en slugs OK) |
| `npm run lint` | **FAIL** — pre-existing `components/auth/*`, `app/api/ai/prompt/enhance` warning; **не чинили** |

---

## 5. SEO regression check

| Проверка | Статус |
|----------|--------|
| Index policy ru/en only (`indexableLocales`) | ✅ |
| Остальные локали noindex (layouts) | ✅ не менялись |
| 20 RU статей published | ✅ check script |
| 12 новых P0: EN draft | ✅ |
| Hreflang только ru/en pairs (`getBlogPathByLocale`, `buildLanguageAlternates`) | ✅ |
| Sitemap без EN для RU-only blog | ✅ smoke |
| `/ru/cost`, `/en/cost` | ✅ smoke |
| Language switcher ru/en | ✅ smoke |
| Icons / manifest / OG | ✅ Stage 1 files on месте |
| Studio route SEO | ✅ не менялся в Stage 2.1 |

Build output подтверждает **28 blog slug paths** (20 RU + 8 EN pairs).

---

## 6. Recommendation

### Можно идти в Stage 3?

**Да** — build gate закрыт, SEO checks зелёные.

### Selective commit (позже, по approval)

Рекомендуем **два коммита** (или два PR):

1. **SEO Stage 1 + 2 + 2.1 build fix в SEO-ветке** — только группы A + B + `sanitizeProductAngleForTryOn.ts` type fix *или* исключить studio fix из SEO PR если studio коммитится отдельно
2. **Studio/AI** — группа C отдельно, с review try-on

Минимальный type fix в studio-файле логично включить в **studio PR**, если SEO PR должен быть чистым — тогда SEO PR собирается только если studio-файл не в дереве; сейчас дерево mixed, поэтому перед SEO commit либо:

- закоммитить studio fix в studio branch, либо
- cherry-pick только SEO paths

### Cleanup (optional)

- Удалить `scripts/seo/_*.py`, `_*.mjs` временные генераторы (не влияют на build)

---

## 7. Acceptance criteria

| # | Критерий | Статус |
|---|----------|--------|
| 1 | Stage 1/2 не откатились | ✅ |
| 2 | Dirty tree разделён | ✅ |
| 3 | Причина fail описана | ✅ |
| 4 | build + tsc PASS | ✅ |
| 5 | Safe fix only | ✅ |
| 6 | check:seo:ru-content | ✅ |
| 7 | smoke:seo:public | ✅ |
| 8 | sitemap/hreflang/index | ✅ |
| 9 | Studio behavior unchanged | ✅ (type-only) |
| 10 | Commit/push | ✅ не делались |
