"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import type { StudioSessionAsset } from "./types";
import { PostProcessingGalleryCard } from "./PostProcessingGalleryCard";
import { StudioFilesPagination } from "./StudioFilesPagination";
import { StudioFilesSectionHeader } from "./StudioFilesSectionHeader";
import { postProcessingSectionCardClass } from "./StudioSaaSPreviewChrome";
import { useStudioCopy } from "./StudioLocaleContext";
const PAGE_SIZE = 4;

type PostProcessingDesktopGalleryProps = {
  assets: StudioSessionAsset[];
  onCreateImage: (assetId: string) => void;
  onCreateVideo: (assetId: string) => void;
  onDownloadAsset: (asset: StudioSessionAsset) => void;
  onDeleteAsset: (assetId: string) => void;
};

export function PostProcessingDesktopGallery({
  assets,
  onCreateImage,
  onCreateVideo,
  onDownloadAsset,
  onDeleteAsset,
}: PostProcessingDesktopGalleryProps) {
  const { copy } = useStudioCopy();
  const d = copy.postProcessingDesktop;
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
        <StudioFilesSectionHeader title={d.galleryTitle} />
      </div>
      <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        {paginated.map((asset) => (
          <PostProcessingGalleryCard
            key={asset.id}
            asset={asset}
            allAssets={assets}
            onCreateImage={() => onCreateImage(asset.id)}
            onCreateVideo={() => onCreateVideo(asset.id)}
            onDownload={() => onDownloadAsset(asset)}
            onDelete={() => onDeleteAsset(asset.id)}
          />
        ))}
      </CardContent>
      {totalPages > 1 ? (
        <CardContent className="border-t border-border pt-4">
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
