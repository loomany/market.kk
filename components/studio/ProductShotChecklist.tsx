"use client";

import {
  PRODUCT_SHOT_CHECKLIST_KEYS,
  PRODUCT_SHOT_CHECKLIST_LABELS_RU,
  type ProductShotChecklistKey,
  type ProductShotChecklistState,
} from "@/lib/ai/productShotChecklist";

type ProductShotChecklistProps = {
  checklist: ProductShotChecklistState;
  onChange: (key: ProductShotChecklistKey, value: boolean) => void;
  showCreativeWarning?: boolean;
};

export function ProductShotChecklist({
  checklist,
  onChange,
  showCreativeWarning,
}: ProductShotChecklistProps) {
  const completed = PRODUCT_SHOT_CHECKLIST_KEYS.filter((k) => checklist[k]).length;
  const total = PRODUCT_SHOT_CHECKLIST_KEYS.length;

  return (
    <div className="space-y-2 text-sm">
      <span className="text-xs font-medium text-slate-600">
        Проверка товара · {completed}/{total}
      </span>

      {showCreativeWarning && (
        <p className="text-xs leading-5 text-amber-800">
          AI-сцена может менять детали. Сравните с исходником перед скачиванием.
        </p>
      )}

      <ul className="space-y-1.5">
        {PRODUCT_SHOT_CHECKLIST_KEYS.map((key) => (
          <li key={key}>
            <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-slate-700">
              <input
                type="checkbox"
                checked={checklist[key]}
                onChange={(e) => onChange(key, e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border accent-teal-700"
              />
              <span>{PRODUCT_SHOT_CHECKLIST_LABELS_RU[key]}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
