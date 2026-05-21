"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { openVitrinaLoginModal } from "@/lib/tokens/billingErrorPayload";
import { useStudioCopy } from "./StudioLocaleContext";

type StudioSignupGateModalProps = {
  open: boolean;
  onClose: () => void;
  onBeforeLogin?: () => void;
};

export function StudioSignupGateModal({
  open,
  onClose,
  onBeforeLogin,
}: StudioSignupGateModalProps) {
  const { copy } = useStudioCopy();
  const sg = copy.signupGate;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-950/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-signup-gate-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[24px] bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-teal-50 text-teal-700">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2
                id="studio-signup-gate-title"
                className="text-lg font-semibold text-slate-950"
              >
                {sg.title}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{sg.body}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label={sg.close}
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 rounded-[16px] border border-teal-100 bg-teal-50/80 px-3 py-2.5 text-sm leading-6 text-teal-950">
          {sg.bonus}
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          <Button
            className="w-full"
            onClick={() => {
              onBeforeLogin?.();
              onClose();
              openVitrinaLoginModal();
            }}
          >
            {sg.cta}
          </Button>
          <Button variant="outline" className="w-full" onClick={onClose}>
            {sg.later}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
