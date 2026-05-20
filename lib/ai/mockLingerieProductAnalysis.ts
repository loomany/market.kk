import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";

/** Reference mock for black/turquoise lingerie set on model (tests + AI_MOCK_MODE). */
export function mockLingerieSetOnModelAnalysis(): ProductDescriptionAnalysis {
  return {
    descriptionRu:
      "На фото комплект нижнего белья на модели: чёрный поддерживающий бюстгальтер с широкими бретелями и высокие трусы с бирюзово-зелёным кружевным цветочным узором. Важно сохранить чёрную основу комплекта, контрастное бирюзово-зелёное кружево, форму и глубину чашек бюстгальтера, широкие бретели, кружевную отделку по краям и высокую посадку трусов.",
    shortAiSummaryEn:
      "on-model lingerie set, bra + high-waist brief, black base, turquoise-green floral lace, wide bra straps, supportive full cups, preserve cup shape, preserve lace texture, preserve high-waist fit, do not treat as flat-lay",
    categoryContext: "lingerie",
    productCategory: "auto",
    sourcePresentation: "on-model",
    garmentPhotoType: "model",
    setType: "bra_brief_set",
    lingerieSetType: "bra_brief_set",
    lingerieSetTypeConfidence: 0.94,
    lingerieSetTypeReason:
      "Visible separate bra cups and separate high-waisted brief with skin gap between them.",
    baseColor: "black",
    accentColors: ["turquoise", "green"],
    pattern: "floral lace",
    materials: ["lace"],
    bra: {
      present: true,
      style: "supportive bra",
      cupShape: "full cup",
      straps: "wide",
    },
    bottoms: {
      present: true,
      style: "brief",
      rise: "high-waist",
    },
    mustPreserve: [
      "black base color",
      "turquoise-green floral lace pattern",
      "lace texture",
      "wide bra straps",
      "supportive full cup shape",
      "high-waist brief fit",
      "lace edge detailing",
    ],
    fitNotes: [
      "preserve the depth and support of the bra cups",
      "preserve the high-waist silhouette of the briefs",
      "avoid flattening the bust shape",
      "avoid changing lace placement",
      "avoid turning the briefs into low-rise bottoms",
    ],
    warnings: [
      "source image shows garment worn on a human body",
      "do not classify as flat-lay",
      "necklace is visible but is not the product",
    ],
    confidence: 0.95,
    sourceModel: {
      bodyType: "plus-size curvy hourglass",
      sizeClass: "plus-size",
      pose: "front-facing standing pose, torso slightly angled, hands near hips",
      poseRu: "стоя анфас, корпус слегка в полуоборот, руки у бёдер",
      crop: "upper-thigh",
      cameraAngle: "straight-on catalog camera angle",
      handsPosition: "relaxed near hips/thighs",
      framing: "product-focused crop from upper body to upper thighs",
      bodyVisibility: "torso, waist, hips, bust visible; full face may be cropped",
      descriptionRu:
        "На фото plus-size модель, стоя, фронтально, кадр по пояс — до верхней части бёдер.",
      promptEn:
        "Create a new synthetic adult female model with similar plus-size curvy hourglass proportions, similar front-facing standing catalog pose, hands relaxed near hips, product-focused framing from upper body to upper thighs, straight-on camera angle. Do not copy the original person's face, identity, tattoos, skin marks, or recognizable features.",
    },
  };
}
