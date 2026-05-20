# Auto view matching + premium quality pipeline

**Date:** 2026-05-20  
**Scope:** «Одежда на модели» — ракурс товара → ракурс AI-модели до FASHN Try-On, parity one-click/manual generate, clothing product-zone, premium FASHN Edit, debug.

## What was broken

1. **FASHN Try-On v1.6 does not change pose** — it copies `model_image` pose. Back-view garments on front-view models produced wrong try-on.
2. **One-click vs manual generate** — manual «Сгенерировать AI-модель» omitted `sourceModelPose`, `sourceModelCameraAngle`, `sourceModelCrop`, `productView`, `resolvedModelPose`.
3. **Prompt conflicts** — «face the camera clearly» and «both shoulders square to camera» overrode back/side product references.
4. **Product-zone** — orientation/crop guidance was lingerie-only; clothing on-model did not get safe orientation rules.
5. **Premium path** — FASHN Edit existed but was not wired from UI; quality pipeline was skipped after premium prep; UI label «2K» was only `mode=quality` on v1.6, not Try-On Max API.

## Fix: productView → resolvedModelPose

| Module | Role |
|--------|------|
| `lib/ai/productViewTypes.ts` | `ProductView`, `ResolvedModelPose`, `PoseSource` |
| `lib/ai/productViewResolver.ts` | `deriveProductView`, `resolveModelPose`, `effectiveResolvedModelPoseFromRequest` |
| `lib/ai/resolvedModelPosePrompts.ts` | Back/front/side/3/4 prompt blocks + lingerie hand rules |
| `lib/ai/productGenerationContext.ts` | `buildStudioModelGenerationFields` — single bundle for both generate paths |

**Auto pose (`settings.pose === "auto"`):**

- `productView=back` → `resolvedModelPose=back_view`
- `front` → `front`
- `side` → `side_view`
- `three_quarter` → `three_quarter`
- `unknown` → `safe_front`

**Manual pose** overrides auto; warning if e.g. product back + UI front.

`mapSourceModelToGenerationSettings` no longer forces `poseCustom` from Vision when pose is `auto` (resolver owns orientation).

## Prompt changes

- `buildModelGenerationPrompt` / `composeModelGenerationPrompt` use `resolvedModelPose` blocks.
- No default «face the camera clearly» when pose is `back_view` / `side_view`.
- Lingerie opener drops «shoulders square to camera» for back/side.
- `PREMIUM_CATALOG_QUALITY_EN` added for model generation quality wording.

## Product-zone for clothing

`deriveSourceFramingGuidance` now applies to **`clothing` + on-model** (confidence ≥ threshold), with a lighter middle phrase than lingerie. Lingerie keeps strict hand/garment-zone rules.

## Try-On quality & engines

| UI label | Reality |
|----------|---------|
| 0.5K / 1K / 2K | FASHN Try-On **v1.6** `mode` = performance / balanced / **quality** |
| «Try-On Max» (future) | `tryOnEngine: fashn_tryon_max_experimental` — **not connected**, no paid calls |

`lib/ai/tryOnEngine.ts` — `fashn_v16` | `fashn_v16_quality` | `fashn_tryon_max_experimental`.

Premium try-on: `mode=quality`, `outputFormat=png`, `numSamples=1` (unchanged defaults).

## Premium FASHN Edit (`premiumGarmentPrep`)

Runs only when:

- `AI_PREMIUM_GARMENT_EDIT_ENABLED=true`
- `garmentPrepMode=premium` (UI: **2K** resolution + feature flag via `resolveGarmentPrepMode`)
- `FASHN_API_KEY` set
- `ALLOW_PAID_AI_RUNS=true` for live calls

Flow: product → FASHN Edit (mask `center_product_zone`, 5–95% warning in debug) → `preparedGarmentImageUrl` → Try-On v1.6 → judge/repair **still runs** unless `TRYON_QUALITY_PIPELINE=0`.

**No silent fallback** in premium mode — missing key or edit failure returns `FASHN_API_KEY_MISSING` / `FASHN_EDIT_FAILED`.

Fast/default: `garmentPrepMode=fast`, no Edit.

## Debug (API + dev UI)

`generate-model` and `tryon` responses include `debug` with analysis, resolver, generation/tryOn, premium blocks.

Studio: `STUDIO_AI_DEBUG=1` shows JSON panel (`pipelineDebug`) when `isStudioAiDebugEnabled()`.

## Env

| Variable | Purpose |
|----------|---------|
| `ALLOW_PAID_AI_RUNS=true` | Paid Fal/OpenAI/FASHN |
| `AI_MOCK_MODE=0` | Real providers |
| `FAL_KEY` | Fal upload + try-on + model gen |
| `FASHN_API_KEY` | Premium Edit only |
| `AI_PREMIUM_GARMENT_EDIT_ENABLED=true` | Allow `garmentPrepMode=premium` on 2K |
| `TRYON_QUALITY_PIPELINE` | `=0` disables judge/repair |
| `COMPOSE_MODEL_PROMPT_WITH_LLM=0` | Template-only model prompts |
| `STUDIO_AI_DEBUG=1` | Pipeline debug panel |

## Tests

```bash
npm run test:product-view-resolver
npm run test:source-orientation
npm run test:source-framing
npm run test:premium-garment-prep
npx tsc --noEmit
npm run build
```

Paid manual script (not run in CI):

```bash
ALLOW_PAID_AI_RUNS=true AI_PREMIUM_GARMENT_EDIT_ENABLED=true \
  node --experimental-strip-types --import=./scripts/lib/registerTsAlias.mjs \
  scripts/test-fashn-edit-before-tryon.ts --product <url> --model <url>
```

## Remaining risks

- Vision may mis-label `sourceModel.crop` as `full-body` on square on-model photos → tall 9:16 still biases toward full-length (mitigated by product-zone text, not pixel mask).
- GPT compose can still paraphrase hard rules — use `COMPOSE_MODEL_PROMPT_WITH_LLM=0` for deterministic regression.
- FASHN Edit center mask may alter lace/SKU edges — review `preparedGarmentImageUrl` in debug.
- True **FASHN Try-On Max** API needs a separate PR; types are reserved only.

## Manual acceptance

1. Upload back-view lingerie on-model → analyze → one-click or manual generate with pose **Авто** → `debug.resolver.resolvedModelPose=back_view` → model back-facing → try-on.
2. Repeat with manual «Сгенерировать AI-модель» — same fields in request/debug.
3. Front product → `front` / `safe_front`.
4. Premium: enable env + 2K → `debug.premium.premiumGarmentEditRan=true`.
