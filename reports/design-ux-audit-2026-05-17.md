# Design UX Audit — Vitrina AI Studio

**Дата:** 2026-05-17  
**Проект:** MVP веб-сайта для товарных фото маркетплейсов  
**Режим аудита:** audit-only, без изменений UI-кода  
**Real Fal calls:** не запускались

## Что сейчас хорошо

- В проекте уже есть понятный MVP-flow: landing, `/studio`, три режима, загрузка фото, генерация, чеклист качества, accept/reject/download.
- API routes разделены по задачам и уже поддерживают mock mode: `tryon`, `generate-model`, `product-shot`, `remove-background`.
- В студии есть ручная QC-проверка перед скачиванием. Это правильный UX-паттерн для AI-результатов, потому что AI может исказить товар.
- Локальная загрузка файлов уже валидируется по типу и размеру.
- Есть базовые UI-компоненты `Button`, `Card`, `Badge`, что упрощает приведение интерфейса к единому стилю.
- README уже честно фиксирует ограничения MVP: нет Auth, Payments, Supabase, истории, batch queue.

## Где продукт всё ещё выглядит как Kaspi-only

- `app/page.tsx` использует бренд `Kaspi AI Studio` и footer `Kaspi AI Product Photo Studio`.
- `app/layout.tsx` fallback app name: `Kaspi AI Product Studio`.
- `app/studio/page.tsx` metadata title: `Kaspi AI Product Studio`.
- `components/landing/Hero.tsx` позиционирует результат как карточки для `Kaspi, Instagram и каталога`, где Kaspi выглядит главным рынком.
- `components/landing/HowItWorks.tsx` говорит про варианты для `Kaspi и соцсетей`.
- `components/landing/UseCases.tsx` использует Kaspi в подзаголовке как первый сценарий и упоминает форматы под Kaspi.
- README и `.env.example` всё ещё называют продукт `Kaspi AI Product Photo Studio` / `Kaspi AI Product Studio`.

## Где надо заменить бренд на Vitrina AI Studio

- `app/page.tsx`: header, footer.
- `app/layout.tsx`: fallback `NEXT_PUBLIC_APP_NAME`, metadata description.
- `app/studio/page.tsx`: metadata title и description.
- `components/landing/Hero.tsx`: badge и общий copy.
- README title, description, env example.
- `.env.example`: `NEXT_PUBLIC_APP_NAME`.
- `package.json`: `name` и `description`.

Kaspi можно оставить только как пример площадки внутри списков: `Kaspi, Wildberries, Ozon, Instagram, интернет-магазины и каталоги`.

## Где непонятно обычному пользователю

- В landing используются английские/технические слова: `AI Product Photo Studio`, `virtual try-on`, `Try-On`, `Lingerie`, `Export`, `studio background`.
- В studio видны `Demo · Mock mode`, `real AI mode`, `Fal Storage`, `Source product image`, `Target model image`, `AI generated`, `provider/model/requestId`.
- Режим `Product Shot` не объяснён сразу как товарное фото без модели.
- Режим `Background Remove Only` в README и логике звучит технически; в UI лучше использовать `Удалить фон`.
- Настройки модели (`Gender`, `Body type`, `Pose`, `Crop`, `Background`, `Category`) выглядят как developer-form, а не как настройки для продавца.
- Пользователю не объясняется достаточно явно, что файл имеет приоритет над URL.

## Где интерфейс перегружен

- В левой панели `/studio` подряд идут выбор режима, техническое предупреждение, upload товара, upload модели, пресеты модели, настройки примерки, кнопка генерации.
- Техническая meta-информация результата (`provider`, `model`, `requestId`, `seed`, `inputSource`, `scene`) занимает место рядом с основным пользовательским flow.
- В product-shot настройках смешаны пресеты, custom prompt на английском, количество вариантов и формат без структурных подсказок.
- Landing сейчас короткий и не перегружен, но не закрывает вопросы “для кого”, “что можно сделать”, “почему нужна проверка”.

## Где не хватает подсказок

- Upload должен явно говорить: что загружать, какой размер, какие форматы, что делать с URL, что MVP не сохраняет фото в базе.
- Генерация AI-модели должна объяснять, зачем нужна модель и что она используется только для режима “Одежда на модели”.
- Перед генерацией в реальном AI-режиме нужно простое предупреждение, что обработка через Fal может стоить денег.
- Для QC checklist нужно объяснение: скачать можно только после ручной проверки.
- Для Product Shot нужны подсказки по выбору фона: маркетплейсы чаще любят белый/светлый фон, Instagram допускает сцену.

## Где плохие или сложные тексты

- `Virtual try-on`, `Try-On`, `Lingerie`, `Export`, `Background removed`, `Original`, `Custom scene (English)` лучше заменить или пояснить.
- `real AI mode` и `Mock mode` в UI нужно заменить на `Реальный AI-режим` и `Демо-режим`.
- `Product type`, `Source photo type`, `Quality mode`, `Number of samples` нужно заменить на русские labels.
- `AI generated` лучше заменить на `AI-модель`.
- Ошибка про real mode и Fal Storage слишком техническая для обычного продавца.

## Mobile UX

- Landing hero сейчас центрированный и компактный, но визуальный блок из трёх фото на мобильном будет длинным и без понятных шагов/стрелок.
- `/studio` на mobile превращается в одну колонку, но левая панель очень длинная до кнопки генерации.
- Mode selector состоит из небольших строк. На телефоне лучше крупные touch-friendly карточки.
- Result cards с чеклистом и большим количеством кнопок могут стать плотными; кнопки стоит делать шире и понятнее.
- Upload preview квадратный, а studio previews 3:4; стоит унифицировать поведение и не допустить выхода за экран.

## Empty states

- В результатах сейчас текст `Результаты появятся после генерации`, но нет указания следующего действия.
- Preview empty states короткие, но не объясняют, какое фото лучше загрузить.
- Для AI-модели нет дружелюбного empty/success state с “теперь можно создать фото товара на модели”.

## Loading states

- Result loading есть как skeleton, но без текста о том, что происходит.
- Генерация модели показывает `Генерируем модель…`; лучше `Генерируем модель для примерки…`.
- У `Удалить фон` per-result есть loading state, это хорошо; стоит сохранить.
- Regenerate использует общий loading, но пользователю полезно видеть, что создаётся новый вариант.

## Error states

- Ошибки mostly русские, но часть сообщений содержит технические слова `real AI mode`, `Fal Storage`.
- Ошибки FAL_KEY_MISSING могут приходить с API; UI должен показывать понятное объяснение: нужен ключ Fal для реального режима.
- В product-shot catch используется `product shot`; лучше `товарное фото`.
- Ошибки upload уже хорошие: размер и формат на русском.

## Trust / safety

- Уже есть предупреждение, что AI может менять цвет, форму, узор или детали.
- Нужно добавить отдельный trust block в studio: фото в MVP не сохраняются в нашей базе; в демо-режиме списаний нет; в реальном режиме изображения отправляются в Fal.
- Нельзя обещать полную конфиденциальность, идеальную точность или гарантированное принятие маркетплейсом.
- Нужно объяснить, что ручная проверка обязательна, потому что AI может ошибаться.

## Компоненты, которые стоит улучшить

- `components/ui/Button.tsx`: добавить более премиальные состояния, единый radius, disabled/loading/focus.
- `components/ui/Card.tsx`: сделать карточки мягче, но без вложенных card-heavy секций.
- `components/ui/Badge.tsx`: добавить warning/danger/neutral варианты.
- `components/landing/Hero.tsx`: переписать hero, badges и demo-flow.
- `components/landing/HowItWorks.tsx`: расширить до 4 шагов простым языком.
- `components/landing/UseCases.tsx`: разделить “Что можно делать”, “Для кого”, “Важно знать”.
- `components/studio/StudioShell.tsx`: улучшить intro, trust block, copy, error states, primary actions, debug meta.
- `components/studio/StudioModeSelector.tsx`: превратить в крупные карточки с иконками и рекомендациями.
- `components/studio/ImageUploader.tsx`: drag-and-drop, preview, файл/URL приоритет, понятные hints.
- `components/studio/ModelPresetSelector.tsx`: русские labels и безопасный copy для adult AI-модели.
- `components/studio/GarmentSettingsPanel.tsx`: русские labels и значения.
- `components/studio/ProductShotSettingsPanel.tsx`: русские пресеты, подсказки, custom сценарий.
- `components/studio/GenerationResultGrid.tsx`: улучшить empty/loading/result cards и пояснение gating.
- `components/studio/QualityChecklist.tsx`: убрать `watermark`, усилить понятный human copy.

## P0 изменения

- Переименовать публичный бренд в `Vitrina AI Studio`, коротко `Vitrina AI`.
- Убрать Kaspi из позиции бренда продукта; оставить только как пример marketplace.
- Переписать весь видимый UI-copy на русский язык.
- Убрать/спрятать технические labels из основного пользовательского flow.
- Сохранить mock mode и не запускать real Fal calls.
- Не менять существующие API routes и backend provider logic.
- Обновить README, `.env.example`, `package.json`.

## P1 изменения

- Пересобрать landing под структуру: header, hero, demo-flow, 4 шага, возможности, для кого, важно знать, final CTA.
- Улучшить studio header, mode selector, upload UX, settings UX, result cards.
- Добавить trust/safety block в studio.
- Улучшить mobile layout: крупные touch targets, аккуратные grids, читаемые result cards.
- Улучшить loading/empty/error states на русском.
- Обновить дизайн-систему через CSS variables и базовые UI-компоненты.

## P2 изменения

- Добавить более точные manual QA сценарии для mock-flow.
- Добавить automated E2E/smoke tests для `/studio` mock-flow.
- В будущем добавить upload file support для standalone background remove, если это будет отдельный approved scope.
- В будущем добавить server-side export resize и историю генераций только после отдельного решения по backend.

## Решение по реализации

Запрошенные UX/UI изменения можно выполнить без переписывания backend/API logic. Реализация должна быть ограничена frontend-компонентами, README, env example, package metadata и отчётами.
