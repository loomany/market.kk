"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { StudioSessionAsset } from "./types";
import { StudioAssetPreview } from "./StudioAssetPreview";
import { StudioFilesPagination } from "./StudioFilesPagination";
import {
  getAssetDisplayTitle,
  getAssetStatusBadge,
  getAssetTypeBadge,
} from "@/lib/studio/assetDisplayLabels";

const PAGE_SIZE = 12;

type StudioFilesListProps = {
  assets: StudioSessionAsset[];
  selectedAssetId: string;
  onSelectAsset: (id: string) => void;
};

export function StudioFilesList({
  assets,
  selectedAssetId,
  onSelectAsset,
}: StudioFilesListProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(assets.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
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
      <CardHeader className="space-y-3">
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

          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelectAsset(asset.id)}
              className={`rounded-[20px] border bg-white p-3 text-left transition ${
                selected
                  ? "border-teal-500 ring-2 ring-teal-100"
                  : "border-border hover:border-teal-200"
              }`}
            >
              <StudioAssetPreview asset={asset} />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{getAssetTypeBadge(asset)}</Badge>
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
              </div>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {getAssetDisplayTitle(asset)}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {new Date(asset.createdAt).toLocaleString("ru-RU", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </button>
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
