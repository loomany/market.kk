/**
 * AUDIT-ONLY paid test (Stage 2): run FASHN four times with the same AI base
 * model and four different garment references for the black/emerald lingerie
 * set. Goal: prove whether the brief artefacts come from an ambiguous garment
 * reference vs an inherent FASHN limitation for two-piece high-waist briefs.
 *
 * Pattern follows scripts/audit-blackOutput.ts — one-off audit, NOT product
 * code, NOT wired into the app, NO commits. Approved scope:
 *   - AI model regeneration via fal-ai/nano-banana-pro (~$0.15)
 *   - 4× FASHN try-on calls (~$0.08 each = $0.32)
 *   - 4× OpenAI Vision judge with extended top/bottom schema (~$0.015 each = $0.06)
 *   - garment_photo_type = "auto" for all four variants (fair comparison)
 *
 * Hard guards before paid calls:
 *   - FAL_KEY set
 *   - OPENAI_API_KEY set
 *   - ALLOW_PAID_AI_RUNS=true
 *   - AI_MOCK_MODE=0
 * Without any of these the script exits 1 BEFORE issuing a single network call.
 *
 * Usage (PowerShell):
 *   $env:FAL_KEY = "<from .env.local>"
 *   $env:OPENAI_API_KEY = "<from .env.local>"
 *   $env:ALLOW_PAID_AI_RUNS = "true"
 *   $env:AI_MOCK_MODE = "0"
 *   node --experimental-strip-types scripts/audit-fashnGarmentReference.ts
 *
 * Inputs (must exist; run scripts/audit-garmentRefVariants.ts first):
 *   .audit-outputs/garment-ref-variants/A-original.jpg
 *   .audit-outputs/garment-ref-variants/B-cleaned.jpg
 *   .audit-outputs/garment-ref-variants/C-bottom-focus.jpg
 *   .audit-outputs/garment-ref-variants/D-bra-brief-stacked.jpg
 *
 * Outputs (.audit-outputs/fashn-garment-ref-test/):
 *   - model.png                            — AI base model used in all 4 tests
 *   - variant-A.png … variant-D.png        — FASHN try-on results
 *   - variant-A-judge.json … variant-D-judge.json — extended top/bottom scores
 *   - summary.json                         — combined run log
 */
import { fal } from "@fal-ai/client";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve as pathResolve } from "node:path";

// ─── 0. ENV LOADER + GUARDS (NO paid calls before this passes) ───────────────
//
// Minimal dotenv-style loader: if FAL_KEY / OPENAI_API_KEY / etc. are NOT
// already exported in the shell, try to read them from `.env.local` so the
// audit is reproducible without forcing the operator to `$env:FAL_KEY = …`
// every time. Existing shell variables ALWAYS win (no overwrite).
function loadEnvLocalIfPresent() {
  const envPath = pathResolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf8");
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

loadEnvLocalIfPresent();
const REQUIRED_ENV: ReadonlyArray<readonly [string, string]> = [
  ["FAL_KEY", "Fal API key (from .env.local)"],
  ["OPENAI_API_KEY", "OpenAI API key (from .env.local)"],
];

const HARD_REQUIRED: ReadonlyArray<readonly [string, string, string]> = [
  ["ALLOW_PAID_AI_RUNS", "true", "set to 'true' to acknowledge paid spend"],
  ["AI_MOCK_MODE", "0", "set to '0' to disable mock mode"],
];

function checkEnv() {
  const missing: string[] = [];
  for (const [name, hint] of REQUIRED_ENV) {
    if (!process.env[name]?.trim()) missing.push(`${name} (${hint})`);
  }
  for (const [name, expected, hint] of HARD_REQUIRED) {
    if (process.env[name] !== expected) {
      missing.push(`${name}=${expected} (${hint}; current: ${process.env[name] ?? "unset"})`);
    }
  }
  if (missing.length > 0) {
    console.error("[abort] Environment not ready for paid audit:");
    for (const item of missing) console.error("  -", item);
    console.error("\nFix in PowerShell and re-run:");
    console.error("  $env:FAL_KEY = '<key>'");
    console.error("  $env:OPENAI_API_KEY = '<key>'");
    console.error("  $env:ALLOW_PAID_AI_RUNS = 'true'");
    console.error("  $env:AI_MOCK_MODE = '0'");
    process.exit(1);
  }
}

checkEnv();

fal.config({ credentials: process.env.FAL_KEY! });

// ─── 1. CONSTANTS (mirror prod) ──────────────────────────────────────────────
const VARIANT_DIR = pathResolve(process.cwd(), ".audit-outputs", "garment-ref-variants");
const OUT_DIR = pathResolve(process.cwd(), ".audit-outputs", "fashn-garment-ref-test");

const FASHN_TRYON_MODEL = "fal-ai/fashn/tryon/v1.6";
const MODEL_GENERATION_MODEL = "fal-ai/nano-banana-pro";

const VARIANTS = [
  { id: "A-original" },
  { id: "B-cleaned" },
  { id: "C-bottom-focus" },
  { id: "D-bra-brief-stacked" },
] as const;

// ─── 2. AI MODEL PROMPT (neutral base, plus-size, upper-thigh crop) ──────────
//
// Replicates production neutral-base lingerie generation: no garment copy,
// minimal-base brief, try-on-safe pose (arms along outer sides, hands not in
// front of abdomen/briefs). Plus-size matches the source product target.
//
// Kept inline (NOT imported from lib/ai) to avoid the `server-only` import
// chain in a Node test script.
const MODEL_PROMPT = [
  "Realistic full-body studio photo of a 28-year-old female fashion model for virtual lingerie try-on,",
  "visibly plus-size curvy proportions with full hips and soft belly,",
  "commercial lingerie catalog crop from full head through upper-mid thighs, entire bra and brief fully visible,",
  "front-facing pose with subtle natural weight shift,",
  "studio lighting with directional soft key light and visible soft natural shadow on the backdrop,",
  "confident warm expression with natural smile,",
  "plain seamless neutral bra and brief set, simple smooth fabric, nude beige or solid black only,",
  "no lace, no prints, no decorative straps, no floral pattern, no turquoise or green accents,",
  "no logos, no product design recreation,",
  "Brief must be a minimal low-profile classic bikini brief sitting flat against the body —",
  "natural waistline at or just below the navel, minimal visible side edges,",
  "no high-cut side panels, no pronounced or thick waistband shape, no decorative seams,",
  "no boyshorts, no high-waist shorts, no biker shorts, no long leg line to mid-thigh,",
  "base brief must not compete with the target marketplace garment silhouette,",
  "Standing neutral studio pose with relaxed posture,",
  "arms must stay relaxed at the sides or slightly away from the body,",
  "arms drop straight down along the outer sides of the body,",
  "hands rest near the outer thighs only,",
  "hands must not be placed in front of the abdomen, waist, stomach, briefs, hips, bra band, straps, or any garment zone,",
  "fingers must not overlap the product area,",
  "no hand on hip, no arms akimbo, no hand resting on the waistband or stomach,",
  "both shoulders must stay square to the camera,",
  "do not raise either arm above the shoulder line,",
  "do not place a hand behind the head, neck, hair, or above the head,",
  "do not cross arms in front of the bra band or torso,",
  "calm non-explicit editorial catalog pose,",
  "plain white seamless studio backdrop with soft natural floor shadow,",
  "Photorealistic human skin: subtle natural skin grain and micro-detail,",
  "soft realistic shading across the face, neck, arms and legs,",
  "gentle natural asymmetry in posture and features,",
  "Not plastic, not waxy, not doll-like, not over-airbrushed, not CGI-smooth.",
  "Premium glamorous adult female fashion model styling: salon-finished hair, light natural makeup, manicured hands.",
  "Identity context: virtual lingerie try-on base — marketplace garment will be applied later by FASHN, not by this generation.",
  "Do not generate: explicit nudity, sexualized pose, watermark, text, logo, distorted hands, extra limbs, bad anatomy, blurry image,",
  "child, teen, hand on hip, hand on waist, hand on stomach, hand on abdomen, hands in front of abdomen, hands in front of torso,",
  "raised-arm Vogue pose, hand behind head, arms above shoulders, lace pattern on base, green or turquoise accents on base.",
].join(" ");

// ─── 3. JUDGE PROMPT (extended top/bottom schema) ────────────────────────────
const JUDGE_INSTRUCTIONS = [
  "You are an objective garment-fidelity judge for a lingerie virtual try-on (FASHN) audit.",
  "You see TWO images: (1) the original product garment reference and (2) the try-on result.",
  "Score the try-on against the source garment, not against artistic beauty.",
  "",
  "Evaluate the TOP (bra) and the BOTTOM (brief) SEPARATELY.",
  "",
  "TOP checks:",
  "- bra color preserved",
  "- lace/pattern preserved",
  "- cup shape preserved",
  "- straps preserved",
  "- bra band and lower eyelash-lace edge preserved",
  "",
  "BOTTOM checks:",
  "- high-waist silhouette preserved (waistline at or above navel, not low-rise)",
  "- waistline height preserved",
  "- central front green lace panel preserved (size and position)",
  "- side black panels preserved (the brief has two black side panels around a central lace panel)",
  "- leg opening shape preserved",
  "- waistband shape preserved",
  "- no beige/neutral base underwear visible underneath",
  "- target brief not changed into low-rise brief",
  "- product not simplified into a different bottom",
  "- green lace/front panel not missing or shrunk",
  "",
  "Important: if the bra looks good but the brief is wrong, do NOT average it away.",
  "Report bottomOk=false and lower the overall score.",
  "Set bottomCriticalFailure=true when the brief silhouette, central front panel, or visible base underwear severely fails the source garment.",
  "Aggregation rule: if bottomOk=false, total score must not exceed 0.70; if bottomCriticalFailure=true, total score must not exceed 0.60.",
  "Fill every bottomIssueFlags boolean truthfully (false when not observed).",
  "productSetType must be 'bra_brief_set' for this product.",
  "",
  "Return JSON exactly matching the supplied schema.",
].join("\n");

const JUDGE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    pass: { type: "boolean" },
    score: { type: "number" },
    issues: { type: "array", items: { type: "string" } },
    preservedWell: { type: "array", items: { type: "string" } },
    topScore: { type: "number" },
    topOk: { type: "boolean" },
    topIssues: { type: "array", items: { type: "string" } },
    bottomScore: { type: "number" },
    bottomOk: { type: "boolean" },
    bottomIssues: { type: "array", items: { type: "string" } },
    productSetType: {
      type: "string",
      enum: ["single", "set", "bra_brief_set", "unknown"],
    },
    bottomCriticalFailure: { type: "boolean" },
    bottomIssueFlags: {
      type: "object",
      additionalProperties: false,
      properties: {
        highWaistSilhouetteLost: { type: "boolean" },
        waistlineTooLow: { type: "boolean" },
        centralPanelMissingOrShrunk: { type: "boolean" },
        sidePanelsMissingOrWrong: { type: "boolean" },
        lacePatternMissing: { type: "boolean" },
        legOpeningsWrongShape: { type: "boolean" },
        waistbandDistorted: { type: "boolean" },
        visibleBaseUnderwear: { type: "boolean" },
        productChangedToDifferentBrief: { type: "boolean" },
      },
      required: [
        "highWaistSilhouetteLost",
        "waistlineTooLow",
        "centralPanelMissingOrShrunk",
        "sidePanelsMissingOrWrong",
        "lacePatternMissing",
        "legOpeningsWrongShape",
        "waistbandDistorted",
        "visibleBaseUnderwear",
        "productChangedToDifferentBrief",
      ],
    },
  },
  required: [
    "pass",
    "score",
    "issues",
    "preservedWell",
    "topScore",
    "topOk",
    "topIssues",
    "bottomScore",
    "bottomOk",
    "bottomIssues",
    "productSetType",
    "bottomCriticalFailure",
    "bottomIssueFlags",
  ],
} as const;

// ─── 4. JUDGE CALL ───────────────────────────────────────────────────────────
type JudgeResult = {
  pass: boolean;
  score: number;
  topScore?: number;
  topOk?: boolean;
  bottomScore?: number;
  bottomOk?: boolean;
  bottomCriticalFailure?: boolean;
  bottomIssueFlags?: Record<string, boolean>;
  bottomIssues?: string[];
  topIssues?: string[];
  issues?: string[];
  preservedWell?: string[];
  productSetType?: string;
};

function extractResponseText(payload: unknown): string {
  if (
    payload &&
    typeof payload === "object" &&
    "output_text" in payload &&
    typeof (payload as { output_text?: unknown }).output_text === "string"
  ) {
    return (payload as { output_text: string }).output_text;
  }
  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";
  return output
    .flatMap((item) =>
      typeof item === "object" && item !== null && "content" in item
        ? (item as { content?: { text?: string }[] }).content ?? []
        : []
    )
    .map((p) => p.text)
    .filter(Boolean)
    .join("");
}

async function runJudge(input: {
  productImageUrl: string;
  resultImageUrl: string;
}): Promise<JudgeResult | { error: string }> {
  const model =
    process.env.OPENAI_VISION_MODEL?.trim() ||
    process.env.OPENAI_PROMPT_MODEL?.trim() ||
    "gpt-5.5";
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      instructions: JUDGE_INSTRUCTIONS,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Original product garment:" },
            { type: "input_image", image_url: input.productImageUrl },
            { type: "input_text", text: "Try-on result to judge:" },
            { type: "input_image", image_url: input.resultImageUrl },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "tryon_judge_extended",
          strict: true,
          schema: JUDGE_SCHEMA,
        },
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { error: `judge HTTP ${res.status}: ${body.slice(0, 400)}` };
  }
  try {
    const payload = await res.json();
    const text = extractResponseText(payload);
    return JSON.parse(text) as JudgeResult;
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

// ─── 5. FASHN CALL ───────────────────────────────────────────────────────────
async function runFashn(input: {
  modelImageUrl: string;
  garmentImageUrl: string;
  seed?: number;
}): Promise<
  { ok: true; url: string; requestId: string } | { ok: false; error: string }
> {
  try {
    const result = await fal.subscribe(FASHN_TRYON_MODEL, {
      input: {
        model_image: input.modelImageUrl,
        garment_image: input.garmentImageUrl,
        category: "auto",
        mode: "balanced",
        garment_photo_type: "auto",
        moderation_level: "permissive",
        num_samples: 1,
        segmentation_free: true,
        output_format: "png",
        ...(typeof input.seed === "number" ? { seed: input.seed } : {}),
      },
      logs: false,
    });
    const url = (result.data as { images?: { url: string }[] }).images?.[0]?.url;
    if (!url) return { ok: false, error: "no image url in FASHN response" };
    return { ok: true, url, requestId: result.requestId };
  } catch (error) {
    const err = error as { status?: number; body?: unknown; message?: string };
    return {
      ok: false,
      error: `${err.status ?? "?"}: ${err.message ?? String(error)}`,
    };
  }
}

// ─── 6. MAIN ─────────────────────────────────────────────────────────────────
async function downloadToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  console.log("=".repeat(72));
  console.log("AUDIT-PAID — FASHN garment_image variants test");
  console.log("=".repeat(72));
  console.log("Estimated cost: ~$0.53 (model $0.15 + FASHN 4×$0.08 + judge 4×$0.015)");
  console.log("");

  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });

  // Sanity: variants exist
  const variantFiles: { id: string; path: string }[] = [];
  for (const v of VARIANTS) {
    const p = join(VARIANT_DIR, `${v.id}.jpg`);
    if (!existsSync(p)) {
      console.error(`[abort] Variant missing: ${p}`);
      console.error("Run scripts/audit-garmentRefVariants.ts first.");
      process.exit(1);
    }
    variantFiles.push({ id: v.id, path: p });
  }

  // ── 6.1 Generate (or reuse) AI base model ───────────────────────────────
  const modelLocalPath = join(OUT_DIR, "model.png");
  let modelImageUrl: string;
  let modelRequestId: string;
  let modelGenElapsed = 0;

  if (existsSync(modelLocalPath)) {
    console.log("[1/3] Reusing existing model.png — re-uploading to fal.storage …");
    const buf = await readFile(modelLocalPath);
    const file = new File([new Blob([buf], { type: "image/png" })], "model.png", {
      type: "image/png",
    });
    modelImageUrl = await fal.storage.upload(file);
    modelRequestId = "reused-from-disk";
    console.log(`  → ${modelImageUrl}`);
  } else {
    console.log("[1/3] Generating AI base model (fal-ai/nano-banana-pro) …");
    const modelGenStart = Date.now();
    try {
      const result = await fal.subscribe(MODEL_GENERATION_MODEL, {
        input: {
          prompt: MODEL_PROMPT,
          num_images: 1,
          aspect_ratio: "3:4",
          output_format: "png",
          safety_tolerance: "6",
          resolution: "2K",
          limit_generations: true,
        },
        logs: false,
      });
      const url = (result.data as { images?: { url: string }[] }).images?.[0]?.url;
      if (!url) {
        console.error("[abort] Model generation returned no image URL");
        process.exit(1);
      }
      modelImageUrl = url;
      modelRequestId = result.requestId;
    } catch (error) {
      const err = error as { status?: number; body?: unknown; message?: string };
      console.error(
        `[abort] Model generation failed: ${err.status ?? "?"}: ${err.message ?? String(error)}`
      );
      process.exit(1);
    }
    modelGenElapsed = Date.now() - modelGenStart;
    console.log(
      `  → ${modelImageUrl}  (request ${modelRequestId}, ${modelGenElapsed} ms)`
    );
    try {
      const buf = await downloadToBuffer(modelImageUrl);
      await writeFile(modelLocalPath, buf);
      console.log(`  saved → ${modelLocalPath}`);
    } catch (error) {
      console.warn(
        "  could not download model copy:",
        error instanceof Error ? error.message : error
      );
    }
  }

  // ── 6.2 Upload garment variants to fal.storage ──────────────────────────
  console.log("\n[2/3] Uploading 4 garment variants to fal.storage …");
  const garmentUrls: Record<string, string> = {};
  for (const { id, path } of variantFiles) {
    const buf = await readFile(path);
    const file = new File([new Blob([buf], { type: "image/jpeg" })], `${id}.jpg`, {
      type: "image/jpeg",
    });
    const url = await fal.storage.upload(file);
    garmentUrls[id] = url;
    console.log(`  ${id} → ${url}`);
  }

  // ── 6.3 Run FASHN 4× + judge 4× ─────────────────────────────────────────
  console.log("\n[3/3] Running 4 FASHN try-ons + 4 judges …");
  const results: Array<{
    id: string;
    garmentUrl: string;
    fashn:
      | { ok: true; url: string; requestId: string; elapsedMs: number }
      | { ok: false; error: string };
    judge: JudgeResult | { error: string } | null;
  }> = [];

  const SHARED_SEED = 12345;

  for (const { id } of VARIANTS) {
    const garmentUrl = garmentUrls[id]!;
    const variantPngPath = join(OUT_DIR, `variant-${id}.png`);
    const judgeJsonPath = join(OUT_DIR, `variant-${id}-judge.json`);

    // ── FASHN: skip if local PNG already exists (re-upload it to get a URL) ─
    let fashnRecord:
      | { ok: true; url: string; requestId: string; elapsedMs: number }
      | { ok: false; error: string };

    if (existsSync(variantPngPath)) {
      console.log(`\n  [${id}] FASHN skipped — variant-${id}.png exists`);
      const buf = await readFile(variantPngPath);
      const file = new File([new Blob([buf], { type: "image/png" })], `variant-${id}.png`, {
        type: "image/png",
      });
      const url = await fal.storage.upload(file);
      console.log(`    re-uploaded for judge → ${url}`);
      fashnRecord = {
        ok: true,
        url,
        requestId: `reused-from-disk:${id}`,
        elapsedMs: 0,
      };
    } else {
      console.log(`\n  [${id}] FASHN …`);
      const fashnStart = Date.now();
      const fashn = await runFashn({
        modelImageUrl,
        garmentImageUrl: garmentUrl,
        seed: SHARED_SEED,
      });
      const elapsed = Date.now() - fashnStart;

      if (!fashn.ok) {
        console.error(`    fail: ${fashn.error}`);
        results.push({ id, garmentUrl, fashn, judge: null });
        continue;
      }
      console.log(`    → ${fashn.url}  (${elapsed} ms, request ${fashn.requestId})`);
      try {
        const buf = await downloadToBuffer(fashn.url);
        await writeFile(variantPngPath, buf);
        console.log(`    saved → variant-${id}.png`);
      } catch (error) {
        console.warn(
          "    could not download:",
          error instanceof Error ? error.message : error
        );
      }
      fashnRecord = {
        ok: true,
        url: fashn.url,
        requestId: fashn.requestId,
        elapsedMs: elapsed,
      };
    }

    // ── Judge: skip if judge JSON already exists ────────────────────────────
    let judge: JudgeResult | { error: string } | null;
    if (existsSync(judgeJsonPath)) {
      console.log(`  [${id}] Judge skipped — JSON exists`);
      try {
        judge = JSON.parse(await readFile(judgeJsonPath, "utf8")) as JudgeResult;
      } catch (error) {
        judge = { error: `parse cached judge: ${error}` };
      }
    } else {
      console.log(`  [${id}] Judge …`);
      judge = await runJudge({
        productImageUrl: garmentUrl,
        resultImageUrl: fashnRecord.url,
      });
      if ("error" in judge) {
        console.error(`    judge fail: ${judge.error}`);
      } else {
        console.log(
          `    score=${judge.score.toFixed(2)}  topScore=${judge.topScore?.toFixed(2)}  bottomScore=${judge.bottomScore?.toFixed(2)}  bottomOk=${judge.bottomOk}`
        );
      }
      await writeFile(judgeJsonPath, `${JSON.stringify(judge, null, 2)}\n`);
    }

    results.push({ id, garmentUrl, fashn: fashnRecord, judge });
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("\n", "=".repeat(72));
  console.log("SUMMARY");
  console.log("=".repeat(72));

  console.log("\n  id                   total  top    bot    bot-ok  bot-crit  central-shrunk  base-visible  hi-waist-lost");
  for (const r of results) {
    if (!r.fashn.ok) {
      console.log(`  ${r.id.padEnd(20)} FAIL  (${r.fashn.error})`);
      continue;
    }
    if (!r.judge || "error" in r.judge) {
      console.log(`  ${r.id.padEnd(20)} judge-fail`);
      continue;
    }
    const j = r.judge;
    const f = j.bottomIssueFlags ?? {};
    console.log(
      `  ${r.id.padEnd(20)} ${j.score.toFixed(2)}  ${(j.topScore ?? -1).toFixed(2)}  ${(j.bottomScore ?? -1).toFixed(2)}  ${String(j.bottomOk).padEnd(6)}  ${String(j.bottomCriticalFailure ?? false).padEnd(8)}  ${String(f.centralPanelMissingOrShrunk ?? false).padEnd(14)}  ${String(f.visibleBaseUnderwear ?? false).padEnd(12)}  ${String(f.highWaistSilhouetteLost ?? false)}`
    );
  }

  const summary = {
    runStartedAt: new Date().toISOString(),
    modelGeneration: {
      requestId: modelRequestId,
      url: modelImageUrl,
      promptLength: MODEL_PROMPT.length,
      elapsedMs: modelGenElapsed,
    },
    garmentUrls,
    results,
  };
  await writeFile(join(OUT_DIR, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`\nSaved full report → ${join(OUT_DIR, "summary.json")}`);
  console.log("Saved per-variant try-on PNGs and judge JSONs in:", OUT_DIR);
  console.log("\nDone. NO commits, NO changes to product code.");
}

void main().catch((error) => {
  console.error("FATAL:", error);
  process.exit(1);
});
