/**
 * Tiny ESM resolver hook so `node --experimental-strip-types` can run a test
 * script whose dependency chain uses `@/` path aliases.
 *
 * Mirrors the `paths: { "@/*": ["./*"] }` entry from `tsconfig.json`.
 *
 * Used only by local regression scripts (e.g. `npm run test:tryon-safe-pose`);
 * NOT loaded by Next.js / production. Zero external deps.
 */
import { existsSync } from "node:fs";
import { dirname, resolve as pathResolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HOOK_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = pathResolve(HOOK_DIR, "..", "..");

const CANDIDATE_SUFFIXES = [".ts", ".tsx", "/index.ts", "/index.tsx"];

function tryResolveTsCandidate(base) {
  for (const suffix of CANDIDATE_SUFFIXES) {
    const candidate = `${base}${suffix}`;
    if (existsSync(candidate)) {
      return pathToFileURL(candidate).href;
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const base = pathResolve(PROJECT_ROOT, specifier.slice(2));
    const rewritten = tryResolveTsCandidate(base);
    if (rewritten) {
      return nextResolve(rewritten, context);
    }
  }
  return nextResolve(specifier, context);
}
