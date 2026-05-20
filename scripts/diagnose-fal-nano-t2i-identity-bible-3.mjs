/**
 * 3× nano-banana-pro t2i only: hero + identity bible + 2 follow-up poses (lingerie).
 * Usage: node scripts/diagnose-fal-nano-t2i-identity-bible-3.mjs
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

const falBase = {
  num_images: 1,
  aspect_ratio: "3:4",
  output_format: "png",
  safety_tolerance: "6",
  resolution: "1K",
  limit_generations: true,
  seed: 42,
};

const photoRealism =
  "raw unretouched commercial catalog photograph, natural skin texture and pores, soft diffused studio lighting, shot on full-frame DSLR 85mm, photorealistic, not CGI, not doll, not plastic skin";

const lingerieGarment =
  "same coordinated black lingerie set with emerald green floral lace on bra cups and brief front panel, high-waisted briefs, wide lace straps, small gold necklace";

const heroBase = [
  "Realistic full-length e-commerce studio photo of one adult plus-size curvy woman fashion model for premium lingerie catalog",
  lingerieGarment,
  photoRealism,
  "front-facing standing, both hands resting on outer hips only, entire head face hair and feet visible, white seamless backdrop, warm natural smile, professional makeup, non-explicit marketplace",
  "Do not generate: child, teen, explicit nudity, watermark, text, logo, doll, plastic skin, 3d render.",
].join(" ");

const poses = [
  {
    id: "T1",
    label: "back view — ref screen 1",
    angle:
      "back-facing full body catalog shot, model facing away from camera, arms relaxed at sides below shoulders, full back of lace bra and briefs visible, hair over one shoulder, white studio wall, optional soft pink roses blurred in corner",
  },
  {
    id: "T2",
    label: "seated sofa — ref screen 2",
    angle:
      "seated on light gray fabric sofa, relaxed lifestyle catalog pose, one hand near collarbone other arm on sofa, knees angled, crop from head to upper thighs minimum, soft even lighting, non-explicit",
  },
];

const FALLBACK_IDENTITY_BIBLE = [
  "IDENTITY LOCK — must be the exact same woman in every image:",
  "plus-size curvy hourglass body, age 28 appearance, warm medium tan skin with natural texture, oval face, dark brown wavy shoulder-length hair, brown eyes, groomed arched brows, glam catalog makeup, warm smile with white teeth, gold pendant necklace.",
  lingerieGarment + ".",
  "Do not change face, hair color, skin tone, body proportions, or lingerie design.",
].join(" ");

async function extractIdentityBible(heroUrl) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.log("  (no OPENAI_API_KEY — using fallback identity bible)");
    return FALLBACK_IDENTITY_BIBLE;
  }
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_PROMPT_MODEL ?? "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: [
                  "Describe ONLY this model's identity for image generation consistency (English, 120-180 words).",
                  "Include: face shape, skin tone, hair, eyes, makeup, body type, approximate age, jewelry.",
                  "Include lingerie: colors, lace pattern, bra and brief style.",
                  "Do NOT describe pose or background.",
                  "Start with: IDENTITY LOCK —",
                ].join(" "),
              },
              { type: "image_url", image_url: { url: heroUrl } },
            ],
          },
        ],
        max_tokens: 350,
      }),
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (text && text.length > 80) {
      console.log("  identity bible from vision:", text.slice(0, 120) + "…");
      return text;
    }
  } catch (e) {
    console.log("  vision bible failed:", e instanceof Error ? e.message : e);
  }
  return FALLBACK_IDENTITY_BIBLE;
}

function buildFollowUpPrompt(identityBible, angleInstruction) {
  return [
    identityBible,
    photoRealism + ".",
    "Change ONLY pose and camera:",
    angleInstruction + ".",
    "Commercial lingerie marketplace catalog, non-explicit.",
    "Do not generate: child, explicit nudity, different face, different lingerie colors, watermark, text, doll, plastic skin.",
  ].join(" ");
}

function errMsg(e) {
  if (e instanceof Error) return e.message;
  return JSON.stringify(e).slice(0, 1200);
}

const results = [];

async function runT2i(id, label, prompt, seed) {
  console.log(`\n[${id}] ${label} (${prompt.length} chars)`);
  const t0 = Date.now();
  try {
    const r = await fal.subscribe(T2I, {
      input: { ...falBase, prompt, seed },
      logs: false,
    });
    const url = r.data?.images?.[0]?.url;
    const row = {
      id,
      label,
      ok: true,
      sec: Math.round((Date.now() - t0) / 100) / 10,
      url,
      requestId: r.requestId,
      promptPreview: prompt.slice(0, 400),
    };
    console.log("OK", row.sec + "s", url?.slice(0, 72));
    results.push(row);
    return row;
  } catch (e) {
    const row = {
      id,
      label,
      ok: false,
      sec: Math.round((Date.now() - t0) / 100) / 10,
      error: errMsg(e),
    };
    console.log("FAIL", row.error.slice(0, 280));
    results.push(row);
    return row;
  }
}

console.log("nano-banana t2i ×3 + identity bible —", new Date().toISOString());

const hero = await runT2i("H0", "hero front full (nano-banana only)", heroBase, 42);
if (!hero.ok || !hero.url) {
  writeFileSync(
    "reports/ai/fal-nano-t2i-bible-3-latest.json",
    JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2)
  );
  process.exit(1);
}

console.log("\nExtracting identity bible from hero…");
const identityBible = await extractIdentityBible(hero.url);

for (const pose of poses) {
  const prompt = buildFollowUpPrompt(identityBible, pose.angle);
  await runT2i(pose.id, pose.label, prompt, 43 + Number(pose.id.slice(1)));
}

const summary = {
  ranAt: new Date().toISOString(),
  variant: "nano-banana-pro t2i only, 3 poses, identity bible",
  identityBible,
  heroUrl: hero.url,
  ok: results.filter((r) => r.ok).length,
  fail: results.filter((r) => !r.ok).length,
  results,
};

writeFileSync(
  "reports/ai/fal-nano-t2i-bible-3-latest.json",
  JSON.stringify(summary, null, 2)
);
console.log("\n=== SUMMARY ===");
for (const r of results) {
  console.log((r.ok ? "OK" : "FAIL") + " " + r.id + " " + r.label);
}
console.log("→ reports/ai/fal-nano-t2i-bible-3-latest.json");
