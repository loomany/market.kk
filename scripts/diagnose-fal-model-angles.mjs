/**
 * Diagnose angle-1 vs angle-2 Fal failures.
 * Usage: node scripts/diagnose-fal-model-angles.mjs
 */
import { readFileSync, existsSync } from "fs";
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

function errMsg(error) {
  if (error instanceof Error) return error.message;
  return JSON.stringify(error, null, 2).slice(0, 2000);
}

const baseInput = {
  prompt:
    "Realistic full-body studio photo of an adult female fashion model for premium apparel catalog, size L proportions, full body, front-facing, studio lighting, warm natural smile, white seamless background, commercial catalog, non-explicit.",
  num_images: 1,
  aspect_ratio: "3:4",
  output_format: "png",
  safety_tolerance: "6",
  resolution: "1K",
  limit_generations: true,
  seed: 42,
};

async function run(label, modelId, input) {
  console.log(`\n--- ${label} (${modelId}) ---`);
  const start = Date.now();
  try {
    const result = await fal.subscribe(modelId, {
      input,
      logs: true,
      onQueueUpdate(u) {
        if (u.status === "IN_PROGRESS" && u.logs?.length) {
          console.log(" log:", u.logs[u.logs.length - 1]?.message);
        }
      },
    });
    const url = result.data?.images?.[0]?.url;
    console.log(`OK in ${((Date.now() - start) / 1000).toFixed(1)}s`);
    console.log(" url:", url?.slice(0, 80) + "...");
    return url;
  } catch (error) {
    console.log(`FAIL in ${((Date.now() - start) / 1000).toFixed(1)}s`);
    console.log(errMsg(error));
    if (typeof error === "object" && error !== null) {
      console.log(" status:", error.status ?? error.statusCode);
      if (error.body) console.log(" body:", JSON.stringify(error.body).slice(0, 800));
    }
    return null;
  }
}

const angle2Prompt =
  "Edit this professional e-commerce studio photo. Same model identity. Keep catalog apparel. Change only pose and camera to: three-quarter torso shot, body turned 30 degrees. Same studio backdrop.";

const angle2GeneratePrompt =
  baseInput.prompt +
  " three-quarter torso shot, body turned 30 degrees, natural editorial posture.";

console.log("Fal multi-angle diagnosis…");

const url1 = await run(
  "1) text-to-image (angle 1)",
  "fal-ai/nano-banana-pro",
  baseInput
);
if (!url1) process.exit(1);

await run("2a) EDIT with ref from angle 1", "fal-ai/nano-banana-pro/edit", {
  ...baseInput,
  prompt: angle2Prompt,
  image_urls: [url1],
});

await run("2b) text-to-image fallback (angle 2)", "fal-ai/nano-banana-pro", {
  ...baseInput,
  prompt: angle2GeneratePrompt,
  seed: 42,
});

console.log("\nDone.");
