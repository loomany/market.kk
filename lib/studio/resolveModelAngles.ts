import {
  resolveSelectedModelAngles,
  type ResolvedModelAngle,
} from "@/lib/ai/modelAngles";
import type { ModelGenerationSettings } from "@/components/studio/types";

const DEFAULT_GENERATION_ANGLE: ResolvedModelAngle = {
  key: "default",
  label: "Стандартная поза",
  prompt: "",
};

export function resolveAnglesForGeneration(
  settings: ModelGenerationSettings,
  options: {
    useProductSampleAngles: boolean;
    productSampleAngles: ResolvedModelAngle[] | null;
  }
): ResolvedModelAngle[] {
  if (
    options.useProductSampleAngles &&
    options.productSampleAngles &&
    options.productSampleAngles.length > 0
  ) {
    return options.productSampleAngles.slice(0, 1);
  }

  const angles = resolveSelectedModelAngles(settings);
  if (angles.length > 0) {
    return angles;
  }
  return [DEFAULT_GENERATION_ANGLE];
}

export function validateProductSampleAnglesMatch(
  productPhotoCount: number,
  productSampleAngles: ResolvedModelAngle[] | null,
  useProductSampleAngles: boolean
): string | null {
  if (!useProductSampleAngles) return null;
  if (!productSampleAngles || productSampleAngles.length === 0) {
    return "Нажмите «Подобрать позу по фото товара» или опишите позу вручную.";
  }
  if (productPhotoCount !== 1 || productSampleAngles.length !== 1) {
    return "Заменили фото товара — снова нажмите «Подобрать позу по фото товара».";
  }
  return null;
}
