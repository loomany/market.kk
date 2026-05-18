"use client";

import {
  ESTIMATED_FULL_CLOTHING_PIPELINE_USD,
  ESTIMATED_TRYON_DURATION_SEC,
  formatUsdRange,
} from "@/lib/studio/clothingTryOnEstimates";

type TryOnCostEstimateProps = {
  mockMode: boolean;
  paidAiRunsAllowed: boolean;
  tryOnOnly?: boolean;
};

export function TryOnCostEstimate({
  mockMode,
  paidAiRunsAllowed,
  tryOnOnly = false,
}: TryOnCostEstimateProps) {
  const costRange = tryOnOnly
    ? { min: 0.08, max: 0.1 }
    : ESTIMATED_FULL_CLOTHING_PIPELINE_USD;

  return (
    <div className="space-y-1 rounded-[14px] border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 text-xs leading-5 text-slate-700">
      {mockMode ? (
        <>
          <p className="font-medium text-violet-900">Демо-режим: списаний нет.</p>
          <p className="text-slate-600">Примерно: $0</p>
        </>
      ) : !paidAiRunsAllowed ? (
        <p className="font-medium text-amber-900">
          Платные генерации заблокированы.
        </p>
      ) : (
        <>
          <p>
            Примерно:{" "}
            <span className="font-semibold text-slate-900">
              {formatUsdRange(costRange.min, costRange.max)}
            </span>
          </p>
          <p className="text-slate-600">
            Обычно занимает {ESTIMATED_TRYON_DURATION_SEC.min}–
            {ESTIMATED_TRYON_DURATION_SEC.max} секунд
          </p>
        </>
      )}
    </div>
  );
}
