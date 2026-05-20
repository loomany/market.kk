# Lingerie set type + Try-On Max prompt lock

**Date:** 2026-05-20  
**Scope:** Prevent two-piece bra+brief sets from merging into bodysuit/one-piece in Try-On Max, Edit, and Repair paths.

## Problem

Real SKU (black/emerald lace bra + high-waist brief, on-model Kaspi photo) produced Try-On Max output resembling a bodysuit/one-piece instead of a two-piece set.

**Root cause:** on-model product reference + generic Max prompt with no garment-type lock. Max received correct URLs but lacked explicit “two separate pieces / not bodysuit / skin gap” instructions.

## Solution

### New fields (Vision + derived)

| Field | Purpose |
|-------|---------|
| `lingerieSetType` | `bra_brief_set`, `bra_only`, `brief_only`, `bodysuit`, `teddy`, `corset`, `swimsuit_one_piece`, `bikini_set`, `unknown` |
| `lingerieSetTypeConfidence` | 0–1 |
| `lingerieSetTypeReason` | Short English explanation |

**Modules:** `lib/ai/lingerieSetType.ts`, schema in `productDescriptionAnalysisSchemas.ts`, Vision rules in `productDescriptionVisionSchema.ts`, post-process enrich in `productDescriptionPostProcess.ts`.

### Prompt changes

| Path | File | Change |
|------|------|--------|
| Try-On Max | `fashnTryOnMaxPrompt.ts` | Type lock first (≤3 EN sentences); anti-bodysuit for `bra_brief_set` |
| FASHN Edit | `fashnGarmentPrepPrompt.ts` | Dynamic `buildFashnGarmentPrepPrompt()` with anti-merge |
| Repair | `productAnalysisPipeline.ts` | Two-piece lock + anti-bodysuit for lingerie |

### Debug

`tryOnPipelineDebug` now includes:

- `analysis.lingerieSetType`, `confidence`, `reason`
- `tryOn.garmentTypeLockApplied`, `antiOnePieceApplied`, `promptPreview`
- `premium.editLingerieSetType`, `editAntiOnePieceApplied`
- `quality.judged`, `repaired`, `judgeScore`

Studio dev panel shows compact summary above JSON.

## Prompt example (bra_brief_set)

**Before:**

> Wear the product on the model exactly as shown… + long Russian descriptionRu

**After (first sentences):**

> This is a TWO-PIECE lingerie set: a separate bra and a separate high-waisted brief. Do NOT turn it into a bodysuit, teddy, swimsuit, corset, or any one-piece garment. Keep a visible natural skin gap between the bra and the brief. Preserve black base; turquoise/green accents; floral lace pattern; …

## How to verify in debug

1. Run clothing try-on with `?debug=1` or dev mode.
2. Expand **Pipeline debug**.
3. Check:
   - `lingerieSetType: bra_brief_set`
   - `antiOnePieceApplied: true`
   - `promptPreview` contains `TWO-PIECE` and `Do NOT turn it into a bodysuit`
   - `premiumGarmentEditRan` / `repaired` if applicable.

## Tests

```bash
npm run test:lingerie-set-type
npm run test:product-view-resolver
npm run test:source-framing
npm run test:source-orientation
npm run test:premium-garment-prep
npx tsc --noEmit
npm run build
```

## A/B script (plan-only by default)

```bash
npm run test:lingerie-tryon-ab -- --product ./path.jpg --model ./model.jpg
# Paid execution requires --run + ALLOW_PAID_AI_RUNS=true + keys
```

Outputs: `.audit-outputs/lingerie-tryon-ab/summary.json` (not committed).

## Remaining / risks

- **Paid A/B** on real SKU still required to confirm Max fidelity improvement.
- On-model product remains a hard input; prompt lock reduces but may not eliminate bodysuit merges.
- Vision may misclassify edge cases → falls back to `unknown` + cautious generic lock.
- Max still ignores Fal `garment_photo_type` API param (prompt-only mitigation).
- Edit center mask may still alter lace edges — review `preparedGarmentImageUrl`.

## Fast flow

Unchanged: without Try-On Max toggle and without premium Edit flag, Fal v1.6 path behaves as before.
