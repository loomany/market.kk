"use client";

import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  MODEL_PRESETS,
  type ModelBackground,
  type ModelBodyType,
  type ModelCategoryContext,
  type ModelCrop,
  type ModelGender,
  type ModelGenerationSettings,
  type ModelPose,
  type ModelPreset,
} from "./types";

type ModelPresetSelectorProps = {
  value: ModelPreset;
  onChange: (value: ModelPreset) => void;
  settings: ModelGenerationSettings;
  onSettingsChange: (settings: ModelGenerationSettings) => void;
  onGenerate: () => void;
  generating?: boolean;
  generateError?: string | null;
  generatedPreviewUrl?: string | null;
};

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const GENDER_OPTIONS: { id: ModelGender; label: string }[] = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
];

const BODY_OPTIONS: { id: ModelBodyType; label: string }[] = [
  { id: "standard", label: "Standard" },
  { id: "plus-size", label: "Plus-size" },
  { id: "slim", label: "Slim" },
];

const POSE_OPTIONS: { id: ModelPose; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "slight-angle", label: "Slight angle" },
];

const CROP_OPTIONS: { id: ModelCrop; label: string }[] = [
  { id: "full-body", label: "Full body" },
  { id: "upper-body", label: "Upper body" },
];

const BACKGROUND_OPTIONS: { id: ModelBackground; label: string }[] = [
  { id: "white", label: "White" },
  { id: "light-gray", label: "Light gray" },
  { id: "studio", label: "Studio" },
];

const CONTEXT_OPTIONS: { id: ModelCategoryContext; label: string }[] = [
  { id: "clothing", label: "Clothing" },
  { id: "lingerie", label: "Lingerie" },
  { id: "jewelry", label: "Jewelry" },
  { id: "general", label: "General" },
];

export function ModelPresetSelector({
  value,
  onChange,
  settings,
  onSettingsChange,
  onGenerate,
  generating,
  generateError,
  generatedPreviewUrl,
}: ModelPresetSelectorProps) {
  const patch = (partial: Partial<ModelGenerationSettings>) =>
    onSettingsChange({ ...settings, ...partial });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">Model preset</label>
        <div className="grid gap-2">
          {MODEL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.id)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                value === preset.id
                  ? "border-violet-500 bg-violet-50 ring-1 ring-violet-500"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <span className="font-medium text-slate-900">{preset.label}</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Gender"
          value={settings.gender}
          options={GENDER_OPTIONS}
          onChange={(gender) => patch({ gender })}
        />
        <SelectField
          label="Body type"
          value={settings.bodyType}
          options={BODY_OPTIONS}
          onChange={(bodyType) => patch({ bodyType })}
        />
        <SelectField
          label="Pose"
          value={settings.pose}
          options={POSE_OPTIONS}
          onChange={(pose) => patch({ pose })}
        />
        <SelectField
          label="Crop"
          value={settings.crop}
          options={CROP_OPTIONS}
          onChange={(crop) => patch({ crop })}
        />
        <SelectField
          label="Background"
          value={settings.background}
          options={BACKGROUND_OPTIONS}
          onChange={(background) => patch({ background })}
        />
        <SelectField
          label="Category"
          value={settings.categoryContext}
          options={CONTEXT_OPTIONS}
          onChange={(categoryContext) => patch({ categoryContext })}
        />
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        loading={generating}
        onClick={onGenerate}
      >
        <UserRound className="h-4 w-4" />
        {generating ? "Генерируем модель…" : "Сгенерировать AI-модель"}
      </Button>

      {generateError && (
        <p className="text-sm text-red-600">{generateError}</p>
      )}

      {generatedPreviewUrl && !generating && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-emerald-700">
            AI-модель сгенерирована
          </p>
          <div className="overflow-hidden rounded-xl border border-emerald-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generatedPreviewUrl}
              alt="Generated model"
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}
