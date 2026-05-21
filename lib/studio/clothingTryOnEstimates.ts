/** Local USD estimates for studio UI (not billing). */

export const ESTIMATED_TRYON_ONLY_USD = { min: 0.08, max: 0.1 } as const;

/**
 * Full SaaS clothing pipeline timing for the "Итоговый результат" countdown.
 * `.max` = ceiling shown to the user (the on-screen mm:ss). Soft target — when
 * the timer hits 0 we still keep waiting; the request is never client-aborted.
 */
/** Единый обратный отсчёт «Итог» / комплект: 15 минут с анализа до финала. */
export const STUDIO_PIPELINE_COUNTDOWN_15_MIN_SEC = 15 * 60;

/** Товарная карточка: колонка «Результат» при сборке exact-card. */
export const STUDIO_PRODUCT_CARD_RESULT_COUNTDOWN_SEC = 3 * 60;

export const ESTIMATED_SAAS_PIPELINE_DURATION_SEC = {
  min: 60,
  max: STUDIO_PIPELINE_COUNTDOWN_15_MIN_SEC,
} as const;

/**
 * UI countdown while nano-banana model image generates (the "Создаём AI-модель"
 * card). Soft target — keeps counting from this start value.
 */
/** До первого кадра модели (после — только карусель). */
export const SAAS_MODEL_GENERATION_COUNTDOWN_SEC = STUDIO_PIPELINE_COUNTDOWN_15_MIN_SEC;

/** Оценка на один ракурс в комплекте (анализ → модель → примерка). */
export const PRODUCT_SET_SLOT_ESTIMATE_SEC = {
  analyze: 25,
  model: 150,
  tryOn: 100,
} as const;

export function estimateProductSetTotalSec(slotCount: number): number {
  const per =
    PRODUCT_SET_SLOT_ESTIMATE_SEC.analyze +
    PRODUCT_SET_SLOT_ESTIMATE_SEC.model +
    PRODUCT_SET_SLOT_ESTIMATE_SEC.tryOn;
  return Math.max(slotCount, 1) * per;
}

export function estimateProductSetStepSec(
  phase: keyof typeof PRODUCT_SET_SLOT_ESTIMATE_SEC
): number {
  return PRODUCT_SET_SLOT_ESTIMATE_SEC[phase];
}

/** @deprecated Use ESTIMATED_SAAS_PIPELINE_DURATION_SEC for clothing SaaS button */
export const ESTIMATED_TRYON_DURATION_SEC = ESTIMATED_SAAS_PIPELINE_DURATION_SEC;

export function estimateTryOnOnlyCostUsd(): number {
  return ESTIMATED_TRYON_ONLY_USD.max;
}
