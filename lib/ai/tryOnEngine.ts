import type { QualityMode } from "@/components/studio/types";
import { FASHN_TRYON_MODEL } from "@/lib/ai/falClient";
import { FASHN_TRYON_MAX_MODEL_NAME } from "@/lib/ai/fashnTryOnMaxSchemas";

/**
 * Declared try-on engines — v1.6 via Fal; Try-On Max via direct FASHN API when toggled.
 */
export type TryOnEngine =
  | "fashn_v16"
  | "fashn_v16_quality"
  | "fashn_tryon_max_experimental";

export function resolveTryOnEngine(
  mode: QualityMode,
  options?: { tryOnMaxExperimental?: boolean }
): TryOnEngine {
  if (options?.tryOnMaxExperimental) return "fashn_tryon_max_experimental";
  if (mode === "quality") return "fashn_v16_quality";
  return "fashn_v16";
}

export function tryOnEngineLabel(engine: TryOnEngine): string {
  switch (engine) {
    case "fashn_v16_quality":
      return `${FASHN_TRYON_MODEL} (mode=quality — Fal v1.6)`;
    case "fashn_tryon_max_experimental":
      return `${FASHN_TRYON_MAX_MODEL_NAME} (direct FASHN API, 2k quality)`;
    default:
      return `${FASHN_TRYON_MODEL} (mode=performance|balanced)`;
  }
}

export function isTryOnMaxExperimental(engine: TryOnEngine): boolean {
  return engine === "fashn_tryon_max_experimental";
}
