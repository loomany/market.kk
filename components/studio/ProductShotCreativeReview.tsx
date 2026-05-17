"use client";

const CREATIVE_REVIEW_PROMPTS = [
  "Цвет товара сохранён?",
  "Форма товара не изменилась?",
  "Лишние детали не появились?",
] as const;

export function ProductShotCreativeReview() {
  return (
    <div className="space-y-2 rounded-[16px] border border-amber-200 bg-amber-50 px-3 py-2.5">
      <p className="text-xs font-semibold leading-5 text-amber-950">
        AI может изменить детали товара. Сравните результат с исходником перед
        скачиванием.
      </p>
      <ul className="space-y-1 text-xs leading-5 text-amber-900">
        {CREATIVE_REVIEW_PROMPTS.map((prompt) => (
          <li key={prompt} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
            <span>{prompt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
