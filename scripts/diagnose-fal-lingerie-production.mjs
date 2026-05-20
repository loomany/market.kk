/**
 * Lingerie with production-length prompts (closer to Studio).
 */
import { readFileSync, existsSync, writeFileSync } from "fs";
import { fal } from "@fal-ai/client";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    process.env[k] = v;
  }
}
fal.config({ credentials: process.env.FAL_KEY });

const falBase = {
  num_images: 1,
  aspect_ratio: "3:4",
  output_format: "png",
  safety_tolerance: "6",
  resolution: "1K",
  limit_generations: true,
  seed: 42,
};

// ~900+ chars like composeModelGenerationPrompt + lingerie blocks
const longLingerieT2i = [
  "Realistic full-body studio photo of an adult woman fashion model for premium lingerie catalog virtual try-on, size L proportions, full body, editorial full-length hero shot facing camera, studio lighting, warm natural smile with bright white teeth, white seamless backdrop, non-explicit, not sexualized.",
  "Mandatory female catalog model styling: professional salon makeup, professional hairstyle, warm smile white teeth, professional manicure.",
  "Wearing plain seamless neutral beige bra and brief set only, no lace, no prints, no logos, arms relaxed along outer sides, hands near outer thighs, commercial catalog base for virtual try-on only.",
  "Do not recreate, copy, imitate, or pre-wear the uploaded garment. The target product will be applied later by virtual try-on.",
  "Try-on safe pose: both arms relaxed below shoulder line, hands near outer thighs only, hands not in front of abdomen waist hips bra band, shoulders square to camera, no hand-on-hip, no arms akimbo.",
  "Mandatory lingerie catalog framing: full head and face visible, entire bra and brief in frame.",
  "Do not generate: child, teen, explicit nudity, sexualized pose, watermark, text, logo, bad anatomy, extra limbs.",
].join(" ");

const backAngle =
  "Back three-quarter catalog view, model facing away from camera with slight head turn, arms relaxed along sides, hands below shoulder line, hair swept to one side exposing full garment back, natural spine curve, full head and feet visible";

const productionEdit = [
  "Edit this professional e-commerce studio photo.",
  "Same model identity: same face, age 28, hairstyle, makeup, skin tone, and body proportions.",
  "Keep professional makeup, salon-styled hair, warm smile with bright white teeth, and manicured nails exactly as the reference.",
  "Keep the exact same plain seamless neutral bra and brief base as the reference — no lace, no prints, no floral pattern.",
  `Change only pose and camera orientation to: ${backAngle}.`,
  "Keep mandatory full head-to-toe framing: entire head, face, hair, and feet visible — do not crop forehead or feet.",
  "Same studio backdrop, lighting, and soft shadows as the reference.",
  "Natural relaxed catalog posture; hands not covering torso.",
  "Commercial marketplace catalog, non-explicit, no text or watermark.",
].join(" ");

const followUpLong =
  longLingerieT2i +
  " Same woman identity as the hero shot: match face, age, hair, professional makeup, skin tone, and the same neutral bodysuit — change only camera angle and body pose per the angle instruction. " +
  backAngle;

function errMsg(e) {
  if (e instanceof Error) return e.message;
  return JSON.stringify(e).slice(0, 1200);
}

const out = [];

async function run(id, label, modelId, input) {
  console.log(`\n[${id}] ${label} (prompt ${input.prompt?.length ?? 0} chars)`);
  const t0 = Date.now();
  try {
    const r = await fal.subscribe(modelId, { input, logs: false });
    const row = {
      id,
      label,
      modelId,
      ok: true,
      sec: Math.round((Date.now() - t0) / 100) / 10,
      url: r.data?.images?.[0]?.url,
      requestId: r.requestId,
    };
    console.log("OK", row.sec, row.url?.slice(0, 70));
    out.push(row);
    return row;
  } catch (e) {
    const row = { id, label, modelId, ok: false, sec: Math.round((Date.now() - t0) / 100) / 10, error: errMsg(e) };
    console.log("FAIL", row.error.slice(0, 300));
    out.push(row);
    return row;
  }
}

console.log("Production-length lingerie test", new Date().toISOString());
console.log("t2i len", longLingerieT2i.length, "edit len", productionEdit.length);

const p1 = await run("P1", "long neutral lingerie t2i front", "fal-ai/nano-banana-pro", {
  ...falBase,
  prompt: longLingerieT2i,
});
if (p1.ok) {
  await run("P2a", "long neutral edit BACK with ref", "fal-ai/nano-banana-pro/edit", {
    ...falBase,
    prompt: productionEdit,
    image_urls: [p1.url],
  });
  await run("P2b", "long neutral t2i BACK followUp", "fal-ai/nano-banana-pro", {
    ...falBase,
    prompt: followUpLong,
    seed: 43,
  });
}

writeFileSync(
  "reports/ai/fal-lingerie-production-latest.json",
  JSON.stringify({ ranAt: new Date().toISOString(), results: out }, null, 2)
);
console.log("\nDone → reports/ai/fal-lingerie-production-latest.json");
