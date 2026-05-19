"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { StudioSessionAsset } from "./types";
import { StudioAssetPreview } from "./StudioAssetPreview";
import { StudioFilesPagination } from "./StudioFilesPagination";
import {
  getAssetDisplayTitle,
  getAssetStatusBadge,
  isVideoAsset,
} from "@/lib/studio/assetDisplayLabels";

const PAGE_SIZE = 4;

type StudioFilesListProps = {
  assets: StudioSessionAsset[];
  selectedAssetId: string;
  onSelectAsset: (id: string) => void;
  onDownloadAsset: (asset: StudioSessionAsset) => void;
  onDeleteAsset: (assetId: string) => void;
};

export function StudioFilesList({
  assets,
  selectedAssetId,
  onSelectAsset,
  onDownloadAsset,
  onDeleteAsset,
}: StudioFilesListProps) {
  const [page, setPage] = useState(1);
  /**
   * Track the last selection we already synced the page to.
   *
   * The page must follow the selection only when the user actually clicks a
   * different asset — NOT every time the list mutates. Otherwise pressing
   * "Создать изображение" (which prepends a new pending asset and shifts
   * everything else by +1) can push the selected source onto the next page
   * and silently flip pagination from 1 → 2.
   */
  const lastSyncedSelectionRef = useRef<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(assets.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (lastSyncedSelectionRef.current === selectedAssetId) return;
    lastSyncedSelectionRef.current = selectedAssetId;
    const index = assets.findIndex((a) => a.id === selectedAssetId);
    if (index < 0) return;
    setPage(Math.floor(index / PAGE_SIZE) + 1);
  }, [selectedAssetId, assets]);

  const paginatedAssets = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return assets.slice(start, start + PAGE_SIZE);
  }, [assets, page]);

  return (
    <Card>
      <CardHeader className="space-y-3 text-center">
        <CardTitle>Мои файлы</CardTitle>
        <StudioFilesPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {paginatedAssets.map((asset) => {
          const statusBadge = getAssetStatusBadge(asset);
          const selected = selectedAssetId === asset.id;
          const downloadable =
            Boolean(asset.url) && asset.status !== "processing";

          return (
            <div
              key={asset.id}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              onClick={() => onSelectAsset(asset.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectAsset(asset.id);
                }
              }}
              className={`cursor-pointer rounded-[20px] border bg-white p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 ${
                selected
                  ? "border-teal-500 ring-2 ring-teal-100"
                  : "border-border hover:border-teal-200"
              }`}
            >
              <StudioAssetPreview asset={asset} />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{getAssetDisplayTitle(asset)}</Badge>
                {statusBadge ? (
                  <Badge
                    variant={
                      asset.status === "error"
                        ? "danger"
                        : asset.status === "processing"
                          ? "violet"
                          : "default"
                    }
                  >
                    {statusBadge}
                  </Badge>
                ) : null}
                <button
                  type="button"
                  disabled={!downloadable}
                  aria-label={isVideoAsset(asset) ? "Скачать видео" : "Скачать"}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (downloadable) onDownloadAsset(asset);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-teal-200 hover:bg-teal-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Скачать
                </button>
                <button
                  type="button"
                  aria-label="Удалить"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteAsset(asset.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Удалить
                </button>
                <Badge variant="outline" className="ml-auto text-slate-500">
                  {new Date(asset.createdAt).toLocaleString("ru-RU", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
      <CardContent className="border-t border-border pt-4">
        <StudioFilesPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </CardContent>
    </Card>
  );
}
