/** High-priority rules when matching on-model product photo body/pose/framing. */
export const SOURCE_MODEL_GENERATION_RULE =
  "Use the source product photo only as a body/pose reference (not crop or framing — crop is user-selected). Match similar body proportions, size class, pose, camera angle, and hand placement. Create a different synthetic adult model with a new face and new identity. Do not copy the original person's face, likeness, tattoos, skin marks, jewelry, hairstyle, or unique identity. Do not recreate or pre-wear the uploaded garment; the product will be applied later by virtual try-on.";

export const SOURCE_MODEL_LINGERIE_NEUTRAL_BASE_RULE =
  "Base model must wear only plain seamless neutral underwear, no lace, no pattern, no logo, no turquoise or green accents, no product design.";
