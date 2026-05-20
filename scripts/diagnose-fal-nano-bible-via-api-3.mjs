/**
 * Smoke: 3 poses via same logic as studio (preferTextOnly + identity lock on server).
 * Requires: npm run dev OR set BASE_URL. Uses generate-model API.
 *
 * Usage: node scripts/diagnose-fal-nano-bible-via-api-3.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";

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

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const baseRequest = {
  gender: "female",
  modelNationality: "Kazakh, Central Asian",
  bodyType: "plus-size",
  modelAge: 28,
  pose: "front",
  crop: "full-body",
  background: "white",
  lighting: "studio",
  categoryContext: "lingerie",
  aspectRatio: "3:4",
  outputFormat: "png",
  resolution: "1K",
  numImages: 1,
  customDescription:
    "premium marketplace catalog, soft daylight, clean white studio, warm approachable mood",
  promptLocale: "ru",
};

const angles = [
  {
    id: "H0",
    label: "hero front",
    preferTextOnlyAngleFollowUp: false,
    cameraAnglePrompt:
      "front-facing full-length hero shot, hands on outer hips, entire head to feet visible",
  },
  {
    id: "T1",
    label: "back",
    preferTextOnlyAngleFollowUp: true,
    cameraAnglePrompt:
      "back-facing catalog shot, arms at sides, full back of lingerie visible",
  },
  {
    id: "T2",
    label: "seated sofa",
    preferTextOnlyAngleFollowUp: true,
    cameraAnglePrompt:
      "seated on light gray sofa, relaxed pose, one hand near collarbone",
  },
];

const results = [];
let heroUrl;

for (const shot of angles) {
  console.log(`\n[${shot.id}] ${shot.label}`);
  const body = {
    ...baseRequest,
    seed: 42 + shot.id.length,
    cameraAnglePrompt: shot.cameraAnglePrompt,
    preferTextOnlyAngleFollowUp: shot.preferTextOnlyAngleFollowUp,
    heroImageUrlForIdentity:
      shot.preferTextOnlyAngleFollowUp && heroUrl ? heroUrl : undefined,
  };
  const t0 = Date.now();
  try {
    const res = await fetch(`${BASE}/api/ai/generate-model`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const row = {
      id: shot.id,
      label: shot.label,
      ok: data.ok,
      status: res.status,
      sec: Math.round((Date.now() - t0) / 100) / 10,
      model: data.model,
      url: data.images?.[0]?.url,
      requestId: data.requestId,
      promptPreview: data.promptPreview?.slice(0, 200),
      usedVisionIdentity: data.usedVisionIdentity,
      message: data.message,
    };
    console.log(
      row.ok ? "OK" : "FAIL",
      row.sec + "s",
      row.model,
      row.usedVisionIdentity ? "vision" : "",
      row.message ?? ""
    );
    if (row.ok && shot.id === "H0") heroUrl = row.url;
    results.push(row);
  } catch (e) {
    console.log("FAIL", e instanceof Error ? e.message : e);
    results.push({ id: shot.id, ok: false, error: String(e) });
  }
}

writeFileSync(
  "reports/ai/fal-nano-bible-api-3-latest.json",
  JSON.stringify({ ranAt: new Date().toISOString(), base: BASE, results }, null, 2)
);
console.log("\n→ reports/ai/fal-nano-bible-api-3-latest.json");
