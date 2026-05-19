/**
 * Regression checks for the try-on-safe pose rules in generate-model prompts.
 *
 * Run: npm run test:tryon-safe-pose
 *
 * Guards that, after the FASHN raised-arm-artifact fix:
 *   1. `lingerieNeutralBaseOutfitGuidance` carries the explicit no-raised-arm /
 *      shoulders-square / no-hand-behind-head rules.
 *   2. `buildModelGenerationPrompt` (template fallback) for every non-jewelry
 *      context surfaces shoulders-square-to-camera + hands-below-shoulder-line
 *      and lists the raised-arm Vogue negatives in the "Do not generate" tail.
 *   3. Jewelry remains editorially free (no try-on raised-arm negatives — the
 *      flow never enters FASHN).
 *   4. Old "relaxed asymmetric arms" / "asymmetric hand placement" phrasing is
 *      gone from both the prompt template and the angle presets.
 *   5. Custom-angle fallback prompts still append the try-on-safe arm phrase.
 *   6. The "Try-on safe pose:" hardRule literal lives in
 *      `composeModelGenerationPrompt.ts` (read as text — that file is
 *      server-only and cannot be imported in a Node-only test).
 *
 * Pure-string regression: no paid Fal/OpenAI calls.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildModelGenerationPrompt } from "../lib/ai/modelPrompts.ts";
import { lingerieNeutralBaseOutfitGuidance } from "../lib/ai/modelIdentityPipeline.ts";
import {
  MODEL_ANGLE_PRESETS,
  resolveSelectedModelAngles,
} from "../lib/ai/modelAngles.ts";
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

/** Must appear in `lingerieNeutralBaseOutfitGuidance()`. */
const NEUTRAL_BASE_POSITIVES: ReadonlyArray<readonly [string, RegExp]> = [
  ["shoulders square to the camera", /shoulders must stay square to the camera/i],
  ["no raised arm above shoulder line", /do not raise either arm above the shoulder line/i],
  ["no hand behind head/neck/hair", /do not place a hand behind the head, neck, hair, or above the head/i],
  ["no crossed arms in front of bra band", /do not cross arms in front of the bra band or torso/i],
  ["arms relaxed at sides", /arms must stay relaxed at the sides or slightly away from the body/i],
];

/** Must appear in `buildModelGenerationPrompt` output for non-jewelry contexts. */
const FULL_PROMPT_POSITIVES: ReadonlyArray<readonly [string, RegExp]> = [
  // accepts both "hands below the shoulder line" and "hands relaxed below the shoulder line"
  ["hands below the shoulder line", /below the shoulder line/i],
  ["shoulders square to camera", /shoulders square to camera/i],
];

/** Must appear in the "Do not generate:" tail for non-jewelry contexts. */
const FULL_PROMPT_NEGATIVES: ReadonlyArray<readonly [string, RegExp]> = [
  ["arms raised above shoulders", /arms raised above shoulders/i],
  ["hand behind head", /hand behind head/i],
  ["raised-arm Vogue pose", /raised-arm Vogue pose/i],
  ["runway raised-arm pose", /runway raised-arm pose/i],
  ["hands crossing garment area", /hands crossing garment area/i],
];

/** Must NOT appear anywhere in prompts or angle presets. */
const FORBIDDEN_OLD_PHRASES: ReadonlyArray<readonly [string, RegExp]> = [
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

function checkLingerieNeutralBaseGuidance() {
  const guidance = lingerieNeutralBaseOutfitGuidance();
  for (const [label, re] of NEUTRAL_BASE_POSITIVES) {
    assertContains(guidance, re, label, "lingerieNeutralBaseOutfitGuidance");
  }
  // The pre-fix wording is gone (which was pushing Vogue/editorial arms).
  assertAbsent(
    guidance,
    /sensual but non-explicit editorial catalog pose/i,
    "old sensual-editorial pose phrase",
    "lingerieNeutralBaseOutfitGuidance"
  );
  assertAbsent(
    guidance,
    /asymmetric/i,
    "asymmetric phrasing",
    "lingerieNeutralBaseOutfitGuidance"
  );
  console.log("[ok] lingerieNeutralBaseOutfitGuidance enforces try-on-safe arms");
}

function checkPromptForContext(ctx: Ctx) {
  const request = baseRequest({
    categoryContext: ctx,
    crop: ctx === "lingerie" ? "upper-thigh" : "full-body",
    bodyType: "standard",
  });
  const prompt = buildModelGenerationPrompt(request, {
    neutralBaseForTryOn: ctx === "lingerie",
  });

  for (const [label, re] of FORBIDDEN_OLD_PHRASES) {
    assertAbsent(prompt, re, label, `buildModelGenerationPrompt[${ctx}]`);
  }

  if (ctx === "jewelry") {
    // Jewelry never enters FASHN — try-on negatives must NOT be present.
    assertAbsent(
      prompt,
      /arms raised above shoulders/i,
      "try-on raised-arm negative",
      `buildModelGenerationPrompt[${ctx}]`
    );
    assertAbsent(
      prompt,
      /raised-arm Vogue pose/i,
      "try-on Vogue negative",
      `buildModelGenerationPrompt[${ctx}]`
    );
    console.log(
      `[ok] buildModelGenerationPrompt[${ctx}] keeps editorial freedom (no try-on pose negatives)`
    );
    return;
  }

  for (const [label, re] of FULL_PROMPT_POSITIVES) {
    assertContains(prompt, re, label, `buildModelGenerationPrompt[${ctx}]`);
  }
  for (const [label, re] of FULL_PROMPT_NEGATIVES) {
    assertContains(
      prompt,
      re,
      label,
      `buildModelGenerationPrompt[${ctx}] safety negatives`
    );
  }
  console.log(
    `[ok] buildModelGenerationPrompt[${ctx}] carries the try-on-safe arm rule + negatives`
  );
}

function checkLingerieSentenceHasNoAsymmetricArms() {
  const prompt = buildModelGenerationPrompt(baseRequest(), {
    neutralBaseForTryOn: true,
  });
  assertContains(
    prompt,
    /arms relaxed naturally along the body/i,
    "lingerie main sentence — relaxed natural arms",
    "buildModelGenerationPrompt[lingerie neutral base]"
  );
  console.log("[ok] lingerie main sentence uses try-on-safe arm phrasing");
}

function checkAnglePresetsHaveNoAsymmetricArms() {
  for (const preset of MODEL_ANGLE_PRESETS) {
    if (!preset.prompt) continue;
    for (const [label, re] of FORBIDDEN_OLD_PHRASES) {
      assertAbsent(
        preset.prompt,
        re,
        label,
        `MODEL_ANGLE_PRESETS[${preset.id}]`
      );
    }
  }
  console.log(
    "[ok] MODEL_ANGLE_PRESETS no longer encourage asymmetric / raised arms"
  );
}

function checkCustomAngleHasTryOnSafeFallback() {
  const resolved = resolveSelectedModelAngles({
    anglePresets: [],
    customAngles: [
      { id: "c1", text: "у большого окна с дневным светом", saved: false },
    ],
  });
  assert.equal(resolved.length, 1, "custom angle should resolve to one entry");
  assertContains(
    resolved[0]!.prompt,
    /arms relaxed below the shoulder line/i,
    "custom-angle fallback enforces try-on-safe arms",
    "resolveSelectedModelAngles"
  );
  console.log(
    "[ok] resolveSelectedModelAngles appends try-on-safe arm fallback to custom angles"
  );
}

function checkComposeModelHardRuleSourceContainsTryOnSafePose() {
  // `composeModelGenerationPrompt.ts` is server-only — we cannot import it
  // here. Read it as text and assert the literal hardRule string is present
  // (this is the rule that travels into GPT's structured settings).
  const filePath = pathResolve(
    PROJECT_ROOT,
    "lib",
    "ai",
    "composeModelGenerationPrompt.ts"
  );
  const source = readFileSync(filePath, "utf8");
  assertContains(
    source,
    /Try-on safe pose: both arms relaxed and held below the shoulder line/,
    "Try-on safe pose hardRule literal",
    "composeModelGenerationPrompt.ts"
  );
  assertContains(
    source,
    /Keep chest, waist, hips, straps, and garment zones clear for virtual try-on/,
    "garment-zones-clear clause",
    "composeModelGenerationPrompt.ts"
  );
  assertContains(
    source,
    /request\.categoryContext !== "jewelry"/,
    "guard against jewelry path",
    "composeModelGenerationPrompt.ts"
  );
  console.log(
    "[ok] composeModelGenerationPrompt.ts carries the Try-on safe pose hardRule"
  );
}

function main() {
  checkLingerieNeutralBaseGuidance();
  checkAnglePresetsHaveNoAsymmetricArms();
  checkCustomAngleHasTryOnSafeFallback();
  checkLingerieSentenceHasNoAsymmetricArms();
  checkComposeModelHardRuleSourceContainsTryOnSafePose();

  for (const ctx of ["lingerie", "clothing", "general", "jewelry"] as const) {
    checkPromptForContext(ctx);
  }

  console.log("\nAll try-on-safe pose regression checks passed.");
}

main();
