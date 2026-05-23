import type { StudioSessionAsset } from "@/components/studio/types";

/**
 * One preview per gallery tile. Generated videos/photos are listed as their own
 * cards in «Мои файлы», not as carousel slides on the upload they came from.
 */
export function getPostProcessingCarouselAssets(
  asset: StudioSessionAsset,
  allAssets?: StudioSessionAsset[]
): StudioSessionAsset[] {
  if (
    asset.status === "processing" &&
    asset.parentAssetId &&
    allAssets?.length
  ) {
    const parent = allAssets.find((a) => a.id === asset.parentAssetId);
    if (parent && assetPreviewHasMedia(parent)) {
      return [parent, asset];
    }
  }
  return [asset];
}

function assetPreviewHasMedia(asset: StudioSessionAsset): boolean {
  return Boolean(asset.url?.trim() || asset.sourceImageUrl?.trim());
}
