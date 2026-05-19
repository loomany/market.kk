/**
 * Strips video / short-form motion language from prompt-enhancer output when
 * the downstream consumer is a static image editor (Проработка → scene).
 */

const COLLAPSE_SPACES = /\s{2,}/g;

/** Phrases and tokens that must not leak into image-edit prompts. */
const VIDEO_LEAK_PATTERNS: readonly RegExp[] = [
  /\bfor reels\b/gi,
  /\binstagram reels\b/gi,
  /\bvertical reels\b/gi,
  /\btik\s?tok\b/gi,
  /\byoutube shorts\b/gi,
  /\bshort[\s-]form video\b/gi,
  /\bcinematic motion\b/gi,
  /\bcinematic video\b/gi,
  /\bcamera movement\b/gi,
  /\bcamera pan\b/gi,
  /\bcamera zoom\b/gi,
  /\btracking shot\b/gi,
  /\bdolly\b/gi,
  /\bslow push[\s-]?in\b/gi,
  /\bpush[\s-]?in\b/gi,
  /\bpull[\s-]?out\b/gi,
  /\bmotion preset\b/gi,
  /\bsubtle motion\b/gi,
  /\bloopable\b/gi,
  /\b(?:fps|frames per second)\b/gi,
  /\b\d+\s*[-–]\s*\d+\s*seconds?\b/gi,
  /\b\d+\s*seconds?\b/gi,
  /\bcreate (?:a )?\d+[-–]?\d*\s*sec\b/gi,
  /\b(?:slow|fast)\s+(?:push|zoom|pan|dolly)\b/gi,
  /\bduration\b/gi,
  /\b6[\s–-]8\s*seconds?\b/gi,
  /\b5[\s–-]7\s*seconds?\b/gi,
  /\banimate(?:d|s)?\b/gi,
  /\banimation\b/gi,
  /\binstagram stories\b/gi,
  /\breels\b/gi,
  /\bvideo\b/gi,
  /** Keep "motion blur" (photo) — strip motion only when not part of that phrase */
  /\bmotion\b(?!\s*blur\b)/gi,
];

/**
 * Removes video/Reels/motion/duration wording from enhancer output.
 * Safe to call on empty strings.
 */
export function sanitizeImageEnhancerOutputText(text: string): string {
  let out = (text ?? "").trim();
  if (!out) return "";

  for (const p of VIDEO_LEAK_PATTERNS) {
    out = out.replace(p, " ");
  }

  return out
    .replace(COLLAPSE_SPACES, " ")
    .replace(/\s*,\s*,/g, ",")
    .replace(/\s*\.\s*\./g, ".")
    .replace(/^[\s,.;:]+/, "")
    .replace(/[\s,;:]+$/, "")
    .trim();
}
