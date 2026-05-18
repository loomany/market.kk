"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type StepState = "done" | "current" | "upcoming";

function stepState(step: number, activeStep: number): StepState {
  if (step < activeStep) return "done";
  if (step === activeStep) return "current";
  return "upcoming";
}

const STEPS = [
  { id: 1, title: "Товар", description: "Загрузите фото товара." },
  {
    id: 2,
    title: "Модель",
    description: "Сгенерируйте AI-модель или загрузите свою.",
  },
  {
    id: 3,
    title: "Примерка",
    description: "Создайте фото и проверьте результат.",
  },
] as const;

type ClothingTryOnStepperProps = {
  activeStep: 1 | 2 | 3;
  isLingerie?: boolean;
};

export function ClothingTryOnStepper({
  activeStep,
  isLingerie = false,
}: ClothingTryOnStepperProps) {
  return (
    <nav
      aria-label="Шаги примерки одежды"
      className="mb-4 overflow-x-auto rounded-[18px] border border-slate-200/90 bg-white p-3 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ol className="flex min-w-0 gap-2 sm:gap-3">
        {STEPS.map((step) => {
          const state = stepState(step.id, activeStep);

          return (
            <li
              key={step.id}
              className="flex min-w-[min(100%,9.5rem)] flex-1 flex-col gap-1 sm:min-w-0"
            >
              <StepRow state={state} stepNumber={step.id} title={step.title} />
              <p
                className={cn(
                  "px-0.5 text-[11px] leading-4 sm:text-xs sm:leading-5",
                  state === "current"
                    ? "text-teal-950"
                    : state === "done"
                      ? "text-slate-600"
                      : "text-slate-400"
                )}
              >
                {step.description}
              </p>
              {step.id === 2 && isLingerie ? (
                <p className="px-0.5 text-[11px] leading-4 text-amber-900 sm:text-xs sm:leading-5">
                  Для белья лучше полный рост или кадр до бёдер, чтобы был виден
                  комплект.
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepRow({
  state,
  stepNumber,
  title,
}: {
  state: StepState;
  stepNumber: number;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums",
          state === "done" && "bg-emerald-600 text-white",
          state === "current" && "bg-teal-700 text-white ring-2 ring-teal-200",
          state === "upcoming" &&
            "border border-slate-200 bg-slate-50 text-slate-400"
        )}
      >
        {state === "done" ? (
          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
        ) : (
          stepNumber
        )}
      </span>
      <span
        className={cn(
          "truncate text-xs font-semibold sm:text-sm",
          state === "current" && "text-teal-950",
          state === "done" && "text-slate-800",
          state === "upcoming" && "text-slate-400"
        )}
      >
        {title}
      </span>
    </div>
  );
}
