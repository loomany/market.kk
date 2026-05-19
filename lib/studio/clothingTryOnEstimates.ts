/** Local USD estimates for studio UI (not billing). */

export const ESTIMATED_TRYON_ONLY_USD = { min: 0.08, max: 0.1 } as const;

/** SaaS full run: analyze + model + try-on + judge + up to 1 repair */
export const ESTIMATED_FULL_CLOTHING_PIPELINE_USD = {
  min: 0.26,
  max: 0.41,
} as const;

/** Display rate for studio cost hint (₸ per $1). */
export const SAAS_PIPELINE_KZT_PER_USD = 500;

/** Rounded себестоимость one-click «Создать фото на модели» for UI. */
export const ESTIMATED_SAAS_PIPELINE_COST_KZT = {
  min: Math.round(ESTIMATED_FULL_CLOTHING_PIPELINE_USD.min * SAAS_PIPELINE_KZT_PER_USD),
  max: Math.round(ESTIMATED_FULL_CLOTHING_PIPELINE_USD.max * SAAS_PIPELINE_KZT_PER_USD),
} as const;

/**
 * Full SaaS clothing pipeline timing for the "Итоговый результат" countdown.
 * `.max` = ceiling shown to the user (the on-screen mm:ss). Soft target — when
 * the timer hits 0 we still keep waiting; the request is never client-aborted.
 */
export const ESTIMATED_SAAS_PIPELINE_DURATION_SEC = { min: 60, max: 240 } as const;

/**
 * UI countdown while nano-banana model image generates (the "Создаём AI-модель"
 * card). Soft target — keeps counting from this start value.
 */
export const SAAS_MODEL_GENERATION_COUNTDOWN_SEC = 180;

/** @deprecated Use ESTIMATED_SAAS_PIPELINE_DURATION_SEC for clothing SaaS button */
export const ESTIMATED_TRYON_DURATION_SEC = ESTIMATED_SAAS_PIPELINE_DURATION_SEC;

export function formatUsdRange(min: number, max: number): string {
  if (min === max) return `~$${min.toFixed(2)}`;
  return `~$${min.toFixed(2)}–$${max.toFixed(2)}`;
}

export function formatSaasPipelineCostKztRange(): string {
  const { min, max } = ESTIMATED_SAAS_PIPELINE_COST_KZT;
  return `от ${min} до ${max} ₸`;
}

export function estimateTryOnOnlyCostUsd(): number {
  return ESTIMATED_TRYON_ONLY_USD.max;
}
