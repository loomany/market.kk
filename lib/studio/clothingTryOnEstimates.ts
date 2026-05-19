/** Local USD estimates for studio UI (not billing). */

export const ESTIMATED_TRYON_ONLY_USD = { min: 0.08, max: 0.1 } as const;

/** SaaS full run: analyze + model + try-on + judge + up to 1 repair */
export const ESTIMATED_FULL_CLOTHING_PIPELINE_USD = {
  min: 0.2,
  max: 0.45,
} as const;

export const ESTIMATED_SAAS_PIPELINE_DURATION_SEC = { min: 60, max: 180 } as const;

/** @deprecated Use ESTIMATED_SAAS_PIPELINE_DURATION_SEC for clothing SaaS button */
export const ESTIMATED_TRYON_DURATION_SEC = ESTIMATED_SAAS_PIPELINE_DURATION_SEC;

export function formatUsdRange(min: number, max: number): string {
  if (min === max) return `~$${min.toFixed(2)}`;
  return `~$${min.toFixed(2)}–$${max.toFixed(2)}`;
}

export function estimateTryOnOnlyCostUsd(): number {
  return ESTIMATED_TRYON_ONLY_USD.max;
}
