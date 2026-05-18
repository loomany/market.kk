import { z } from "zod";
import { localeCodes } from "@/lib/i18n/locales";

/** UI locale of the studio page; used for display-language enhance + pre-generation translate */
export const promptLocaleSchema = z.enum(localeCodes);

export type PromptLocale = z.infer<typeof promptLocaleSchema>;
