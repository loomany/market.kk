# Аудит «Проработка»: фото и видео (боевой путь)

Дата: 2026-05-21  
Область: `ProcessedAssetsPanel` → API → Fal

## Резюме

| Цепочка | Референс-фото уходит в Fal | Промпт упаковывается на сервере | Негатив-промпт | Готовность к боевым запускам |
|--------|----------------------------|----------------------------------|----------------|------------------------------|
| **Фото** (Nano / FLUX) | ✅ `image_urls` / `image_url` | ✅ `prepareImagePromptPackage` | ✅ в основной промпт (нет поля API) | ✅ при `FAL_KEY` + `ALLOW_PAID_AI_RUNS` |
| **Видео** (Kling / Veo / MiniMax / Motion) | ✅ `start_image_url` / `image_url` | ✅ `prepareVideoPromptPackage` | ✅ `negative_prompt` где поддерживается | ✅ все варианты `realSchemaVerified: true` |

---

## 1. Откуда берётся референс-изображение

`assetProcessingSourceUrl(asset)`:

- Обычное фото/сцена: `asset.url` (готовый результат) или `sourceImageUrl`.
- Видео-ассет: `sourceImageUrl` (кадр-источник), не MP4.

В запросы уходит **публичный URL** (`sourceImageUrl` в JSON). Fal должен скачать файл по ссылке — локальные `blob:` / относительные пути не подходят; в студии URL обычно с CDN/Fal storage после генерации.

---

## 2. Фото: UI → `/api/ai/image/enhance` → Fal

### UI (`ProcessedAssetsPanel`)

1. Режим «Изображение», редактор (Nano Banana Pro / FLUX Kontext).
2. Настройки: формат PNG/JPG, кадр, качество (только Nano), «Сохранять товар», **негатив-промпт** (чекбокс + поле).
3. Промпт → `normalizePostProcessPrompt` (очистка video-слов, тип `ai_prompt`).
4. По «Создать изображение»:
   - опционально Vision preservation (`/api/ai/image/preservation-analyze`) если включено сохранение товара;
   - **без** клиентского `/api/ai/prompt/enhance` — упаковка только на сервере.

### Сервер

1. `prepareImagePromptPackage` (OpenAI или mock): объединяет основной промпт + исключения в **английский** `generationPrompt` (смысл не меняется).
2. `skipPromptPackage: true` если пользователь вставил готовый AI-промпт — OpenAI пропускается, негатив мержится локально.
3. `buildNanoBananaEnhancePrompt` / `buildFluxKontextEditPrompt` + product preservation block.
4. `sanitizeFinalImageEnhancePromptForFal` + лимиты длины.
5. Fal:
   - **Nano**: `fal-ai/nano-banana-pro/edit` — `image_urls: [sourceImageUrl]`, `prompt`, `aspect_ratio`, `output_format`, `resolution`, `safety_tolerance`.
   - **FLUX**: `fal-ai/flux-pro/kontext` — `image_url: sourceImageUrl`, `prompt`, `enhance_prompt: false`.

### Fal API: негатив для фото

У **nano-banana-pro/edit** и **flux-pro/kontext** нет `negative_prompt`. Исключения добавляются в конец `generationPrompt` (`Avoid: …`) через упаковщик — корректно.

### Ограничения редакторов (синхрон UI ↔ сервер)

| Параметр | Nano Banana Pro | FLUX Kontext |
|----------|-----------------|--------------|
| Кадр 4:5 | ✅ | ❌ (сброс при смене редактора) |
| Качество fast/balanced/high | ✅ | скрыто |
| PNG / JPG | ✅ | ✅ |

---

## 3. Видео: UI → `/api/ai/video/generate` → Fal

### UI

1. `VideoProviderSelect` + `VideoSettingsForm` (вариант модели).
2. Продвинутые: звук, негатив, звук референса (Motion).
3. `sourceImageUrl` + `prompt` (сырой текст) + `referenceVideoUrl` для Motion Control.

### Сервер

1. Санитизация флагов по `capabilities` (звук/негатив только если модель поддерживает).
2. `prepareVideoPromptPackage` → English `prompt` + `negativePromptForApi`.
3. `variant.inputMapper` → Fal payload.

### Референсы в Fal

| Вариант | Поле изображения | Референс-видео |
|---------|------------------|----------------|
| Kling 3 i2v | `start_image_url` | — |
| Kling 2.6 / 1.5 i2v | `start_image_url` / `image_url` | — |
| Kling Motion | `image_url` | `video_url` (обязателен) |
| MiniMax Hailuo | `image_url` | — |
| Veo 3.x | `image_url` | — |

### Негатив / звук

- **Негатив**: Kling i2v, Veo — `negative_prompt` + автодобавление PRODUCT_NEGATIVE.
- **Звук**: Kling 3 / 2.6 Pro, Veo — `generate_audio`; описание звука в основном `prompt` (отдельного поля нет).
- **Motion**: `keep_original_sound`, без негатива и без generate_audio.

### Замечания

- **4:5** на Kling 3 / 2.6 i2v: в mapper нет `aspect_ratio` — Fal сам подстраивает под `start_image_url`.
- **MiniMax**: длительность фиксирована 6 с в API; UI duration для этого варианта не влияет на Fal.
- **Veo ultra (4K)**: только если в UI выбран tier `ultra` и вариант поддерживает 4k.

---

## 4. Что нужно для боевого запуска

```env
FAL_KEY=...
ALLOW_PAID_AI_RUNS=true
OPENAI_API_KEY=...   # упаковка промптов фото/видео
AI_MOCK_MODE=0       # отключить mock
```

Токены: `wrapAiPost` на `/api/ai/image/enhance` (`enhance`) и `/api/ai/video/generate` (`video`).

---

## 5. Изменения в этой задаче

1. **Фото**: серверная упаковка промптов `lib/ai/imagePromptPackage.ts` (аналог видео).
2. **Фото**: UI негатив-промпта `ImageAdvancedSettings` + поля в `imageEnhanceRequestSchema`.
3. **Фото**: убран дублирующий клиентский `/api/ai/prompt/enhance` при создании.
4. Подсказка под промптом для изображений: `imagePromptAiNotice`.

---

## 6. Чеклист перед продакшеном

- [ ] `sourceImageUrl` открывается с интернета (curl 200, image/*).
- [ ] Motion Control: публичный MP4 в `referenceVideoUrl`.
- [ ] Промпт ≥ 8 символов для i2v (кроме Motion).
- [ ] После смены редактора фото — проверить сброс 4:5 / формата (жёлтая подсказка).
- [ ] Логи Fal при ошибке: `FAL_KEY`, content rejected, timeout.
