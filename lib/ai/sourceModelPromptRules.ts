/**
 * Default when no server-derived source framing guidance is present.
 * UI-selected crop remains authoritative for framing.
 */
export const SOURCE_MODEL_GENERATION_RULE =
  "Use the source product photo only as a body/pose reference (not crop or framing — crop is user-selected). Match similar body proportions, size class, pose, camera angle, and hand placement. Create a different synthetic adult model with a new face and new identity. Do not copy the original person's face, likeness, tattoos, skin marks, jewelry, hairstyle, or unique identity. Do not recreate or pre-wear the uploaded garment; the product will be applied later by virtual try-on.";

/**
 * When `sourceFramingGuidanceEn` is active (confident on-model lingerie source).
 * Crop scale and body orientation (front/back/side) follow server guidance.
 */
export const SOURCE_MODEL_GENERATION_RULE_WITH_FRAMING =
  "Use the source product photo for similar body proportions, size class, standing body orientation (front, back, or side as in the merchant photo), and hand placement when garment zones stay visible. Crop scale must follow server-derived sourceFramingGuidance — not the generic UI catalog crop preset. Never copy seated, reclining, or hand-on-chest posture. Create a different synthetic adult model with a new face and new identity. Do not copy the original person's face, likeness, tattoos, skin marks, jewelry, hairstyle, or unique identity. Do not recreate or pre-wear the uploaded garment; the product will be applied later by virtual try-on.";

/** Crop scale and orientation from merchant photo. */
export const SOURCE_PRODUCT_ZONE_CROP_OVERRIDE_RULE =
  "Source product-zone framing overrides the generic UI crop preset: match the merchant photo bottom cut line and body orientation (front, back, or side) exactly — do not rotate a back or side reference to front-facing; synthesize head and hands the reference cropped out; standing try-on-safe only — override seated, reclining, or hand-on-chest cues.";

/** Unsafe poses blocked; orientation and crop scale follow the reference. */
export const SOURCE_TRY_ON_SAFE_POSE_WINS_RULE =
  "For virtual try-on: match merchant crop scale and body orientation from the product reference. Block only unsafe poses: seated, reclining, or hand-on-chest. Keep entire head in frame — full face for front or three-quarter views, back of head and hair for back views. Never rotate a back or side merchant photo to front-facing.";

export const SOURCE_MODEL_LINGERIE_NEUTRAL_BASE_RULE =
  "Base model must wear only plain seamless neutral underwear, no lace, no pattern, no logo, no turquoise or green accents, no product design.";
