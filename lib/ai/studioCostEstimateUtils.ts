import type { StudioCostEstimate } from "@/lib/ai/studioGenerationCostEstimate";

/** Tokens charged / checked before generation (worst-case when range). */
export function preflightTokensFromEstimate(estimate: StudioCostEstimate): number {
  return estimate.tokensMax ?? estimate.tokens;
}

export function minTokensFromEstimate(estimate: StudioCostEstimate): number {
  return estimate.tokensMin ?? estimate.tokens;
}

export function maxTokensFromEstimate(estimate: StudioCostEstimate): number {
  return estimate.tokensMax ?? estimate.tokens;
}

export function hasEstimateTokenRange(estimate: StudioCostEstimate): boolean {
  const min = minTokensFromEstimate(estimate);
  const max = maxTokensFromEstimate(estimate);
  return max - min > 0.005;
}

export function sumStudioCostEstimates(
  a: StudioCostEstimate,
  b: StudioCostEstimate
): StudioCostEstimate {
  const minA = minTokensFromEstimate(a);
  const maxA = maxTokensFromEstimate(a);
  const minB = minTokensFromEstimate(b);
  const maxB = maxTokensFromEstimate(b);
  return {
    totalUsd: Number((a.totalUsd + b.totalUsd).toFixed(4)),
    tokens: Number((maxA + maxB).toFixed(2)),
    tokensMin: Number((minA + minB).toFixed(2)),
    tokensMax: Number((maxA + maxB).toFixed(2)),
    lines: [...a.lines, ...b.lines],
    optionalLines: [...a.optionalLines, ...b.optionalLines],
  };
}

export function multiplyStudioCostEstimate(
  estimate: StudioCostEstimate,
  multiplier: number
): StudioCostEstimate {
  const n = Math.max(1, Math.floor(multiplier));
  if (n <= 1) return estimate;

  const scaleTok = (t: number) => Number((t * n).toFixed(4));
  const min = minTokensFromEstimate(estimate);
  const max = maxTokensFromEstimate(estimate);

  return {
    ...estimate,
    totalUsd: Number((estimate.totalUsd * n).toFixed(4)),
    tokens: scaleTok(max),
    tokensMin: scaleTok(min),
    tokensMax: scaleTok(max),
    lines: estimate.lines.map((l) => ({
      ...l,
      usd: Number((l.usd * n).toFixed(4)),
    })),
    optionalLines: estimate.optionalLines.map((l) => ({
      ...l,
      usd: Number((l.usd * n).toFixed(4)),
    })),
  };
}
