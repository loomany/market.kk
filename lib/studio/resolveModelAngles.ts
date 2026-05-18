import {
  resolveSelectedModelAngles,
  type ResolvedModelAngle,
} from "@/lib/ai/modelAngles";
import type { ModelGenerationSettings } from "@/components/studio/types";

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
  return resolveSelectedModelAngles(settings);
}

export function validateProductSampleAnglesMatch(
  productPhotoCount: number,
  productSampleAngles: ResolvedModelAngle[] | null,
  useProductSampleAngles: boolean
): string | null {
  if (!useProductSampleAngles) return null;
  if (!productSampleAngles || productSampleAngles.length === 0) {
    return "Нажмите «Взять ракурс с фото товара» или выберите ракурс вручную.";
  }
  if (productPhotoCount !== 1 || productSampleAngles.length !== 1) {
    return "Заменили фото товара — снова нажмите «Взять ракурс с фото товара».";
  }
  return null;
}
