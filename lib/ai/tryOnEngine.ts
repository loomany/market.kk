import type { QualityMode } from "@/components/studio/types";
import { FASHN_TRYON_MODEL } from "@/lib/ai/falClient";

/**
 * Declared try-on engines — only v1.6 paths are wired today.
 * `fashn_tryon_max_experimental` is reserved; no paid calls until a separate PR.
 */
export type TryOnEngine =
  | "fashn_v16"
  | "fashn_v16_quality"
  | "fashn_tryon_max_experimental";

export function resolveTryOnEngine(mode: QualityMode): TryOnEngine {
  if (mode === "quality") return "fashn_v16_quality";
  return "fashn_v16";
}

export function tryOnEngineLabel(engine: TryOnEngine): string {
  switch (engine) {
    case "fashn_v16_quality":
      return `${FASHN_TRYON_MODEL} (mode=quality — UI “2K / Max quality”, not FASHN Try-On Max API)`;
    case "fashn_tryon_max_experimental":
      return "fashn_tryon_max (experimental — not connected)";
    default:
      return `${FASHN_TRYON_MODEL} (mode=performance|balanced)`;
  }
}

export function isTryOnMaxExperimental(engine: TryOnEngine): boolean {
  return engine === "fashn_tryon_max_experimental";
}
