"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Eraser,
  Paintbrush,
  RotateCcw,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  applyMaskToProductImage,
  createSelectionPreviewBlob,
  fillMaskInterior,
  fillRectangleOnMask,
  getMaskCoverageRatio,
  loadImageElement,
  maskHasSelection,
  shouldFillMaskInterior,
  type MaskSelectionMethod,
} from "@/lib/studio/productMask";
import { Button } from "@/components/ui/Button";

export type ProductMaskApplyResult = {
  file: File;
  previewUrl: string;
  coverageRatio: number;
};

type Tool = "rectangle" | "brush" | "eraser";

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

export function ProductMaskEditor({
  imageUrl,
  onApply,
  onCancel,
}: ProductMaskEditorProps) {
  const viewCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskDataRef = useRef<HTMLCanvasElement | null>(null);
  const dimLayerRef = useRef<HTMLCanvasElement | null>(null);
  const tintLayerRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const drawingRef = useRef(false);
  const strokeStartedRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const rectAnchorRef = useRef<Point | null>(null);
  const rectPreviewRef = useRef<RectPreview | null>(null);
  const appliedMethodRef = useRef<MaskSelectionMethod>("rectangle");

  const [tool, setTool] = useState<Tool>("rectangle");
  const [brushMode, setBrushMode] = useState<"paint" | "contour">("paint");
  const [brushSize, setBrushSize] = useState(28);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [displaySize, setDisplaySize] = useState({ width: 320, height: 320 });
  const [applyError, setApplyError] = useState<string | null>(null);
  const [coverageHint, setCoverageHint] = useState<string | null>(null);
  const [imageReady, setImageReady] = useState(false);

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
      ctx.save();
      ctx.strokeStyle = "rgba(20, 184, 166, 0.95)";
      ctx.lineWidth = Math.max(2, width / (viewCanvas.clientWidth || width));
      ctx.setLineDash([10, 6]);
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      ctx.restore();
    }
  }, []);

  const strokeTo = useCallback(
    (point: Point, isStart: boolean) => {
      const dataCanvas = maskDataRef.current;
      if (!dataCanvas) return;
      const ctx = dataCanvas.getContext("2d");
      if (!ctx) return;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = brushSize;

      if (tool === "brush") {
        appliedMethodRef.current = brushMode;
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = "rgba(255,255,255,1)";
        if (isStart) {
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(point.x, point.y);
        } else if (lastPointRef.current) {
          ctx.beginPath();
          ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
          ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
      } else {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        if (isStart) {
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(point.x, point.y);
        } else if (lastPointRef.current) {
          ctx.beginPath();
          ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
          ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      }
      lastPointRef.current = point;
      renderView();
    },
    [brushMode, brushSize, renderView, tool]
  );

  useEffect(() => {
    let cancelled = false;

    loadImageElement(imageUrl)
      .then((img) => {
        if (cancelled) return;
        imageRef.current = img;
        maskDataRef.current = null;
        setImageReady(true);
      })
      .catch((err) => {
        if (!cancelled) {
          setImageReady(false);
          setLoadError(
            err instanceof Error ? err.message : "Не удалось загрузить фото"
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
  }, [imageUrl]);

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
    const dataCanvas = maskDataRef.current;
    if (!canvas || !dataCanvas) return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    const point = getCanvasPoint(canvas, e.clientX, e.clientY);

    if (tool === "rectangle") {
      rectAnchorRef.current = point;
      rectPreviewRef.current = { x: point.x, y: point.y, w: 0, h: 0 };
      renderView();
      return;
    }

    drawingRef.current = true;
    lastPointRef.current = point;
    strokeStartedRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = viewCanvasRef.current;
    if (!canvas) return;

    if (tool === "rectangle" && rectAnchorRef.current) {
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
      return;
    }

    if (!drawingRef.current) return;
    const dataCanvas = maskDataRef.current;
    if (!dataCanvas) return;
    e.preventDefault();
    const point = getCanvasPoint(canvas, e.clientX, e.clientY);

    if (!strokeStartedRef.current) {
      strokeTo(point, true);
      strokeStartedRef.current = true;
    } else {
      strokeTo(point, false);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = viewCanvasRef.current;
    const dataCanvas = maskDataRef.current;
    if (!canvas) return;
    if (canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    if (tool === "rectangle" && rectAnchorRef.current && dataCanvas) {
      const point = getCanvasPoint(canvas, e.clientX, e.clientY);
      fillRectangleOnMask(
        dataCanvas,
        rectAnchorRef.current.x,
        rectAnchorRef.current.y,
        point.x,
        point.y
      );
      appliedMethodRef.current = "rectangle";
      rectAnchorRef.current = null;
      rectPreviewRef.current = null;
      renderView();
      return;
    }

    if (
      drawingRef.current &&
      (tool === "brush" || tool === "eraser") &&
      !strokeStartedRef.current &&
      lastPointRef.current
    ) {
      strokeTo(lastPointRef.current, true);
    }

    drawingRef.current = false;
    strokeStartedRef.current = false;
    lastPointRef.current = null;
  };

  const handleClear = () => {
    const dataCanvas = maskDataRef.current;
    if (!dataCanvas) return;
    dataCanvas.getContext("2d")?.clearRect(0, 0, dataCanvas.width, dataCanvas.height);
    rectAnchorRef.current = null;
    rectPreviewRef.current = null;
    setApplyError(null);
    setCoverageHint(null);
    renderView();
  };

  const handleApply = async () => {
    const image = imageRef.current;
    const dataCanvas = maskDataRef.current;
    if (!image || !dataCanvas) return;

    setApplyError(null);
    setCoverageHint(null);

    try {
      const exportMask = document.createElement("canvas");
      exportMask.width = dataCanvas.width;
      exportMask.height = dataCanvas.height;
      const exportCtx = exportMask.getContext("2d");
      if (!exportCtx) {
        throw new Error("Canvas не поддерживается");
      }
      exportCtx.drawImage(dataCanvas, 0, 0);

      const applyMethod = appliedMethodRef.current;

      if (shouldFillMaskInterior(applyMethod)) {
        fillMaskInterior(exportMask);
      }

      const filledCoverage = getMaskCoverageRatio(exportMask);
      if (filledCoverage < 0.001) {
        setApplyError("Сначала выделите товар на фото.");
        return;
      }

      const { blob } = await applyMaskToProductImage(image, exportMask);

      if (filledCoverage < 0.002) {
        setCoverageHint(
          "Выделение очень маленькое. Закрасьте товар или замкните контур без разрывов."
        );
      } else if (filledCoverage > 0.55) {
        setCoverageHint(
          "Область слишком большая. Сузьте контур или используйте ластик у соседних предметов."
        );
      }

      const previewBlob = await createSelectionPreviewBlob(image, exportMask, {
        selectionMethod: applyMethod,
      });
      const file = new File([blob], "selected-product.png", {
        type: "image/png",
      });
      const previewUrl = URL.createObjectURL(previewBlob);
      onApply({ file, previewUrl, coverageRatio: filledCoverage });
    } catch (err) {
      setApplyError(
        err instanceof Error ? err.message : "Не удалось применить выделение"
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
          aria-label="Назад"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-950">Выделение товара</p>
          <p className="text-xs text-slate-500">
            Укажите, что оставить на карточке
          </p>
        </div>
        <Badge variant="outline" className="shrink-0">
          Шаг 2
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
            <p className="rounded-[12px] border border-border/80 bg-slate-50/80 px-3 py-2 text-xs leading-5 text-slate-600">
              Обведите рамкой или закрасьте кистью → при необходимости ластиком
              уберите лишнее → сохраните.
            </p>

            <div
              className="relative mx-auto max-w-full overflow-hidden rounded-[18px] border border-border bg-slate-100 shadow-inner"
              style={{ touchAction: "none" }}
            >
            {loading && (
              <div className="absolute inset-0 z-10 flex min-h-[200px] items-center justify-center bg-slate-100 text-sm text-slate-600">
                Загружаем изображение…
              </div>
            )}
            <canvas
              ref={viewCanvasRef}
              className="mx-auto block max-w-full cursor-crosshair"
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
          </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Инструмент
                </span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Очистить выделение"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Очистить
                </button>
              </div>
              <div
                className="flex gap-1 rounded-[14px] border border-border bg-slate-100/80 p-1"
                role="toolbar"
                aria-label="Инструменты выделения"
              >
                {(
                  [
                    {
                      id: "rectangle" as const,
                      label: "Прямоугольник",
                      icon: Square,
                      flex: "flex-[1.55] min-w-0 sm:flex-[1.65]",
                    },
                    {
                      id: "brush" as const,
                      label: "Кисть",
                      icon: Paintbrush,
                      flex: "flex-1 min-w-0",
                    },
                    {
                      id: "eraser" as const,
                      label: "Ластик",
                      icon: Eraser,
                      flex: "flex-1 min-w-0",
                    },
                  ] as const
                ).map(({ id, label, flex, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTool(id)}
                    aria-pressed={tool === id}
                    className={cn(
                      flex,
                      "flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] px-2 py-2.5 text-xs font-semibold transition sm:px-3",
                      tool === id
                        ? "bg-white text-teal-900 shadow-sm ring-1 ring-teal-500/20"
                        : "text-slate-600 hover:bg-white/80"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {tool === "brush" && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Режим кисти
                </span>
                <div className="grid grid-cols-2 gap-1 rounded-[14px] border border-border bg-slate-100/80 p-1">
                  {(
                    [
                      {
                        id: "paint" as const,
                        label: "Закрасить товар",
                        hint: "Рекомендуем",
                      },
                      {
                        id: "contour" as const,
                        label: "Обвести контур",
                        hint: "Плотно, без разрывов",
                      },
                    ] as const
                  ).map(({ id, label, hint }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setBrushMode(id)}
                      className={cn(
                        "rounded-[10px] px-3 py-2.5 text-left text-xs transition",
                        brushMode === id
                          ? "bg-white text-teal-900 shadow-sm ring-1 ring-teal-500/20"
                          : "text-slate-600 hover:bg-white/80"
                      )}
                    >
                      <span className="font-semibold">{label}</span>
                      <span className="mt-0.5 block text-[10px] text-slate-500">
                        {hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(tool === "brush" || tool === "eraser") && (
              <div className="space-y-2 rounded-[14px] border border-border bg-white px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="mask-brush-size"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Размер кисти
                  </label>
                  <span className="text-xs tabular-nums text-slate-500">
                    {brushSize}px
                  </span>
                </div>
                <input
                  id="mask-brush-size"
                  type="range"
                  min={8}
                  max={80}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer accent-teal-600"
                />
              </div>
            )}

          {applyError && (
            <p className="text-xs text-red-700" role="alert">
              {applyError}
            </p>
          )}
          {coverageHint && (
            <p className="text-xs text-amber-800">{coverageHint}</p>
          )}

            <div className="border-t border-border/70 pt-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleApply}
                >
                  <Check className="h-4 w-4 shrink-0" />
                  Сохранить
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={onCancel}
                >
                  Отменить
                </Button>
              </div>
              <p className="mt-2 text-center text-xs leading-5 text-slate-500">
                Вне выделения фон уберётся при создании карточки
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
