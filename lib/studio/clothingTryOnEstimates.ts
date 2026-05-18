/** Local USD estimates for studio UI (not billing). */

export const ESTIMATED_TRYON_ONLY_USD = { min: 0.08, max: 0.1 } as const;

export const ESTIMATED_FULL_CLOTHING_PIPELINE_USD = {
  min: 0.12,
  max: 0.2,
} as const;

export const ESTIMATED_TRYON_DURATION_SEC = { min: 30, max: 60 } as const;

export function formatUsdRange(min: number, max: number): string {
  if (min === max) return `~$${min.toFixed(2)}`;
  return `~$${min.toFixed(2)}–$${max.toFixed(2)}`;
}

export function estimateTryOnOnlyCostUsd(): number {
  return ESTIMATED_TRYON_ONLY_USD.max;
}
