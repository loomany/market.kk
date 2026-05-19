"use client";

import { useEffect, useState } from "react";
import {
  ESTIMATED_SAAS_PIPELINE_DURATION_SEC,
  SAAS_MODEL_GENERATION_COUNTDOWN_SEC,
} from "@/lib/studio/clothingTryOnEstimates";

export const SAAS_PIPELINE_COUNTDOWN_SEC =
  ESTIMATED_SAAS_PIPELINE_DURATION_SEC.max;

export { SAAS_MODEL_GENERATION_COUNTDOWN_SEC };

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type SaasPipelineCountdownProps = {
  totalSeconds?: number;
  label?: string;
};

export function SaasPipelineCountdown({
  totalSeconds = SAAS_PIPELINE_COUNTDOWN_SEC,
  label = "Создаём фото на модели",
}: SaasPipelineCountdownProps) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    setRemaining(totalSeconds);
    const startedAt = Date.now();
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setRemaining(Math.max(0, totalSeconds - elapsed));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [totalSeconds]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      <p
        className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-teal-800"
        aria-live="polite"
        aria-atomic="true"
      >
        {formatCountdown(remaining)}
      </p>
      <p className="max-w-xs text-xs leading-5 text-slate-500">
        Обычно укладываемся раньше — результат появится сразу, как будет готов.
      </p>
    </div>
  );
}
