/**
 * Reproduce lingerie multi-angle failures.
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

fal.config({ credentials: process.env.FAL_KEY });

function errMsg(error) {
  if (error instanceof Error) return error.message;
  return JSON.stringify(error, null, 2).slice(0, 2500);
}

const falBase = {
  num_images: 1,
  aspect_ratio: "3:4",
  output_format: "png",
  safety_tolerance: "6",
  resolution: "1K",
  limit_generations: true,
  seed: 42,
};

// ~like buildModelGenerationPrompt lingerie + female beauty
const lingeriePrompt1 =
  [
    "Realistic full-body studio photo of an adult woman fashion model for premium lingerie catalog try-on, size L proportions, full body, editorial full-length hero shot facing camera, studio lighting, warm natural smile with bright white teeth, white seamless backdrop, non-explicit, not sexualized.",
    "Mandatory female catalog model styling: professional salon makeup, professional hairstyle, warm smile white teeth, professional manicure.",
    "One cohesive lingerie set in a single color — defines the model for all catalog angles.",
    "Do not generate: child, explicit nudity, sexualized pose.",
  ].join(" ");

const angleTorso =
  "three-quarter torso shot from waist to thighs, body turned about 35 degrees, natural editorial posture";

const editPrompt =
  [
    "Edit this professional e-commerce studio photo.",
    "Same model identity: same face, makeup, hairstyle, skin tone.",
    "Keep the exact same catalog apparel outfit as the reference.",
    `Change only pose and camera to: ${angleTorso}.`,
    "Commercial marketplace catalog, non-explicit.",
  ].join(" ");

const lingeriePrompt2 = lingeriePrompt1 + " " + angleTorso;

async function run(label, modelId, input) {
  console.log(`\n--- ${label} ---`);
  const start = Date.now();
  try {
    const result = await fal.subscribe(modelId, { input, logs: false });
    const url = result.data?.images?.[0]?.url;
    console.log(`OK ${((Date.now() - start) / 1000).toFixed(1)}s`, url?.slice(0, 70));
    return url;
  } catch (error) {
    console.log(`FAIL ${((Date.now() - start) / 1000).toFixed(1)}s`);
    console.log(errMsg(error));
    if (error?.status) console.log("status:", error.status);
    if (error?.body) console.log("body:", JSON.stringify(error.body).slice(0, 600));
    return null;
  }
}

console.log("Lingerie prompt length:", lingeriePrompt1.length);

const url1 = await run("1 lingerie t2i", "fal-ai/nano-banana-pro", {
  ...falBase,
  prompt: lingeriePrompt1,
});
if (!url1) process.exit(1);

await run("2a edit lingerie ref", "fal-ai/nano-banana-pro/edit", {
  ...falBase,
  prompt: editPrompt,
  image_urls: [url1],
});

await run("2b t2i lingerie angle2", "fal-ai/nano-banana-pro", {
  ...falBase,
  prompt: lingeriePrompt2,
});

console.log("\nDone.");
