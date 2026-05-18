"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildModelCombinedPromptRu } from "@/lib/ai/modelSettingsSummary";
import { Button } from "@/components/ui/Button";

const DESCRIPTION_MAX = 1000;

type ModelPromptComposerProps = {
  basePrompt: string;
  description: string;
  onDescriptionChange: (value: string) => void;
  onEnhanceDescription: (draft: string) => Promise<string | null>;
  enhancing?: boolean;
  disabled?: boolean;
};

export function ModelPromptComposer({
  basePrompt,
  description,
  onDescriptionChange,
  onEnhanceDescription,
  enhancing = false,
  disabled = false,
}: ModelPromptComposerProps) {
  const hasSavedDescription = Boolean(description.trim());
  const [additionOpen, setAdditionOpen] = useState(hasSavedDescription);
  const [draft, setDraft] = useState(description);
  const [lastConfirmed, setLastConfirmed] = useState<string | null>(
    hasSavedDescription ? description.trim() : null
  );

  useEffect(() => {
    setDraft(description);
    setLastConfirmed(description.trim() ? description.trim() : null);
    if (description.trim()) {
      setAdditionOpen(true);
    }
  }, [description]);

  const trimmedDraft = draft.trim();
  const canConfirm =
    trimmedDraft.length > 0 && !disabled && !enhancing;
  const isConfirmed =
    canConfirm &&
    trimmedDraft === lastConfirmed &&
    trimmedDraft === description.trim();

  const previewExtra = useMemo(() => {
    if (isConfirmed && description.trim()) return description.trim();
    if (additionOpen && trimmedDraft) return trimmedDraft;
    if (description.trim()) return description.trim();
    return "";
  }, [additionOpen, description, isConfirmed, trimmedDraft]);

  const combinedPrompt = useMemo(
    () => buildModelCombinedPromptRu(basePrompt, previewExtra || undefined),
    [basePrompt, previewExtra]
  );

  const hasUnsavedDraft =
    additionOpen &&
    trimmedDraft.length > 0 &&
    trimmedDraft !== description.trim();

  const handleConfirm = () => {
    if (!canConfirm) return;
    onDescriptionChange(trimmedDraft);
    setLastConfirmed(trimmedDraft);
  };

  const handleEnhance = async () => {
    if (!trimmedDraft) return;
    const enhanced = await onEnhanceDescription(trimmedDraft);
    if (enhanced) {
      setDraft(enhanced);
      setLastConfirmed(null);
    }
  };

  const handleClearAddition = () => {
    setDraft("");
    onDescriptionChange("");
    setLastConfirmed(null);
    setAdditionOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-0.5 px-0.5">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Итоговый промт
        </span>
        <p className="text-xs leading-5 text-slate-500">
          База из параметров выше. Добавьте своё описание
          (локация, настроение, детали) — оно дополнит промт для генерации.
        </p>
      </div>

      <div className="space-y-1.5">
        {hasUnsavedDraft ? (
          <div className="flex justify-end px-0.5">
            <span className="text-[10px] font-medium uppercase tracking-wide text-amber-700">
              черновик
            </span>
          </div>
        ) : null}
        <div
          className="rounded-[12px] bg-slate-900/95 px-3 py-3 text-sm leading-6 text-slate-100"
          aria-readonly="true"
        >
          {combinedPrompt}
        </div>
      </div>

      {!additionOpen ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-2"
          disabled={disabled || enhancing}
          onClick={() => setAdditionOpen(true)}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Добавить своё описание
        </Button>
      ) : (
        <div className="relative space-y-2 rounded-[12px] bg-slate-50/90 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Ваше дополнение
              </span>
              <p className="text-xs leading-5 text-slate-500">
                Локация, свет, настроение — не меняет возраст, тип фигуры и
                позу из базы.
              </p>
            </div>
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Свернуть"
              disabled={disabled || enhancing}
              onClick={() => setAdditionOpen(false)}
            >
              <ChevronUp className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {/* Скрытое поле — часть браузеров вешает автозаполнение на первый input в блоке */}
          <input
            type="text"
            name="vitrina-model-addon-decoy"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="pointer-events-none absolute h-0 w-0 opacity-0"
            defaultValue=""
          />
          <textarea
            id="vitrina-model-prompt-addition"
            name="vitrina-model-prompt-addition"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={4}
            maxLength={DESCRIPTION_MAX}
            disabled={disabled || enhancing}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-1p-ignore
            data-lpignore="true"
            data-bwignore
            aria-autocomplete="none"
            placeholder="Например: светлая студия, уверенная поза, смотрит в камеру, руки не закрывают одежду"
            className={cn(
              "min-h-[112px] w-full resize-y rounded-[12px] border bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition",
              "hover:border-slate-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600",
              isConfirmed
                ? "border-emerald-400 ring-2 ring-emerald-100"
                : "border-border"
            )}
          />

          {isConfirmed ? (
            <p className="flex items-center gap-1.5 px-0.5 text-xs font-medium text-emerald-700">
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Сохранено — учтём при генерации
            </p>
          ) : canConfirm ? (
            <p className="px-0.5 text-xs text-slate-500">
              Нажмите галочку, чтобы применить дополнение к промту
            </p>
          ) : (
            <p className="px-0.5 text-xs text-slate-500">
              Опишите детали своими словами, затем подтвердите галочкой
            </p>
          )}

          <div className="relative z-20 mt-1 flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-w-0 flex-1 gap-1.5"
              loading={enhancing}
              disabled={disabled || enhancing || !trimmedDraft}
              onClick={() => void handleEnhance()}
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Усилить дополнение
            </Button>
            <button
              type="button"
              disabled={!canConfirm}
              aria-label={
                isConfirmed ? "Описание сохранено" : "Сохранить описание"
              }
              aria-pressed={isConfirmed}
              onClick={handleConfirm}
              className={cn(
                "relative z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border bg-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1",
                isConfirmed
                  ? "border-emerald-500 bg-emerald-600 text-white"
                  : canConfirm
                    ? "border-teal-400 bg-teal-50 text-teal-800 hover:bg-teal-100 active:scale-[0.98]"
                    : "cursor-not-allowed border-border bg-slate-50 text-slate-300"
              )}
            >
              <Check
                className="h-5 w-5"
                strokeWidth={isConfirmed ? 3 : 2}
                aria-hidden
              />
            </button>
            {(hasSavedDescription || trimmedDraft) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 px-2"
                disabled={disabled || enhancing}
                onClick={handleClearAddition}
              >
                Убрать
              </Button>
            )}
          </div>
        </div>
      )}

      {hasSavedDescription && !additionOpen ? (
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1 text-xs font-medium text-teal-700 transition hover:text-teal-900"
          disabled={disabled || enhancing}
          onClick={() => setAdditionOpen(true)}
        >
          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          Изменить дополнение
        </button>
      ) : null}
    </div>
  );
}