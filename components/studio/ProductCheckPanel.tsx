"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PRODUCT_POSE_DESCRIPTION_RU_MAX } from "@/lib/ai/modelCustomParams";
import {
  isConfidentProductAnalysis,
  type ProductDescriptionAnalysis,
  type ProductDescriptionAnalysisDebug,
} from "@/lib/ai/productDescriptionAnalysisSchemas";
import type {
  GarmentPhotoType,
  ModelCategoryContext,
  ProductCategory,
} from "./types";
import {
  GARMENT_PHOTO_TYPES,
  PRODUCT_CATEGORIES,
} from "./types";

const SCENARIO_LABELS: Record<ModelCategoryContext, string> = {
  clothing: "Одежда",
  lingerie: "Бельё / купальники",
  jewelry: "Украшения",
  general: "Универсально",
};

function labelForCategory(id: ProductCategory): string {
  return PRODUCT_CATEGORIES.find((item) => item.id === id)?.label ?? id;
}

function labelForGarmentPhoto(id: GarmentPhotoType): string {
  return GARMENT_PHOTO_TYPES.find((item) => item.id === id)?.label ?? id;
}

type ProductCheckPanelProps = {
  hasPhoto: boolean;
  description: string;
  onDescriptionChange: (value: string) => void;
  analyzing: boolean;
  error: string | null;
  analysis: ProductDescriptionAnalysis | null;
  analysisDebug: ProductDescriptionAnalysisDebug | null;
  userEditedProductDescription: boolean;
  settingsApplied: boolean | null;
  scenario: ModelCategoryContext;
  productCategory: ProductCategory;
  garmentPhotoType: GarmentPhotoType;
  onReanalyze: () => void;
};

export function ProductCheckPanel({
  hasPhoto,
  description,
  onDescriptionChange,
  analyzing,
  error,
  analysis,
  analysisDebug,
  userEditedProductDescription,
  settingsApplied,
  scenario,
  productCategory,
  garmentPhotoType,
  onReanalyze,
}: ProductCheckPanelProps) {
  if (!hasPhoto) return null;

  const confident =
    analysis !== null && isConfidentProductAnalysis(analysis.confidence);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-950">Проверка товара</h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          AI автоматически определил параметры. Проверьте описание перед
          созданием фото.
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
        <p
          className={
            confident
              ? "rounded-[14px] border border-teal-100 bg-teal-50/70 px-3 py-2 text-xs leading-5 text-teal-950"
              : "rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900"
          }
        >
          {confident && settingsApplied !== false
            ? "AI уверен в выборе"
            : "AI не уверен, проверьте параметры"}
          {` · уверенность ${Math.round(analysis.confidence * 100)}%`}
          {analysis.warnings.length > 0
            ? ` — ${analysis.warnings.slice(0, 2).join(" ")}`
            : null}
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
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Тип товара</dt>
            <dd className="text-right font-medium text-slate-900">
              {labelForCategory(productCategory)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Тип исходного фото</dt>
            <dd className="text-right font-medium text-slate-900">
              {labelForGarmentPhoto(garmentPhotoType)}
            </dd>
          </div>
        </dl>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="product-description-check"
          className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500"
        >
          Описание товара
          {userEditedProductDescription ? (
            <span className="ml-2 font-normal normal-case text-teal-700">
              (отредактировано вручную)
            </span>
          ) : null}
        </label>
        <textarea
          id="product-description-check"
          rows={4}
          value={description}
          maxLength={PRODUCT_POSE_DESCRIPTION_RU_MAX}
          disabled={analyzing}
          placeholder={
            analyzing
              ? "Ожидаем результат анализа…"
              : "Опишите товар для генерации: тип, цвет, детали, как снят на фото"
          }
          onChange={(event) => onDescriptionChange(event.target.value)}
          className="min-h-[96px] w-full resize-y rounded-[12px] border border-border bg-white px-3 py-2.5 text-sm leading-5 text-slate-900 shadow-sm outline-none transition hover:border-slate-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        loading={analyzing}
        disabled={analyzing}
        onClick={onReanalyze}
      >
        <RefreshCw className="h-4 w-4" />
        Повторить анализ AI
      </Button>

      {analysisDebug && !analyzing ? (
        <details className="rounded-[12px] border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
          <summary className="cursor-pointer font-medium text-slate-700">
            Debug
          </summary>
          <dl className="mt-2 space-y-1.5">
            <div>
              <dt className="font-medium text-slate-500">sourcePresentation</dt>
              <dd className="font-mono text-slate-800">
                {analysisDebug.sourcePresentation}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">garmentPhotoType</dt>
              <dd className="font-mono text-slate-800">
                {analysisDebug.garmentPhotoType}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">confidence</dt>
              <dd className="font-mono text-slate-800">
                {analysisDebug.confidence.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">reason</dt>
              <dd className="text-slate-800">{analysisDebug.reason ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">
                userEditedProductDescription
              </dt>
              <dd className="font-mono text-slate-800">
                {String(userEditedProductDescription)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">finalUserDescription</dt>
              <dd className="text-slate-800">{description || "—"}</dd>
            </div>
            {analysisDebug.postProcessingOverrides.length > 0 ? (
              <div>
                <dt className="font-medium text-slate-500">
                  post-processing overrides
                </dt>
                <dd className="text-slate-800">
                  {analysisDebug.postProcessingOverrides.join("; ")}
                </dd>
              </div>
            ) : null}
            {analysis ? (
              <div>
                <dt className="font-medium text-slate-500">productAnalysisJson</dt>
                <dd className="mt-0.5 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] leading-4 text-slate-700">
                  {JSON.stringify(analysis, null, 2)}
                </dd>
              </div>
            ) : null}
            {analysisDebug.rawVisionAnswer ? (
              <div>
                <dt className="font-medium text-slate-500">rawVisionAnswer</dt>
                <dd className="mt-0.5 max-h-32 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] leading-4 text-slate-700">
                  {analysisDebug.rawVisionAnswer}
                </dd>
              </div>
            ) : null}
          </dl>
        </details>
      ) : null}
    </div>
  );
}
