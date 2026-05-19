"use client";

import { Select } from "@/components/ui/Select";
import { isAdultModelAge } from "@/lib/ai/modelAge";
import type { ModelCategoryContext } from "./types";

const SCENARIO_OPTIONS: {
  id: ModelCategoryContext;
  label: string;
  hint: string;
}[] = [
  {
    id: "clothing",
    label: "Одежда",
    hint: "Повседневная и деловая одежда, детская и взрослая",
  },
  {
    id: "lingerie",
    label: "Бельё / купальники",
    hint: "Только 18+, нейтральная взрослая каталожная подача",
  },
  {
    id: "jewelry",
    label: "Украшения",
    hint: "Видны шея, уши и зона украшения без лишних аксессуаров",
  },
  {
    id: "general",
    label: "Универсально",
    hint: "Когда категория неочевидна или смешанный ассортимент",
  },
];

function scenarioHint(value: ModelCategoryContext): string {
  return SCENARIO_OPTIONS.find((item) => item.id === value)?.hint ?? "";
}

type ModelScenarioSelectorProps = {
  value: ModelCategoryContext;
  modelAge: number;
  onChange: (value: ModelCategoryContext) => void;
};

export function ModelScenarioSelector({
  value,
  modelAge,
  onChange,
}: ModelScenarioSelectorProps) {
  const isMinor = !isAdultModelAge(modelAge);

  return (
    <Select
      label="Сценарий"
      helper={scenarioHint(value)}
      value={value}
      options={SCENARIO_OPTIONS.map((opt) => ({
        value: opt.id,
        label: opt.label,
        disabled: isMinor && opt.id === "lingerie",
      }))}
      onChange={onChange}
    />
  );
}
