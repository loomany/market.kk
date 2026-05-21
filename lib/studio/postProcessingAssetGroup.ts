import type { StudioSessionAsset } from "@/components/studio/types";
import { isVideoAsset } from "@/lib/studio/assetDisplayLabels";

const MAX_CAROUSEL = 5;

function isCarouselCandidate(asset: StudioSessionAsset): boolean {
  return (
    asset.status !== "processing" &&
    asset.status !== "error" &&
    !isVideoAsset(asset)
  );
}

/** Up to 5 related still frames: source + outputs from same parent. */
export function getPostProcessingCarouselAssets(
  asset: StudioSessionAsset,
  allAssets: StudioSessionAsset[]
): StudioSessionAsset[] {
  const children = allAssets
    .filter((a) => a.parentAssetId === asset.id && isCarouselCandidate(a))
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  if (children.length > 0) {
    return [asset, ...children].slice(0, MAX_CAROUSEL);
  }

  if (asset.parentAssetId) {
    const parent = allAssets.find((a) => a.id === asset.parentAssetId);
    const siblings = allAssets
      .filter(
        (a) =>
          a.parentAssetId === asset.parentAssetId &&
          a.id !== asset.id &&
          isCarouselCandidate(a)
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    const group = parent
      ? [parent, asset, ...siblings]
      : [asset, ...siblings];
    return group.filter(isCarouselCandidate).slice(0, MAX_CAROUSEL);
  }

  return [asset];
}
