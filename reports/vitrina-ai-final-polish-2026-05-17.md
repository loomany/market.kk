# Vitrina AI Final Polish Report

Дата: 2026-05-18  
Проект: Vitrina AI Studio

## Что исправлено

- Разделён demo и real QA на уровне UI:
  - в студии виден режим `Демо-режим` / `Реальный AI-режим`;
  - result card теперь показывает `Демо-результат` или `Fal AI`;
  - для mock-result добавлен текст: “Это демо-картинка, она не проверяет качество переноса товара.”
- В real mode убран скрытый fallback на demo-модель: для try-on нужно загрузить модель или сгенерировать AI-модель.
- Mock/demo assets перенесены с Unsplash в локальные файлы `public/demo/`.
- Result grid получил graceful fallback для broken image: “Изображение не загрузилось” + “Открыть в новой вкладке”.
- Для lingerie/on-model garment усилены prompt и настройки:
  - adult model only;
  - full-body или torso-to-thigh;
  - visible torso and hips;
  - relaxed arms away from torso;
  - no sunglasses, no heavy jewelry, no props;
  - non-explicit, not sexualized;
  - default UI adjustment: `garmentPhotoType="model"`, `mode="quality"` для сценария `Бельё / купальники`.
- Studio получила stepper 1-2-3 для каждого режима.
- Primary action теперь disabled до обязательного ввода и показывает понятную подсказку.
- Landing обновлён под более сильный SaaS-flow:
  - subtitle включает одежду, бельё, бижутерию и аксессуары;
  - 3 шага вместо 4;
  - блок `Демо-режим / Реальный AI-режим`;
  - локальный demo visual вместо внешних фото.
- Mobile UX улучшен:
  - no horizontal overflow на 360, 390, 430, 768;
  - result cards остаются одной колонкой на мобильном;
  - preview и before/after ограничены по высоте;
  - before/after становится vertical на mobile;
  - buttons остаются touch-friendly/full-width в рабочих блоках.

## Изменённые файлы

- `app/api/ai/generate-model/route.ts`
- `app/api/ai/product-shot/route.ts`
- `app/api/ai/remove-background/route.ts`
- `app/api/ai/tryon/route.ts`
- `components/landing/Hero.tsx`
- `components/landing/HowItWorks.tsx`
- `components/landing/UseCases.tsx`
- `components/studio/BeforeAfterPreview.tsx`
- `components/studio/GarmentSettingsPanel.tsx`
- `components/studio/GenerationResultGrid.tsx`
- `components/studio/ImageUploader.tsx`
- `components/studio/ModelPresetSelector.tsx`
- `components/studio/StudioShell.tsx`
- `components/studio/types.ts`
- `lib/ai/mockResults.ts`
- `lib/ai/modelPrompts.ts`
- `lib/studio/resultUtils.ts`
- `public/demo/background-removed.svg`
- `public/demo/model-full-body.svg`
- `public/demo/product-reference.svg`
- `public/demo/product-shot-accessory.svg`
- `public/demo/product-shot-jewelry.svg`
- `public/demo/tryon-result-1.svg`
- `public/demo/tryon-result-2.svg`
- `reports/real-tryon-ux-audit-2026-05-17.md`
- `reports/real-fal-test-instructions-2026-05-17.md`
- `reports/real-fal-tryon-test-2026-05-17.md`
- `reports/vitrina-ai-final-polish-2026-05-17.md`

## Fal parameters for lingerie/on-model garment

Planned controlled payload:

```json
{
  "model": "fal-ai/fashn/tryon/v1.6",
  "category": "auto",
  "garmentPhotoType": "model",
  "mode": "quality",
  "moderationLevel": "permissive",
  "numSamples": 1,
  "segmentationFree": true,
  "outputFormat": "png"
}
```

Second try-on call only if first result fails and budget allows:

```json
{
  "model": "fal-ai/fashn/tryon/v1.6",
  "category": "one-pieces",
  "garmentPhotoType": "model",
  "mode": "quality",
  "moderationLevel": "permissive",
  "numSamples": 1,
  "segmentationFree": true,
  "outputFormat": "png"
}
```

## Real Fal calls

- Real Fal test: not run.
- Reason: `test-assets/source-lingerie.jpg` is missing.
- Calls spent:
  - `generate-model`: 0
  - `tryon`: 0
  - `product-shot`: 0
  - `remove-background`: 0
- Result URLs: none.
- Pass/fail: blocked, not tested.

## Verification

- `npm run build`: passed.
- `npm run lint`: passed.
- Mock API smoke:
  - `POST /api/ai/generate-model` → `provider=mock`, prompt preview contains `full-body`, `visible torso and hips`.
  - `POST /api/ai/tryon` → `provider=mock`, 1 image.
  - `POST /api/ai/product-shot` → `provider=mock`, 1 image.
  - `POST /api/ai/remove-background` → `provider=mock`, local demo image.
- Browser smoke:
  - `/` desktop/mobile loaded.
  - `/studio` desktop/mobile loaded.
  - checked viewports: `1280x720`, `360x740`, `390x844`, `430x932`, `768x1024`.
  - no horizontal overflow detected.
  - no broken images detected after local demo assets.
  - studio shows stepper and disabled primary action helper before required input.

## Что НЕ делалось

- Supabase не подключался.
- Auth не добавлялся.
- Payments не добавлялись.
- DB не добавлялась.
- История генераций не добавлялась.
- Batch queue не добавлялась.
- `.env.local` не менялся и не добавлялся в git.
- `FAL_KEY` не выводился.
- Push не выполнялся.
- API route contracts не менялись.
- Real paid Fal calls не запускались.

## Риски

- Реальная точность переноса изделия не подтверждена без `test-assets/source-lingerie.jpg`.
- FASHN может не справиться с бельём, если исходник на человеке содержит сложную позу, перекрытия, тени или плохую видимость деталей.
- Для комплектов верх + низ может понадобиться отдельный reference flow, раздельные garment references или manual mask.
- Browser automation не заменяет ручной визуальный QA реального Fal результата.

## Следующий этап

1. Добавить `test-assets/source-lingerie.jpg`.
2. Запустить ровно 1 real `generate-model` и 1 real `tryon` с `category="auto"`.
3. Если результат fail и лимит разрешает, запустить второй `tryon` с `category="one-pieces"`.
4. Записать result URLs, payload settings и честный visual pass/fail.
5. Если fail сохраняется, проектировать manual mask/reference flow.
