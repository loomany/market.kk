/**
 * 1 hero lingerie model + 5 angle edits (nano-banana-pro/edit).
 * Refs: user catalog screenshots (lace set, curvy, non-explicit).
 *
 * Usage: node scripts/diagnose-fal-lingerie-5-edits.mjs
 * Output: reports/ai/fal-lingerie-5-edits-latest.json
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

if (!process.env.FAL_KEY) {
  console.error("FAL_KEY missing");
  process.exit(1);
}
fal.config({ credentials: process.env.FAL_KEY });

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

/** Hero — match ref screens: plus-size, black + emerald lace, catalog */
const heroPrompt = [
  "Realistic full-length e-commerce studio photo of an adult plus-size curvy woman fashion model for premium lingerie catalog, entire head face hair and feet visible, front-facing standing pose, arms relaxed along outer sides hands near outer thighs, wearing coordinated black lingerie set with emerald green floral lace on bra cups and brief front panel, wide lace straps, high-waisted briefs, delicate gold necklace, white seamless studio backdrop, bright soft catalog lighting, warm natural smile, professional makeup, non-explicit commercial marketplace photography, not sexualized.",
  "Do not generate: child, teen, explicit nudity, sexualized pose, watermark, text, logo.",
].join(" ");

const angles = [
  {
    id: "E1",
    label: "front full — hand on lower back/waist",
    pose: "Front-facing full-length hero shot, entire head to feet in frame, one hand placed on lower back or waist from behind the hip line only, other arm relaxed along outer side, weight slightly shifted, white studio backdrop",
  },
  {
    id: "E2",
    label: "3/4 editorial — natural hand",
    pose: "Soft three-quarter catalog pose, body turned about 30 degrees toward camera, natural editorial hand placement with hand near outer hip or relaxed at side, never covering bust or lace detail, full head visible, standing full body",
  },
  {
    id: "E3",
    label: "back view simple",
    pose: "Back-facing catalog shot, model standing facing away from camera, arms relaxed at sides below shoulder line, full back of bra and brief visible, hair swept to one side, full head and feet visible, white studio backdrop",
  },
  {
    id: "E4",
    label: "seated on sofa",
    pose: "Seated on light neutral fabric sofa, relaxed catalog pose, knees angled, torso toward camera, one arm resting on sofa back, non-explicit lifestyle catalog framing from head to upper thighs minimum, soft studio lighting",
  },
  {
    id: "E5",
    label: "front — hands on outer hips (ref screen 5)",
    pose: "Front-facing full-length catalog shot, both hands resting on outer hips only with elbows pointing backward, shoulders relaxed, entire lace set visible, commercial Kaspi-style catalog",
  },
];

function buildEditPrompt(pose) {
  return [
    "Edit this professional e-commerce studio photo.",
    "Same model identity: same face, age, makeup, hairstyle, skin tone, and body proportions.",
    "Keep professional makeup, salon-styled hair, and manicured nails exactly as the reference.",
    "Keep the exact same black and emerald green lace lingerie set, colors, and fabric details as the reference.",
    `Change only pose and camera to: ${pose}.`,
    "Keep mandatory full head visible when standing; natural relaxed catalog posture; hands must not cover center bust lace panel.",
    "Same studio lighting and backdrop as reference unless seated pose specifies sofa.",
    "Commercial marketplace catalog, non-explicit, no text or watermark.",
  ].join(" ");
}

function errMsg(error) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const r = error;
    const body = r.body ? JSON.stringify(r.body).slice(0, 600) : "";
    return [r.status ?? r.statusCode, r.message, body].filter(Boolean).join(" | ");
  }
  return String(error).slice(0, 1200);
}

const results = [];

async function runCase(testCase) {
  const { id, label, modelId, input } = testCase;
  console.log(`\n[${id}] ${label}`);
  const start = Date.now();
  try {
    const result = await fal.subscribe(modelId, { input, logs: false });
    const url = result.data?.images?.[0]?.url;
    const row = {
      id,
      label,
      modelId,
      ok: true,
      elapsedSec: Math.round(((Date.now() - start) / 1000) * 10) / 10,
      url,
      requestId: result.requestId,
      promptLen: input.prompt?.length,
    };
    console.log(`  OK ${row.elapsedSec}s`, url?.slice(0, 72));
    results.push(row);
    return row;
  } catch (error) {
    const row = {
      id,
      label,
      modelId,
      ok: false,
      elapsedSec: Math.round(((Date.now() - start) / 1000) * 10) / 10,
      error: errMsg(error),
      promptLen: input.prompt?.length,
    };
    console.log(`  FAIL ${row.elapsedSec}s`, row.error.slice(0, 240));
    results.push(row);
    return row;
  }
}

console.log("Lingerie 5-edit chain —", new Date().toISOString());

const hero = await runCase({
  id: "H0",
  label: "hero t2i front lace catalog",
  modelId: T2I,
  input: { ...falBase, prompt: heroPrompt },
});

if (!hero.ok || !hero.url) {
  writeFileSync(
    "reports/ai/fal-lingerie-5-edits-latest.json",
    JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2)
  );
  process.exit(1);
}

let refUrl = hero.url;

for (const angle of angles) {
  const prompt = buildEditPrompt(angle.pose);
  const row = await runCase({
    id: angle.id,
    label: angle.label,
    modelId: EDIT,
    input: { ...falBase, prompt, image_urls: [refUrl] },
  });
  // chain: use last successful edit as ref for next (closer to "same model" in edits)
  if (row.ok && row.url) refUrl = row.url;
}

const summary = {
  ranAt: new Date().toISOString(),
  heroRequestId: hero.requestId,
  heroUrl: hero.url,
  ok: results.filter((r) => r.ok).length,
  fail: results.filter((r) => !r.ok).length,
  results,
};

writeFileSync(
  "reports/ai/fal-lingerie-5-edits-latest.json",
  JSON.stringify(summary, null, 2)
);

console.log("\n=== SUMMARY ===");
for (const r of results) {
  console.log(`${r.ok ? "OK" : "FAIL"} ${r.id} ${r.label}`);
}
console.log("→ reports/ai/fal-lingerie-5-edits-latest.json");
