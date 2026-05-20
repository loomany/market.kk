# Vitrina AI — Stage 2 RU Content Foundation (2026-05-20)

**Статус:** выполнен в рабочем дереве. **Commit/push не делались.**

Stage 1 SEO-инфраструктура сохранена (robots, sitemap ru/en, hreflang, `/ru/cost`, icons, smoke). Studio / AI pipeline / auth / billing в рамках этой задачи не менялись; в `git status` могут быть посторонние изменения из других сессий — перед коммитом их нужно отделить.

---

## 1. Dirty tree (кратко)

**Stage 2 (контент + SEO):**
- `data/seo/ruBlogStage2Content.ts` — новый корпус RU статей
- `data/seo/ruFeatureLandingEnhancements.ts` — усиление RU feature landings
- `data/seo/blogArticles.ts`, `blogTopics.ts`, `staticPages.ts`
- `lib/blog/blogResolve.ts`, `lib/seo/site.ts`, `lib/seo/metadata.ts`
- `app/sitemap.ts`, `app/[locale]/[slug]/page.tsx`
- `scripts/seo/check-ru-content-quality.ts`, `package.json` (`check:seo:ru-content`)
- `.env.example` — закомментированные `OPENAI_SEO_*` (опционально)

**Stage 1 (из прошлой фазы, не закоммичено):** robots, layouts, LanguageSwitcher, icons, manifest, `scripts/seo/smoke-public-routes.ts`, отчёт stage-1.

---

## 2. Опубликованные RU статьи (20 URL)

### Расширены (8, были published ru+en)

| ID | Slug RU | Words (после) |
|----|---------|---------------|
| blog_001 | `/ru/blog/ai-foto-tovarov-dlya-marketpleysov` | ~1091 |
| blog_002 | `/ru/blog/kak-sdelat-foto-tovara-dlya-marketpleysa` | ~1036 |
| blog_003 | `/ru/blog/kak-sdelat-belyy-fon-dlya-tovara` | ~1014 |
| blog_008 | `/ru/blog/kak-proverit-ai-foto-pered-publikatsiey` | ~1015 |
| blog_011 | `/ru/blog/kak-sdelat-foto-odezhdy-na-modeli` | ~1007 |
| blog_016 | `/ru/blog/foto-belya-na-ai-modeli` | ~1006 |
| blog_021 | `/ru/blog/foto-bizhuterii-dlya-marketpleysa` | ~1016 |
| blog_031 | `/ru/blog/foto-tovarov-dlya-kaspi` | ~1142 |

До Stage 2: ~300–500 слов, 3 секции, общий FAQ. После: 1000–1100+ слов, 6–7 секций, FAQ 5–6, CTA «Открыть студию», 6+ internal links, честные ограничения AI.

### Новые P0 RU-only (12)

| ID | Тема | Slug RU | Words |
|----|------|---------|-------|
| blog_004 | Улучшить фото без фотографа | `kak-uluchshit-foto-tovara-bez-fotografa` | ~1010 |
| blog_005 | Карточка из обычного фото | `kak-sdelat-kartochku-tovara-iz-obychnogo-foto` | ~1016 |
| blog_012 | Одежда на AI-модель | `kak-perenesti-odezhdu-na-ai-model` | ~1204 |
| blog_030 | Фото обуви для карточки | `kak-sdelat-foto-obuvi-dlya-kartochki-tovara` | ~1180 |
| blog_032 | Wildberries | `foto-tovarov-dlya-wildberries` | ~1007 |
| blog_033 | Ozon | `foto-tovarov-dlya-ozon` | ~1004 |
| blog_047 | Reels из фото (in dev) | `kak-sdelat-reels-iz-foto-tovara` | ~1035 |
| blog_048 | Видео из фото (in dev) | `kak-sdelat-video-tovara-iz-fotografii` | ~1005 |
| blog_064 | Удалить фон | `kak-udalit-fon-s-foto-tovara` | ~1004 |
| blog_065 | Заменить фон | `kak-zamenit-fon-u-tovara` | ~1008 |
| blog_074 | AI vs фотосессия | `ai-foto-ili-fotosessiya-chto-vybrat` | ~1005 |
| blog_098 | Сохранить товар в AI | `kak-zastavit-ai-sohranit-tovar` | ~1001 |

**EN для этих 12:** `draft` (не published). Hreflang en не генерируется без пары.

**EN published (без изменений, 8):** 001, 002, 003, 008, 011, 016, 021, 031 — ru+en пары в sitemap/hreflang.

---

## 3. Политика публикации

- `publishedRuNumbers`: 20 тем (см. `blogTopics.ts`)
- `publishedEnNumbers`: 8 тем (как до Stage 2)
- `getBlogPathByLocale()` — только locale со `status=published` и наличием `content[locale]`
- `buildLanguageAlternates()` — только активные ru/en пути (без draft)
- Sitemap blog: через `getBlogPathByLocale`, без EN slug для RU-only статей

---

## 4. RU landing pages (усиление)

Файл `ruFeatureLandingEnhancements.ts`, подключён в `staticPages.ts` для RU:

| Страница | RU slug |
|----------|---------|
| AI-студия товарных фото | `/ru/ii-studiya-tovarnyh-foto` |
| Фото для маркетплейсов | `/ru/foto-tovarov-dlya-marketpleysov` |
| Генератор фона | `/ru/generator-fona-dlya-tovara` |
| Одежда на AI-модели | `/ru/foto-odezhdy-na-ai-modeli` |
| Бижутерия | `/ru/foto-bizhuterii-dlya-marketpleysa` |

Добавлено: расширенный intro, 3–4 SEO-секции, FAQ 4 вопроса, блок «Полезные материалы» (internal links), CTA «Открыть студию» на шаблоне `[slug]/page.tsx`.

**Не трогали:** `/ru` (SaasLanding), `/ru/cost` (Stage 1), `productVideoGenerator` (noindex, in dev).

---

## 5. Internal linking

- Все RU статьи: `/studio`, `/ru/cost`, 3–6 ссылок на blog/platforms/use-cases
- EN slug в `/ru/blog/...` исправлены на RU slug (проверка `check:seo:ru-content`)
- Ссылки на draft-темы не используются

---

## 6. Schema / metadata

- Существующий паттерн: `createSeoMetadata`, FAQ JSON-LD на blog/static
- У каждой RU статьи: unique title, meta 130–155 символов, H1 = title
- Canonical/hreflang через Stage 1 + partial path map для RU-only

---

## 7. OpenAI

**Не использовался.** Контент написан детерминированно в `ruBlogStage2Content.ts`.

В `.env.example` добавлены опциональные переменные:
`OPENAI_SEO_MODEL`, `OPENAI_SEO_DRY_RUN`, `OPENAI_SEO_DAILY_BUDGET_USD`, `OPENAI_SEO_MAX_TOKENS_PER_ARTICLE`.

Оценка при будущем batch (12–20 статей, gpt-4o-mini): ~3.5k tokens/статья → ~$0.02–0.05/статья при dry-run=false, в пределах $5/день.

---

## 8. Проверки

| Проверка | Результат |
|----------|-----------|
| `npm run check:seo:ru-content` | **PASS** (20 RU published) |
| `npm run smoke:seo:public` | **PASS** |
| `npm run build` | **FAIL** — pre-existing TS в `lib/studio/sanitizeProductAngleForTryOn.ts` (вне scope Stage 2) |
| `npx tsc --noEmit` | **FAIL** — тот же studio-файл (+ не связанные с SEO) |
| `npm run lint` | не запускался (известный studio/auth debt) |

---

## 9. Sitemap (ожидаемое после деплоя)

**Новые RU-only в sitemap:** 12 slug из таблицы §2 (без EN alternate).

**Ru+en pairs:** 8 статей + hub pages + cost + features + platforms + use-cases (как Stage 1).

**Не в sitemap:** kk/uz/…, draft blog (80 тем), EN для RU-only P0.

---

## 10. Оставшиеся проблемы

1. **Build/tsc** блокируется studio TypeScript debt — нужен отдельный фикс или исключение из CI path.
2. **Главная `/ru`** — контент в `SaasLanding`, не расширялась отдельным SEO-текстом (hero уже сильный).
3. **80 draft статей** — Stage 3.
4. **`NEXT_PUBLIC_SITE_URL`** — placeholder до go-live (Stage 1).
5. В дереве могут быть **несвязанные** изменения `components/studio/**`, `lib/ai/**` — не коммитить вместе с SEO без review.

---

## 11. Stage 3 (рекомендация)

1. EN batch для 12 новых P0 (профессиональный перевод, не auto-ru-copy).
2. kk/uz/ky/tg — только после готовности контента; пока noindex.
3. IndexNow + GSC/Yandex verification.
4. Оставшиеся P0/P1 из content-gap (виртуальная примерка, AI фото Kaspi как отдельный кластер если нужен отдельный slug).
5. OpenAI SEO pipeline с `OPENAI_SEO_DRY_RUN=true` → review в `reports/seo/drafts/` → apply.
6. Очистка `scripts/seo/_*` временных генераторов субагента.

---

## 12. Acceptance criteria

| # | Критерий | Статус |
|---|----------|--------|
| 1 | Stage 1 не откатился | ✅ |
| 2 | Studio не трогали в Stage 2 | ✅ (в этой задаче) |
| 3 | AI pipeline не трогали | ✅ (в этой задаче) |
| 4 | Auth/billing/Supabase не трогали | ✅ |
| 5 | 8 RU статей расширены | ✅ |
| 6 | 12 P0 RU опубликованы | ✅ |
| 7 | Не thin spam | ✅ (ручной корпус + QA script) |
| 8 | title/meta/h1/FAQ/CTA/links | ✅ |
| 9 | Непереведённые локали не published | ✅ |
| 10 | Hreflang без draft/404 | ✅ |
| 11 | Sitemap без draft RU-only EN | ✅ |
| 12 | Index policy ru/en only | ✅ |
| 13 | `/ru/cost`, `/en/cost` | ✅ smoke |
| 14 | smoke:seo:public | ✅ |
| 15 | build/tsc | ⚠️ studio pre-existing |
| 16 | OpenAI бюджет | ✅ не запускался |
| 17 | Отчёт Stage 2 | ✅ этот файл |
| 18 | Commit/push | ✅ не делались |
