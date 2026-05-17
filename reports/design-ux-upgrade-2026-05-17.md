# Design UX Upgrade — Vitrina AI Studio

**Дата:** 2026-05-17  
**Продукт:** Vitrina AI Studio  
**Короткое название:** Vitrina AI  
**Позиционирование:** AI-студия товарных фото для маркетплейсов

## 1. Что было улучшено

- Landing переписан под универсальный SaaS для продавцов маркетплейсов, интернет-магазинов, Instagram-витрин и каталогов.
- Header, hero, demo-flow, “Как работает”, “Что можно делать”, “Для кого”, “Важно знать” и финальный CTA приведены к новому бренду.
- Studio получила понятный intro, крупные карточки режимов и trust/safety block.
- Upload UX объясняет, что загружать, ограничения 10MB, JPEG/PNG/WEBP, приоритет файла над URL, отсутствие сохранения фото в базе MVP и временную отправку в Fal в реальном режиме.
- AI model block переписан на русский язык, с adult-only смыслом, безопасным commercial copy и предупреждением про стоимость real mode.
- Settings panels переведены на простые русские labels.
- Results UX получил более понятные empty/loading/error states, статусы, checklist gating и объяснение, почему скачивание доступно только после проверки.
- Debug meta свернута в `<details>` и не выглядит как основная часть UI.

## 2. Изменённые файлы

- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `app/studio/page.tsx`
- `components/landing/Hero.tsx`
- `components/landing/HowItWorks.tsx`
- `components/landing/UseCases.tsx`
- `components/studio/BeforeAfterPreview.tsx`
- `components/studio/GarmentSettingsPanel.tsx`
- `components/studio/GenerationResultGrid.tsx`
- `components/studio/ImageUploader.tsx`
- `components/studio/ModelPresetSelector.tsx`
- `components/studio/ProductShotSettingsPanel.tsx`
- `components/studio/QualityChecklist.tsx`
- `components/studio/StudioModeSelector.tsx`
- `components/studio/StudioShell.tsx`
- `components/studio/types.ts`
- `components/ui/Badge.tsx`
- `components/ui/Button.tsx`
- `components/ui/Card.tsx`
- `lib/ai/qualityChecklist.ts`
- `.env.example`
- `package.json`
- `README.md`

## 3. Какие UX проблемы исправлены

- Продукт больше не выглядит Kaspi-only.
- Landing объясняет продукт быстрее и проще.
- Режимы студии стали понятными для пользователя без AI-терминов.
- Product Shot объяснён как “товарное фото без модели”.
- Background Remove заменён на “Удалить фон”.
- Mock mode заменён в UI на “Демо-режим”.
- Real mode заменён в UI на “Реальный AI-режим”.
- Результаты больше не выглядят как технический output.
- Скачивание заблокировано до ручной проверки, и причина объяснена.

## 4. Какие тексты переписаны

- Hero headline/subtitle/CTA.
- Benefit badges.
- How it works steps.
- Use cases and audience tags.
- Studio intro.
- Mode selector descriptions and recommendations.
- Upload hints and validation context.
- AI model generation copy.
- Settings labels.
- Result empty/loading/error states.
- QC checklist helper text.
- README title, description, features and environment notes.

## 5. Что переименовано в Vitrina AI Studio

- Публичный бренд в landing и studio.
- Metadata fallback in `app/layout.tsx`.
- Studio page metadata.
- README title and env docs.
- `.env.example` `NEXT_PUBLIC_APP_NAME`.
- `package.json` package metadata.

## 6. Где Kaspi оставлен только как пример

- Landing audience tag: “продавцы Kaspi”.
- Landing copy: “Kaspi — только один из примеров”.
- README note: Kaspi может быть примером площадки, но не брендом продукта.

## 7. Какие проверки запускались

- `npm run lint`
- `npm run build`
- Browser DOM smoke:
  - `/` открывается как Vitrina AI Studio.
  - `/studio` содержит Vitrina AI Studio, “Студия товарных фото”, 3 режима и trust block.
  - Старый публичный бренд в DOM не найден.
- Mock API smoke на изолированном порту:
  - `POST /api/ai/generate-model` → `ok=True`, `provider=mock`.
  - `POST /api/ai/tryon` → `ok=True`, `provider=mock`.
  - `POST /api/ai/product-shot` → `ok=True`, `provider=mock`.
  - `POST /api/ai/remove-background` → `ok=True`, `provider=mock`.
- Поиск старого бренда в `app`, `components`, `README.md`, `.env.example`, `package.json`.

## 8. Build result

`npm run build` — pass.

Next.js 16.2.6 compiled successfully. Routes:

- `/`
- `/studio`
- 4 API routes under `/api/ai/*`

## 9. Lint result

`npm run lint` — pass.

## 10. Что НЕ делалось

- Supabase не подключался.
- Auth не добавлялся.
- Payments не добавлялись.
- DB не добавлялась.
- Batch queue не добавлялась.
- История генераций не добавлялась.
- `.env.local` не изменялся.
- AI provider logic и API route contracts не переписывались.
- Push не делался.

## 11. Риски

- `.env.local` содержит значение `FAL_KEY`. Поэтому проверку “real mode без ключа” нельзя корректно выполнить, не изменяя `.env.local` или не изолируя env ещё жёстче.
- Во время попытки проверки real mode without key был получен `FAL_TRYON_FAILED`, а не `FAL_KEY_MISSING`, после чего real-mode проверки были остановлены. Это означает, что окружение не было “без ключа”.
- In-app browser screenshot/CDP click automation зависала на странице с внешними изображениями; DOM smoke и API smoke прошли.
- Standalone “Удалить фон” по-прежнему работает по URL, без file upload, согласно текущему API.
- Нет автоматизированного E2E-теста полного UI-flow.

## 12. Следующий этап

- Добавить Playwright smoke test для mock-flow на локальном порту без внешних изображений.
- Добавить безопасный dev guard/скрипт для проверки `FAL_KEY_MISSING` в отдельном окружении, не читая `.env.local`.
- Добавить локальные demo assets в `public/`, чтобы browser QA не зависела от внешних Unsplash-загрузок.
