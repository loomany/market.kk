/**
 * Variant 3: 1× nano-banana-pro hero + 5× InstantID (face_image_url = hero).
 * Ref poses: user catalog screenshots 1–5.
 *
 * Usage: node scripts/diagnose-fal-instantid-5-poses.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fal } from "@fal-ai/client";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    let v = t.slice(eq + 1).trim();
    if ((v[0] === '"' && v.at(-1) === '"') || (v[0] === "'" && v.at(-1) === "'"))
      v = v.slice(1, -1);
    process.env[t.slice(0, eq).trim()] = v;
  }
}
if (!process.env.FAL_KEY) {
  console.error("FAL_KEY missing");
  process.exit(1);
}
fal.config({ credentials: process.env.FAL_KEY });

const T2I = "fal-ai/nano-banana-pro";
const INSTANTID = "fal-ai/instantid";

const lingerieCore =
  "plus-size curvy adult woman, black lingerie with emerald green floral lace bra and high-waisted briefs, gold necklace, professional catalog makeup, warm smile, photorealistic e-commerce studio";

const heroPrompt = [
  `Full-length front-facing ${lingerieCore}, standing with hands resting on outer hips, entire head face hair and feet visible, white seamless studio backdrop, bright soft lighting, commercial marketplace lingerie catalog, non-explicit.`,
  "Do not generate: child, explicit nudity, watermark, text.",
].join(" ");

/** Matches ref screens 1–5 (hero = ref 4 front full) */
const instantIdPoses = [
  {
    id: "I1",
    ref: "screen 1 back",
    prompt: `Back-facing full body ${lingerieCore}, model facing away from camera, arms relaxed at sides, hair over one shoulder, white studio wall, soft pink roses blurred in background corner, catalog photo`,
  },
  {
    id: "I2",
    ref: "screen 2 seated sofa",
    prompt: `Seated on light gray fabric sofa ${lingerieCore}, relaxed pose, one hand near collarbone, knees angled, torso toward camera, lifestyle catalog crop from head to upper thighs, soft studio light, non-explicit`,
  },
  {
    id: "I3",
    ref: "screen 3 front hands hips",
    prompt: `Front-facing medium-full shot ${lingerieCore}, both hands on outer hips, white backdrop, blurred pink white roses upper right, commercial Kaspi catalog`,
  },
  {
    id: "I4",
    ref: "screen 4 front full",
    prompt: `Full-length front ${lingerieCore}, hands near outer thighs, large gold hoop earrings, double gold chain necklace, plain white seamless background, entire body visible`,
  },
  {
    id: "I5",
    ref: "screen 5 three-quarter",
    prompt: `Three-quarter torso catalog ${lingerieCore}, body turned 30 degrees, arms relaxed at sides, plain off-white background, from neck to upper thighs`,
  },
];

const negativePrompt =
  "nsfw, nude, explicit, child, teen, lowres, bad anatomy, bad hands, extra fingers, watermark, text, logo, blurry, deformed face";

const instantIdBase = {
  face_image_url: "", // filled after hero
  style: "(No style)",
  negative_prompt: negativePrompt,
  num_inference_steps: 8,
  guidance_scale: 1.8,
  ip_adapter_scale: 0.75,
  identity_controlnet_conditioning_scale: 0.85,
  enhance_face_region: true,
  enable_lcm: true,
  seed: 42,
};

function errMsg(e) {
  if (e instanceof Error) return e.message;
  return JSON.stringify(e).slice(0, 1200);
}

const results = [];

async function run(id, label, modelId, input) {
  console.log(`\n[${id}] ${label}`);
  const t0 = Date.now();
  try {
    const r = await fal.subscribe(modelId, { input, logs: false });
    const img = r.data?.image ?? r.data?.images?.[0];
    const url = img?.url;
    const row = {
      id,
      label,
      modelId,
      ok: true,
      sec: Math.round((Date.now() - t0) / 100) / 10,
      url,
      requestId: r.requestId,
      width: img?.width,
      height: img?.height,
    };
    console.log("OK", row.sec + "s", url?.slice(0, 72));
    results.push(row);
    return row;
  } catch (e) {
    const row = {
      id,
      label,
      modelId,
      ok: false,
      sec: Math.round((Date.now() - t0) / 100) / 10,
      error: errMsg(e),
    };
    console.log("FAIL", row.error.slice(0, 280));
    results.push(row);
    return row;
  }
}

console.log("InstantID chain —", new Date().toISOString());

const hero = await run("H0", "hero nano-banana front (ref 4)", T2I, {
  num_images: 1,
  aspect_ratio: "3:4",
  output_format: "png",
  safety_tolerance: "6",
  resolution: "1K",
  limit_generations: true,
  seed: 42,
  prompt: heroPrompt,
});

if (!hero.ok || !hero.url) {
  writeFileSync(
    "reports/ai/fal-instantid-5-poses-latest.json",
    JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2)
  );
  process.exit(1);
}

instantIdBase.face_image_url = hero.url;

for (const pose of instantIdPoses) {
  await run(
    pose.id,
    `${pose.ref} — InstantID`,
    INSTANTID,
    {
      ...instantIdBase,
      prompt: pose.prompt,
      seed: 42 + Number(pose.id.slice(1)),
    }
  );
}

const summary = {
  ranAt: new Date().toISOString(),
  variant: "nano-banana hero + instantid face lock",
  heroUrl: hero.url,
  heroRequestId: hero.requestId,
  ok: results.filter((r) => r.ok).length,
  fail: results.filter((r) => !r.ok).length,
  results,
};

writeFileSync(
  "reports/ai/fal-instantid-5-poses-latest.json",
  JSON.stringify(summary, null, 2)
);
console.log("\n=== SUMMARY ===");
for (const r of results) {
  console.log((r.ok ? "OK" : "FAIL") + " " + r.id + " " + r.label);
}
console.log("→ reports/ai/fal-instantid-5-poses-latest.json");
