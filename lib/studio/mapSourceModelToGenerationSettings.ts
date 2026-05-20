import type { ProductSourceModel } from "@/lib/ai/productDescriptionAnalysisSchemas";
import { buildSourceModelCameraAnglePrompt } from "@/lib/ai/sourceModelPostProcess";
import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";
import type {
  ModelBodyType,
  ModelGenerationSettings,
} from "@/components/studio/types";
/** SaaS default when AI body type does not match a preset */
export const SAAS_DEFAULT_BODY_TYPE: ModelBodyType = "standard";

export type MapSourceModelResult = {
  settings: ModelGenerationSettings;
  /** English camera/pose line for generate-model when no product-angle preset */
  cameraAnglePrompt?: string;
};

function mapSizeClassToBodyType(
  sizeClass: ProductSourceModel["sizeClass"]
): ModelBodyType | null {
  switch (sizeClass) {
    case "plus-size":
      return "plus-size";
    case "curvy":
      return "curvy";
    case "xl":
      return "size-xl";
    case "2xl":
      return "size-2xl";
    case "slim":
      return "slim";
    case "petite":
      return "petite";
    case "standard":
      return "standard";
    default:
      return null;
  }
}

function inferBodyTypeFromText(text: string): ModelBodyType | null {
  const t = text.toLowerCase();
  if (/plus[-\s]?size|плюс[-\s]?сайз/.test(t)) return "plus-size";
  if (/2\s*xl|2xl/.test(t)) return "size-2xl";
  if (/\bxl\b/.test(t)) return "size-xl";
  if (/\bsize[-\s]?l\b|\blarge\b/.test(t)) return "size-l";
  if (/\bsize[-\s]?m\b|\bmedium\b/.test(t)) return "size-m";
  if (/\bsize[-\s]?s\b|\bsmall\b/.test(t)) return "size-s";
  if (/curvy|hourglass|пышн/.test(t)) return "curvy";
  if (/petite|миниатюр/.test(t)) return "petite";
  if (/slim|стройн|lean/.test(t)) return "slim";
  if (/athletic|sport|фитнес|подтянут/.test(t)) return "athletic";
  if (/tall|высок/.test(t)) return "tall";
  if (/swimwear|bikini|купальник|бикини/.test(t)) return "swimwear";
  if (/standard|regular|average|средн|нормальн/.test(t)) return "standard";
  return null;
}

/** Map AI source model → a known body-type preset (never «свой вариант»). */
export function resolveSourceModelBodyTypeSettings(
  sourceModel: ProductSourceModel
): Pick<ModelGenerationSettings, "bodyType" | "bodyTypeCustom"> {
  const fromSize = mapSizeClassToBodyType(sourceModel.sizeClass);
  if (fromSize) {
    return { bodyType: fromSize, bodyTypeCustom: "" };
  }

  const bodyText = sourceModel.bodyType?.trim();
  if (bodyText) {
    const inferred = inferBodyTypeFromText(bodyText);
    if (inferred) {
      return { bodyType: inferred, bodyTypeCustom: "" };
    }
  }

  return { bodyType: SAAS_DEFAULT_BODY_TYPE, bodyTypeCustom: "" };
}

/** Only when user chose custom pose — never override auto (productView resolver owns pose). */
function mapPose(
  sourceModel: ProductSourceModel,
  settings: ModelGenerationSettings
): Pick<ModelGenerationSettings, "pose" | "poseCustom"> | null {
  if (settings.pose === "auto") return null;
  if (settings.pose !== MODEL_PARAM_CUSTOM) return null;
  const poseText = sourceModel.pose?.trim();
  if (!poseText) return null;
  return {
    pose: MODEL_PARAM_CUSTOM,
    poseCustom: settings.poseCustom.trim() || poseText,
  };
}

/**
 * Apply source-model hints for one-click generation (body, pose, camera).
 * Crop («кадр для примерки») is user-controlled only — never taken from analysis.
 * Call only at generate time; does not mutate UI defaults permanently.
 */
export function mapSourceModelToGenerationSettings(input: {
  settings: ModelGenerationSettings;
  sourceModel: ProductSourceModel | null | undefined;
}): MapSourceModelResult {
  const { sourceModel } = input;
  if (!sourceModel) {
    return { settings: input.settings };
  }

  let next: ModelGenerationSettings = { ...input.settings };

  next = { ...next, ...resolveSourceModelBodyTypeSettings(sourceModel) };

  const pose = mapPose(sourceModel, input.settings);
  if (pose) {
    next = { ...next, ...pose };
  }

  const cameraAnglePrompt = buildSourceModelCameraAnglePrompt(sourceModel);

  return {
    settings: next,
    ...(cameraAnglePrompt ? { cameraAnglePrompt } : {}),
  };
}
