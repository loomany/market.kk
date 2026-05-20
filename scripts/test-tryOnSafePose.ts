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
import { deriveSourceFramingGuidance } from "../lib/ai/sourceFramingGuidance.ts";
import { lingerieNeutralBaseOutfitGuidance } from "../lib/ai/modelIdentityPipeline.ts";
import { lingerieSetTypeFieldsForSetType } from "../lib/ai/lingerieSetType.ts";
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
  // New (hands-near-outer-thighs + minimal-base brief contract):
  ["arms drop down outer sides", /arms drop straight down along the outer sides of the body/i],
  ["hands near outer thighs only", /hands rest near the outer thighs only/i],
  [
    "hands not in front of garment area",
    /hands must not be placed in front of the abdomen, waist, stomach, briefs, hips, bra band, straps, or any garment zone/i,
  ],
  ["fingers must not overlap product", /fingers must not overlap the product area/i],
  ["no hand on hip / no arms akimbo", /no hand on hip, no arms akimbo/i],
  [
    "minimal low-profile bikini brief",
    /Brief must be a minimal low-profile classic bikini brief sitting flat against the body/i,
  ],
  ["no high-cut side panels", /no high-cut side panels/i],
  ["no pronounced waistband shape", /no pronounced or thick waistband shape/i],
  [
    "base brief must not compete with marketplace",
    /base brief must not compete with the target marketplace garment silhouette/i,
  ],
];

/** Must appear in `buildModelGenerationPrompt` output for non-jewelry contexts. */
const FULL_PROMPT_POSITIVES: ReadonlyArray<readonly [string, RegExp]> = [
  // accepts both "hands below the shoulder line" and "hands relaxed below the shoulder line"
  ["hands below the shoulder line", /below the shoulder line/i],
  ["shoulders square to camera", /shoulders square to camera/i],
  // New explicit hands-position contract:
  ["hands near outer thighs only", /hands resting near the outer thighs only/i],
  [
    "hands not in front of abdomen/waist/hips/briefs/bra band",
    /hands not in front of the abdomen, waist, hips, briefs, or bra band/i,
  ],
];

/** Must appear in the "Do not generate:" tail for non-jewelry contexts. */
const FULL_PROMPT_NEGATIVES: ReadonlyArray<readonly [string, RegExp]> = [
  ["arms raised above shoulders", /arms raised above shoulders/i],
  ["hand behind head", /hand behind head/i],
  ["raised-arm Vogue pose", /raised-arm Vogue pose/i],
  ["runway raised-arm pose", /runway raised-arm pose/i],
  ["hands crossing garment area", /hands crossing garment area/i],
  // New hand-position negatives (FASHN was distorting briefs/abdomen edges
  // when the base model's hand sat over the garment area):
  ["hand on hip", /\bhand on hip\b/i],
  ["hand on waist", /\bhand on waist\b/i],
  ["hand on stomach", /\bhand on stomach\b/i],
  ["hand on abdomen", /\bhand on abdomen\b/i],
  ["hands in front of abdomen", /\bhands in front of abdomen\b/i],
  ["hands in front of torso", /\bhands in front of torso\b/i],
  ["arms akimbo", /\barms akimbo\b/i],
  ["fingers overlapping product", /\bfingers overlapping the product area\b/i],
  ["hand resting on waistband", /\bhand resting on waistband\b/i],
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

function checkProductZoneIgnoresUnsafeSourcePose() {
  const helper = deriveSourceFramingGuidance({
    analysis: {
      descriptionRu: "x".repeat(25),
      shortAiSummaryEn: "on-model lingerie set",
      categoryContext: "lingerie",
      productCategory: "auto",
      sourcePresentation: "on-model",
      garmentPhotoType: "model",
      setType: "bra_brief_set",
      ...lingerieSetTypeFieldsForSetType("bra_brief_set"),
      baseColor: null,
      accentColors: [],
      pattern: null,
      materials: [],
      bra: { present: true, style: null, cupShape: null, straps: null },
      bottoms: { present: true, style: null, rise: "high-waist" },
      mustPreserve: [],
      fitNotes: [],
      warnings: [],
      confidence: 0.92,
      sourceModel: {
        bodyType: "curvy",
        sizeClass: "curvy",
        pose: "seated on sofa, hand on chest",
        poseRu: "сидя",
        crop: "upper-thigh",
        cameraAngle: "seated angled",
        handsPosition: "hand on chest",
        framing: "tight crop",
        bodyVisibility: "torso only",
        descriptionRu: "сидя",
        promptEn:
          "Match similar seated pose with hand on chest. Do not copy face.",
      },
    },
    categoryContext: "lingerie",
  });
  assert.equal(helper.applied, true, "product-zone helper applied");

  const prompt = buildModelGenerationPrompt(
    {
      ...baseRequest({ categoryContext: "lingerie", crop: "upper-thigh" }),
      sourceFramingGuidanceEn: helper.text,
      sourceModelPromptEn:
        "Match similar seated pose with hand on chest. Do not copy face.",
      cameraAnglePrompt: "seated on sofa, hand resting on chest",
    },
    { neutralBaseForTryOn: true }
  );

  assertContains(
    prompt,
    /entire head and full face (?:must )?always (?:remain )?visible|Non-negotiable head framing/i,
    "full head required",
    "product-zone unsafe source"
  );
  assertContains(
    prompt,
    /standing try-on-safe|Honor merchant orientation/i,
    "standing / merchant orientation",
    "product-zone unsafe source"
  );
  assertContains(
    prompt,
    /seated|hand-on-chest/i,
    "unsafe pose blocked",
    "product-zone unsafe source"
  );
  assertAbsent(prompt, /\blower face\b/i, "lower face crop", "product-zone unsafe source");
  console.log(
    "[ok] product-zone framing ignores seated/hand-on-chest source pose hints"
  );
}

function main() {
  checkLingerieNeutralBaseGuidance();
  checkAnglePresetsHaveNoAsymmetricArms();
  checkCustomAngleHasTryOnSafeFallback();
  checkLingerieSentenceHasNoAsymmetricArms();
  checkComposeModelHardRuleSourceContainsTryOnSafePose();
  checkProductZoneIgnoresUnsafeSourcePose();

  for (const ctx of ["lingerie", "clothing", "general", "jewelry"] as const) {
    checkPromptForContext(ctx);
  }

  console.log("\nAll try-on-safe pose regression checks passed.");
}

main();
