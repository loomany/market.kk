"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import type { PostProcessingMode } from "@/lib/studio/postProcessingEditors";
import type { StudioSessionAsset } from "./types";
import { PostProcessingGalleryCard } from "./PostProcessingGalleryCard";
import { StudioFilesPagination } from "./StudioFilesPagination";
import { StudioFilesSectionHeader } from "./StudioFilesSectionHeader";
import { postProcessingSectionCardClass } from "./StudioSaaSPreviewChrome";
import { useStudioCopy } from "./StudioLocaleContext";

const PAGE_SIZE = 10;

type PostProcessingMobileGalleryProps = {
  assets: StudioSessionAsset[];
  onCreateImage: (assetId: string) => void;
  onCreateVideo: (assetId: string) => void;
  onDownloadAsset: (asset: StudioSessionAsset) => void;
  onDeleteAsset: (assetId: string) => void;
  activeAssetId?: string | null;
  activeMode?: PostProcessingMode | null;
};

export function PostProcessingMobileGallery({
  assets,
  onCreateImage,
  onCreateVideo,
  onDownloadAsset,
  onDeleteAsset,
  activeAssetId = null,
  activeMode = null,
}: PostProcessingMobileGalleryProps) {
  const { copy } = useStudioCopy();
  const title = copy.postProcessingDesktop.galleryTitle;
  const [page, setPage] = useState(1);

  const galleryAssets = useMemo(
    () => assets.filter((a) => !a.parentAssetId || a.status === "processing"),
    [assets]
  );
  const totalPages = Math.max(1, Math.ceil(galleryAssets.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return galleryAssets.slice(start, start + PAGE_SIZE);
  }, [galleryAssets, page]);

  if (assets.length === 0) {
    return null;
  }

  return (
    <Card className={postProcessingSectionCardClass}>
      <div className="border-b border-border/60 px-4 py-3">
        <StudioFilesSectionHeader title={title} />
      </div>
      <CardContent className="flex flex-col gap-4 px-4 py-4">
        {paginated.map((asset) => (
          <PostProcessingGalleryCard
            key={asset.id}
            layout="mobile"
            asset={asset}
            allAssets={assets}
            activeMode={
              activeAssetId === asset.id ? activeMode ?? null : null
            }
            onCreateImage={() => onCreateImage(asset.id)}
            onCreateVideo={() => onCreateVideo(asset.id)}
            onDownload={() => onDownloadAsset(asset)}
            onDelete={() => onDeleteAsset(asset.id)}
          />
        ))}
      </CardContent>
      {totalPages > 1 ? (
        <CardContent className="border-t border-border px-4 pt-3 pb-4">
          <StudioFilesPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </CardContent>
      ) : null}
    </Card>
  );
}
