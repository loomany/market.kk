/**
 * Regression checks for the realism prompt-layer in generate-model.
 *
 * Run: npm run test:model-realism
 *
 * Guards that, after the realism layer landed:
 *   1. `buildModelGenerationPrompt` for adult lingerie / clothing / general
 *      contexts surfaces the humanRealism positives:
 *        - "natural human skin micro-detail" (or equivalent skin grain wording)
 *        - "soft realistic shading"
 *        - "subtle natural asymmetry"
 *        - "not plastic", "not waxy", "not doll-like", "not over-airbrushed"
 *   2. lingerie + neutral-base path additionally carries the
 *      `lingerieRealismGuidance` body-shading rule WITHOUT introducing
 *      garment-design / lace / pattern vocabulary on the base.
 *   3. The mandatory hardRule literal "Photorealism is mandatory:" is
 *      present in composeModelGenerationPrompt.ts source so GPT
 *      composer can never silently drop it.
 *   4. The realism layer DOES NOT inject any positive defect vocabulary
 *      (stretch marks, scars, wrinkles, cellulite, body folds) — those
 *      would either age the model or confuse FASHN at garment edges.
 *   5. The realism layer DOES NOT trigger the try-on-safe-pose regex
 *      guards (no "asymmetric arms" / "asymmetric hand placement"
 *      phrasing).
 *   6. The realism layer DOES NOT fire for under-18 models.
 *
 * Pure-string regression: no paid Fal/OpenAI calls.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildModelGenerationPrompt } from "../lib/ai/modelPrompts.ts";
import type { GenerateModelRequest } from "../lib/ai/modelGenerationSchemas.ts";

type Ctx = GenerateModelRequest["categoryContext"];

const PROJECT_ROOT = pathResolve(
  dirname(fileURLToPath(import.meta.url)),
  ".."
);

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
    aspectRatio: "3:4",
    outputFormat: "png",
    resolution: "2K",
    numImages: 1,
    ...overrides,
  } as GenerateModelRequest;
}

/** Positives every adult generate-model prompt must carry. */
const HUMAN_REALISM_POSITIVES: ReadonlyArray<readonly [string, RegExp]> = [
  ["natural human skin micro-detail", /natural (?:human )?skin (?:grain and )?micro-detail/i],
  ["soft realistic shading", /soft realistic shading/i],
  ["subtle natural asymmetry", /(?:subtle|gentle) natural asymmetry/i],
  ["not plastic", /\bnot plastic\b/i],
  ["not waxy", /\bnot waxy\b/i],
  ["not doll-like", /\bnot doll-like\b/i],
  ["not over-airbrushed", /\bnot over-airbrushed\b/i],
];

/** Positives that must appear in the lingerie + neutral-base path. */
const LINGERIE_REALISM_POSITIVES: ReadonlyArray<readonly [string, RegExp]> = [
  ["realistic soft shading around base edges", /realistic soft shading around the neutral base garment edges/i],
  ["natural shadow where base meets the body", /natural shadow where the neutral base meets the body/i],
  ["micro-detail stays on body only", /skin micro-detail stays on the body only, never on the garment/i],
];

/**
 * The realism layer must NEVER add positive defect vocabulary.
 *
 * NB: pre-existing code legitimately mentions "visible cellulite",
 * "deep wrinkles", "orange-peel skin", "lumpy dimpling" inside the
 * `catalogSkinFinishGuidance()` and `safetyNegatives()` NEGATIVE
 * lists (preceded by "without" / "no" / "Do not generate:"). The
 * regexes below intentionally exclude the "visible" modifier and
 * focus on the realism-layer style modifiers (subtle/natural/gentle/
 * soft/realistic) so we only flag NEW positive defect mentions, not
 * the existing safety negatives.
 *
 * Also: "no scars", "no marks", "no broken skin" inside the realism
 * block itself ARE allowed — those are explicit negatives.
 */
const POSITIVE_DEFECT_FORBIDDEN: ReadonlyArray<readonly [string, RegExp]> = [
  ["plain stretch marks", /\bstretch marks?\b/i],
  ["positive scars", /(?:subtle|natural|gentle|soft|realistic) scars?\b/i],
  ["positive wrinkles", /(?:subtle|natural|gentle|soft|realistic) wrinkles?\b/i],
  ["positive cellulite", /(?:subtle|natural|gentle|soft|realistic) cellulite\b/i],
  ["body folds (positive)", /(?:subtle|natural|gentle|soft|realistic) (?:body |belly |skin )?folds?\b/i],
  ["belly rolls", /\bbelly rolls?\b/i],
  ["dimples", /\bdimples?\b/i],
];

/** Pose-related regex guards from `test-tryOnSafePose.ts` must still pass. */
const POSE_REGEX_FORBIDDEN: ReadonlyArray<readonly [string, RegExp]> = [
  ["relaxed asymmetric arms", /relaxed asymmetric arms/i],
  ["arms in natural asymmetric relaxed position", /arms in natural asymmetric relaxed position/i],
  ["asymmetric hand placement", /asymmetric hand placement/i],
];

function assertContains(
  haystack: string,
  marker: RegExp,
  label: string,
  where: string
) {
  assert.ok(
    marker.test(haystack),
    `[${where}] expected to contain ${label} (${marker})\n--- prompt ---\n${haystack}\n--------------`
  );
}

function assertAbsent(
  haystack: string,
  marker: RegExp,
  label: string,
  where: string
) {
  assert.ok(
    !marker.test(haystack),
    `[${where}] expected NOT to contain ${label} (${marker})\n--- prompt ---\n${haystack}\n--------------`
  );
}

function checkAdultPromptCarriesHumanRealism(
  ctx: Ctx,
  bodyType: GenerateModelRequest["bodyType"]
) {
  const request = baseRequest({
    categoryContext: ctx,
    crop: ctx === "lingerie" ? "upper-thigh" : "full-body",
    bodyType,
  });
  const prompt = buildModelGenerationPrompt(request, {
    neutralBaseForTryOn: ctx === "lingerie",
  });

  for (const [label, re] of HUMAN_REALISM_POSITIVES) {
    assertContains(
      prompt,
      re,
      label,
      `buildModelGenerationPrompt[${ctx}, ${bodyType}]`
    );
  }
  for (const [label, re] of POSITIVE_DEFECT_FORBIDDEN) {
    assertAbsent(
      prompt,
      re,
      label,
      `buildModelGenerationPrompt[${ctx}, ${bodyType}]`
    );
  }
  for (const [label, re] of POSE_REGEX_FORBIDDEN) {
    assertAbsent(
      prompt,
      re,
      label,
      `buildModelGenerationPrompt[${ctx}, ${bodyType}] pose regression`
    );
  }
  console.log(
    `[ok] buildModelGenerationPrompt[${ctx}, ${bodyType}] carries humanRealism positives and no positive defects`
  );
}

function checkLingerieNeutralBaseRealism() {
  const request = baseRequest({
    categoryContext: "lingerie",
    bodyType: "curvy",
    crop: "upper-thigh",
  });
  const prompt = buildModelGenerationPrompt(request, {
    neutralBaseForTryOn: true,
  });

  for (const [label, re] of LINGERIE_REALISM_POSITIVES) {
    assertContains(
      prompt,
      re,
      label,
      `buildModelGenerationPrompt[lingerie neutral-base]`
    );
  }
  // No-garment-copy rule must still be present alongside realism.
  assertContains(
    prompt,
    /Do not recreate, copy, imitate, or pre-wear the uploaded garment/i,
    "MODEL_GENERATION_NO_GARMENT_COPY_RULE",
    "buildModelGenerationPrompt[lingerie neutral-base]"
  );
  // Realism block must not introduce SKU vocabulary on the base model.
  assertAbsent(
    prompt,
    /realistic soft shading around the neutral base garment edges.*\b(?:lace|floral|emerald|turquoise|pattern)\b/i,
    "garment-design vocab adjacent to base-edges realism",
    "buildModelGenerationPrompt[lingerie neutral-base]"
  );
  console.log(
    `[ok] buildModelGenerationPrompt[lingerie neutral-base] carries lingerieRealism + preserves no-garment-copy`
  );
}

function checkCurvyAdditionalBlock() {
  const request = baseRequest({
    categoryContext: "clothing",
    bodyType: "plus-size",
    crop: "full-body",
  });
  const prompt = buildModelGenerationPrompt(request);
  assertContains(
    prompt,
    /Keep realistic curvy body finish with natural soft body contours and gentle realistic shading/i,
    "curvyRealismGuidance positive",
    "buildModelGenerationPrompt[clothing, plus-size]"
  );
  assertContains(
    prompt,
    /Do not over-smooth or plastify the body/i,
    "curvyRealismGuidance counter",
    "buildModelGenerationPrompt[clothing, plus-size]"
  );
  console.log(
    "[ok] buildModelGenerationPrompt[plus-size] carries the soft curvy realism reinforcement"
  );
}

function checkMinorPromptHasNoRealismLayer() {
  // Under-18 path must NOT receive the adult realism layer (which talks
  // about body contours / collarbone shading — inappropriate wording).
  const request = baseRequest({
    categoryContext: "clothing",
    bodyType: "standard",
    crop: "full-body",
    modelAge: 10,
  });
  const prompt = buildModelGenerationPrompt(request);
  assertAbsent(
    prompt,
    /Photorealistic human skin and body finish on the model/i,
    "humanRealismGuidance",
    "buildModelGenerationPrompt[child]"
  );
  assertAbsent(
    prompt,
    /under the chin, jawline and collarbone/i,
    "collarbone shading wording",
    "buildModelGenerationPrompt[child]"
  );
  console.log(
    "[ok] buildModelGenerationPrompt[child, age=10] does NOT inject adult realism layer"
  );
}

function checkComposeModelHardRuleHasPhotorealism() {
  // composeModelGenerationPrompt.ts is server-only — read source as text
  // and assert the literal mandatory hardRule is present.
  const filePath = pathResolve(
    PROJECT_ROOT,
    "lib",
    "ai",
    "composeModelGenerationPrompt.ts"
  );
  const source = readFileSync(filePath, "utf8");
  assertContains(
    source,
    /Photorealism is mandatory: natural human skin micro-detail, soft realistic shading, subtle natural asymmetry — not plastic, not waxy, not doll-like, not over-airbrushed\./,
    "Photorealism hardRule literal",
    "composeModelGenerationPrompt.ts"
  );
  assertContains(
    source,
    /if \(isAdultModelAge\(request\.modelAge\)\)\s*\{[\s\S]*?Photorealism is mandatory/,
    "adult-only guard around the hardRule",
    "composeModelGenerationPrompt.ts"
  );
  console.log(
    "[ok] composeModelGenerationPrompt.ts carries the Photorealism mandatory hardRule (adult-only)"
  );
}

function main() {
  // Adult prompts across contexts and body types
  checkAdultPromptCarriesHumanRealism("clothing", "standard");
  checkAdultPromptCarriesHumanRealism("clothing", "plus-size");
  checkAdultPromptCarriesHumanRealism("lingerie", "curvy");
  checkAdultPromptCarriesHumanRealism("general", "standard");
  checkAdultPromptCarriesHumanRealism("jewelry", "standard");

  // Lingerie + neutral-base specific realism + no-garment-copy intact
  checkLingerieNeutralBaseRealism();

  // Curvy soft reinforcement
  checkCurvyAdditionalBlock();

  // Children path must not get adult realism wording
  checkMinorPromptHasNoRealismLayer();

  // Mandatory hardRule literal exists in GPT-composer source
  checkComposeModelHardRuleHasPhotorealism();

  console.log("\nAll model-realism regression checks passed.");
}

main();
