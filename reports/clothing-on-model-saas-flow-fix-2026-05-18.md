# Clothing on model SaaS flow fix — 2026-05-18

## 1. What was wrong

- UX promised multi-angle / batch behaviour while `MAX_PRODUCT_PHOTOS = 1` and `MAX_MODEL_ANGLES = 1`.
- Copy «Взять ракурс с фото товара» implied FASHN would copy the product photo pose; in reality OpenAI vision only steers **model generation**.
- Lingerie scenario defaulted to generic clothing try-on settings (`garmentPhotoType: auto`, `qualityMode: balanced`).
- Try-on handler could still call `generate-model` inline though the UI expects a ready model first (dead branch).
- No stepper, no cost/time hint before try-on, weak result trust (no Fal/Demo badge, no collapsed technical details).
- No «перегенерировать только примерку»; errors still mentioned «2+ ракурсы без edit».
- `useNeutralBaseModelGeneration` triggered React hooks lint false positives.
- `npm run smoke:ai:mock` could hit a real dev server or spawn a second `next dev` in the same repo.

## 2. What was fixed

- Product copy and labels aligned to **1 product → 1 model → 1 try-on** per run.
- Pose-from-product flow renamed and explained (model pose, not FASHN pose).
- Lingerie auto-settings + hint + warning when settings are weakened.
- Clear 3-step stepper; model and try-on are separate actions; try-on requires existing model.
- Cost/time estimate before «Создать фото на модели»; Demo / Fal AI badges; collapsed technical details.
- Regenerate try-on only (new seed, append results) vs regenerate model.
- Friendly errors updated for 1:1 flow.
- Renamed `shouldUseNeutralBaseModelGeneration`; smoke script guards; `OPENAI_VISION_MODEL` in `.env.example`.

## 3. «Подобрать позу модели по фото товара»

1. User uploads one product photo and clicks **Подобрать позу модели по фото товара**.
2. `/api/ai/analyze-product-angles` (OpenAI vision) returns a `cameraAnglePrompt` → one `ResolvedModelAngle`.
3. That angle is used when generating the AI model (`generate-model`).
4. FASHN try-on uses the **model image pose**, not the product angle prompt directly.
5. If the model is already generated and only the product photo changes, pose stays until the user regenerates the model or applies pose-from-product again.

## 4. Lingerie auto settings

When scenario **Бельё / купальники** is selected:

| Setting | Value |
|--------|--------|
| `categoryContext` | `lingerie` (via scenario) |
| `garmentPhotoType` | `model` |
| `qualityMode` | `quality` (2K) |
| `productCategory` | `auto` |

UI hint: precise try-on for catalog shots. Warning if user sets `garmentPhotoType: auto` or quality below maximum.

## 5. Stepper

`ClothingTryOnStepper` above the workflow rail:

1. **Товар** — upload product photo  
2. **Модель** — upload or generate AI model (+ lingerie framing hint)  
3. **Примерка** — garment settings, estimate, create photo  

Active step derives from: product present → model present → ready for try-on.

## 6. «Перегенерировать примерку»

On result: **Перегенерировать примерку** calls only `/api/ai/tryon` with the same product/model/settings and a new seed; results are **appended**. **Сгенерировать другую модель** runs `handleGenerateModel` separately.

## 7. Fal AI / Demo badge

- `provider === "mock"` → badge **Демо**
- `provider === "fal"` → badge **Fal AI**
- Collapsed **Технические детали**: provider, model, requestId, seed, estimated cost, promptPreview (when present)

## 8. Cost / time estimate

`TryOnCostEstimate` before primary try-on button:

- Mock: «Демо-режим: списаний нет», ~$0  
- Paid blocked: «Платные генерации заблокированы»  
- Otherwise: ~$0.12–$0.20 full pipeline, 30–60 s (local estimate, not billing)

Regenerate try-on shows ~$0.08–$0.10 try-on-only estimate.

## 9. Build result

```
npm run build — passed
```

## 10. Lint result

```
npm run lint — 8 errors, 7 warnings (exit 1)
```

Fixed in scope: `useNeutralBaseModelGeneration` rename (hooks false positive).

Remaining (out of scope, pre-existing): `PhoneCountryInput`, `WhatsAppLoginModal`, `MultiSelect`, `Select`, `ModelPromptComposer`, `StudioShell` ref/effect rules.

## 11. Smoke result

```
npm run smoke:ai:mock — stopped safely
```

Message: `Smoke остановлен: текущий сервер не в mock mode. (http://127.0.0.1:3000)` — existing dev on port 3000 is real mode; script does not spawn a second `next dev` in the same repo (Next.js lock).

To pass locally: stop dev or run mock dev on another port, e.g. `AI_MOCK_MODE=1 npm run dev -- --port 3011` then `SMOKE_BASE_URL=http://127.0.0.1:3011 npm run smoke:ai:mock`.

## 12. Real paid calls

**None** in this session.

## 13. Remaining risks

- **Fal CDN URLs** for model/result may expire — persist to Supabase Storage before production (not implemented in this fix).
- Full `npm run lint` still fails on unrelated auth/UI rules.
- Smoke requires mock server or no dev process; cannot run against real-mode dev without explicit stop.
- Regenerate try-on appends results; long sessions may need manual «Начать сначала».
- Pricing API has no try-on type; UI uses local USD estimates.
