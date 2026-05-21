import { z } from "zod";
import { SITE_EVENT_TYPES } from "@/lib/telegram/types";

const MAX_LEN = {
  path: 512,
  title: 256,
  referrer: 1024,
  userAgent: 512,
  utm: 128,
  id: 64,
  label: 128,
  locale: 16,
  userId: 64,
  email: 128,
};

function trimMax(max: number) {
  return z.string().trim().max(max).optional();
}

export const siteEventBodySchema = z
  .object({
    eventType: z.enum(SITE_EVENT_TYPES),
    path: z.string().trim().min(1).max(MAX_LEN.path),
    title: trimMax(MAX_LEN.title),
    referrer: trimMax(MAX_LEN.referrer),
    userAgent: trimMax(MAX_LEN.userAgent),
    utm_source: trimMax(MAX_LEN.utm),
    utm_medium: trimMax(MAX_LEN.utm),
    utm_campaign: trimMax(MAX_LEN.utm),
    utm_content: trimMax(MAX_LEN.utm),
    utm_term: trimMax(MAX_LEN.utm),
    gclid: trimMax(MAX_LEN.utm),
    yclid: trimMax(MAX_LEN.utm),
    fbclid: trimMax(MAX_LEN.utm),
    ttclid: trimMax(MAX_LEN.utm),
    visitorId: z.string().trim().min(4).max(MAX_LEN.id),
    sessionId: z.string().trim().min(4).max(MAX_LEN.id),
    locale: trimMax(MAX_LEN.locale),
    timestamp: z.string().min(10).max(40),
    label: trimMax(MAX_LEN.label),
    userId: trimMax(MAX_LEN.userId),
    maskedEmail: trimMax(MAX_LEN.email),
  })
  .strict();

export type SiteEventBody = z.infer<typeof siteEventBodySchema>;
