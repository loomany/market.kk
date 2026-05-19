"use client";

import {
  ESTIMATED_SAAS_PIPELINE_DURATION_SEC,
  formatUsdRange,
} from "@/lib/studio/clothingTryOnEstimates";
import { isStudioAiDebugEnabled } from "@/lib/studio/studioAiDebug";

type TryOnCostEstimateProps = {
  mockMode: boolean;
  paidAiRunsAllowed: boolean;
  /** Show USD range only in debug/dev */
  showCostInDebug?: boolean;
};

export function TryOnCostEstimate({
  mockMode,
  paidAiRunsAllowed,
  showCostInDebug = isStudioAiDebugEnabled(),
}: TryOnCostEstimateProps) {
  return (
    <div className="space-y-1 rounded-[14px] border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 text-xs leading-5 text-slate-700">
      {mockMode ? (
        <p className="font-medium text-violet-900">Демо-режим: списаний нет.</p>
      ) : !paidAiRunsAllowed ? (
        <p className="font-medium text-amber-900">
          Платные генерации заблокированы.
        </p>
      ) : (
        <>
          <p className="text-slate-800">
            AI создаёт финальный кадр в несколько этапов: проверка товара, модель,
            примерка и улучшение качества.
          </p>
          <p className="text-slate-600">
            Обычно занимает {ESTIMATED_SAAS_PIPELINE_DURATION_SEC.min / 60}–
            {Math.ceil(ESTIMATED_SAAS_PIPELINE_DURATION_SEC.max / 60)} минут
          </p>
          {showCostInDebug ? (
            <p className="text-slate-500">
              Debug cost estimate: {formatUsdRange(0.2, 0.45)} (analyze + model +
              try-on + judge + repair)
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
