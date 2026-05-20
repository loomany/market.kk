/**
 * A/B harness for lingerie try-on variants (does NOT auto-run paid calls).
 *
 * Usage:
 *   ALLOW_PAID_AI_RUNS=true AI_MOCK_MODE=0 \
 *   node --experimental-strip-types --import=./scripts/lib/registerTsAlias.mjs \
 *     scripts/test-lingerie-tryon-ab.ts \
 *     --product <path-or-url> --model <path-or-url> [--run]
 *
 * Without --run: prints planned variants and exits (safe default).
 * With --run: executes paid calls when keys + ALLOW_PAID_AI_RUNS=true.
 *
 * Outputs: .audit-outputs/lingerie-tryon-ab/ (gitignored — do not commit)
 */
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

import { mockLingerieSetOnModelAnalysis } from "../lib/ai/mockLingerieProductAnalysis.ts";
import { buildFashnGarmentPrepPrompt } from "../lib/ai/fashnGarmentPrepPrompt.ts";
import { buildFashnTryOnMaxPrompt } from "../lib/ai/fashnTryOnMaxPrompt.ts";
import { resolveLingerieSetType } from "../lib/ai/lingerieSetType.ts";

const OUT_DIR = pathResolve(".audit-outputs/lingerie-tryon-ab");

type Variant = {
  id: "A" | "B" | "C" | "D";
  label: string;
  engine: "fal_v16" | "tryon_max";
  edit: boolean;
};

const VARIANTS: Variant[] = [
  { id: "A", label: "v1.6 without Edit", engine: "fal_v16", edit: false },
  { id: "B", label: "v1.6 + Edit", engine: "fal_v16", edit: true },
  { id: "C", label: "Try-On Max without Edit", engine: "tryon_max", edit: false },
  { id: "D", label: "Try-On Max + Edit", engine: "tryon_max", edit: true },
];

function loadEnvLocal() {
  const envPath = pathResolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const rawLine of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx < 0 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

function paidRunAllowed(): boolean {
  return (
    process.argv.includes("--run") &&
    process.env.ALLOW_PAID_AI_RUNS === "true" &&
    process.env.AI_MOCK_MODE === "0" &&
    Boolean(process.env.FAL_KEY) &&
    Boolean(process.env.FASHN_API_KEY)
  );
}

async function main() {
  loadEnvLocal();

  const product = parseArg("--product");
  const model = parseArg("--model");
  if (!product || !model) {
    console.error("Usage: --product <path-or-url> --model <path-or-url> [--run]");
    process.exit(1);
  }

  const analysis = mockLingerieSetOnModelAnalysis();
  const lingerie = resolveLingerieSetType(analysis);
  const maxPrompt = buildFashnTryOnMaxPrompt({ productAnalysis: analysis });
  const editPrompt = buildFashnGarmentPrepPrompt({ productAnalysis: analysis });

  await mkdir(OUT_DIR, { recursive: true });

  const plan = {
    product,
    model,
    lingerieSetType: lingerie.lingerieSetType,
    lingerieSetTypeConfidence: lingerie.lingerieSetTypeConfidence,
    lingerieSetTypeReason: lingerie.lingerieSetTypeReason,
    tryOnMaxPrompt: maxPrompt.prompt,
    garmentTypeLockApplied: maxPrompt.garmentTypeLockApplied,
    antiOnePieceApplied: maxPrompt.antiOnePieceApplied,
    editPrompt: editPrompt.prompt,
    variants: VARIANTS,
    paidRunAllowed: paidRunAllowed(),
    note: "Execute variants manually or extend this script with Fal/FASHN clients. Default is plan-only.",
  };

  await writeFile(
    pathResolve(OUT_DIR, "summary.json"),
    JSON.stringify(plan, null, 2),
    "utf8"
  );

  console.log(JSON.stringify(plan, null, 2));

  if (!process.argv.includes("--run")) {
    console.log("\nPlan saved. Re-run with --run and ALLOW_PAID_AI_RUNS=true to execute paid variants.");
    return;
  }

  if (!paidRunAllowed()) {
    console.error(
      "Paid run blocked. Require ALLOW_PAID_AI_RUNS=true AI_MOCK_MODE=0 FAL_KEY FASHN_API_KEY"
    );
    process.exit(1);
  }

  console.log(
    "\nPaid execution hook not wired in this harness — use studio UI or extend script with runTryOn calls."
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
