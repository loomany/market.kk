"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { PreviewCard } from "./PreviewCard";
import { TryOnResultActions } from "./TryOnResultActions";
import { downloadImageFile } from "@/lib/studio/downloadImages";
import { formatAspectBadgeFromDimensions } from "@/lib/studio/previewImageAspect";
import { formatStudioString } from "@/lib/studio/i18n";
import { cn } from "@/lib/utils";
import { useStudioCopy } from "./StudioLocaleContext";

type ExportTabId = "card" | "cutout";

function inferImageFormatLabel(url: string): string {
  const dataMatch = url.match(/^data:image\/([\w+.-]+)/i);
  if (dataMatch?.[1]) {
    const raw = dataMatch[1].split("+")[0]!.toLowerCase();
    if (raw === "jpeg" || raw === "jpg") return "JPEG";
    if (raw === "webp") return "WEBP";
    if (raw === "png") return "PNG";
    return raw.toUpperCase();
  }
  if (/\.jpe?g(\?|$)/i.test(url)) return "JPEG";
  if (/\.webp(\?|$)/i.test(url)) return "WEBP";
  return "PNG";
}

function ExportTabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "relative flex flex-1 items-center justify-center rounded-md px-1 py-1.5 text-xs font-medium transition",
        active
          ? "bg-white text-slate-950 shadow-sm"
          : "text-slate-600 hover:text-slate-900"
      )}
    >
      {label}
    </button>
  );
}

function AspectBadge({ label }: { label: string }) {
  const { copy } = useStudioCopy();

  return (
    <span
      className="inline-flex shrink-0 items-center rounded-lg bg-slate-100/90 px-2.5 py-1.5 ring-1 ring-slate-200/50"
      aria-label={formatStudioString(copy.common.formatLabel, { label })}
    >
      <span className="font-mono text-[10px] font-semibold tabular-nums text-slate-700">
        {label}
      </span>
    </span>
  );
}

const checkerboardStyle = {
  backgroundImage:
    "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
  backgroundColor: "#f8fafc",
  backgroundSize: "12px 12px",
  backgroundPosition: "0 0, 6px 6px",
} as const;

function getExportPreviewSize(
  width: number,
  height: number,
  maxWidth = 340,
  maxHeight = 560
): { width: number; height: number } {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function ExportSizeFrame({
  width,
  height,
  className,
  style,
  children,
}: {
  width: number;
  height: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const preview = getExportPreviewSize(width, height);

  return (
    <div
      className={cn("mx-auto shrink-0 overflow-hidden rounded-[18px]", className)}
      style={{
        width: preview.width,
        height: preview.height,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type ProductCardDualExportPanelProps = {
  cardUrl: string;
  cutoutUrl: string;
  width: number;
  height: number;
  resultId: string;
  imageLabel?: string;
  failedImages: Record<string, boolean>;
  onImageFail: (imageKey: string) => void;
  onStartOver: () => void;
};

export function ProductCardDualExportPanel({
  cardUrl,
  cutoutUrl,
  width,
  height,
  resultId,
  imageLabel,
  failedImages,
  onImageFail,
  onStartOver,
}: ProductCardDualExportPanelProps) {
  const { copy } = useStudioCopy();
  const pc = copy.productCard;
  const exp = copy.productCardExport;
  const resolvedImageLabel = imageLabel ?? pc.imageLabelProduct;
  const [activeTab, setActiveTab] = useState<ExportTabId>("card");
  const cardFormatLabel = inferImageFormatLabel(cardUrl);
  const aspectLabel = formatAspectBadgeFromDimensions(width, height);
  const aspectRatio = width / height;

  const handleDownload = () => {
    if (activeTab === "card") {
      void downloadImageFile(cardUrl, `${resultId}-card.png`);
      return;
    }
    void downloadImageFile(cutoutUrl, `${resultId}-no-bg.png`);
  };

  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-2 flex items-center gap-2">
        <div
          role="tablist"
          aria-label={pc.exportFormatAria}
          className="flex min-w-0 flex-1 gap-0.5 rounded-lg bg-slate-100/90 p-0.5 ring-1 ring-slate-200/50"
        >
          <ExportTabButton
            label={cardFormatLabel}
            active={activeTab === "card"}
            onClick={() => setActiveTab("card")}
          />
          <ExportTabButton
            label={pc.pngNoBg}
            active={activeTab === "cutout"}
            onClick={() => setActiveTab("cutout")}
          />
        </div>
        <AspectBadge label={aspectLabel} />
      </div>

      <PreviewCard
        compact
        title=""
        url={null}
        empty=""
        viewportAspectRatio={aspectRatio}
        content={
          <div className="flex flex-1 items-center justify-center p-4">
            <ExportSizeFrame
              width={width}
              height={height}
              className={
                activeTab === "card"
                  ? "bg-white ring-1 ring-slate-200"
                  : "bg-[length:12px_12px] bg-[position:0_0,6px_6px]"
              }
              style={activeTab === "cutout" ? checkerboardStyle : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeTab === "card" ? cardUrl : cutoutUrl}
                alt={
                  activeTab === "card"
                    ? formatStudioString(exp.cardAlt, {
                        label: resolvedImageLabel,
                        format: cardFormatLabel,
                      })
                    : formatStudioString(exp.cutoutAlt, {
                        label: resolvedImageLabel,
                      })
                }
                className="block h-full w-full object-contain"
                onError={() =>
                  onImageFail(
                    `${resultId}:${activeTab === "card" ? "main" : "removed"}`
                  )
                }
              />
            </ExportSizeFrame>
          </div>
        }
        footer={
          <TryOnResultActions
            onDownload={handleDownload}
            onStartOver={onStartOver}
            startOverLabel={exp.createAgain}
            startOverTitle={exp.removeCardHint}
          />
        }
      />
    </div>
  );
}
