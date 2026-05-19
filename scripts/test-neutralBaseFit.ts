/**
 * Regression checks for `deriveNeutralBaseFitGuidance` — the pure helper that
 * turns the existing product-analysis fit signals into a whitelisted English
 * "match silhouette, not design" sentence for the lingerie neutral base.
 *
 * Run: `npm run test:neutral-base-fit`
 *
 * Two layers of coverage:
 *  1. Helper unit tests (cases 1–13): pure input→output of
 *     `deriveNeutralBaseFitGuidance`, exhaustive over enum values, with an
 *     adversarial-Vision-input test that proves SKU vocabulary cannot leak.
 *  2. Wiring tests (cases 14–18, runtime): exercise the public
 *     `productAnalysisForModelGeneration` + `buildModelGenerationPrompt`
 *     pipeline that the generate-model route consumes. Proves the
 *     fit-guidance sentence reaches the final prompt for lingerie SKUs with
 *     confident analyses, and never for clothing / jewelry / low-confidence /
 *     missing analyses. The no-garment-copy rule, try-on-safe pose rules and
 *     model-realism rules must still survive alongside the new guidance.
 *
 * Pure-string regression: no paid Fal / OpenAI calls, no network, no I/O.
 */
import assert from "node:assert/strict";

import {
  NEUTRAL_BASE_FIT_GUIDANCE_MAX_LEN,
  deriveNeutralBaseFitGuidance,
  type FitAwareCategoryContext,
} from "../lib/ai/neutralBaseFitGuidance.ts";
import type { ProductDescriptionAnalysis } from "../lib/ai/productDescriptionAnalysisSchemas.ts";
import { buildModelGenerationPrompt } from "../lib/ai/modelPrompts.ts";
import { MODEL_GENERATION_NO_GARMENT_COPY_RULE } from "../lib/ai/modelIdentityPipeline.ts";
import type { GenerateModelRequest } from "../lib/ai/modelGenerationSchemas.ts";
import { productAnalysisForModelGeneration } from "../lib/ai/productAnalysisShared.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function baseAnalysis(
  overrides: Partial<ProductDescriptionAnalysis> = {}
): ProductDescriptionAnalysis {
  return {
    descriptionRu:
      "На фото комплект нижнего белья на модели: чёрный поддерживающий бюстгальтер с широкими бретелями и высокие трусы с бирюзово-зелёным кружевным узором.",
    shortAiSummaryEn:
      "on-model lingerie set, bra + high-waist brief, preserve cup shape, preserve high-waist fit",
    categoryContext: "lingerie",
    productCategory: "auto",
    sourcePresentation: "on-model",
    garmentPhotoType: "model",
    setType: "bra_brief_set",
    baseColor: "black",
    accentColors: ["turquoise", "green"],
    pattern: "floral lace",
    materials: ["lace"],
    bra: {
      present: true,
      style: "supportive bra",
      cupShape: "full cup",
      straps: "wide",
    },
    bottoms: {
      present: true,
      style: "brief",
      rise: "high-waist",
    },
    mustPreserve: [
      "black base color",
      "turquoise-green floral lace pattern",
      "wide bra straps",
      "supportive full cup shape",
      "high-waist brief fit",
    ],
    fitNotes: [
      "preserve the depth and support of the bra cups",
      "preserve the high-waist silhouette of the briefs",
      "avoid turning the briefs into low-rise bottoms",
    ],
    warnings: [],
    confidence: 0.92,
    sourceModel: null,
    ...overrides,
  };
}

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

function assertContains(
  haystack: string,
  marker: RegExp,
  label: string,
  where: string
) {
  assert.ok(
    marker.test(haystack),
    `[${where}] expected to contain ${label} (${marker})\n--- text ---\n${haystack}\n--------------`
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
    `[${where}] expected NOT to contain ${label} (${marker})\n--- text ---\n${haystack}\n--------------`
  );
}

/**
 * The decorative-design vocabulary that must NEVER appear in the helper
 * output — neither as positive instructions ("high-waist black lace bra")
 * nor as negative restatements ("no lace, no emerald"). The existing
 * `lingerieNeutralBaseOutfitGuidance` and `MODEL_GENERATION_NO_GARMENT_COPY_RULE`
 * already carry the detailed "no lace / no floral / no turquoise" wording at
 * the prompt level; the helper output stays strictly silhouette-only so it
 * cannot leak SKU design even if used in isolation.
 */
const FORBIDDEN_TOKENS: ReadonlyArray<readonly [string, RegExp]> = [
  ["lace", /\blace\b/i],
  ["emerald", /\bemerald\b/i],
  ["turquoise", /\bturquoise\b/i],
  ["floral", /\bfloral\b/i],
  ["black base", /\bblack base\b/i],
  ["scalloped", /\bscallop/i],
  ["embroidery", /\bembroider/i],
  ["floral lace", /\bfloral\s+lace\b/i],
  ["decorative", /\bdecorative\b/i],
  ["pattern", /\bpattern\b/i],
  ["print", /\bprint\b/i],
  ["logo", /\blogo\b/i],
  // No concrete colour vocabulary at all
  ["color word", /\bcolou?r\b/i],
  ["black", /\bblack\b/i],
  ["green", /\bgreen\b/i],
  ["red", /\bred\b/i],
  ["blue", /\bblue\b/i],
  ["beige", /\bbeige\b/i],
  ["nude", /\bnude\b/i],
];

function assertNoForbiddenTokens(text: string, label: string) {
  for (const [name, re] of FORBIDDEN_TOKENS) {
    assertAbsent(text, re, name, label);
  }
}

// ---------------------------------------------------------------------------
// case 1 — current black/emerald high-waist bra+brief set
// ---------------------------------------------------------------------------

function caseHighWaistFullCupWide() {
  const result = deriveNeutralBaseFitGuidance({
    analysis: baseAnalysis(),
    categoryContext: "lingerie",
  });

  assert.equal(result.applied, true, "case 1: applied should be true");
  if (!result.applied) return;

  assertContains(
    result.text,
    /high-waist neutral brief silhouette/i,
    "high-waist neutral brief silhouette",
    "case 1"
  );
  assertContains(
    result.text,
    /full-cup neutral bra shape/i,
    "full-cup neutral bra shape",
    "case 1"
  );
  assertContains(
    result.text,
    /wider shoulder straps/i,
    "wider shoulder straps",
    "case 1"
  );
  assertContains(
    result.text,
    /structured supportive bra silhouette/i,
    "structured supportive bra silhouette",
    "case 1"
  );
  assertContains(
    result.text,
    /Match silhouette geometry only/i,
    "negative tail anchor",
    "case 1"
  );

  // Strict ban list — no SKU design tokens may leak
  assertNoForbiddenTokens(result.text, "case 1 helper output");

  // Inputs match what we derived
  assert.equal(result.inputs.bra?.cupCoverage, "full_cup");
  assert.equal(result.inputs.bra?.strapWidth, "wide");
  assert.equal(result.inputs.bra?.supportLevel, "structured");
  assert.equal(result.inputs.bottom?.waistHeight, "high_waist");
  assert.equal(result.inputs.bottom?.backCoverage, "brief");

  console.log("[ok] case 1: high-waist + full-cup + wide straps");
}

// ---------------------------------------------------------------------------
// case 2 — low-rise bra+brief
// ---------------------------------------------------------------------------

function caseLowRise() {
  const result = deriveNeutralBaseFitGuidance({
    analysis: baseAnalysis({
      bottoms: { present: true, style: "bikini brief", rise: "low-rise" },
      bra: { present: true, style: "soft cup", cupShape: "triangle", straps: "thin" },
      fitNotes: ["preserve the low-rise silhouette"],
      baseColor: "white",
      accentColors: [],
      pattern: null,
      mustPreserve: ["soft cup shape", "thin straps"],
    }),
    categoryContext: "lingerie",
  });

  assert.equal(result.applied, true, "case 2: applied should be true");
  if (!result.applied) return;

  assertContains(
    result.text,
    /low-rise neutral brief silhouette/i,
    "low-rise neutral brief silhouette",
    "case 2"
  );
  assertContains(
    result.text,
    /soft triangle-style neutral bra shape/i,
    "soft triangle neutral bra shape",
    "case 2"
  );
  assertContains(
    result.text,
    /thinner shoulder straps/i,
    "thinner shoulder straps",
    "case 2"
  );
  assertAbsent(
    result.text,
    /high-waist/i,
    "no high-waist in low-rise case",
    "case 2"
  );

  assertNoForbiddenTokens(result.text, "case 2 helper output");

  console.log("[ok] case 2: low-rise + soft triangle + thin straps");
}

// ---------------------------------------------------------------------------
// case 3 — unknown fit (all enum mappings fail)
// ---------------------------------------------------------------------------

function caseUnknownFit() {
  const result = deriveNeutralBaseFitGuidance({
    analysis: baseAnalysis({
      bra: { present: true, style: null, cupShape: null, straps: null },
      bottoms: { present: true, style: null, rise: null },
      fitNotes: [],
      mustPreserve: [],
    }),
    categoryContext: "lingerie",
  });

  assert.equal(result.applied, false, "case 3: applied should be false");
  assert.equal(result.text, "", "case 3: text empty when not applied");
  console.log("[ok] case 3: unknown fit → applied=false");
}

// ---------------------------------------------------------------------------
// case 4 — clothing context (non-lingerie)
// ---------------------------------------------------------------------------

function caseClothingContext() {
  const result = deriveNeutralBaseFitGuidance({
    analysis: baseAnalysis({
      categoryContext: "clothing",
      setType: "dress",
    }),
    categoryContext: "clothing",
  });

  assert.equal(result.applied, false, "case 4: applied should be false");
  assert.equal(result.text, "", "case 4: text empty when not applied");
  console.log("[ok] case 4: categoryContext=clothing → applied=false");
}

// ---------------------------------------------------------------------------
// case 5 — jewelry context
// ---------------------------------------------------------------------------

function caseJewelryContext() {
  const result = deriveNeutralBaseFitGuidance({
    analysis: baseAnalysis({
      categoryContext: "jewelry",
      setType: "unknown",
      bra: { present: false, style: null, cupShape: null, straps: null },
      bottoms: { present: false, style: null, rise: null },
    }),
    categoryContext: "jewelry",
  });

  assert.equal(result.applied, false, "case 5: applied should be false");
  console.log("[ok] case 5: categoryContext=jewelry → applied=false");
}

// ---------------------------------------------------------------------------
// case 6 — low confidence
// ---------------------------------------------------------------------------

function caseLowConfidence() {
  const result = deriveNeutralBaseFitGuidance({
    analysis: baseAnalysis({ confidence: 0.4 }),
    categoryContext: "lingerie",
  });

  assert.equal(result.applied, false, "case 6: applied should be false");
  assert.match(
    result.reason,
    /confidence/i,
    "case 6: reason should mention confidence"
  );
  console.log("[ok] case 6: low confidence (0.4) → applied=false");
}

// ---------------------------------------------------------------------------
// case 7 — null analysis
// ---------------------------------------------------------------------------

function caseNullAnalysis() {
  const result = deriveNeutralBaseFitGuidance({
    analysis: null,
    categoryContext: "lingerie",
  });

  assert.equal(result.applied, false, "case 7: applied should be false");
  console.log("[ok] case 7: null analysis → applied=false");
}

// ---------------------------------------------------------------------------
// case 8 — adversarial Vision strings (colour / lace / SKU vocabulary in source)
// ---------------------------------------------------------------------------

function caseAdversarialAnalysis() {
  // Vision returns polluted strings that mention colour + lace + pattern in
  // every text field. The helper must still emit a clean silhouette-only
  // sentence — the regex maps catch only the silhouette tokens (full cup,
  // wide straps, high-waist) and the phrase-constant tables never echo the
  // input.
  const result = deriveNeutralBaseFitGuidance({
    analysis: baseAnalysis({
      bra: {
        present: true,
        style: "supportive black lace bra with emerald floral panels",
        cupShape: "full cup with turquoise lace overlay",
        straps: "wide black satin straps with green embroidery",
      },
      bottoms: {
        present: true,
        style: "high-waist brief with scalloped emerald lace edges",
        rise: "high-waist with floral lace panels",
      },
      fitNotes: [
        "black base color",
        "turquoise-green floral lace pattern",
        "scalloped lace edges",
        "emerald decorative panels",
      ],
      mustPreserve: [
        "black base color",
        "turquoise-green floral lace pattern",
        "scalloped lace edges",
      ],
    }),
    categoryContext: "lingerie",
  });

  assert.equal(
    result.applied,
    true,
    "case 8: applied should be true (signals still extractable)"
  );
  if (!result.applied) return;

  // Proof: even when every input field is polluted with colour + lace +
  // floral + emerald + scalloped + pattern wording, NONE of these tokens
  // appear in the helper output.
  assertNoForbiddenTokens(result.text, "case 8 helper output (adversarial)");

  // The silhouette signals were still correctly extracted.
  assertContains(
    result.text,
    /high-waist neutral brief silhouette/i,
    "high-waist signal survived adversarial input",
    "case 8"
  );
  assertContains(
    result.text,
    /full-cup neutral bra shape/i,
    "full-cup signal survived adversarial input",
    "case 8"
  );
  assertContains(
    result.text,
    /wider shoulder straps/i,
    "wide-straps signal survived adversarial input",
    "case 8"
  );

  console.log(
    "[ok] case 8: adversarial Vision text → silhouette extracted, no SKU vocabulary leaks"
  );
}

// ---------------------------------------------------------------------------
// case 9 — prompt length safety
// ---------------------------------------------------------------------------

function casePromptLengthSafety() {
  // Max-signal case (every enum filled) — verify we still respect the cap.
  const result = deriveNeutralBaseFitGuidance({
    analysis: baseAnalysis({
      fitNotes: [
        "longline band extending toward ribs",
        "wide side panels on the briefs",
        "high-cut leg openings",
        "full back coverage briefs",
      ],
    }),
    categoryContext: "lingerie",
  });
  assert.equal(result.applied, true, "case 9: applied");
  if (!result.applied) return;

  assert.ok(
    result.text.length <= NEUTRAL_BASE_FIT_GUIDANCE_MAX_LEN,
    `case 9: text length ${result.text.length} > cap ${NEUTRAL_BASE_FIT_GUIDANCE_MAX_LEN}`
  );

  // Also: helper must not contain the entire prompt budget on its own
  // (GENERATION_PROMPT_MAX = 3500 in composeModelGenerationPrompt.ts).
  assert.ok(
    result.text.length <= 700,
    `case 9: hard cap 700; got ${result.text.length}`
  );
  console.log(
    `[ok] case 9: prompt length safe (${result.text.length} <= ${NEUTRAL_BASE_FIT_GUIDANCE_MAX_LEN})`
  );
}

// ---------------------------------------------------------------------------
// case 10 — non-lingerie contexts all gated
// ---------------------------------------------------------------------------

function caseAllNonLingerieContextsGated() {
  const contexts: FitAwareCategoryContext[] = ["clothing", "general", "jewelry"];
  for (const ctx of contexts) {
    const result = deriveNeutralBaseFitGuidance({
      analysis: baseAnalysis({ categoryContext: ctx }),
      categoryContext: ctx,
    });
    assert.equal(
      result.applied,
      false,
      `case 10: categoryContext=${ctx} should be gated`
    );
  }
  console.log("[ok] case 10: clothing/general/jewelry all gated to applied=false");
}

// ---------------------------------------------------------------------------
// case 11 — bra_only (no bottoms) and bottoms_only (no bra)
// ---------------------------------------------------------------------------

function caseBraOnlyAndBottomsOnly() {
  const braOnly = deriveNeutralBaseFitGuidance({
    analysis: baseAnalysis({
      setType: "bra_only",
      bottoms: { present: false, style: null, rise: null },
    }),
    categoryContext: "lingerie",
  });
  assert.equal(braOnly.applied, true, "case 11a: bra-only applied");
  if (braOnly.applied) {
    assert.equal(
      braOnly.inputs.bottom,
      undefined,
      "case 11a: no bottom inputs"
    );
    assertAbsent(
      braOnly.text,
      /brief silhouette/i,
      "no brief silhouette without bottoms",
      "case 11a"
    );
    assertContains(
      braOnly.text,
      /full-cup neutral bra shape/i,
      "bra signal present",
      "case 11a"
    );
  }

  const bottomsOnly = deriveNeutralBaseFitGuidance({
    analysis: baseAnalysis({
      setType: "bottoms_only",
      bra: { present: false, style: null, cupShape: null, straps: null },
    }),
    categoryContext: "lingerie",
  });
  assert.equal(bottomsOnly.applied, true, "case 11b: bottoms-only applied");
  if (bottomsOnly.applied) {
    assert.equal(
      bottomsOnly.inputs.bra,
      undefined,
      "case 11b: no bra inputs"
    );
    assertContains(
      bottomsOnly.text,
      /high-waist neutral brief silhouette/i,
      "brief signal present",
      "case 11b"
    );
    assertAbsent(
      bottomsOnly.text,
      /shoulder straps/i,
      "no bra straps without bra",
      "case 11b"
    );
  }
  console.log("[ok] case 11: bra_only / bottoms_only — correctly partial");
}

// ---------------------------------------------------------------------------
// case 12 — runtime wiring: buildModelGenerationPrompt now consumes
// `neutralBaseFitGuidanceEn` and surfaces it AFTER the no-garment-copy rule.
// ---------------------------------------------------------------------------

const HELPER_SIGNATURE = "matches only the product fit silhouette";

function checkPromptWiringWithFitGuidance() {
  const baseline = buildModelGenerationPrompt(baseRequest(), {
    neutralBaseForTryOn: true,
  });
  assertAbsent(
    baseline,
    new RegExp(HELPER_SIGNATURE, "i"),
    "helper signature without neutralBaseFitGuidanceEn",
    "buildModelGenerationPrompt[baseline]"
  );

  const helperResult = deriveNeutralBaseFitGuidance({
    analysis: baseAnalysis(),
    categoryContext: "lingerie",
  });
  assert.equal(helperResult.applied, true, "case 12: helper applied");
  if (!helperResult.applied) return;

  const wired = buildModelGenerationPrompt(
    baseRequest({ neutralBaseFitGuidanceEn: helperResult.text }),
    { neutralBaseForTryOn: true }
  );

  // No-garment-copy rule still present, verbatim.
  assertContains(
    wired,
    /Do not recreate, copy, imitate, or pre-wear the uploaded garment/i,
    "MODEL_GENERATION_NO_GARMENT_COPY_RULE literal",
    "buildModelGenerationPrompt[lingerie neutral-base + fit]"
  );
  assert.ok(
    wired.includes(MODEL_GENERATION_NO_GARMENT_COPY_RULE),
    "no-garment-copy rule constant must appear verbatim in the wired prompt"
  );

  // Helper output is now embedded.
  assertContains(
    wired,
    /Neutral base fit guidance \(silhouette only, never design\):/i,
    "wiring marker",
    "buildModelGenerationPrompt[lingerie neutral-base + fit]"
  );
  assert.ok(
    wired.includes(helperResult.text),
    "case 12: full helper output present verbatim in the prompt"
  );

  // Order: no-copy rule must appear BEFORE the fit guidance.
  const noCopyAt = wired.indexOf(MODEL_GENERATION_NO_GARMENT_COPY_RULE);
  const fitAt = wired.indexOf(helperResult.text);
  assert.ok(
    noCopyAt >= 0 && fitAt > noCopyAt,
    `case 12: no-garment-copy rule must precede fit guidance (noCopyAt=${noCopyAt}, fitAt=${fitAt})`
  );

  console.log(
    "[ok] case 12: buildModelGenerationPrompt now surfaces fit guidance after no-garment-copy rule"
  );
}

// ---------------------------------------------------------------------------
// case 12b — runtime wiring: the helper's silhouette signals reach the
// final prompt for the black/emerald high-waist set, and the helper segment
// itself stays free of decorative-design vocabulary.
// ---------------------------------------------------------------------------

function checkHighWaistSilhouetteReachesFinalPrompt() {
  const helperResult = deriveNeutralBaseFitGuidance({
    analysis: baseAnalysis(),
    categoryContext: "lingerie",
  });
  assert.equal(helperResult.applied, true, "case 12b: helper applied");
  if (!helperResult.applied) return;

  const wired = buildModelGenerationPrompt(
    baseRequest({ neutralBaseFitGuidanceEn: helperResult.text }),
    { neutralBaseForTryOn: true }
  );

  for (const re of [
    /high-waist neutral brief silhouette/i,
    /full-cup neutral bra shape/i,
    /wider shoulder straps/i,
    /structured supportive bra silhouette/i,
    /Match silhouette geometry only/i,
  ]) {
    assertContains(wired, re, re.source, "case 12b wired prompt");
  }

  // The helper's contribution (its exact text) must not introduce any
  // decorative-design vocabulary. We isolate the helper's substring inside
  // the wired prompt and assert no forbidden token is present there.
  // (The wider prompt contains negatives like "no lace, no floral pattern"
  // from `lingerieNeutralBaseOutfitGuidance` — those are correct negatives,
  // not helper output. PR #2 must not introduce any new positive design
  // vocabulary on top of the existing prompt.)
  const helperStart = wired.indexOf(helperResult.text);
  assert.ok(
    helperStart >= 0,
    "case 12b: helper text must appear in the wired prompt"
  );
  const helperSlice = wired.slice(
    helperStart,
    helperStart + helperResult.text.length
  );
  assertNoForbiddenTokens(helperSlice, "case 12b helper slice");

  console.log(
    "[ok] case 12b: high-waist / full-cup / wider straps reach the final prompt; helper slice is clean"
  );
}

// ---------------------------------------------------------------------------
// case 14 — productAnalysisForModelGeneration returns neutralBaseFitGuidanceEn
// for confident lingerie + high-waist analysis.
// ---------------------------------------------------------------------------

function checkProductAnalysisShimEmitsFitGuidance() {
  const productGen = productAnalysisForModelGeneration(
    baseAnalysis(),
    { categoryContext: "lingerie" },
    "",
    false
  );
  assert.ok(
    typeof productGen.neutralBaseFitGuidanceEn === "string" &&
      productGen.neutralBaseFitGuidanceEn.length > 0,
    "case 14: productGen.neutralBaseFitGuidanceEn must be a non-empty string"
  );
  assertContains(
    productGen.neutralBaseFitGuidanceEn!,
    /high-waist neutral brief silhouette/i,
    "shim output carries high-waist signal",
    "case 14"
  );
  assertNoForbiddenTokens(
    productGen.neutralBaseFitGuidanceEn!,
    "case 14 productGen.neutralBaseFitGuidanceEn"
  );
  console.log(
    "[ok] case 14: productAnalysisForModelGeneration emits neutralBaseFitGuidanceEn for confident lingerie"
  );
}

// ---------------------------------------------------------------------------
// case 15 — productAnalysisForModelGeneration does NOT emit fit guidance for
// non-lingerie contexts (clothing / jewelry / general).
// ---------------------------------------------------------------------------

function checkProductAnalysisShimGatesNonLingerie() {
  for (const ctx of ["clothing", "jewelry", "general"] as const) {
    const productGen = productAnalysisForModelGeneration(
      baseAnalysis({ categoryContext: ctx }),
      { categoryContext: ctx },
      "",
      false
    );
    assert.equal(
      productGen.neutralBaseFitGuidanceEn,
      undefined,
      `case 15: ctx=${ctx} must not get neutralBaseFitGuidanceEn`
    );
  }
  console.log(
    "[ok] case 15: productAnalysisForModelGeneration gates non-lingerie contexts"
  );
}

// ---------------------------------------------------------------------------
// case 16 — productAnalysisForModelGeneration gates low-confidence analyses.
// ---------------------------------------------------------------------------

function checkProductAnalysisShimGatesLowConfidence() {
  const productGen = productAnalysisForModelGeneration(
    baseAnalysis({ confidence: 0.4 }),
    { categoryContext: "lingerie" },
    "",
    false
  );
  assert.equal(
    productGen.neutralBaseFitGuidanceEn,
    undefined,
    "case 16: low confidence must not emit fit guidance"
  );
  console.log(
    "[ok] case 16: productAnalysisForModelGeneration gates low-confidence analyses"
  );
}

// ---------------------------------------------------------------------------
// case 17 — co-existence: fit guidance does NOT displace try-on-safe pose,
// realism, no-garment-copy, or framing rules already in the prompt.
// ---------------------------------------------------------------------------

function checkFitGuidanceCoexistsWithSafetyLayers() {
  const helperResult = deriveNeutralBaseFitGuidance({
    analysis: baseAnalysis(),
    categoryContext: "lingerie",
  });
  assert.equal(helperResult.applied, true, "case 17: helper applied");
  if (!helperResult.applied) return;

  const wired = buildModelGenerationPrompt(
    baseRequest({ neutralBaseFitGuidanceEn: helperResult.text }),
    { neutralBaseForTryOn: true }
  );

  // try-on-safe pose: shoulders square + hands near outer thighs only
  assertContains(
    wired,
    /shoulders square to camera/i,
    "shoulders square",
    "case 17"
  );
  assertContains(
    wired,
    /hands resting near the outer thighs only/i,
    "hands near outer thighs",
    "case 17"
  );

  // model-realism: human realism positives (from `humanRealismGuidance`)
  assertContains(
    wired,
    /natural (?:human )?skin (?:grain and )?micro-detail/i,
    "human realism micro-detail",
    "case 17"
  );
  assertContains(
    wired,
    /soft realistic shading/i,
    "human realism shading",
    "case 17"
  );

  // lingerie-base realism (from `lingerieRealismGuidance`)
  assertContains(
    wired,
    /realistic soft shading around the neutral base garment edges/i,
    "lingerieRealism base-edges shading",
    "case 17"
  );

  // The no-garment-copy rule constant survives verbatim
  assert.ok(
    wired.includes(MODEL_GENERATION_NO_GARMENT_COPY_RULE),
    "case 17: MODEL_GENERATION_NO_GARMENT_COPY_RULE constant verbatim"
  );

  console.log(
    "[ok] case 17: fit guidance coexists with try-on-safe pose, model-realism, and no-garment-copy"
  );
}

// ---------------------------------------------------------------------------
// case 18 — clothing context: even if neutralBaseFitGuidanceEn is set on the
// request, the prompt must not surface it (branch gating in modelPrompts).
// This is the defence against caller mistakes that pass the field outside
// of the lingerie / neutral-base branch.
// ---------------------------------------------------------------------------

function checkClothingPromptIgnoresFitGuidance() {
  const helperResult = deriveNeutralBaseFitGuidance({
    analysis: baseAnalysis(),
    categoryContext: "lingerie",
  });
  assert.equal(helperResult.applied, true, "case 18: helper applied");
  if (!helperResult.applied) return;

  const wired = buildModelGenerationPrompt(
    baseRequest({
      categoryContext: "clothing",
      crop: "full-body",
      neutralBaseFitGuidanceEn: helperResult.text,
    }),
    { neutralBaseForTryOn: false }
  );

  assertAbsent(
    wired,
    /Neutral base fit guidance \(silhouette only, never design\):/i,
    "wiring marker",
    "case 18 clothing prompt"
  );
  assertAbsent(
    wired,
    /high-waist neutral brief silhouette/i,
    "lingerie-specific silhouette",
    "case 18 clothing prompt"
  );
  console.log(
    "[ok] case 18: clothing context does NOT surface neutralBaseFitGuidanceEn even when present on request"
  );
}

// ---------------------------------------------------------------------------
// case 19 — composeModelGenerationPrompt.ts source still carries the wiring
// (text-level guard so a future refactor cannot silently delete it). The
// module is server-only and cannot be imported in this Node-only test.
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { dirname, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = pathResolve(
  dirname(fileURLToPath(import.meta.url)),
  ".."
);

function checkComposeModelPromptSourceCarriesWiring() {
  const filePath = pathResolve(
    PROJECT_ROOT,
    "lib",
    "ai",
    "composeModelGenerationPrompt.ts"
  );
  const source = readFileSync(filePath, "utf8");

  // Wiring marker, gated on lingerie + neutralBaseForTryOn
  assertContains(
    source,
    /request\.neutralBaseFitGuidanceEn\?\.trim\(\)/,
    "neutralBaseFitGuidanceEn read",
    "composeModelGenerationPrompt.ts"
  );
  assertContains(
    source,
    /Neutral base fit guidance \(silhouette only, never design\):/,
    "wiring marker literal",
    "composeModelGenerationPrompt.ts"
  );

  // The push for fit guidance must live inside the lingerie + neutralBase
  // branch and must come AFTER MODEL_GENERATION_NO_GARMENT_COPY_RULE in the
  // source order — protects the priority contract.
  const noCopyIdx = source.indexOf(
    "rules.push(MODEL_GENERATION_NO_GARMENT_COPY_RULE)"
  );
  const fitPushIdx = source.indexOf(
    "Neutral base fit guidance (silhouette only, never design):"
  );
  assert.ok(
    noCopyIdx >= 0 && fitPushIdx > noCopyIdx,
    `case 19: fit guidance push must come after no-copy push in source (noCopy=${noCopyIdx}, fit=${fitPushIdx})`
  );

  console.log(
    "[ok] case 19: composeModelGenerationPrompt.ts carries the fit-guidance wiring after no-garment-copy"
  );
}

// ---------------------------------------------------------------------------
// case 13 — phrase constants self-audit: none of the rendered phrases for
// any enum value contain forbidden tokens. Catches future edits that add a
// stray colour/pattern word into the phrase tables.
// ---------------------------------------------------------------------------

function caseAllEnumPhrasesAreClean() {
  // Exhaustively cover every enum × every value by faking analyses that
  // exercise each branch through the public helper. We rely on the helper's
  // internal sanitizer (`FORBIDDEN_DESIGN_TOKENS`) to refuse to emit any
  // leak, AND we externally verify the output here.

  // Bra: every cup × every strap; bottoms intentionally absent so we isolate
  // bra phrasing.
  const cupValues = ["full cup", "balconette", "triangle", "sports bra"] as const;
  const strapValues = ["wide", "medium", "thin", "strapless"] as const;
  for (const cup of cupValues) {
    for (const strap of strapValues) {
      const result = deriveNeutralBaseFitGuidance({
        analysis: baseAnalysis({
          bra: { present: true, style: null, cupShape: cup, straps: strap },
          bottoms: { present: false, style: null, rise: null },
        }),
        categoryContext: "lingerie",
      });
      assert.equal(
        result.applied,
        true,
        `case 13: bra cup=${cup} strap=${strap} should apply`
      );
      if (result.applied) {
        assertNoForbiddenTokens(
          result.text,
          `case 13 bra cup=${cup} strap=${strap}`
        );
      }
    }
  }

  // Bottoms: every rise × back-coverage cue; bra absent.
  const riseValues = ["high-waist", "mid-rise", "low-rise"] as const;
  const backCueValues = ["brief", "cheeky", "thong", "full coverage brief"] as const;
  for (const rise of riseValues) {
    for (const cue of backCueValues) {
      const result = deriveNeutralBaseFitGuidance({
        analysis: baseAnalysis({
          bra: { present: false, style: null, cupShape: null, straps: null },
          bottoms: { present: true, style: cue, rise },
        }),
        categoryContext: "lingerie",
      });
      assert.equal(
        result.applied,
        true,
        `case 13: bottoms rise=${rise} cue=${cue} should apply`
      );
      if (result.applied) {
        assertNoForbiddenTokens(
          result.text,
          `case 13 bottoms rise=${rise} cue=${cue}`
        );
      }
    }
  }
  console.log("[ok] case 13: all phrase-table values render clean output");
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function main() {
  caseHighWaistFullCupWide();
  caseLowRise();
  caseUnknownFit();
  caseClothingContext();
  caseJewelryContext();
  caseLowConfidence();
  caseNullAnalysis();
  caseAdversarialAnalysis();
  casePromptLengthSafety();
  caseAllNonLingerieContextsGated();
  caseBraOnlyAndBottomsOnly();
  checkPromptWiringWithFitGuidance();
  checkHighWaistSilhouetteReachesFinalPrompt();
  caseAllEnumPhrasesAreClean();
  checkProductAnalysisShimEmitsFitGuidance();
  checkProductAnalysisShimGatesNonLingerie();
  checkProductAnalysisShimGatesLowConfidence();
  checkFitGuidanceCoexistsWithSafetyLayers();
  checkClothingPromptIgnoresFitGuidance();
  checkComposeModelPromptSourceCarriesWiring();

  console.log("\nAll neutral-base-fit regression checks passed.");
}

main();
