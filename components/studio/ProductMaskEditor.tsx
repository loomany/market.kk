"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, Check, RotateCcw, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  applyMaskToProductImage,
  createSelectionPreviewBlob,
  fillRectangleOnMask,
  getMaskCoverageRatio,
  loadImageElement,
  maskHasSelection,
} from "@/lib/studio/productMask";
import { Button } from "@/components/ui/Button";
import { useStudioCopy } from "./StudioLocaleContext";
import type { StudioCopyFull } from "@/lib/studio/i18n/studioCopyTypes";

export type ProductMaskApplyResult = {
  file: File;
  previewUrl: string;
  coverageRatio: number;
};

type RectPreview = { x: number; y: number; w: number; h: number };

type ProductMaskEditorProps = {
  imageUrl: string;
  onApply: (result: ProductMaskApplyResult) => void;
  onCancel: () => void;
};

type Point = { x: number; y: number };

function getCanvasPoint(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number
): Point {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

function rectangleCoverageHint(
  ratio: number,
  me: StudioCopyFull["maskEditor"]
): { message: string; level: "error" | "warn" } | null {
  if (ratio > 0.45) {
    return { message: me.coverageTooLarge, level: "error" };
  }
  if (ratio > 0.28) {
    return { message: me.coverageWide, level: "warn" };
  }
  if (ratio < 0.002) {
    return { message: me.coverageSmall, level: "warn" };
  }
  return null;
}

export function ProductMaskEditor({
  imageUrl,
  onApply,
  onCancel,
}: ProductMaskEditorProps) {
  const { copy } = useStudioCopy();
  const me = copy.maskEditor;
  const mask = copy.mask;

  const viewCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskDataRef = useRef<HTMLCanvasElement | null>(null);
  const dimLayerRef = useRef<HTMLCanvasElement | null>(null);
  const tintLayerRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const rectAnchorRef = useRef<Point | null>(null);
  const rectPreviewRef = useRef<RectPreview | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [displaySize, setDisplaySize] = useState({ width: 320, height: 320 });
  const [applyError, setApplyError] = useState<string | null>(null);
  const [coverageHint, setCoverageHint] = useState<{
    message: string;
    level: "error" | "warn";
  } | null>(null);
  const [imageReady, setImageReady] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [isDrawingRect, setIsDrawingRect] = useState(false);

  const renderView = useCallback(() => {
    const viewCanvas = viewCanvasRef.current;
    const dataCanvas = maskDataRef.current;
    const image = imageRef.current;
    if (!viewCanvas || !dataCanvas || !image) return;

    const ctx = viewCanvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = viewCanvas;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);

    const hasMask = maskHasSelection(dataCanvas);
    setHasSelection(hasMask);

    if (hasMask) {
      let dimLayer = dimLayerRef.current;
      if (!dimLayer || dimLayer.width !== width || dimLayer.height !== height) {
        dimLayer = document.createElement("canvas");
        dimLayer.width = width;
        dimLayer.height = height;
        dimLayerRef.current = dimLayer;
      }
      const dimCtx = dimLayer.getContext("2d");
      if (!dimCtx) return;

      dimCtx.clearRect(0, 0, width, height);
      dimCtx.globalCompositeOperation = "source-over";
      dimCtx.fillStyle = "rgba(15, 23, 42, 0.55)";
      dimCtx.fillRect(0, 0, width, height);
      dimCtx.globalCompositeOperation = "destination-out";
      dimCtx.drawImage(dataCanvas, 0, 0);
      dimCtx.globalCompositeOperation = "source-over";
      ctx.drawImage(dimLayer, 0, 0);

      let tintLayer = tintLayerRef.current;
      if (!tintLayer || tintLayer.width !== width || tintLayer.height !== height) {
        tintLayer = document.createElement("canvas");
        tintLayer.width = width;
        tintLayer.height = height;
        tintLayerRef.current = tintLayer;
      }
      const tintCtx = tintLayer.getContext("2d");
      if (!tintCtx) return;

      tintCtx.clearRect(0, 0, width, height);
      tintCtx.fillStyle = "rgba(20, 184, 166, 0.45)";
      tintCtx.fillRect(0, 0, width, height);
      tintCtx.globalCompositeOperation = "destination-in";
      tintCtx.drawImage(dataCanvas, 0, 0);
      tintCtx.globalCompositeOperation = "source-over";
      ctx.drawImage(tintLayer, 0, 0);
    }

    const rect = rectPreviewRef.current;
    if (rect && rect.w > 1 && rect.h > 1) {
      const displayScale =
        width / Math.max(1, viewCanvas.clientWidth || width);
      const rectStroke = Math.max(10, displayScale * 4);
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
      ctx.lineWidth = rectStroke + displayScale * 2;
      ctx.setLineDash([]);
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = "rgba(20, 184, 166, 0.98)";
      ctx.lineWidth = rectStroke;
      ctx.setLineDash([14, 8]);
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      ctx.restore();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadImageElement(imageUrl)
      .then((img) => {
        if (cancelled) return;
        imageRef.current = img;
        maskDataRef.current = null;
        setHasSelection(false);
        setImageReady(true);
      })
      .catch((err) => {
        if (!cancelled) {
          setImageReady(false);
          setLoadError(
            err instanceof Error ? err.message : me.loadPhotoFailed
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      setImageReady(false);
      imageRef.current = null;
      maskDataRef.current = null;
      dimLayerRef.current = null;
      tintLayerRef.current = null;
    };
  }, [imageUrl, me.loadPhotoFailed]);

  useLayoutEffect(() => {
    if (!imageReady || loading) return;

    const img = imageRef.current;
    if (!img) return;

    const maxW = Math.min(window.innerWidth - 48, 520);
    const maxH = Math.min(window.innerHeight * 0.45, 480);
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);

    if (!maskDataRef.current) {
      const dataCanvas = document.createElement("canvas");
      dataCanvas.width = img.naturalWidth;
      dataCanvas.height = img.naturalHeight;
      maskDataRef.current = dataCanvas;
    }

    const viewCanvas = viewCanvasRef.current;
    if (!viewCanvas) return;

    viewCanvas.width = img.naturalWidth;
    viewCanvas.height = img.naturalHeight;
    viewCanvas.style.width = `${w}px`;
    viewCanvas.style.height = `${h}px`;
    setDisplaySize({ width: w, height: h });
    renderView();
  }, [imageReady, loading, renderView]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = viewCanvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    const point = getCanvasPoint(canvas, e.clientX, e.clientY);
    rectAnchorRef.current = point;
    rectPreviewRef.current = { x: point.x, y: point.y, w: 0, h: 0 };
    setIsDrawingRect(true);
    setApplyError(null);
    setCoverageHint(null);
    renderView();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = viewCanvasRef.current;
    if (!canvas || !rectAnchorRef.current) return;
    e.preventDefault();
    const point = getCanvasPoint(canvas, e.clientX, e.clientY);
    const x0 = rectAnchorRef.current.x;
    const y0 = rectAnchorRef.current.y;
    rectPreviewRef.current = {
      x: Math.min(x0, point.x),
      y: Math.min(y0, point.y),
      w: Math.abs(point.x - x0),
      h: Math.abs(point.y - y0),
    };
    renderView();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = viewCanvasRef.current;
    const dataCanvas = maskDataRef.current;
    if (!canvas) return;
    if (canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    if (!rectAnchorRef.current || !dataCanvas) {
      rectAnchorRef.current = null;
      rectPreviewRef.current = null;
      setIsDrawingRect(false);
      return;
    }

    const point = getCanvasPoint(canvas, e.clientX, e.clientY);
    fillRectangleOnMask(
      dataCanvas,
      rectAnchorRef.current.x,
      rectAnchorRef.current.y,
      point.x,
      point.y
    );
    rectAnchorRef.current = null;
    rectPreviewRef.current = null;
    setIsDrawingRect(false);

    const ratio = getMaskCoverageRatio(dataCanvas);
    setCoverageHint(rectangleCoverageHint(ratio, me));
    renderView();
  };

  const handleClear = () => {
    const dataCanvas = maskDataRef.current;
    if (!dataCanvas) return;
    dataCanvas.getContext("2d")?.clearRect(0, 0, dataCanvas.width, dataCanvas.height);
    rectAnchorRef.current = null;
    rectPreviewRef.current = null;
    setApplyError(null);
    setCoverageHint(null);
    setHasSelection(false);
    setIsDrawingRect(false);
    renderView();
  };

  const handleApply = async () => {
    const image = imageRef.current;
    const dataCanvas = maskDataRef.current;
    if (!image || !dataCanvas) return;

    setApplyError(null);
    setCoverageHint(null);

    try {
      const filledCoverage = getMaskCoverageRatio(dataCanvas);
      if (filledCoverage < 0.001) {
        setApplyError(me.drawFrameFirst);
        return;
      }

      const hint = rectangleCoverageHint(filledCoverage, me);
      if (hint && filledCoverage > 0.45) {
        setCoverageHint(hint);
        return;
      }

      const exportMask = document.createElement("canvas");
      exportMask.width = dataCanvas.width;
      exportMask.height = dataCanvas.height;
      const exportCtx = exportMask.getContext("2d");
      if (!exportCtx) {
        throw new Error(copy.errors.canvasUnsupported);
      }
      exportCtx.drawImage(dataCanvas, 0, 0);

      const { blob } = await applyMaskToProductImage(image, exportMask);

      if (hint) {
        setCoverageHint(hint);
      }

      const previewBlob = await createSelectionPreviewBlob(image, exportMask, {
        selectionMethod: "rectangle",
      });
      const file = new File([blob], "selected-product.png", {
        type: "image/png",
      });
      const previewUrl = URL.createObjectURL(previewBlob);
      onApply({ file, previewUrl, coverageRatio: filledCoverage });
    } catch (err) {
      setApplyError(
        err instanceof Error ? err.message : me.applyFailed
      );
    }
  };

  return (
    <section className="overflow-hidden rounded-[22px] border border-border bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-border/70 bg-slate-50/80 px-4 py-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-border bg-white text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          aria-label={copy.common.back}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-950">{mask.title}</p>
          <p className="text-xs text-slate-500">{me.instructionsIntro}</p>
        </div>
        <Badge variant="outline" className="shrink-0">
          {mask.stepBadge}
        </Badge>
      </div>

      <div className="space-y-4 p-4">
        {loadError && (
          <p className="text-sm text-red-700" role="alert">
            {loadError}
          </p>
        )}

        {!loadError && (
          <>
            <ul className="rounded-[12px] border border-border/80 bg-slate-50/80 px-3 py-2.5 text-xs leading-5 text-slate-600">
              <li>• {me.instruction1}</li>
              <li>• {me.instruction2}</li>
              <li>• {me.instruction3}</li>
            </ul>

            <div
              className="relative mx-auto max-w-full overflow-hidden rounded-[18px] border border-border bg-slate-100 shadow-inner"
              style={{ touchAction: "none" }}
            >
              {loading && (
                <div className="absolute inset-0 z-10 flex min-h-[200px] items-center justify-center bg-slate-100 text-sm text-slate-600">
                  {copy.status.analyzingProduct}
                </div>
              )}
              <canvas
                ref={viewCanvasRef}
                className={cn(
                  "mx-auto block max-w-full",
                  isDrawingRect ? "cursor-crosshair" : "cursor-cell"
                )}
                style={{
                  width: displaySize.width,
                  height: displaySize.height,
                  minHeight: loading ? 200 : undefined,
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
              {!loading && !hasSelection && !isDrawingRect && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
                  <p className="rounded-[12px] bg-white/90 px-3 py-2 text-center text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/80">
                    {me.instruction1}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 rounded-[14px] border border-border bg-slate-100/80 px-3 py-2.5">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-900">
                <Square className="h-4 w-4 shrink-0" aria-hidden />
                {me.instruction1}
              </span>
              <button
                type="button"
                onClick={handleClear}
                disabled={!hasSelection}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:opacity-40"
                aria-label={me.resetFrameAria}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {mask.resetFrame}
              </button>
            </div>

            {applyError && (
              <p className="text-xs text-red-700" role="alert">
                {applyError}
              </p>
            )}
            {coverageHint && (
              <p
                className={cn(
                  "text-xs leading-5",
                  coverageHint.level === "error"
                    ? "text-amber-900"
                    : "text-slate-600"
                )}
                role="status"
              >
                {coverageHint.message}
              </p>
            )}

            <div className="border-t border-border/70 pt-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={!hasSelection}
                  onClick={handleApply}
                >
                  <Check className="h-4 w-4 shrink-0" />
                  {mask.saveFrame}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={onCancel}
                >
                  {copy.common.cancel}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
