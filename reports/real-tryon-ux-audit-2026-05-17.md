# Real Try-On UX Audit — Vitrina AI Studio

Дата: 2026-05-18  
Проект: Vitrina AI Studio  
Режим проверки: audit-only, без изменений кода до записи этого отчёта.

## Проверки этапа 0

- `git status --short`: рабочее дерево чистое.
- `git log --oneline -5`: последний коммит `3d0a4dc feat: rebrand and improve Vitrina AI Studio UX`.
- `npm run build`: успешно, Next.js 16.2.6, маршруты `/`, `/studio`, `/api/ai/*` собраны.
- `npm run lint`: успешно.
- `http://localhost:3000`: отдаёт Vitrina AI Studio.
- `http://localhost:3000/studio`: отдаёт студию Vitrina AI Studio.
- `test-assets/source-lingerie.jpg`: файл отсутствует, real Fal test запускать нельзя.
- `.env.local`: существует, `AI_MOCK_MODE=1`, `FAL_KEY` настроен, значение ключа не выводилось.

## 1. Какие режимы есть

В `/studio` есть 3 режима:

1. `Одежда на модели` — перенос одежды на модель через `POST /api/ai/tryon`.
2. `Product Shot` — товарное фото без модели через `POST /api/ai/product-shot`.
3. `Удалить фон` — удаление фона по URL через `POST /api/ai/remove-background`.

Дополнительно внутри режима одежды есть генерация AI-модели через `POST /api/ai/generate-model`.

## 2. Где mock/demo картинки могут подменять реальный result

- `lib/ai/mockResults.ts` использует внешние Unsplash URL для mock try-on, mock product shot, mock background removal, mock product preview и mock model preview.
- `components/studio/StudioShell.tsx` подставляет `MOCK_MODEL_IMAGE`, если пользователь не загрузил модель и не сгенерировал модель. В real mode это опасно: можно отправить demo-модель как настоящую целевую модель.
- `GenerationResultGrid` показывает результат без явного badge на карточке: пользователь не видит прямо в карточке, это mock или Fal.
- `meta.provider` есть только в скрываемой технической информации. Это правильно для debug, но недостаточно для QA: mock-result может выглядеть как настоящий результат.

## 3. Почему текущий результат не совпадает с исходным товаром

Главная причина ручного fail сейчас не в одной строке кода, а в смешении демо и real QA:

- mock try-on возвращает заранее заданные random/demo images и не может сохранять исходное изделие;
- внешние demo URL могут грузиться нестабильно и создавать broken image;
- при отсутствии целевой модели UI может использовать demo model fallback;
- для белья на человеке нужно явно выбрать `garmentPhotoType="model"`, `moderationLevel="permissive"`, `mode="quality"` и `outputFormat="png"`;
- default `garmentPhotoType="auto"` и `qualityMode="balanced"` слишком мягкие для controlled QA белья;
- результатам не хватает явной маркировки `Демо-результат` / `Fal AI`.

## 4. Где AI-модель генерируется как портрет вместо full body

- В UI `ModelPresetSelector` сейчас разрешает только `В полный рост` и `По пояс`, портрета в списке нет.
- Но prompt builder в `lib/ai/modelPrompts.ts` для `lingerie` только добавляет tasteful/non-explicit copy и не форсирует `full-body` или `torso and hips visible`.
- Для белья prompt должен жёстко описывать full-body или torso-to-thigh, расслабленные руки, видимый торс и бёдра, отсутствие очков, украшений и props.
- Если пользователь выберет `По пояс`, текущий prompt пишет `upper body`, что может привести к кадру без бёдер и низа комплекта.

## 5. Где broken image в result grid

- Browser check на landing показал broken image для одного Unsplash hero visual URL.
- В `GenerationResultGrid` нет `onError` fallback для result image и removed-background image.
- При битом URL браузер покажет сломанный `<img>`/alt text вместо аккуратного состояния “Изображение не загрузилось”.
- Mock QA зависит от внешних картинок, поэтому broken image может появиться даже без ошибки приложения.

## 6. UI проблемы на landing

- Landing уже на бренде Vitrina AI Studio и базово понятен.
- Hero visual зависит от внешних изображений, одно из них уже сломалось при browser check.
- Блок “Как работает” говорит про 4 шага, а новый сценарий просит более короткий SaaS-flow “3 шага”.
- Нет отдельного блока “Демо-режим / Реальный AI-режим”.
- Secondary CTA лучше заменить на “Посмотреть пример”.
- Визуал можно сделать более SaaS-like: явные labels “Исходник”, “AI-модель”, “Готовая карточка”, локальные demo assets, без зависимости от Unsplash.

## 7. UI проблемы в studio

- Нет адаптивного stepper 1-2-3, который объясняет порядок действий по выбранному режиму.
- Основная кнопка не disabled при неполном обязательном вводе; ошибка появляется только после клика.
- Для real mode нужно требовать модель: загрузить фото модели или сгенерировать AI-модель. Demo fallback нельзя использовать как незаметную замену.
- Настройки белья не автоподсказывают `Одежда на человеке`, `Максимальное качество`, `Платье / комплект`.
- В карточках результата нет provider-level badge.
- Техническая информация спрятана в details, это хорошо, но status provider нужен именно в result card.

## 8. Mobile проблемы

- Layout уже responsive, но рабочая область в `/studio` остаётся длинной формой без stepper.
- Primary action может оказаться далеко после upload/model/settings.
- Result grid на mobile должен явно идти одной колонкой, checklist и кнопки должны быть full-width.
- Before/After сейчас горизонтальный flex; на узких экранах лучше vertical.
- Preview изображения без `max-height` могут занимать слишком много экрана до кнопки генерации.
- Debug details уже collapsed, это хорошо.

## 9. Изменения по приоритетам

### P0

- Убрать реальные QA-риски mock/real смешения: result cards должны показывать `Демо-результат` или `Fal AI`.
- Не использовать `MOCK_MODEL_IMAGE` как скрытый fallback в real mode.
- Перенести mock/demo images в `public/demo/`, чтобы QA не зависел от Unsplash.
- Добавить fallback для broken image в results.
- Усилить prompt generation для lingerie: adult, full-body/torso+hips, neutral catalog pose, no sunglasses, no props, no heavy jewelry, non-explicit.
- Для сценария белья автоматически рекомендовать/ставить `garmentPhotoType="model"`, `quality="quality"`, `moderationLevel="permissive"`, `outputFormat="png"`.

### P1

- Добавить stepper 1-2-3 в studio, адаптивный под режим.
- Сделать primary button disabled с понятной подсказкой, если не загружен товар или модель.
- Обновить landing: 3 шага, demo/real block, локальный demo-flow, более сильный SaaS visual.
- Улучшить mobile: full-width buttons, vertical before/after, ограничение preview height.
- Добавить manual real Fal test instructions.

### P2

- Добавить более детальные подсказки pass/fail в QA checklist.
- Добавить отдельный manual mask/reference flow как следующий этап, если FASHN fail на белье с человеком.
- Добавить server-side export resize только в будущем, не в этом MVP.

## Вывод

Проект уже переименован и build/lint зелёные, но для реального QA переноски одежды нужно убрать неоднозначность demo/result, запретить скрытую demo-модель в real mode, локализовать demo assets и усилить controlled параметры для белья на человеке. Real Fal test сейчас не запускается, потому что нет `test-assets/source-lingerie.jpg`; при этом `.env.local` содержит Fal key, поэтому любые real проверки нужно делать только по лимиту и без вывода ключа.
