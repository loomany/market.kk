/**
 * Unit tests: productView → resolvedModelPose resolver and prompt hooks.
 * Run: npm run test:product-view-resolver
 */
import assert from "node:assert/strict";
import {
  deriveProductView,
  resolveModelPose,
  effectiveResolvedModelPoseFromRequest,
} from "../lib/ai/productViewResolver.ts";
import {
  resolvedModelPosePromptEn,
  resolvedModelPoseNegativesEn,
} from "../lib/ai/resolvedModelPosePrompts.ts";
import { buildModelGenerationPrompt } from "../lib/ai/modelPrompts.ts";
import { buildGenerateModelRequestBody } from "../lib/studio/buildGenerateModelRequest.ts";
import { buildStudioModelGenerationFields } from "../lib/ai/productGenerationContext.ts";
import { DEFAULT_MODEL_GENERATION_SETTINGS } from "../components/studio/types.ts";
import type { ProductDescriptionAnalysis } from "../lib/ai/productDescriptionAnalysisSchemas.ts";
import { lingerieSetTypeFieldsForSetType } from "../lib/ai/lingerieSetType.ts";

function backAnalysis(): ProductDescriptionAnalysis {
  return {
    confidence: 0.9,
    categoryContext: "lingerie",
    productCategory: "auto",
    garmentPhotoType: "auto",
    sourcePresentation: "on-model",
    setType: "bra_brief_set",
    ...lingerieSetTypeFieldsForSetType("bra_brief_set"),
    descriptionRu: "бельё со спины",
    shortAiSummaryEn: "test",
    baseColor: "black",
    accentColors: [],
    pattern: null,
    materials: [],
    bra: { present: true, style: null, cupShape: null, straps: null },
    bottoms: { present: true, style: "brief", rise: "high-waist" },
    mustPreserve: [],
    fitNotes: ["high-waist"],
    warnings: [],
    sourceModel: {
      bodyType: "curvy",
      sizeClass: "plus-size",
      pose: "standing back view, model faces away from camera",
      poseRu: "вид сзади",
      crop: "upper-thigh",
      cameraAngle: "rear view, back to camera",
      handsPosition: "one hand near shoulder",
      framing: "torso to upper thighs",
      bodyVisibility: "back and hips visible",
      descriptionRu: "со спины",
      promptEn: "back view standing, facing away",
    },
  };
}

// A) Product view
{
  const v = deriveProductView(backAnalysis().sourceModel);
  assert.equal(v, "back", "back lingerie → productView=back");
}
{
  const a = backAnalysis();
  a.sourceModel = {
    ...a.sourceModel!,
    pose: "front-facing standing toward camera",
    cameraAngle: "straight-on front view facing the camera",
    handsPosition: "at sides",
    promptEn: "front view catalog",
  };
  assert.equal(deriveProductView(a.sourceModel), "front");
}
{
  const sm = backAnalysis().sourceModel!;
  assert.equal(
    deriveProductView({
      ...sm,
      pose: "side profile standing",
      cameraAngle: "side view from the side",
      promptEn: "side profile catalog",
    }),
    "side"
  );
}
{
  const sm = backAnalysis().sourceModel!;
  assert.equal(
    deriveProductView({
      ...sm,
      pose: "three-quarter body turn",
      cameraAngle: "three-quarter view",
      promptEn: "3/4 catalog angle",
    }),
    "three_quarter"
  );
}
{
  const sm = backAnalysis().sourceModel!;
  assert.equal(
    deriveProductView({
      ...sm,
      pose: null,
      cameraAngle: null,
      promptEn: null,
      handsPosition: null,
      framing: null,
      descriptionRu: null,
    }),
    "unknown"
  );
}

// B) Pose resolver
{
  const r = resolveModelPose({
    uiPose: "auto",
    productView: "back",
    productViewConfidence: 0.9,
  });
  assert.equal(r.resolvedModelPose, "back_view");
  assert.equal(r.poseSource, "auto");
}
{
  const r = resolveModelPose({ uiPose: "auto", productView: "front" });
  assert.equal(r.resolvedModelPose, "front");
}
{
  const r = resolveModelPose({ uiPose: "auto", productView: "side" });
  assert.equal(r.resolvedModelPose, "side_view");
}
{
  const r = resolveModelPose({ uiPose: "auto", productView: "three_quarter" });
  assert.equal(r.resolvedModelPose, "three_quarter");
}
{
  const r = resolveModelPose({ uiPose: "auto", productView: "unknown" });
  assert.equal(r.resolvedModelPose, "safe_front");
}
{
  const r = resolveModelPose({ uiPose: "front", productView: "back" });
  assert.equal(r.resolvedModelPose, "front");
  assert.equal(r.poseSource, "manual");
  assert.ok(r.warnings.some((w) => /back-view but selected model pose is front/i.test(w)));
}

// C) Prompt
{
  const prompt = resolvedModelPosePromptEn("back_view");
  assert.match(prompt, /back facing the camera/i);
  assert.doesNotMatch(prompt, /face the camera clearly/i);
}
{
  const prompt = buildModelGenerationPrompt(
    buildGenerateModelRequestBody({
      settings: { ...DEFAULT_MODEL_GENERATION_SETTINGS, categoryContext: "lingerie", pose: "auto" },
      outputSize: { aspectRatio: "9:16", resolution: "2K" },
      promptLocale: "ru",
      seed: 1,
      resolvedModelPose: "back_view",
      productView: "back",
      sourceModelPose: "back view",
      sourceFramingGuidanceEn: "Match merchant product photo crop scale",
    })
  );
  assert.match(prompt, /back facing the camera|faces away/i);
  assert.doesNotMatch(prompt, /Model should face the camera clearly/i);
  assert.match(prompt, /waistband|back closure|bra cups/i);
}

// D) Flow parity fields
{
  const fields = buildStudioModelGenerationFields({
    analysis: backAnalysis(),
    overrides: { categoryContext: "lingerie" },
    settings: { ...DEFAULT_MODEL_GENERATION_SETTINGS, pose: "auto" },
    userDescriptionRu: "",
    userEditedProductDescription: false,
  });
  assert.equal(fields.productView, "back");
  assert.equal(fields.resolvedModelPose, "back_view");
  assert.ok(fields.sourceModelPose);
  assert.ok(fields.sourceModelCameraAngle);
  assert.ok(fields.sourceModelCrop);
}

// E) effectiveResolvedModelPoseFromRequest
assert.equal(
  effectiveResolvedModelPoseFromRequest({
    pose: "auto",
    productView: "back",
    resolvedModelPose: "back_view",
  }),
  "back_view"
);

console.log("[ok] productView resolver tests passed");
