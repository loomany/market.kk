"use client";

import {
  CheckCircle2,
  ImageIcon,
  MousePointerClick,
  PencilLine,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useStudioCopy } from "./StudioLocaleContext";
import {
  ProductMaskEditor,
  type ProductMaskApplyResult,
} from "./ProductMaskEditor";

type ProductSelectionPanelProps = {
  active: boolean;
  previewUrl: string | null;
  maskEditorOpen: boolean;
  hasSelectedProduct: boolean;
  selectedProductPreviewUrl: string | null;
  onOpenEditor: () => void;
  onApply: (result: ProductMaskApplyResult) => void;
  onCancelEditor: () => void;
  onClearSelection?: () => void;
};

export function ProductSelectionPanel({
  active,
  previewUrl,
  maskEditorOpen,
  hasSelectedProduct,
  selectedProductPreviewUrl,
  onOpenEditor,
  onApply,
  onCancelEditor,
  onClearSelection,
}: ProductSelectionPanelProps) {
  const { copy } = useStudioCopy();
  const ps = copy.productSelection;
  const mask = copy.mask;

  if (!active || !previewUrl) {
    return (
      <div className="rounded-[16px] border border-dashed border-slate-200 bg-slate-50/90 px-4 py-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-white text-slate-400 shadow-sm ring-1 ring-slate-200/80">
          <ImageIcon className="h-6 w-6" aria-hidden />
        </span>
        <p className="mt-4 text-sm font-semibold text-slate-950">
          {ps.uploadFirstTitle}
        </p>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-slate-500">
          {ps.uploadFirstHint}
        </p>
        <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {ps.requiredStep}
        </p>
      </div>
    );
  }

  if (maskEditorOpen) {
    return (
      <ProductMaskEditor
        key={previewUrl}
        imageUrl={previewUrl}
        onApply={onApply}
        onCancel={onCancelEditor}
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-[22px] border border-border bg-white shadow-sm">
      <div className="border-b border-border/70 bg-slate-50/80 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-teal-100 text-teal-800">
              <MousePointerClick className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-950">{mask.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                {ps.requiredStep}
              </p>
            </div>
          </div>
          {hasSelectedProduct ? (
            <Badge variant="success" className="shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {mask.statusDone}
            </Badge>
          ) : (
            <Badge variant="warning" className="shrink-0">
              {mask.statusNeeded}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">
        {!hasSelectedProduct && (
          <>
            <p className="text-sm leading-6 text-slate-600">
              {copy.maskEditor.instruction1}
            </p>
            <div className="rounded-[16px] border border-amber-200/90 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-950">
              {copy.errors.maskRequired}
            </div>
            <Button
              type="button"
              variant="primary"
              className="w-full"
              size="lg"
              onClick={onOpenEditor}
            >
              <PencilLine className="h-4 w-4" />
              {ps.drawFrame}
            </Button>
          </>
        )}

        {hasSelectedProduct && selectedProductPreviewUrl && (
          <>
            <p className="text-sm leading-6 text-slate-600">
              {copy.maskEditor.instruction3}
            </p>

            <div className="overflow-hidden rounded-[18px] border border-border">
              <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-slate-50 px-3 py-2">
                <span className="text-xs font-semibold text-slate-700">
                  {mask.title}
                </span>
              </div>
              <div className="flex min-h-[140px] items-center justify-center bg-slate-100 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedProductPreviewUrl}
                  alt={ps.selectedAlt}
                  className="max-h-44 w-full rounded-[12px] object-contain"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:flex-1"
                onClick={onOpenEditor}
              >
                <PencilLine className="h-4 w-4" />
                {ps.editFrame}
              </Button>
              {onClearSelection && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full sm:w-auto"
                  onClick={onClearSelection}
                >
                  <RotateCcw className="h-4 w-4" />
                  {ps.clearSelection}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
