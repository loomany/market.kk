/**
 * Fal identity / multi-angle hypothesis matrix (paid API).
 * Usage: node scripts/diagnose-fal-identity-matrix.mjs
 *
 * Results JSON: reports/ai/fal-identity-matrix-latest.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fal } from "@fal-ai/client";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    process.env[k] = v;
  }
}

const key = process.env.FAL_KEY;
if (!key) {
  console.error("FAL_KEY missing in .env.local");
  process.exit(1);
}
fal.config({ credentials: key });

const T2I = "fal-ai/nano-banana-pro";
const EDIT = "fal-ai/nano-banana-pro/edit";

const falBase = {
  num_images: 1,
  aspect_ratio: "3:4",
  output_format: "png",
  safety_tolerance: "6",
  resolution: "1K",
  limit_generations: true,
  seed: 42,
};

const angle34 =
  "three-quarter torso shot from waist to thighs, body turned about 30 degrees, natural editorial posture, arms relaxed along outer sides";

function errMsg(error) {
  if (error instanceof Error) return error.message;
  const o = error;
  if (typeof o === "object" && o !== null) {
    const status = o.status ?? o.statusCode;
    const body = o.body ? JSON.stringify(o.body).slice(0, 800) : "";
    return [status, o.message, body].filter(Boolean).join(" | ");
  }
  return JSON.stringify(error).slice(0, 1500);
}

const results = [];

async function runCase(testCase) {
  const { id, label, modelId, input } = testCase;
  console.log(`\n[${id}] ${label}`);
  const start = Date.now();
  try {
    const result = await fal.subscribe(modelId, { input, logs: false });
    const image = result.data?.images?.[0];
    const elapsedSec = (Date.now() - start) / 1000;
    const row = {
      id,
      label,
      modelId,
      ok: true,
      elapsedSec: Math.round(elapsedSec * 10) / 10,
      url: image?.url ?? null,
      requestId: result.requestId ?? null,
      description: result.data?.description?.slice(0, 500) ?? null,
    };
    console.log(`  OK ${row.elapsedSec}s`, row.url?.slice(0, 72) ?? "");
    results.push(row);
    return row;
  } catch (error) {
    const elapsedSec = (Date.now() - start) / 1000;
    const row = {
      id,
      label,
      modelId,
      ok: false,
      elapsedSec: Math.round(elapsedSec * 10) / 10,
      error: errMsg(error),
    };
    console.log(`  FAIL ${row.elapsedSec}s`, row.error.slice(0, 200));
    results.push(row);
    return row;
  }
}

const clothingPrompt1 =
  "Realistic full-body studio photo of an adult female fashion model for premium apparel catalog, size L proportions, full body, front-facing, studio lighting, warm natural smile, white seamless background, commercial catalog, wearing simple fitted neutral grey top and trousers, non-explicit.";

const lingerieSkuPrompt1 =
  [
    "Realistic full-body studio photo of an adult woman fashion model for premium lingerie catalog try-on, size L proportions, full body, front-facing, studio lighting, warm natural smile, white seamless backdrop, non-explicit.",
    "Mandatory female catalog styling: professional salon makeup, hairstyle, warm smile, manicure.",
    "One cohesive lingerie set in a single color — defines the model for all catalog angles.",
  ].join(" ");

const neutralBasePrompt1 =
  [
    "Realistic full-body studio photo of an adult woman fashion model for premium lingerie virtual try-on base, size L proportions, full body, front-facing, studio lighting, warm natural smile, white seamless backdrop, non-explicit.",
    "Wearing plain seamless neutral beige bra and brief set only, no lace, no prints, no logos, arms relaxed along outer sides, hands near outer thighs, commercial catalog base for virtual try-on only.",
  ].join(" ");

const identityBibleMock =
  "IDENTITY LOCK — same woman on every shot: adult female, age 28 appearance, oval face, warm medium skin tone, brown shoulder-length hair with soft waves, brown eyes, arched brows, natural salon makeup, warm smile with white teeth, size L curvy proportions, plain seamless beige bra and brief base only. Change ONLY camera and body orientation.";

const followUpLingerie =
  lingerieSkuPrompt1 +
  " Same woman identity as the hero shot: match face, age, hair, professional makeup, skin tone, and the exact same apparel set — change only camera angle and body pose to: " +
  angle34 +
  ".";

const followUpNeutral =
  neutralBasePrompt1 +
  " Same woman identity as the hero shot: match face, age, hair, professional makeup, skin tone, and the same neutral bodysuit — change only camera angle and body pose to: " +
  angle34 +
  ".";

const editPromptSku =
  [
    "Edit this professional e-commerce studio photo.",
    "Same model identity: same face, makeup, hairstyle, skin tone.",
    "Keep the exact same catalog apparel outfit as the reference.",
    `Change only pose and camera to: ${angle34}.`,
    "Commercial marketplace catalog, non-explicit.",
  ].join(" ");

const editPromptNeutral =
  [
    "Edit this professional e-commerce studio photo.",
    "Same model identity: same face, makeup, hairstyle, skin tone.",
    "Keep the exact same plain seamless neutral bra and brief base as the reference.",
    `Change only pose and camera to: ${angle34}.`,
    "Commercial marketplace catalog, non-explicit.",
  ].join(" ");

console.log("Fal identity matrix —", new Date().toISOString());

// --- Clothing ---
const cloth1 = await runCase({
  id: "C1",
  label: "clothing t2i front",
  modelId: T2I,
  input: { ...falBase, prompt: clothingPrompt1 },
});
if (cloth1.ok) {
  await runCase({
    id: "C2a",
    label: "clothing edit 3/4 with ref",
    modelId: EDIT,
    input: { ...falBase, prompt: editPromptSku.replace("catalog apparel", "clothing"), image_urls: [cloth1.url] },
  });
  await runCase({
    id: "C2b",
    label: "clothing t2i 3/4 text only",
    modelId: T2I,
    input: { ...falBase, prompt: clothingPrompt1 + " " + angle34, seed: 43 },
  });
}

// --- Lingerie SKU in frame ---
const lingSku1 = await runCase({
  id: "L1",
  label: "lingerie SKU t2i front",
  modelId: T2I,
  input: { ...falBase, prompt: lingerieSkuPrompt1 },
});
if (lingSku1.ok) {
  await runCase({
    id: "L2a",
    label: "lingerie SKU edit 3/4 with ref",
    modelId: EDIT,
    input: { ...falBase, prompt: editPromptSku, image_urls: [lingSku1.url] },
  });
  await runCase({
    id: "L2b",
    label: "lingerie SKU t2i 3/4 append angle",
    modelId: T2I,
    input: { ...falBase, prompt: lingerieSkuPrompt1 + " " + angle34, seed: 43 },
  });
  await runCase({
    id: "L2c",
    label: "lingerie SKU t2i 3/4 followUpAngle prompt",
    modelId: T2I,
    input: { ...falBase, prompt: followUpLingerie, seed: 44 },
  });
  await runCase({
    id: "L2d",
    label: "lingerie SKU t2i 3/4 identity bible (mock)",
    modelId: T2I,
    input: { ...falBase, prompt: identityBibleMock + " " + angle34, seed: 45 },
  });
  if (lingSku1.description) {
    await runCase({
      id: "L2e",
      label: "lingerie SKU t2i 3/4 Fal description from L1",
      modelId: T2I,
      input: {
        ...falBase,
        prompt:
          identityBibleMock +
          " Visual reference from prior shot: " +
          lingSku1.description +
          ". " +
          angle34,
        seed: 46,
      },
    });
  }
}

// --- Lingerie neutral base ---
const lingNeu1 = await runCase({
  id: "N1",
  label: "lingerie neutral-base t2i front",
  modelId: T2I,
  input: { ...falBase, prompt: neutralBasePrompt1 },
});
if (lingNeu1.ok) {
  await runCase({
    id: "N2a",
    label: "lingerie neutral-base edit 3/4 with ref",
    modelId: EDIT,
    input: { ...falBase, prompt: editPromptNeutral, image_urls: [lingNeu1.url] },
  });
  await runCase({
    id: "N2b",
    label: "lingerie neutral-base t2i followUpAngle",
    modelId: T2I,
    input: { ...falBase, prompt: followUpNeutral, seed: 47 },
  });
}

const summary = {
  ranAt: new Date().toISOString(),
  total: results.length,
  ok: results.filter((r) => r.ok).length,
  fail: results.filter((r) => !r.ok).length,
  results,
};

const outPath = "reports/ai/fal-identity-matrix-latest.json";
writeFileSync(outPath, JSON.stringify(summary, null, 2), "utf8");

console.log("\n=== SUMMARY ===");
for (const r of results) {
  console.log(`${r.ok ? "OK" : "FAIL"}  ${r.id}  ${r.label}  ${r.elapsedSec}s`);
}
console.log(`\nWrote ${outPath}`);
