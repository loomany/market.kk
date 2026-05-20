import {
  MAX_CLOTHING_PRODUCT_SET,
  isProductSetMode,
} from "@/lib/studio/productPhotos";
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
    productPhotoCount?: number;
  }
): ResolvedModelAngle[] {
  if (
    options.useProductSampleAngles &&
    options.productSampleAngles &&
    options.productSampleAngles.length > 0
  ) {
    const max = isProductSetMode(options.productPhotoCount ?? 1)
      ? MAX_CLOTHING_PRODUCT_SET
      : 1;
    return options.productSampleAngles.slice(0, max);
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
  if (isProductSetMode(productPhotoCount)) {
    if (productSampleAngles.length !== productPhotoCount) {
      return "Число ракурсов не совпадает с числом фото — подождите анализ или загрузите фото заново.";
    }
    return null;
  }
  if (productPhotoCount !== 1 || productSampleAngles.length !== 1) {
    return "Заменили фото товара — снова нажмите «Подобрать позу по фото товара».";
  }
  return null;
}
