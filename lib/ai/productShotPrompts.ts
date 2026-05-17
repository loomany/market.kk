import type { ProductShotRequest } from "@/lib/ai/productShotSchemas";

/** @deprecated Creative product-shot is disabled in the studio UI. */
export function buildProductShotSceneDescription(
  _input: ProductShotRequest
): string {
  throw new Error(
    "Креативная сцена отключена. Используйте точную карточку в студии."
  );
}
