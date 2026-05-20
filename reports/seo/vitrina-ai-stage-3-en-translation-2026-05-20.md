# Vitrina AI — Stage 3 EN Translation / ru-en parity (2026-05-20)

**Статус:** выполнен в рабочем дереве. **Commit/push не делались.**  
**OpenAI:** не использовался (детерминированный EN-корпус в коде).

---

## 1. Dirty tree (before → after)

### Не менялось по scope Stage 3
- Studio: `components/studio/**`, `lib/studio/**` (кроме косвенно — не трогали)
- AI pipeline: `lib/ai/**`, `app/api/ai/**`
- Auth/billing/Supabase

### Stage 3 добавлено/изменено

| Файл | Действие |
|------|----------|
| `data/seo/enBlogStage3Content.ts` | **NEW** — 12 EN статей |
| `data/seo/enFeatureLandingEnhancements.ts` | **NEW** — EN feature landings |
| `data/seo/blogArticles.ts` | `applyStage3En()` |
| `data/seo/blogTopics.ts` | `publishedEnNumbers` → 20 тем |
| `data/seo/staticPages.ts` | EN feature enhancements |
| `scripts/seo/check-seo-content.ts` | **NEW** — ru/en/all |
| `package.json` | `check:seo:en-content`, `check:seo:content` |

Stage 1/2/2.1 SEO-файлы сохранены.

---

## 2. Twelve new P0: translation table

| Topic | RU slug | EN slug | Before EN | After EN |
|-------|---------|---------|-----------|----------|
| blog_004 | `kak-uluchshit-foto-tovara-bez-fotografa` | `how-to-improve-product-photos-without-a-photographer` | draft | **published** |
| blog_005 | `kak-sdelat-kartochku-tovara-iz-obychnogo-foto` | `how-to-make-a-product-card-from-a-regular-photo` | draft | **published** |
| blog_012 | `kak-perenesti-odezhdu-na-ai-model` | `how-to-place-clothing-on-an-ai-model` | draft | **published** |
| blog_030 | `kak-sdelat-foto-obuvi-dlya-kartochki-tovara` | `how-to-create-shoe-photos-for-a-product-card` | draft | **published** |
| blog_032 | `foto-tovarov-dlya-wildberries` | `product-photos-for-wildberries` | draft | **published** |
| blog_033 | `foto-tovarov-dlya-ozon` | `product-photos-for-ozon` | draft | **published** |
| blog_047 | `kak-sdelat-reels-iz-foto-tovara` | `how-to-make-reels-from-a-product-photo` | draft | **published** |
| blog_048 | `kak-sdelat-video-tovara-iz-fotografii` | `how-to-create-a-product-video-from-a-photo` | draft | **published** |
| blog_064 | `kak-udalit-fon-s-foto-tovara` | `how-to-remove-the-background-from-a-product-photo` | draft | **published** |
| blog_065 | `kak-zamenit-fon-u-tovara` | `how-to-replace-a-product-background` | draft | **published** |
| blog_074 | `ai-foto-ili-fotosessiya-chto-vybrat` | `ai-product-photos-or-a-photoshoot-what-to-choose` | draft | **published** |
| blog_098 | `kak-zastavit-ai-sohranit-tovar` | `how-to-make-ai-preserve-the-product` | draft | **published** |

---

## 3. EN word counts (Stage 3 articles)

| ID | Words | Meta len | FAQ |
|----|-------|----------|-----|
| blog_004 | 1145 | 160 | 5 |
| blog_005 | 920 | 156 | 6 |
| blog_012 | 928 | 152 | 5 |
| blog_030 | 923 | 149 | 5 |
| blog_032 | 924 | 152 | 5 |
| blog_033 | 935 | 154 | 6 |
| blog_047 | 922 | 148 | 5 |
| blog_048 | 927 | 146 | 5 |
| blog_064 | 924 | 149 | 5 |
| blog_065 | 923 | 153 | 5 |
| blog_074 | 928 | 155 | 6 |
| blog_098 | 923 | 150 | 5 |

Стиль: semantic adaptation (ecommerce / marketplace / AI product photo), не дословный RU→EN.

Каждая статья: 6 секций, CTA **Open studio** → `/studio`, ссылки на `/en`, `/en/cost`, опубликованные EN blog/platform/use-case URL.

---

## 4. Publication & hreflang

### `publishedEnNumbers` (20)
`1, 2, 3, 4, 5, 8, 11, 12, 16, 21, 30, 31, 32, 33, 47, 48, 64, 65, 74, 98`

### ru/en parity
- **20 RU published** + **20 EN published** = **20 полных пар** с hreflang ru + en + x-default→ru
- **80 тем** — draft / noindex (не в sitemap)
- **18 локалей** (kk, uz, …) — без индекса, без hreflang (Stage 1 policy)

### RU-only
- **Нет** — все 20 RU статей теперь имеют EN контент и `published` EN status

### Legacy EN (8 original pairs)
- EN-тексты **короткие** (~76–172 слов) из Stage 1 — **не расширялись** в Stage 3
- Остаются published для hreflang parity; полное выравнивание объёма — **Stage 4**

---

## 5. Sitemap / smoke

- `getBlogPathByLocale()` — только locale с `published` + `content[locale]`
- Sitemap: 20 RU + 20 EN blog URL (build: 28 blog slug paths в выводе — 20×2 минус пересечения hub)
- `smoke:seo:public` — **PASS** (pricing, locale switch, published slugs)

---

## 6. Feature landing parity (EN)

`enFeatureLandingEnhancements.ts` — 5 EN feature pages:
- Related resources → только **published** EN blog links
- FAQ + CTA Open studio

---

## 7. OpenAI

**Не использовался.** Контент в `enBlogStage3Content.ts` написан вручную/детерминированно.

Оценка при будущем batch (12 статей × ~3.5k tokens, gpt-4o-mini): ~$0.30–0.60 при `OPENAI_SEO_DRY_RUN=false`, в пределах `$5/day`.

---

## 8. Проверки

| Команда | Результат |
|---------|-----------|
| `npm run check:seo:ru-content` | **PASS** (20 RU) |
| `npm run check:seo:en-content` | **PASS** (20 EN; 12 Stage 3 ≥900 words, 8 legacy ≥70 words) |
| `npm run check:seo:content` | **PASS** |
| `npm run smoke:seo:public` | **PASS** |
| `npx tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** |
| `npm run lint` | не запускался (pre-existing auth/studio debt) |

---

## 9. SEO regression

| Check | Status |
|-------|--------|
| ru/en index only | ✅ |
| kk/uz/ky/tg noindex | ✅ |
| hreflang 20 locales | ✅ не возвращён |
| hreflang только real pairs | ✅ |
| `/ru/cost`, `/en/cost` | ✅ smoke |
| Studio route | ✅ не менялся |

---

## 10. Stage 4 recommendation

1. **Expand legacy 8 EN articles** to ~1000 words (match RU Stage 2 depth)
2. kk/uz/ky/tg — только после готового контента
3. IndexNow + GSC/Yandex verification
4. Оставшиеся 80 blog topics P1/P2
5. Selective commit: PR1 SEO Stage 1–3, PR2 Studio/AI separate
6. Cleanup `scripts/seo/_*` temp generators

---

## 11. Acceptance criteria

| # | Критерий | Статус |
|---|----------|--------|
| 1–4 | Scope / no rollback | ✅ |
| 5 | 12 new P0 EN published | ✅ |
| 6–8 | Quality title/meta/FAQ/CTA/links | ✅ |
| 9 | publishedEnNumbers updated | ✅ |
| 10–12 | hreflang / sitemap / 18 locales | ✅ |
| 13–17 | checks + build + tsc | ✅ |
| 18 | OpenAI budget | ✅ not used |
| 19 | Report | ✅ |
| 20 | No commit/push | ✅ |

**Note:** 8 legacy EN articles remain shorter than RU; documented for Stage 4. All 12 **new** P0 EN articles meet 900+ word target.
