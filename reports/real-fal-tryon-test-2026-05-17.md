# Real Fal Try-On Test Report — Vitrina AI Studio

Дата: 2026-05-18  
Статус: real test не запускался.

## Причина

Файл `test-assets/source-lingerie.jpg` отсутствует. По ТЗ при отсутствии тестового исходника real Fal test запускать нельзя.

## Calls spent

- `generate-model`: 0 / 1
- `tryon`: 0 / 2
- `product-shot`: 0
- `remove-background`: 0

## FAL_KEY safety

- `FAL_KEY` не выводился в консоль или отчёты.
- `.env.local` не менялся и не добавлялся в git.
- Real paid calls не запускались.

## Planned payload settings

Первый controlled try-on call, когда пользователь добавит `test-assets/source-lingerie.jpg`:

```json
{
  "endpoint": "POST /api/ai/tryon",
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

Второй call только если первый fail и лимит ещё доступен:

```json
{
  "endpoint": "POST /api/ai/tryon",
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

## Result URLs

Нет. Real Fal result не создавался.

## Visual QA

Не проводился из-за отсутствия тестового исходника.

## Pass/fail

Статус: blocked, not tested.  
Причина: нет `test-assets/source-lingerie.jpg`.

## Что сделать дальше

1. Положить исходник в `test-assets/source-lingerie.jpg`.
2. Включить `AI_MOCK_MODE=0` только для controlled run.
3. Запустить один real `generate-model`.
4. Запустить один real `tryon` с `category="auto"`.
5. Если fail и лимит разрешает, запустить второй `tryon` с `category="one-pieces"`.
6. Зафиксировать result URLs, настройки payload и визуальный pass/fail.
