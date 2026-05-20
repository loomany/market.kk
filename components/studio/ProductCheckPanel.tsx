"use client";

import { useLayoutEffect, useRef } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { PRODUCT_POSE_DESCRIPTION_RU_MAX } from "@/lib/ai/modelCustomParams";
import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import { sourcePresentationSummaryRu } from "@/lib/studio/garmentPhotoTypeFromPresentation";
import { isSourceModelPopulated } from "@/lib/ai/sourceModelPostProcess";
import { sourceModelCheckLinesRu } from "@/lib/studio/sourceModelSummaryRu";
import type { ModelCategoryContext } from "./types";

const SCENARIO_LABELS: Record<ModelCategoryContext, string> = {
  clothing: "Одежда",
  lingerie: "Бельё / купальники",
  jewelry: "Украшения",
  general: "Универсально",
};

type ProductCheckPanelProps = {
  hasPhoto: boolean;
  description: string;
  analyzing: boolean;
  error: string | null;
  analysis: ProductDescriptionAnalysis | null;
  scenario: ModelCategoryContext;
  onReanalyze: () => void;
};

function ReadOnlyAutoHeightDescription({
  id,
  value,
  placeholder,
  analyzing,
}: {
  id: string;
  value: string;
  placeholder: string;
  analyzing: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [value, analyzing]);

  return (
    <textarea
      ref={ref}
      id={id}
      readOnly
      tabIndex={-1}
      rows={1}
      value={analyzing ? "" : value}
      placeholder={analyzing ? placeholder : undefined}
      aria-readonly="true"
      className="pointer-events-none min-h-[72px] w-full resize-none overflow-hidden rounded-[12px] border border-border bg-slate-50 px-3 py-2.5 text-sm leading-5 text-slate-900 shadow-sm outline-none placeholder:text-slate-400"
    />
  );
}

export function ProductCheckPanel({
  hasPhoto,
  description,
  analyzing,
  error,
  analysis,
  scenario,
  onReanalyze,
}: ProductCheckPanelProps) {
  if (!hasPhoto) return null;

  const sourcePhotoSummary = sourcePresentationSummaryRu(
    analysis?.sourcePresentation
  );
  const sourceModelLines =
    analysis?.sourcePresentation === "on-model" &&
    isSourceModelPopulated(analysis.sourceModel)
      ? sourceModelCheckLinesRu(analysis.sourceModel)
      : null;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-950">Проверка товара</h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          AI автоматически определил параметры. Описание товара ниже — только
          для просмотра.
        </p>
      </div>

      {analyzing ? (
        <p className="rounded-[14px] border border-teal-100 bg-teal-50/70 px-3 py-2 text-xs leading-5 text-teal-950">
          Анализируем фото товара…
        </p>
      ) : null}

      {error ? (
        <p className="rounded-[14px] border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-800">
          {error}
        </p>
      ) : null}

      {analysis && !analyzing ? (
        <dl className="grid grid-cols-1 gap-2 rounded-[12px] border border-slate-200/80 bg-slate-50/60 px-3 py-2.5 text-xs">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Сценарий</dt>
            <dd className="text-right font-medium text-slate-900">
              {SCENARIO_LABELS[scenario]}
            </dd>
          </div>
          {sourcePhotoSummary ? (
            <div className="col-span-full text-[11px] leading-4 text-slate-700">
              {sourcePhotoSummary}
            </div>
          ) : null}
          {sourceModelLines ? (
            <>
              {sourceModelLines.bodyLine ? (
                <div className="col-span-full text-[11px] leading-4 text-slate-700">
                  {sourceModelLines.bodyLine}
                </div>
              ) : null}
              {sourceModelLines.cropLine ? (
                <div className="col-span-full text-[11px] leading-4 text-slate-700">
                  {sourceModelLines.cropLine}
                </div>
              ) : null}
              {sourceModelLines.poseLine ? (
                <div className="col-span-full text-[11px] leading-4 text-slate-700">
                  {sourceModelLines.poseLine}
                </div>
              ) : null}
            </>
          ) : null}
        </dl>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="product-description-check"
          className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500"
        >
          Описание товара
        </label>
        {analyzing ? (
          <p className="rounded-[12px] border border-border bg-slate-50 px-3 py-2.5 text-sm leading-5 text-slate-500">
            Ожидаем результат анализа…
          </p>
        ) : (
          <ReadOnlyAutoHeightDescription
            id="product-description-check"
            value={description}
            analyzing={false}
            placeholder="Описание появится после анализа фото"
          />
        )}
        {!analyzing && description.length >= PRODUCT_POSE_DESCRIPTION_RU_MAX ? (
          <p className="text-[11px] leading-4 text-slate-500">
            Текст обрезан до {PRODUCT_POSE_DESCRIPTION_RU_MAX} символов.
          </p>
        ) : null}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={analyzing}
        onClick={onReanalyze}
      >
        <RefreshCw
          className={cn("h-4 w-4", analyzing && "animate-spin")}
          aria-hidden
        />
        Повторить анализ AI
      </Button>
    </div>
  );
}
