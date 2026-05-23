import type { StudioSessionAsset } from "@/components/studio/types";

/**
 * One preview per gallery tile. Generated videos/photos are listed as their own
 * cards in «Мои файлы», not as carousel slides on the upload they came from.
 */
export function getPostProcessingCarouselAssets(
  asset: StudioSessionAsset
): StudioSessionAsset[] {
  return [asset];
}
