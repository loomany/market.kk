"use client";

import { useMemo, useState } from "react";
import { Clapperboard, Download, ImagePlus, Layers, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { VIDEO_MODELS, type VideoModelKey } from "@/lib/ai/videoModels";
import type { PromptEnhanceResponse } from "@/lib/ai/promptEnhanceSchemas";
import type { SceneGenerateResponse } from "@/lib/ai/sceneSchemas";
import type { VideoGenerateResponse } from "@/lib/ai/videoSchemas";
import type { Locale } from "@/lib/i18n/localeConfig";
import type { StudioSessionAsset } from "./types";
import { downloadImageFile } from "@/lib/studio/downloadImages";

type ProcessingAction =
  | "video"
  | "background"
  | "continue-scene"
  | "enhance-image"
  | "reels";

type ProcessedAssetsPanelProps = {
  assets: StudioSessionAsset[];
  mockMode: boolean;
  promptLocale: Locale;
  onDeleteAsset: (id: string) => void;
  onAssetCreated: (asset: StudioSessionAsset) => void;
};

const actionLabels: Record<ProcessingAction, string> = {
  video: "Сделать видео",
  background: "Заменить фон",
  "continue-scene": "Продолжить сцену",
  "enhance-image": "Улучшить изображение",
  reels: "Reels / Stories",
};

const motionPresets = [
  { id: "subtle-motion", label: "Лёгкое движение" },
  { id: "model-turn", label: "Поворот модели" },
  { id: "camera-push", label: "Приближение камеры" },
  { id: "continue-scene", label: "Продолжить сцену" },
  { id: "product-fidelity", label: "Товар без искажений" },
] as const;

export function ProcessedAssetsPanel({
  assets,
  mockMode,
  promptLocale,
  onDeleteAsset,
  onAssetCreated,
}: ProcessedAssetsPanelProps) {
  const firstAssetId = assets[0]?.id ?? "";
  const [selectedAssetId, setSelectedAssetId] = useState(firstAssetId);
  const [activeAction, setActiveAction] = useState<ProcessingAction>("video");
  const [prompt, setPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [enhanceLoading, setEnhanceLoading] = useState(false);
  const [generationLoading, setGenerationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelKey, setModelKey] = useState<VideoModelKey>("kling");
  const [quality, setQuality] = useState<"fast" | "balanced" | "high">(
    "balanced"
  );
  const [durationSeconds, setDurationSeconds] = useState(5);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "9:16" | "16:9">(
    "9:16"
  );
  const [motionPreset, setMotionPreset] =
    useState<(typeof motionPresets)[number]["id"]>("subtle-motion");
  const [sceneMode, setSceneMode] = useState<
    "exact-background" | "creative-scene"
  >("exact-background");

  const selectedAsset =
    assets.find((asset) => asset.id === selectedAssetId) ?? assets[0];
  const selectedModel = VIDEO_MODELS[modelKey];
  const appliedPrompt = enhancedPrompt ?? prompt;
  const canGenerate = Boolean(selectedAsset && appliedPrompt.trim().length >= 4);

  const durationOptions = useMemo(() => {
    return selectedModel.durationOptions;
  }, [selectedModel.durationOptions]);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setError("Сначала напишите короткий промт.");
      return;
    }
    setEnhanceLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/prompt/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: activeAction === "video" || activeAction === "reels" ? "video" : "background",
          userPrompt: prompt,
          sourceImageDescription: selectedAsset?.label,
          targetPlatform: activeAction === "reels" ? "reels" : "marketplace",
          language: promptLocale,
        }),
      });
      const data = (await res.json()) as PromptEnhanceResponse;
      if (!data.ok) {
        setError(data.message);
        return;
      }
      setEnhancedPrompt(data.enhancedPrompt);
    } catch {
      setError("Не удалось усилить промт. Попробуйте ещё раз.");
    } finally {
      setEnhanceLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedAsset) {
      setError("Сначала выберите изображение.");
      return;
    }
    if (!canGenerate) {
      setError("Напишите промт для проработки.");
      return;
    }

    setGenerationLoading(true);
    setError(null);

    try {
      if (activeAction === "video" || activeAction === "reels") {
        const res = await fetch("/api/ai/video/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceImageUrl: selectedAsset.url,
            prompt: appliedPrompt,
            modelKey,
            quality,
            durationSeconds,
            aspectRatio: activeAction === "reels" ? "9:16" : aspectRatio,
            motionPreset,
            promptLocale,
          }),
        });
        const data = (await res.json()) as VideoGenerateResponse;
        if (!data.ok) {
          setError(data.message);
          return;
        }
        onAssetCreated({
          id: crypto.randomUUID(),
          type: "video",
          url: data.video.url,
          sourceImageUrl: selectedAsset.url,
          mode: "video",
          provider: data.provider,
          model: data.model,
          requestId: data.requestId,
          createdAt: new Date().toISOString(),
          prompt: appliedPrompt,
          estimatedCost: data.estimatedCost,
          width: data.video.width,
          height: data.video.height,
          duration: data.video.duration,
          format: data.video.format ?? "mp4",
          label: activeAction === "reels" ? "Reels / Stories" : "Видео",
        });
        return;
      }

      const res = await fetch("/api/ai/scene/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceImageUrl: selectedAsset.url,
          prompt: appliedPrompt,
          mode: sceneMode,
          aspectRatio,
          outputFormat: "png",
          promptLocale,
        }),
      });
      const data = (await res.json()) as SceneGenerateResponse;
      if (!data.ok) {
        setError(data.message);
        return;
      }
      onAssetCreated({
        id: crypto.randomUUID(),
        type: sceneMode === "exact-background" ? "background-removed" : "scene",
        url: data.image.url,
        sourceImageUrl: selectedAsset.url,
        mode: "scene",
        provider: data.provider,
        model: data.model,
        requestId: data.requestId,
        createdAt: new Date().toISOString(),
        prompt: appliedPrompt,
        estimatedCost: data.estimatedCost,
        width: data.image.width,
        height: data.image.height,
        format: "png",
        label:
          sceneMode === "exact-background"
            ? "Фон заменён"
            : "Креативная сцена",
      });
    } catch {
      setError("Не удалось запустить проработку. Попробуйте ещё раз.");
    } finally {
      setGenerationLoading(false);
    }
  };

  if (assets.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-[360px] items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-teal-50 text-teal-700">
              <Layers className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-950">
              Здесь появится проработка
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Сначала создайте фото в режимах “Одежда на модели” или
              “Товарная карточка”. После этого здесь появятся действия для
              видео, фона и сцены.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <Card>
        <CardHeader>
          <CardTitle>Мои файлы и история</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {assets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => setSelectedAssetId(asset.id)}
              className={`rounded-[20px] border bg-white p-3 text-left transition ${
                selectedAsset?.id === asset.id
                  ? "border-teal-500 ring-2 ring-teal-100"
                  : "border-border hover:border-teal-200"
              }`}
            >
              <div className="overflow-hidden rounded-[16px] border border-border bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.url}
                  alt={asset.label ?? "Файл студии"}
                  className="h-40 w-full object-contain"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{asset.label ?? asset.type}</Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {new Date(asset.createdAt).toLocaleString("ru-RU")}
              </p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Проработка выбранного файла</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(
              [
                "video",
                "background",
                "continue-scene",
                "enhance-image",
                "reels",
              ] as ProcessingAction[]
            ).map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => setActiveAction(action)}
                className={`rounded-[16px] border px-3 py-2.5 text-left text-sm font-semibold transition ${
                  activeAction === action
                    ? "border-teal-500 bg-teal-50 text-teal-950"
                    : "border-border bg-white text-slate-700 hover:border-teal-200"
                }`}
              >
                {actionLabels[action]}
              </button>
            ))}
          </div>

          <div className="rounded-[18px] border border-border bg-slate-50 p-3">
            <div className="flex items-start gap-3">
              <div className="h-24 w-20 shrink-0 overflow-hidden rounded-[14px] border border-border bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedAsset.url}
                  alt="Выбранное изображение"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-950">
                  {selectedAsset.label ?? "Выбранный файл"}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  AI может изменить детали товара. Перед публикацией проверьте
                  цвет, форму, узор и края изделия.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      void downloadImageFile(
                        selectedAsset.url,
                        `${selectedAsset.id}.png`
                      )
                    }
                  >
                    <Download className="h-4 w-4" />
                    Скачать
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteAsset(selectedAsset.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Удалить из сессии
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {(activeAction === "background" ||
            activeAction === "continue-scene" ||
            activeAction === "enhance-image") && (
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSceneMode("exact-background")}
                className={`rounded-[16px] border px-3 py-2 text-left text-sm ${
                  sceneMode === "exact-background"
                    ? "border-teal-500 bg-teal-50"
                    : "border-border bg-white"
                }`}
              >
                Точный фон
                <span className="mt-1 block text-xs text-slate-500">
                  Не перерисовывать товар.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSceneMode("creative-scene")}
                className={`rounded-[16px] border px-3 py-2 text-left text-sm ${
                  sceneMode === "creative-scene"
                    ? "border-teal-500 bg-teal-50"
                    : "border-border bg-white"
                }`}
              >
                Креативная сцена
                <span className="mt-1 block text-xs text-slate-500">
                  Может изменить детали, нужна проверка.
                </span>
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-950">
              Промт для проработки
            </label>
            <textarea
              value={prompt}
              onChange={(event) => {
                setPrompt(event.target.value);
                setEnhancedPrompt(null);
              }}
              rows={4}
              disabled={generationLoading || enhanceLoading}
              placeholder="Например: модель плавно поворачивается, камера медленно приближается, ткань слегка движется"
              className="w-full rounded-[18px] border border-border bg-white px-3 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              loading={enhanceLoading}
              disabled={generationLoading || enhanceLoading}
              onClick={handleEnhancePrompt}
            >
              <Wand2 className="h-4 w-4" />
              Усилить промт
            </Button>
          </div>

          {enhancedPrompt && (
            <div className="rounded-[18px] border border-violet-100 bg-violet-50 p-4 text-sm text-violet-950">
              <p className="font-semibold">Усиленный промт</p>
              <p className="mt-2 leading-6">{enhancedPrompt}</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Button size="sm" onClick={() => setPrompt(enhancedPrompt)}>
                  Применить
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEnhancedPrompt(null)}
                >
                  Оставить мой
                </Button>
              </div>
            </div>
          )}

          {(activeAction === "video" || activeAction === "reels") && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Модель видео"
                value={modelKey}
                onChange={(value) => {
                  const nextKey = value as VideoModelKey;
                  const nextModel = VIDEO_MODELS[nextKey];
                  setModelKey(nextKey);
                  setQuality(nextModel.qualityOptions[0]?.id ?? "balanced");
                  setDurationSeconds(nextModel.durationOptions[0] ?? 5);
                  setAspectRatio(nextModel.aspectRatioOptions[0] ?? "9:16");
                }}
                options={Object.entries(VIDEO_MODELS).map(([id, model]) => ({
                  value: id,
                  label: model.label,
                }))}
              />
              <Select
                label="Качество"
                value={quality}
                onChange={(value) => setQuality(value as typeof quality)}
                options={selectedModel.qualityOptions.map((option) => ({
                  value: option.id,
                  label: option.label,
                }))}
              />
              <Select
                label="Длительность"
                value={String(durationSeconds)}
                onChange={(value) => setDurationSeconds(Number(value))}
                options={durationOptions.map((value) => ({
                  value: String(value),
                  label: `${value} sec`,
                }))}
              />
              <Select
                label="Формат"
                value={activeAction === "reels" ? "9:16" : aspectRatio}
                onChange={(value) => setAspectRatio(value as typeof aspectRatio)}
                disabled={activeAction === "reels"}
                options={selectedModel.aspectRatioOptions.map((value) => ({
                  value,
                  label: value === "9:16" ? "9:16 Reels / Stories" : value,
                }))}
              />
              <Select
                label="Движение"
                value={motionPreset}
                onChange={(value) =>
                  setMotionPreset(value as typeof motionPreset)
                }
                options={motionPresets.map((preset) => ({
                  value: preset.id,
                  label: preset.label,
                }))}
              />
            </div>
          )}

          {error && (
            <p className="rounded-[16px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button
            className="w-full"
            size="lg"
            loading={generationLoading}
            disabled={!canGenerate}
            onClick={handleGenerate}
          >
            {activeAction === "video" || activeAction === "reels" ? (
              <Clapperboard className="h-5 w-5" />
            ) : (
              <ImagePlus className="h-5 w-5" />
            )}
            {activeAction === "video" || activeAction === "reels"
              ? "Создать видео"
              : "Создать сцену"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
