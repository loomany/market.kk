import type { ProductShotRequest } from "@/lib/ai/productShotSchemas";

const PRESET_SCENES: Record<
  Exclude<ProductShotRequest["scenePreset"], "custom">,
  string
> = {
  "marketplace-clean":
    "clean professional ecommerce product photo on a minimal bright studio background, soft realistic shadows, premium marketplace catalog style, high detail, no text, no watermark, no logo",
  "white-studio":
    "professional product photography on a pure white studio background, soft shadow under the product, clean marketplace catalog image, no text, no watermark, no logo",
  "light-gray-studio":
    "professional product photography on a light gray studio background, soft gradient, realistic shadows, premium ecommerce catalog style, no text, no watermark, no logo",
  "luxury-boutique":
    "premium boutique product photography scene, elegant neutral background, soft studio lighting, luxury ecommerce style, realistic shadows, no text, no watermark, no logo",
  "jewelry-display":
    "professional jewelry product photography on a clean jewelry display stand, elegant neutral background, soft highlights, premium ecommerce catalog style, no text, no watermark, no logo",
  "flat-lay":
    "professional flat lay ecommerce product photography on a clean neutral surface, balanced composition, soft natural shadows, no text, no watermark, no logo",
};

const QUALITY_SUFFIX =
  "Keep the original product shape, color, material, texture, pattern, and details accurate. Do not change the product design.";

export function buildProductShotSceneDescription(
  input: ProductShotRequest
): string {
  let scene: string;

  if (input.scenePreset === "custom") {
    const custom = input.customSceneDescription?.trim();
    scene = custom || PRESET_SCENES["marketplace-clean"];
  } else {
    scene = PRESET_SCENES[input.scenePreset];
  }

  return `${scene} ${QUALITY_SUFFIX}`;
}
