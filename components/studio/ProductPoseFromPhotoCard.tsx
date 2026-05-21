"use client";

import { Button } from "@/components/ui/Button";
import type { ResolvedModelAngle } from "@/lib/ai/modelAngles";
import { productPoseLabelForUi } from "@/lib/ai/productPoseSummary";
import { useStudioCopy } from "./StudioLocaleContext";

type ProductPoseFromPhotoCardProps = {
  disabled?: boolean;
  analyzing?: boolean;
  useProductSampleAngles?: boolean;
  productSampleAngles?: ResolvedModelAngle[] | null;
  onApply?: () => void;
  onClear?: () => void;
};

export function ProductPoseFromPhotoCard({
  disabled,
  analyzing,
  useProductSampleAngles,
  productSampleAngles,
  onApply,
  onClear,
}: ProductPoseFromPhotoCardProps) {
  const { copy } = useStudioCopy();
  const p = copy.productPoseFromPhoto;

  if (
    useProductSampleAngles &&
    productSampleAngles &&
    productSampleAngles.length > 0
  ) {
    return (
      <div className="space-y-2 rounded-[14px] border border-emerald-200 bg-emerald-50/60 p-3">
        <p className="text-xs font-semibold text-emerald-900">
          {p.matchedTitle}
        </p>
        <p className="text-sm font-medium leading-6 text-emerald-950">
          {productSampleAngles[0]
            ? productPoseLabelForUi(productSampleAngles[0])
            : "—"}
        </p>
        {onClear ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onClear}
            className="text-xs font-medium text-emerald-800 underline-offset-2 hover:underline"
          >
            {p.describeManual}
          </button>
        ) : null}
      </div>
    );
  }

  if (!onApply) return null;

  return (
    <div className="space-y-2 rounded-[14px] border border-teal-100 bg-teal-50/50 p-3">
      <p className="text-xs font-medium text-teal-950">{p.title}</p>
      <p className="text-xs leading-5 text-teal-950">{p.hint}</p>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-full"
        loading={analyzing}
        disabled={disabled || analyzing}
        onClick={onApply}
      >
        {p.cta}
      </Button>
    </div>
  );
}
