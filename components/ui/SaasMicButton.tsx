"use client";

import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useSpeechDictation,
  type SpeechDictationStatus,
} from "@/hooks/useSpeechDictation";

type SaasMicButtonProps = {
  lang: string;
  disabled?: boolean;
  onTranscript: (text: string) => void;
  className?: string;
};

function statusLabel(status: SpeechDictationStatus, isListening: boolean): string {
  if (status === "unsupported") {
    return "Голосовой ввод недоступен в этом браузере";
  }
  if (status === "error") {
    return "Нет доступа к микрофону — разрешите в настройках браузера";
  }
  if (isListening) {
    return "Слушаю… Нажмите ещё раз, чтобы остановить";
  }
  return "Надиктовать описание";
}

export function SaasMicButton({
  lang,
  disabled,
  onTranscript,
  className,
}: SaasMicButtonProps) {
  const { status, isListening, isSupported, toggle } = useSpeechDictation({
    lang,
    onFinalTranscript: onTranscript,
    disabled,
  });

  const isDisabled = disabled || !isSupported;
  const label = statusLabel(status, isListening);

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-label={label}
      title={label}
      aria-pressed={isListening}
      onClick={toggle}
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1",
        isListening
          ? "border-teal-500 bg-teal-600 text-white shadow-teal-900/20"
          : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800",
        isDisabled && "cursor-not-allowed opacity-45 hover:border-slate-200 hover:bg-white hover:text-slate-600",
        className
      )}
    >
      {isListening ? (
        <>
          <span
            className="absolute inset-0 animate-ping rounded-full bg-teal-400/40"
            aria-hidden
          />
          <MicOff className="relative h-4 w-4" aria-hidden />
        </>
      ) : (
        <Mic className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
