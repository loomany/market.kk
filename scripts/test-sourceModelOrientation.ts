/**
 * Regression checks for merchant orientation (front/back/side) in product-zone prompts.
 * Run: `npm run test:source-orientation`
 */
import assert from "node:assert/strict";

import { buildModelGenerationPrompt } from "../lib/ai/modelPrompts.ts";
import { deriveSourceFramingGuidance } from "../lib/ai/sourceFramingGuidance.ts";
import {
  deriveSourceModelOrientation,
  sourceModelOrientationPoseEn,
} from "../lib/ai/sourceModelOrientation.ts";
import type { GenerateModelRequest } from "../lib/ai/modelGenerationSchemas.ts";
import type { ProductDescriptionAnalysis } from "../lib/ai/productDescriptionAnalysisSchemas.ts";

function baseRequest(
  overrides: Partial<GenerateModelRequest> = {}
): GenerateModelRequest {
  return {
    gender: "female",
    bodyType: "curvy",
    modelAge: 25,
    pose: "front",
    crop: "upper-thigh",
    background: "white",
    lighting: "studio",
    categoryContext: "lingerie",
    aspectRatio: "9:16",
    outputFormat: "png",
    resolution: "2K",
    numImages: 1,
    ...overrides,
  } as GenerateModelRequest;
}

function framingForBackProduct() {
  const analysis: ProductDescriptionAnalysis = {
    descriptionRu: "Комплект на модели, вид сзади.",
    shortAiSummaryEn: "on-model lingerie set back view",
    categoryContext: "lingerie",
    productCategory: "auto",
    sourcePresentation: "on-model",
    garmentPhotoType: "model",
    setType: "bra_brief_set",
    baseColor: "black",
    accentColors: [],
    pattern: "solid",
    materials: [],
    bra: { present: true, style: "bra", cupShape: null, straps: null },
    bottoms: { present: true, style: "brief", rise: "high-waist" },
    mustPreserve: [],
    fitNotes: [],
    warnings: [],
    confidence: 0.92,
    sourceModel: {
      bodyType: "curvy",
      sizeClass: "curvy",
      pose: "standing back view, model faces away from camera, hand near shoulder",
      poseRu: "стоя спиной",
      crop: "upper-thigh",
      cameraAngle: "back view toward camera",
      handsPosition: "right hand near shoulder",
      framing: "back view from shoulders to upper thighs",
      bodyVisibility: "back, shoulders, briefs; head cropped",
      descriptionRu: "модель стоит спиной",
      promptEn:
        "Standing back view, model faces away from camera. Do not copy face.",
    },
  };
  const helper = deriveSourceFramingGuidance({
    analysis,
    categoryContext: "lingerie",
  });
  assert.equal(helper.applied, true);
  if (!helper.applied) throw new Error("framing not applied");
  return { analysis, helper };
}

function testDeriveBackOrientation() {
  const { analysis } = framingForBackProduct();
  assert.equal(
    deriveSourceModelOrientation(analysis.sourceModel),
    "back",
    "detect back view"
  );
  console.log("[ok] deriveSourceModelOrientation detects back view");
}

function testBackViewPrompt() {
  const { helper } = framingForBackProduct();
  const prompt = buildModelGenerationPrompt(
    baseRequest({
      sourceFramingGuidanceEn: helper.text,
      sourceModelPose: "standing back view, model faces away from camera",
      sourceModelCameraAngle: "back view toward camera",
      sourceModelHandsPosition: "right hand near shoulder",
    }),
    { neutralBaseForTryOn: true }
  );

  assert.match(prompt, /back view|faces away from the camera/i, "back pose in prompt");
  assert.match(
    prompt,
    /do not rotate a back or side reference to front-facing/i,
    "no front override"
  );
  assert.doesNotMatch(
    prompt,
    /Ignore source camera or pose hints that imply seated[\s\S]*front-facing try-on-safe pose with full head and face visible/i,
    "old front-only override removed"
  );
  assert.match(
    prompt,
    /back of head, hair, and nape|entire head visible from behind/i,
    "back head rule"
  );
  console.log("[ok] back-view product generates back-oriented prompt");
}

function testFrontStillWorks() {
  const prompt = buildModelGenerationPrompt(
    baseRequest({
      sourceFramingGuidanceEn:
        "Match merchant product photo crop scale and bottom cut line; try-on-safe standing model: standing front-facing toward the camera.",
      sourceModelPose: "front-facing standing",
      sourceModelCameraAngle: "straight-on",
    }),
    { neutralBaseForTryOn: true }
  );
  assert.match(prompt, /front-facing toward the camera/i);
  console.log("[ok] front reference keeps front-facing phrase");
}

function testPosePhraseTable() {
  assert.match(sourceModelOrientationPoseEn("back"), /faces away/i);
  assert.match(sourceModelOrientationPoseEn("side"), /side profile/i);
  console.log("[ok] orientation pose phrases");
}

function main() {
  testDeriveBackOrientation();
  testBackViewPrompt();
  testFrontStillWorks();
  testPosePhraseTable();
  console.log("\nAll source-model-orientation checks passed.");
}

main();
