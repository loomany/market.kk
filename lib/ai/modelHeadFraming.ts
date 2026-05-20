/**
 * Shared head/face framing rules for generate-model (lingerie try-on base).
 * Product-zone crop must not zoom in so much that forehead or hair are cut off.
 */

/** Highest-priority head rule — prepend to mandatory framing blocks. */
export const LINGERIE_FULL_HEAD_FACE_MANDATORY_EN =
  "Non-negotiable head framing: the entire head must stay in frame with generous headroom above the hair; full face always visible from hairline through forehead, both eyes, eyebrows, nose, mouth, and chin; never crop above the eyebrows, never cut off the top of the head or forehead, not headless, not chin-only, not portrait face close-up without the full head.";

export const LINGERIE_HEAD_SAFETY_NEGATIVES =
  "cropped head, headless model, forehead cut off, eyes cut off, top of head out of frame, hair cropped at crown, portrait crop without full head, face partially outside frame";
