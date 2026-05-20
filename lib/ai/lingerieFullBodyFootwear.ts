import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";
import { isFullBodyCrop } from "@/lib/ai/modelFraming";
import { isAdultModelAge } from "@/lib/ai/modelAge";
import { hasSourceProductZoneFraming } from "@/lib/ai/sourceFramingGuidance";

const FOOTWEAR_OVERRIDE_PATTERN =
  /barefoot|bare\s*feet|no\s+heels?|without\s+heels?|sneakers?|trainers?|flats?|босиком|без\s+обуви|кроссовк/i;

/** User explicitly asked for no heels / casual footwear — skip hidden heels rule. */
export function userOverridesFootwear(customDescription?: string | null): boolean {
  const text = customDescription?.trim();
  if (!text) return false;
  return FOOTWEAR_OVERRIDE_PATTERN.test(text);
}

/** Hidden catalog footwear guidance for adult lingerie full-length shots. */
export function lingerieFullBodyFootwearGuidance(): string {
  return (
    "For this adult lingerie or swimwear full-length catalog shot, style the model in elegant refined fashion heels or classic stiletto pumps, closed toe or minimal heeled sandals, neutral black or nude. " +
    "Heels should support upright commercial posture, subtly lengthen the leg line, and create a clean flattering silhouette. " +
    "Footwear remains tasteful, minimal, and secondary to the garment. " +
    "No sneakers, no athletic shoes, no flip-flops, no platform stripper heels, no nightclub or costume styling."
  );
}

export function shouldApplyLingerieFullBodyHeels(
  request: GenerateModelRequest
): boolean {
  if (request.categoryContext !== "lingerie") return false;
  if (hasSourceProductZoneFraming(request.sourceFramingGuidanceEn)) return false;
  if (!isAdultModelAge(request.modelAge)) return false;
  if (!isFullBodyCrop(request)) return false;
  if (userOverridesFootwear(request.customDescription)) return false;
  return true;
}
