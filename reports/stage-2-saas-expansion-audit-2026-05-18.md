# Stage 2 SaaS Expansion Audit — Vitrina AI Studio

Дата: 2026-05-18  
Режим: audit-only перед реализацией Stage 2.

## Текущее состояние репозитория

- Текущая ветка содержит более свежие изменения после прошлого UX-этапа:
  - `d9d69f8 feat: add Supabase SSR integration and env templates`
  - `201bdb4 feat: exact product cards, mask editor, and studio UX polish`
  - `0965eca fix: remove shadow from exact product cards`
  - `809c463 feat: add product mask selection for exact cards`
  - `2fb8faf fix: add reels product shot size`
- `git status --short` до Stage 2 показывает чужие untracked файлы:
  - `.agents/`
  - `skills-lock.json`
- Эти файлы не относятся к Stage 2 реализации и не должны быть затронуты без отдельного решения.

## Текущая структура `/studio`

Главный экран собран в `components/studio/StudioShell.tsx`.

Сейчас верхний выбор режимов:

1. `clothing-tryon` — UI label `Одежда на модели`.
2. `product-shot` — UI label `Product Shot`.
3. `background-remove-only` — UI label `Удалить фон`.

Сценарий построен как один stateful client component:

- выбранный режим: `studioMode`;
- файл товара: `productFile`;
- файл модели: `modelFile`;
- превью товара/модели: object URLs;
- настройки одежды: `productCategory`, `garmentPhotoType`, `qualityMode`;
- настройки модели: `modelSettings`;
- настройки карточки: `productShotSettings`;
- результаты текущей генерации: `results`;
- mask editor state: `selectedProductFile`, `selectedProductPreviewUrl`, `maskEditorOpen`;
- ошибки/loading: `error`, `loading`, `modelGenerating`.

Результаты сейчас живут только в React state `results`. После смены режима/новой генерации они очищаются. Отдельной истории сессии нет.

## Как устроены текущие режимы

### Одежда на модели

- UI: загрузка файла товара, загрузка/генерация AI-модели, настройки try-on.
- API: `POST /api/ai/tryon`.
- Реальный provider: `fal-ai/fashn/tryon/v1.6`.
- Mock mode: возвращает локальные demo assets.
- Ограничение: нет пользовательского prompt-поля “Опишите модель”, только structured settings.

### Товарная карточка

- В UI всё ещё называется `Product Shot`, хотя фактически стала точной карточкой.
- Серверный `POST /api/ai/product-shot` сейчас возвращает `FEATURE_DISABLED` для creative product-shot.
- Рабочий pipeline точной карточки находится на клиенте:
  - `removeBackgroundForProduct()`;
  - optional user mask через `ProductMaskEditor`;
  - `refineCutoutWithUserMask`;
  - `fitCutoutToShotSize`;
  - `composeExactProductCard` в canvas.
- Товарная карточка использует `POST /api/ai/remove-background`, затем client-side composition.
- Creative scene пока отключена.

### Удалить фон

- Сейчас отдельный верхний режим `background-remove-only`.
- API `POST /api/ai/remove-background` сохранён и поддерживает JSON + multipart.
- По новому Stage 2 этот режим нужно убрать из верхнего выбора и оставить как внутреннее действие в `Товарная карточка` и `Проработка`.

## API routes

Сейчас есть:

- `POST /api/ai/tryon`
- `POST /api/ai/generate-model`
- `POST /api/ai/product-shot`
- `POST /api/ai/remove-background`

Не найдено:

- `POST /api/ai/pricing`
- `POST /api/ai/video/generate`
- `POST /api/ai/scene/generate`
- `POST /api/ai/prompt/enhance`
- auth routes для WhatsApp.

## Supabase / Auth

Пакеты уже установлены:

- `@supabase/ssr`
- `@supabase/supabase-js`

Есть файлы:

- `utils/supabase/client.ts`
- `utils/supabase/server.ts`
- `utils/supabase/middleware.ts`

Но пока нет:

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/admin.ts`
- migrations / SQL schema;
- RLS policies;
- `profiles`, `studio_assets`, `generation_jobs`, `auth_codes`;
- app-level sessions;
- WhatsApp login UI/routes;
- history UI.

`.env.example` уже содержит:

- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- direct Postgres values.

В ТЗ упомянут `NEXT_PUBLIC_SUPABASE_ANON_KEY`; текущий проект использует modern publishable key. Нужно аккуратно поддержать оба варианта или привести документацию к одному стилю.

## Mobile layout

Студия уже mobile-first по основным контейнерам:

- `main` с `px-4`;
- mode selector `grid gap-3 md:grid-cols-3`;
- основной layout `grid lg:grid-cols-[420px_1fr]`;
- result cards одной колонкой до `lg`.

Проблемы для Stage 2:

- один `StudioShell` станет слишком большим комбайном;
- post-processing actions, video studio, prompt enhance и history лучше вынести в отдельные компоненты;
- на mobile “Проработка” должна быть action workspace, а не длинная форма всех возможностей сразу;
- Video controls должны быть full-width, с понятной стоимостью перед запуском.

## Что должно стать тремя режимами

### 1. Одежда на модели

Пользовательская цель:

> Перенесите одежду, бельё или комплект на AI-модель.

Сохраняем существующий try-on flow и добавляем позже:

- manual model description;
- prompt enhance;
- расширенные настройки модели;
- background/object handling для загруженной модели.

### 2. Товарная карточка

Пользовательская цель:

> Создайте чистую карточку товара для маркетплейса или креативную сцену для витрины.

На безопасном этапе:

- переименовать главный UI label;
- оставить текущую точную карточку как основной рабочий flow;
- creative scene не запускать real без отдельного verified schema + pricing.

### 3. Проработка

Пользовательская цель:

> Доработайте уже созданные изображения: видео, фон, сцена, Reels.

Внутри:

- session assets grid;
- actions:
  - `Сделать видео`;
  - `Заменить фон`;
  - `Продолжить сцену`;
  - `Улучшить изображение`;
  - `Подготовить Reels / Stories`;
- prompt input + prompt enhance;
- estimated cost;
- mock generation by default.

## Какие компоненты надо разделить

Рекомендуемые новые компоненты:

- `components/studio/ProcessedAssetsPanel.tsx`
- `components/studio/VideoStudioPanel.tsx`
- `components/studio/PromptEnhancePanel.tsx`
- `components/studio/PostProcessingActions.tsx`
- `components/auth/WhatsAppLoginModal.tsx`
- `components/studio/StudioHistoryPanel.tsx`

Рекомендуемые новые lib modules:

- `lib/ai/videoModels.ts`
- `lib/ai/videoSchemas.ts`
- `lib/ai/promptEnhanceSchemas.ts`
- `lib/ai/sceneSchemas.ts`
- `lib/ai/pricing.ts`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/admin.ts`
- `lib/auth/whatsapp.ts`
- `lib/auth/session.ts`
- `lib/studio/assets.ts`

## Новые API routes

Безопасно добавить mock/dry-run first:

- `POST /api/ai/prompt/enhance`
- `POST /api/ai/video/generate`
- `POST /api/ai/scene/generate`
- `POST /api/ai/pricing`
- `POST /api/auth/whatsapp/send-code`
- `POST /api/auth/whatsapp/verify-code`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Важно:

- `FAL_KEY`, `OPENAI_API_KEY`, Green API credentials и service role должны читаться только server-side.
- Real video/scene calls нельзя включать до подтверждённых Fal schemas + pricing + `ALLOW_PAID_AI_RUNS=true`.

## Supabase tables

Нужны migrations с RLS:

- `profiles`
- `studio_projects`
- `studio_assets`
- `generation_jobs`
- `auth_codes`
- optional `app_sessions`, если не используется Supabase Auth cookie/session.

Storage buckets:

- `user-uploads`
- `generated-assets`

RLS:

- users read/write only own rows;
- service role manages jobs/assets server-side;
- users never read other users' assets/jobs/auth codes.

## Env keys

Нужно добавить/проверить:

```env
OPENAI_API_KEY=
OPENAI_PROMPT_MODEL=gpt-5.5
ALLOW_PAID_AI_RUNS=false
MAX_AI_TEST_SPEND_USD=5

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GREEN_API_INSTANCE_ID=
GREEN_API_TOKEN=
WHATSAPP_AUTH_FROM_PHONE=
WHATSAPP_AUTH_CODE_TTL_MINUTES=10
```

## AI/video price risks

- Video generation can be materially more expensive than image generation.
- Fal video models differ by schema: duration/aspect ratio fields and pricing unit may vary.
- Some models are text-to-video only and not suitable for image-to-video product workflows.
- Real calls need:
  - model schema audit;
  - estimate before run;
  - explicit user click;
  - `ALLOW_PAID_AI_RUNS=true`;
  - max budget guard.

## Real tests plan and limits

До Stage 2 budget guard:

- real paid calls: 0.

После budget guard + explicit approval:

- создать `reports/stage-2-real-run-plan-2026-05-18.md`;
- перечислить 10 planned generations;
- оценить cost per generation and total;
- запускать только если:
  - `ALLOW_PAID_AI_RUNS=true`;
  - `MAX_AI_TEST_SPEND_USD` задан;
  - пользователь явно approve.

## Реализация, безопасная сейчас

Безопасно продолжать после этого отчёта:

1. Переименовать верхние 3 режима:
   - `Одежда на модели`;
   - `Товарная карточка`;
   - `Проработка`.
2. Убрать standalone “Удалить фон” из mode selector, не удаляя API.
3. Добавить session-level asset history и `ProcessedAssetsPanel`.
4. Добавить UI/typed config для video workspace и mock-only route.
5. Добавить prompt enhance route with mock fallback and server-only OpenAI path.
6. Добавить Supabase migrations and server/client/admin wrappers without running SQL.
7. Добавить WhatsApp auth architecture/mock-safe routes, не отправляя реальные Green API сообщения без credentials.
8. Добавить pricing/budget guards, default `ALLOW_PAID_AI_RUNS=false`.

Небезопасно делать сейчас без дополнительных подтверждений:

- запускать real video calls;
- запускать 10 paid generations;
- отправлять реальные WhatsApp сообщения;
- выполнять destructive SQL;
- включать production session/auth без полноценного security review.
