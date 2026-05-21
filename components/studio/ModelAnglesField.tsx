"use client";

import { ProductPoseFromPhotoCard } from "@/components/studio/ProductPoseFromPhotoCard";
import { MODEL_CUSTOM_TEXT_MAX } from "@/lib/ai/modelCustomParams";
import {
  createEmptyCustomAngle,
  type ModelCustomAngle,
  type ResolvedModelAngle,
} from "@/lib/ai/modelAngles";
import { cn } from "@/lib/utils";
import { useStudioCopy } from "./StudioLocaleContext";

type ModelAnglesFieldProps = {
  customAngles: ModelCustomAngle[];
  disabled?: boolean;
  productPhotoCount?: number;
  useProductSampleAngles?: boolean;
  productSampleAngles?: ResolvedModelAngle[] | null;
  analyzingProductAngles?: boolean;
  onApplyFromProduct?: () => void;
  onClearProductPose?: () => void;
  onCustomAnglesChange: (angles: ModelCustomAngle[]) => void;
};

export function ModelAnglesField({
  customAngles,
  disabled,
  productPhotoCount = 0,
  useProductSampleAngles = false,
  productSampleAngles = null,
  analyzingProductAngles = false,
  onApplyFromProduct,
  onClearProductPose,
  onCustomAnglesChange,
}: ModelAnglesFieldProps) {
  const { copy } = useStudioCopy();
  const m = copy.modelAngles;
  const text = customAngles[0]?.text ?? "";
  const poseFromProduct = useProductSampleAngles;

  const setText = (nextText: string) => {
    const base = customAngles[0] ?? createEmptyCustomAngle();
    const trimmed = nextText.slice(0, MODEL_CUSTOM_TEXT_MAX);
    onCustomAnglesChange([
      {
        ...base,
        text: trimmed,
        saved: trimmed.trim().length > 0,
      },
    ]);
  };

  return (
    <div className="space-y-3">
      {productPhotoCount === 0 ? (
        <p className="rounded-[14px] border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2 text-xs leading-5 text-slate-600">
          {m.uploadFirst}
        </p>
      ) : (
        <ProductPoseFromPhotoCard
          disabled={disabled}
          analyzing={analyzingProductAngles}
          useProductSampleAngles={useProductSampleAngles}
          productSampleAngles={productSampleAngles}
          onApply={onApplyFromProduct}
          onClear={onClearProductPose}
        />
      )}

      {!poseFromProduct ? (
        <>
          <textarea
            value={text}
            disabled={disabled || analyzingProductAngles}
            maxLength={MODEL_CUSTOM_TEXT_MAX}
            rows={3}
            placeholder={m.posePlaceholder}
            onChange={(event) => setText(event.target.value)}
            className={cn(
              "w-full resize-y rounded-[12px] border bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm outline-none transition sm:text-sm",
              "hover:border-slate-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600",
              "border-border min-h-[88px]"
            )}
          />
        </>
      ) : null}
    </div>
  );
}
