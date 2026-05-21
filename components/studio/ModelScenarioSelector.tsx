"use client";

import { useMemo } from "react";
import { Select } from "@/components/ui/Select";
import { isAdultModelAge } from "@/lib/ai/modelAge";
import { useStudioCopy } from "./StudioLocaleContext";
import type { ModelCategoryContext } from "./types";

type ModelScenarioSelectorProps = {
  value: ModelCategoryContext;
  modelAge: number;
  onChange: (value: ModelCategoryContext) => void;
  disabled?: boolean;
};

export function ModelScenarioSelector({
  value,
  modelAge,
  onChange,
  disabled = false,
}: ModelScenarioSelectorProps) {
  const { copy } = useStudioCopy();
  const ms = copy.modelScenario;

  const scenarioOptions = useMemo(
    () =>
      (
        [
          { id: "clothing" as const, label: ms.clothing },
          { id: "lingerie" as const, label: ms.lingerie },
          { id: "jewelry" as const, label: ms.jewelry },
          { id: "general" as const, label: ms.general },
        ] as const
      ).map((opt) => ({ ...opt, hint: ms.hint })),
    [ms]
  );

  const isMinor = !isAdultModelAge(modelAge);

  return (
    <Select
      label={ms.label}
      helper={ms.hint}
      value={value}
      options={scenarioOptions.map((opt) => ({
        value: opt.id,
        label: opt.label,
        disabled: isMinor && opt.id === "lingerie",
      }))}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
