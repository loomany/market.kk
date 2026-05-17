"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Eraser,
  Paintbrush,
  RectangleHorizontal,
  RotateCcw,
  X,
} from "lucide-react";
import { applyMaskToProductImage, loadImageElement } from "@/lib/studio/productMask";
import { Button } from "@/components/ui/Button";

export type ProductMaskApplyResult = {
  file: File;
  previewUrl: string;
  coverageRatio: number;
};

type Tool = "brush" | "eraser" | "rectangle";

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
  const imageRef = useRef<HTMLImageElement | null>(null);
  const drawingRef = useRef(false);
  const rectStartRef = useRef<Point | null>(null);
  const rectSnapshotRef = useRef<ImageData | null>(null);
  const lastPointRef = useRef<Point | null>(null);

  const [tool, setTool] = useState<Tool>("brush");
  const [brushSize, setBrushSize] = useState(28);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [displaySize, setDisplaySize] = useState({ width: 320, height: 320 });
  const [applyError, setApplyError] = useState<string | null>(null);
  const [coverageHint, setCoverageHint] = useState<string | null>(null);

  const renderView = useCallback(() => {
    const viewCanvas = viewCanvasRef.current;
    const dataCanvas = maskDataRef.current;
    const image = imageRef.current;
    if (!viewCanvas || !dataCanvas || !image) return;

    const ctx = viewCanvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, viewCanvas.width, viewCanvas.height);
    ctx.drawImage(image, 0, 0, viewCanvas.width, viewCanvas.height);
    ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
    ctx.fillRect(0, 0, viewCanvas.width, viewCanvas.height);

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(dataCanvas, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = "rgba(20, 184, 166, 0.55)";
    ctx.drawImage(dataCanvas, 0, 0);
    ctx.restore();
  }, []);

  const strokeTo = useCallback(
    (point: Point, isStart: boolean) => {
      const dataCanvas = maskDataRef.current;
      if (!dataCanvas) return;
      const ctx = dataCanvas.getContext("2d");
      if (!ctx) return;

      if (tool === "rectangle") return;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = brushSize;

      if (tool === "brush") {
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
    [brushSize, renderView, tool]
  );

  useEffect(() => {
    let cancelled = false;

    loadImageElement(imageUrl)
      .then((img) => {
        if (cancelled) return;
        imageRef.current = img;

        const maxW = Math.min(
          typeof window !== "undefined" ? window.innerWidth - 48 : 360,
          520
        );
        const maxH = Math.min(
          typeof window !== "undefined" ? window.innerHeight * 0.45 : 480,
          480
        );
        const scale = Math.min(
          maxW / img.naturalWidth,
          maxH / img.naturalHeight,
          1
        );
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        setDisplaySize({ width: w, height: h });

        const dataCanvas = document.createElement("canvas");
        dataCanvas.width = img.naturalWidth;
        dataCanvas.height = img.naturalHeight;
        maskDataRef.current = dataCanvas;

        const viewCanvas = viewCanvasRef.current;
        if (viewCanvas) {
          viewCanvas.width = img.naturalWidth;
          viewCanvas.height = img.naturalHeight;
          viewCanvas.style.width = `${w}px`;
          viewCanvas.style.height = `${h}px`;
        }
        renderView();
      })
      .catch((err) => {
        if (!cancelled) {
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
    };
  }, [imageUrl, renderView]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = viewCanvasRef.current;
    const dataCanvas = maskDataRef.current;
    if (!canvas || !dataCanvas) return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const point = getCanvasPoint(canvas, e.clientX, e.clientY);

    if (tool === "rectangle") {
      rectStartRef.current = point;
      const ctx = dataCanvas.getContext("2d");
      if (ctx) {
        rectSnapshotRef.current = ctx.getImageData(
          0,
          0,
          dataCanvas.width,
          dataCanvas.height
        );
      }
      lastPointRef.current = null;
      return;
    }

    lastPointRef.current = point;
    strokeTo(point, true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = viewCanvasRef.current;
    const dataCanvas = maskDataRef.current;
    if (!canvas || !dataCanvas) return;
    e.preventDefault();
    const point = getCanvasPoint(canvas, e.clientX, e.clientY);

    if (tool === "rectangle" && rectStartRef.current && rectSnapshotRef.current) {
      const ctx = dataCanvas.getContext("2d");
      if (!ctx) return;
      ctx.putImageData(rectSnapshotRef.current, 0, 0);
      const start = rectStartRef.current;
      const x = Math.min(start.x, point.x);
      const y = Math.min(start.y, point.y);
      const w = Math.abs(point.x - start.x);
      const h = Math.abs(point.y - start.y);
      ctx.fillStyle = "rgba(255,255,255,1)";
      ctx.fillRect(x, y, w, h);
      renderView();
      return;
    }

    strokeTo(point, false);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = viewCanvasRef.current;
    if (!canvas) return;
    if (canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    drawingRef.current = false;
    rectStartRef.current = null;
    rectSnapshotRef.current = null;
    lastPointRef.current = null;
  };

  const handleClear = () => {
    const dataCanvas = maskDataRef.current;
    if (!dataCanvas) return;
    dataCanvas.getContext("2d")?.clearRect(0, 0, dataCanvas.width, dataCanvas.height);
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
      const { blob, coverageRatio } = await applyMaskToProductImage(
        image,
        dataCanvas
      );

      if (coverageRatio < 0.01) {
        setApplyError("Сначала выделите товар на фото.");
        return;
      }
      if (coverageRatio < 0.02) {
        setCoverageHint(
          "Выделение очень маленькое. Проверьте, весь ли товар попал в область."
        );
      }

      const file = new File([blob], "selected-product.png", {
        type: "image/png",
      });
      const previewUrl = URL.createObjectURL(blob);
      onApply({ file, previewUrl, coverageRatio });
    } catch (err) {
      setApplyError(
        err instanceof Error ? err.message : "Не удалось применить выделение"
      );
    }
  };

  return (
    <div className="space-y-4 rounded-[22px] border border-teal-200 bg-teal-50/40 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-950">Выделите товар</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Закрасьте только товар. Всё, что не выделено, будет удалено.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-slate-600">Загружаем изображение…</p>
      )}
      {loadError && (
        <p className="text-sm text-red-700" role="alert">
          {loadError}
        </p>
      )}

      {!loading && !loadError && (
        <>
          <div
            className="mx-auto max-w-full overflow-hidden rounded-[18px] border border-border bg-slate-900/5"
            style={{ touchAction: "none" }}
          >
            <canvas
              ref={viewCanvasRef}
              className="mx-auto block max-w-full cursor-crosshair"
              style={{
                width: displaySize.width,
                height: displaySize.height,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={tool === "brush" ? "primary" : "outline"}
              onClick={() => setTool("brush")}
            >
              <Paintbrush className="h-4 w-4" />
              Кисть
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tool === "eraser" ? "primary" : "outline"}
              onClick={() => setTool("eraser")}
            >
              <Eraser className="h-4 w-4" />
              Ластик
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tool === "rectangle" ? "primary" : "outline"}
              onClick={() => setTool("rectangle")}
            >
              <RectangleHorizontal className="h-4 w-4" />
              Прямоугольник
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleClear}>
              <RotateCcw className="h-4 w-4" />
              Очистить
            </Button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Размер кисти: {brushSize}px
            </label>
            <input
              type="range"
              min={8}
              max={80}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full accent-teal-700"
              aria-label="Размер кисти"
            />
          </div>

          {applyError && (
            <p className="text-xs text-red-700" role="alert">
              {applyError}
            </p>
          )}
          {coverageHint && (
            <p className="text-xs text-amber-800">{coverageHint}</p>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={handleApply}
            >
              <Check className="h-4 w-4" />
              Применить выделение
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
              <X className="h-4 w-4" />
              Отмена
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
