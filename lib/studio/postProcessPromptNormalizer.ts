/**
 * Prompt preprocessor for "Проработка" (image enhance + video generate).
 *
 * The user may paste either:
 *  - a short natural-language intent ("дорогой интерьер у окна, мягкий свет"),
 *  - or a full pre-baked AI prompt that already contains guardrails, mode-
 *    specific instructions, and negative rules.
 *
 * Naïvely sending the latter through `/api/ai/prompt/enhance` (which already
 * adds RU guardrails) and then through the editor-specific server builder
 * (which adds another set of English guardrails) produces a bloated, often
 * conflicting prompt — sometimes image/video mismatched. The model then
 * returns black / broken results.
 *
 * This module classifies the input and prepares a clean, single-intent string
 * the rest of the pipeline can safely consume.
 */

export type PostProcessPromptType =
  | "simple_intent"
  | "ai_prompt"
  | "empty"
  | "conflicting";

export type PostProcessOutputMode = "image" | "video";

export type PostProcessEditorId = "nano-banana-pro" | "flux-kontext-pro";

export type NormalizePostProcessPromptInput = {
  userPrompt: string;
  selectedEditor: PostProcessEditorId;
  outputMode: PostProcessOutputMode;
  preserveProduct: boolean;
};

export type NormalizePostProcessPromptResult = {
  promptType: PostProcessPromptType;
  /** Clean scene/intent string suitable to pass to enhancer or builder. */
  normalizedUserIntent: string;
  /** Phrases that were stripped (guardrails / mode mismatches). */
  removedConflicts: string[];
  /** Whether `/api/ai/prompt/enhance` should be called on top of intent. */
  shouldRunEnhancer: boolean;
  /** Optional user-facing notice (do not block submission). */
  warningForUi?: string;
};

/* ------------------------------------------------------------------------ */
/*                              Marker patterns                              */
/* ------------------------------------------------------------------------ */

/** Used for "is this an AI prompt?" detection (matches anywhere in text). */
const AI_PROMPT_MARKERS: readonly RegExp[] = [
  /\bedit instruction\b/i,
  /\bpreserve the\b/i,
  /\bpreserve\s+(?:color|shape|pattern|product|garment)/i,
  /\bdo not change\b/i,
  /\bdo not alter\b/i,
  /\bdo not replace\b/i,
  /\bavoid:/i,
  /\bnegative prompt\b/i,
  /\bnegative:/i,
  /\bphotorealistic\b/i,
  /\bsame person\b/i,
  /\bimage_urls?\b/i,
  /\bprompt:\s/i,
  /\bnatural skin texture\b/i,
  /\bno plastic\b/i,
  /\bno doll/i,
  /\bguidance_scale\b/i,
  /\bsafety_tolerance\b/i,
  /\baspect_ratio\b/i,
];

/** Sentence-level patterns: when isAi=true, drop the whole sentence. */
const GUARDRAIL_SENTENCE_PATTERNS: readonly RegExp[] = [
  /^edit instruction[:\-—]/i,
  /^preserve\b/i,
  /^keep (?:the )?same\b/i,
  /^do not\b/i,
  /^do\snot\s/i,
  /^avoid[:\-]/i,
  /^negative[:\-]/i,
  /^photorealistic\b/i,
  /^natural skin/i,
  /^premium commercial lighting\b/i,
  /^return (?:one|a|only one|a single)\b/i,
  /^no plastic\b/i,
  /^no doll\b/i,
  /^remove cgi\b/i,
  /^only modify\b/i,
  /^only change\b/i,
];

/** Phrases that belong to a video brief — strip in image mode. */
const VIDEO_ONLY_PATTERNS: readonly RegExp[] = [
  /\bfor reels\b/i,
  /\breels\b/i,
  /\btik\s?tok\b/i,
  /\bcinematic (?:motion|video|clip)\b/i,
  /\bcamera (?:movement|pan|zoom|push|tracking)\b/i,
  /\bpush[-\s]?in\b/i,
  /\bpull[-\s]?out\b/i,
  /\bdolly\b/i,
  /\btracking shot\b/i,
  /\bmotion preset\b/i,
  /\bsubtle motion\b/i,
  /\bloopable\b/i,
  /\b(?:fps|frames per second)\b/i,
  /\b\d+\s*[-–]?\s*\d*\s*seconds?\b/i,
  /\bcreate (?:a )?\d+[-–]?\d*\s*sec/i,
  /\b(?:slow|fast)\s+(?:push|zoom|pan|dolly)\b/i,
  /\bvideo\b/i,
  /\banimate(?:d|s)?\b/i,
  /\banimation\b/i,
];

/** Phrases that imply a static image — strip in video mode. */
const IMAGE_ONLY_PATTERNS: readonly RegExp[] = [
  /\bstill image\b/i,
  /\bsingle still\b/i,
  /\bsingle frame\b/i,
  /\bno motion\b/i,
  /\bfrozen frame\b/i,
  /\bstatic frame\b/i,
  /\bphotograph only\b/i,
];

/* ------------------------------------------------------------------------ */
/*                              Helpers                                      */
/* ------------------------------------------------------------------------ */

function matchesAny(text: string, patterns: readonly RegExp[]): boolean {
  for (const p of patterns) {
    if (p.test(text)) return true;
  }
  return false;
}

function countMarkers(text: string, patterns: readonly RegExp[]): number {
  let count = 0;
  for (const p of patterns) {
    if (p.test(text)) count += 1;
  }
  return count;
}

function detectIsAiPrompt(text: string): boolean {
  if (text.length > 700) return true;
  return countMarkers(text, AI_PROMPT_MARKERS) >= 2;
}

/** Splits text into sentence-like units (newlines, ". ", "! ", "? "). */
function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n+|(?<=[.!?])\s+(?=[A-Za-zА-Яа-яЁё«"'])/u)
    .map((s) => s.trim())
    .filter(Boolean);
}

function stripLeadingPrefix(sentence: string): string {
  return sentence
    .replace(
      /^(edit instruction|user intent|scene|background|prompt|request|task)\s*[:\-—]\s*/i,
      ""
    )
    .trim();
}

/**
 * Removes mode-conflicting phrases from a sentence.
 *
 * Strategy:
 *  1. Strip every matching phrase inline (so user's valid intent survives
 *     even if it shares a sentence with one or two video/image keywords).
 *  2. If the stripped phrases account for more than ~40% of the original
 *     sentence length, treat the whole sentence as a mode-only brief and
 *     drop it — what remains would be garbage like "create a slow toward
 *     the model with".
 */
function stripModeConflicts(
  sentence: string,
  mode: PostProcessOutputMode
): { cleaned: string; removed: string[]; dropEntire: boolean } {
  const patterns = mode === "image" ? VIDEO_ONLY_PATTERNS : IMAGE_ONLY_PATTERNS;
  const removed: string[] = [];
  let cleaned = sentence;

  for (const p of patterns) {
    const flags = p.flags.includes("g") ? p.flags : p.flags + "g";
    const globalRe = new RegExp(p.source, flags);
    const matches = cleaned.match(globalRe);
    if (matches && matches.length > 0) {
      for (const m of matches) removed.push(m.trim());
    }
    cleaned = cleaned.replace(globalRe, "");
  }

  if (removed.length > 0) {
    const removedChars = removed.reduce((sum, frag) => sum + frag.length, 0);
    const originalChars = Math.max(sentence.length, 1);
    if (removedChars / originalChars > 0.4) {
      return {
        cleaned: "",
        removed: [sentence.trim()],
        dropEntire: true,
      };
    }
  }

  cleaned = cleaned
    .replace(/\s*,\s*,/g, ",")
    .replace(/\s*\.\s*\./g, ".")
    .replace(/^[\s,.;:]+/, "")
    .replace(/[\s,;:]+$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return { cleaned, removed, dropEntire: false };
}

function clampLength(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastDot = truncated.lastIndexOf(".");
  if (lastDot > maxLen * 0.6) return truncated.slice(0, lastDot + 1).trim();
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLen * 0.6) return truncated.slice(0, lastSpace).trim();
  return truncated.trim();
}

function maxIntentLengthForEditor(
  editor: PostProcessEditorId,
  mode: PostProcessOutputMode
): number {
  if (mode === "video") return 400;
  if (editor === "flux-kontext-pro") return 350;
  return 500;
}

/* ------------------------------------------------------------------------ */
/*                              Public API                                   */
/* ------------------------------------------------------------------------ */

export function normalizePostProcessPrompt(
  input: NormalizePostProcessPromptInput
): NormalizePostProcessPromptResult {
  const trimmed = (input.userPrompt ?? "").trim();
  if (!trimmed) {
    return {
      promptType: "empty",
      normalizedUserIntent: "",
      removedConflicts: [],
      shouldRunEnhancer: false,
    };
  }

  const isAi = detectIsAiPrompt(trimmed);
  const sentences = splitIntoSentences(trimmed);

  const removedGuardrails: string[] = [];
  const removedConflicts: string[] = [];
  const keptSentences: string[] = [];

  for (const raw of sentences) {
    const original = raw.trim();
    if (!original) continue;

    const withoutPrefix = stripLeadingPrefix(original);

    // 1. Drop full guardrail sentences only when the input is an AI prompt.
    if (isAi && matchesAny(withoutPrefix, GUARDRAIL_SENTENCE_PATTERNS)) {
      removedGuardrails.push(original);
      continue;
    }

    // 2. Strip mode-conflicting phrases. Both simple_intent and ai_prompt
    //    benefit from this — user shouldn't see "video" leaking into image
    //    mode. Heavy mode-only sentences are dropped wholesale (see helper).
    const { cleaned, removed, dropEntire } = stripModeConflicts(
      withoutPrefix,
      input.outputMode
    );
    if (removed.length > 0) removedConflicts.push(...removed);
    if (dropEntire) continue;

    // 3. Keep only meaningful remainders (≥ 2 words, ≥ 4 chars).
    const words = cleaned.split(/\s+/).filter(Boolean);
    if (cleaned.length >= 4 && words.length >= 2) {
      keptSentences.push(cleaned);
    } else if (cleaned.length > 0) {
      removedConflicts.push(original);
    }
  }

  let normalizedUserIntent = keptSentences.join(". ").trim();
  normalizedUserIntent = normalizedUserIntent
    .replace(/\s{2,}/g, " ")
    .replace(/\.\s*\./g, ".")
    .replace(/^[.,\s]+/, "")
    .replace(/[,\s]+$/, "")
    .trim();

  // Ensure exactly one trailing period if there's content.
  if (normalizedUserIntent.length > 0 && !/[.!?]$/.test(normalizedUserIntent)) {
    normalizedUserIntent += ".";
  }

  const maxLen = maxIntentLengthForEditor(input.selectedEditor, input.outputMode);
  normalizedUserIntent = clampLength(normalizedUserIntent, maxLen);

  let promptType: PostProcessPromptType;
  if (isAi) {
    promptType = "ai_prompt";
  } else if (removedConflicts.length > 0) {
    promptType = "conflicting";
  } else {
    promptType = "simple_intent";
  }

  const shouldRunEnhancer =
    !isAi && normalizedUserIntent.length > 0;

  let warningForUi: string | undefined;
  if (promptType === "ai_prompt") {
    warningForUi =
      "Похоже, вы вставили готовый AI-промт. Мы адаптируем его под выбранный редактор и уберём лишние команды.";
  } else if (promptType === "conflicting") {
    warningForUi =
      input.outputMode === "image"
        ? "Из промта убрали видео-инструкции — выбран режим «Изображение»."
        : "Из промта убрали инструкции для статичной картинки — выбран режим «Видео».";
  }

  if (
    (promptType === "ai_prompt" || promptType === "conflicting") &&
    normalizedUserIntent.length === 0
  ) {
    warningForUi =
      input.outputMode === "image"
        ? "Промт состоит только из служебных или video-инструкций. Опишите сцену для изображения."
        : "Промт состоит только из служебных инструкций. Опишите, что должно происходить в видео.";
  }

  return {
    promptType,
    normalizedUserIntent,
    removedConflicts: [...removedConflicts, ...removedGuardrails],
    shouldRunEnhancer,
    warningForUi,
  };
}
