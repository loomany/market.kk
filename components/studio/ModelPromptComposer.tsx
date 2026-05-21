"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildModelCombinedPromptRu } from "@/lib/ai/modelSettingsSummary";
import { Button } from "@/components/ui/Button";
import { SaasMicButton } from "@/components/ui/SaasMicButton";
import type { Locale } from "@/lib/i18n/locales";
import { speechRecognitionLang } from "@/lib/voice/speechRecognitionLocale";
import { useStudioCopy } from "./StudioLocaleContext";

const DESCRIPTION_MAX = 1000;

type ModelPromptComposerProps = {
  basePrompt: string;
  description: string;
  onDescriptionChange: (value: string) => void;
  disabled?: boolean;
  dictationLocale?: Locale;
};

export function ModelPromptComposer({
  basePrompt,
  description,
  onDescriptionChange,
  disabled = false,
  dictationLocale = "ru",
}: ModelPromptComposerProps) {
  const { copy } = useStudioCopy();
  const p = copy.modelPrompt;
  const hasSavedDescription = Boolean(description.trim());
  const [additionOpen, setAdditionOpen] = useState(false);
  const [draft, setDraft] = useState(description);

  useEffect(() => {
    setDraft(description);
  }, [description]);

  const trimmedDraft = draft.trim();

  const previewExtra = useMemo(() => {
    if (additionOpen && trimmedDraft) return trimmedDraft;
    if (description.trim()) return description.trim();
    return "";
  }, [additionOpen, description, trimmedDraft]);

  const combinedPrompt = useMemo(
    () => buildModelCombinedPromptRu(basePrompt, previewExtra || undefined),
    [basePrompt, previewExtra]
  );

  const handleDraftChange = (next: string) => {
    setDraft(next);
    onDescriptionChange(next);
  };

  const handleClearAddition = () => {
    setDraft("");
    onDescriptionChange("");
    setAdditionOpen(false);
  };

  const appendDictation = (spoken: string) => {
    const chunk = spoken.trim();
    if (!chunk) return;
    const base = draft.trim();
    const next = (base ? `${base} ${chunk}` : chunk).slice(0, DESCRIPTION_MAX);
    handleDraftChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-0.5 px-0.5">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {p.previewTitle}
        </span>
        <p className="text-xs leading-5 text-slate-500">{p.previewHint}</p>
      </div>

      <div className="space-y-1.5">
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
          disabled={disabled}
          onClick={() => setAdditionOpen(true)}
        >
          <Plus className="h-4 w-4" aria-hidden />
          {p.addDescription}
        </Button>
      ) : (
        <div className="relative space-y-2 rounded-[12px] bg-slate-50/90 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {p.additionTitle}
              </span>
              <p className="text-xs leading-5 text-slate-500">{p.additionHint}</p>
            </div>
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label={copy.form.collapse}
              disabled={disabled}
              onClick={() => setAdditionOpen(false)}
            >
              <ChevronUp className="h-4 w-4" aria-hidden />
            </button>
          </div>

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
            onChange={(event) => handleDraftChange(event.target.value)}
            rows={4}
            maxLength={DESCRIPTION_MAX}
            disabled={disabled}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-1p-ignore
            data-lpignore="true"
            data-bwignore
            aria-autocomplete="none"
            placeholder={p.additionPlaceholder}
            className={cn(
              "min-h-[112px] w-full resize-y rounded-[12px] border border-border bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition",
              "hover:border-slate-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600"
            )}
          />

          <div className="relative z-20 mt-1 flex items-center justify-end gap-2 pt-1">
            <SaasMicButton
              lang={speechRecognitionLang(dictationLocale)}
              disabled={disabled}
              onTranscript={appendDictation}
            />
            {(hasSavedDescription || trimmedDraft) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 px-2"
                disabled={disabled}
                onClick={handleClearAddition}
              >
                {p.remove}
              </Button>
            )}
          </div>
        </div>
      )}

      {hasSavedDescription && !additionOpen ? (
        <div className="rounded-[12px] border border-emerald-200/80 bg-white px-3 py-2.5 shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="min-w-0 flex-1 space-y-1">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {p.additionTitle}
              </span>
              <p className="line-clamp-3 text-sm leading-6 text-slate-700">
                {description.trim()}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 text-xs font-semibold text-teal-700 transition hover:text-teal-900"
              disabled={disabled}
              onClick={() => setAdditionOpen(true)}
            >
              {p.edit}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
