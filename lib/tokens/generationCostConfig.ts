export type GenerationOperationType =
  | "try-on"
  | "background"
  | "enhance"
  | "video"
  | "model-generation"
  | "product-shot"
  | "scene"
  | "prompt-enhance"
  | "mask-refine"
  | "preservation-analyze"
  | "angles-analyze"
  | "text-to-image"
  | "default";

export const GENERATION_COST_BY_OPERATION: Record<
  GenerationOperationType,
  number
> = {
  "try-on": 1,
  background: 1,
  enhance: 1,
  video: 1,
  "model-generation": 1,
  "product-shot": 1,
  scene: 1,
  "prompt-enhance": 1,
  "mask-refine": 1,
  "preservation-analyze": 1,
  "angles-analyze": 1,
  "text-to-image": 1,
  default: 1,
};

function parsePositiveInt(raw: string | undefined): number | null {
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
}

export function resolveGenerationCost(
  operationType: GenerationOperationType = "default",
  defaultOverride?: number
): number {
  if (
    typeof defaultOverride === "number" &&
    Number.isFinite(defaultOverride) &&
    defaultOverride > 0
  ) {
    return Math.floor(defaultOverride);
  }
  return GENERATION_COST_BY_OPERATION[operationType] ?? 1;
}

/** Client-side token cost for UI hints (studio headers, buttons). */
export function getClientGenerationCost(
  operationType: GenerationOperationType = "default"
): number {
  const fromPublic = parsePositiveInt(
    process.env.NEXT_PUBLIC_TOKEN_DEFAULT_GENERATION_COST
  );
  return resolveGenerationCost(operationType, fromPublic ?? undefined);
}
