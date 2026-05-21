"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  captureAttributionFromUrl,
  getStoredAttribution,
  isReturnVisitor,
  markFirstSeen,
  postSiteEvent,
  touchSessionActivity,
} from "@/lib/telegram/clientEvents";

export function SiteTelegramTracker() {
  const pathname = usePathname() ?? "/";
  const initialSent = useRef(false);
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    captureAttributionFromUrl();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.(
        "[data-telegram-event]"
      ) as HTMLElement | null;
      if (!target) return;

      const eventType = target.getAttribute("data-telegram-event");
      if (!eventType) return;

      const label = target.getAttribute("data-telegram-label") ?? undefined;
      const allowed = [
        "cta_click",
        "lead_action",
        "checkout_click",
        "signup_start",
      ] as const;

      if (!allowed.includes(eventType as (typeof allowed)[number])) {
        return;
      }

      void postSiteEvent(eventType as (typeof allowed)[number], pathname, {
        label,
        path: pathname,
      });
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [pathname]);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    touchSessionActivity();

    const attribution = getStoredAttribution();

    const sendVisit = async () => {
      if (!initialSent.current) {
        initialSent.current = true;
        markFirstSeen();
        const visitType = isReturnVisitor() ? "return_visit" : "first_visit";
        await postSiteEvent(visitType, pathname, attribution);
      }

      await postSiteEvent("page_view", pathname, attribution);
    };

    void sendVisit();
  }, [pathname]);

  return null;
}
