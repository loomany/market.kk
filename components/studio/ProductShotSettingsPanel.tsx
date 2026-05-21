"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { Select } from "@/components/ui/Select";
import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";
import {
  PRODUCT_SHOT_ASPECT_RATIO_OPTIONS,
  aspectRatioForShotSizePreset,
  shotSizePresetFromAspectRatio,
} from "@/lib/ai/productShotSchemas";
import {
  AspectRatioSelectField,
  hintForAspectRatioOption,
} from "@/components/studio/AspectRatioSelectField";
import type { ProductShotScenePreset, ProductShotSettings } from "./types";
import { useStudioCopy } from "./StudioLocaleContext";

type ProductShotSettingsPanelProps = {
  settings: ProductShotSettings;
  onChange: (settings: ProductShotSettings) => void;
};

function SettingField({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="space-y-0.5 px-0.5">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </span>
        {description ? (
          <p className="text-xs leading-5 text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function hintForOption<T extends string>(
  options: ReadonlyArray<{ id: T; hint: string }>,
  value: T
): string {
  return options.find((item) => item.id === value)?.hint ?? "";
}

export function ProductShotSettingsPanel({
  settings,
  onChange,
}: ProductShotSettingsPanelProps) {
  const { copy } = useStudioCopy();
  const ps = copy.productShot;
  const f = copy.form;

  const scenePresets = useMemo(
    () =>
      [
        {
          id: "marketplace-clean" as const,
          label: ps.sceneMarketplace,
          hint: ps.marketplaceHelp,
        },
        {
          id: "white-studio" as const,
          label: ps.sceneWhite,
          hint: ps.sceneWhiteHint,
        },
        {
          id: "light-gray-studio" as const,
          label: ps.sceneGray,
          hint: ps.sceneGrayHint,
        },
      ] satisfies {
        id: Exclude<ProductShotScenePreset, typeof MODEL_PARAM_CUSTOM>;
        label: string;
        hint: string;
      }[],
    [ps]
  );

  const patch = (partial: Partial<ProductShotSettings>) =>
    onChange({ ...settings, ...partial });

  const aspectRatio = aspectRatioForShotSizePreset(settings.shotSizePreset);
  const scenePreset =
    settings.scenePreset === MODEL_PARAM_CUSTOM
      ? "marketplace-clean"
      : settings.scenePreset;

  useEffect(() => {
    if (settings.scenePreset !== MODEL_PARAM_CUSTOM) return;
    onChange({
      ...settings,
      scenePreset: "marketplace-clean",
      sceneCustomDescription: "",
    });
  }, [settings.scenePreset]);

  const sceneDescription =
    scenePreset === "marketplace-clean"
      ? ps.marketplaceHelp
      : hintForOption(scenePresets, scenePreset);

  const aspectRatioDescription = aspectRatio
    ? hintForAspectRatioOption(PRODUCT_SHOT_ASPECT_RATIO_OPTIONS, aspectRatio)
    : ps.aspectFallback;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-950">{ps.title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">{ps.subtitle}</p>
      </div>

      <div className="space-y-2">
        <SettingField label={ps.backgroundLabel} description={sceneDescription}>
          <div className="space-y-2">
            <Select
              triggerClassName="rounded-[12px] font-medium"
              placeholder={f.selectBackground}
              menuMatchTriggerWidth
              value={scenePreset}
              options={scenePresets.map((opt) => ({
                value: opt.id,
                label: opt.label,
                triggerLabel: opt.label,
              }))}
              onChange={(next) =>
                patch({
                  scenePreset: next,
                  sceneCustomDescription: "",
                })
              }
            />
          </div>
        </SettingField>
      </div>

      <div className="flex flex-col gap-4">
        <AspectRatioSelectField
          description={aspectRatioDescription}
          value={aspectRatio}
          options={PRODUCT_SHOT_ASPECT_RATIO_OPTIONS}
          onChange={(nextRatio) => {
            const preset = shotSizePresetFromAspectRatio(nextRatio);
            if (preset) patch({ shotSizePreset: preset });
          }}
        />
      </div>
    </div>
  );
}
