import "server-only";

import type {
  FalErrorSummary,
  FalResponseSummary,
  ImageEnhanceDebugTrace,
  OutputImageCheck,
  PromptDebugSummary,
  SourceImageCheck,
} from "@/lib/ai/imageEnhanceDebugTypes";

export type {
  FalErrorSummary,
  FalResponseSummary,
  ImageEnhanceDebugTrace,
  OutputImageCheck,
  PromptDebugSummary,
  SourceImageCheck,
};

/**
 * Diagnostic helpers for the /api/ai/image/enhance pipeline.
 *
 * This file is the single source of truth for the image-enhance debug trace.
 * It is intentionally side-effect-free: it produces structured data, the
 * route is responsible for `console.log`ing and embedding the trace in the
 * JSON response.
 *
 * Debug flag:
 *   - AI_IMAGE_ENHANCE_DEBUG=1     ⇒ enabled in any environment
 *   - NODE_ENV=development         ⇒ enabled by default (no opt-out needed)
 *
 * Production callers MUST still strip secrets / raw bodies before returning
 * `debug` to the client — see `redactUrl` and the route-level guard.
 */

// Types intentionally live in `imageEnhanceDebugTypes.ts` (no `server-only`)
// so the client UI can import them without dragging the server bundle in.

// ============================================================================
// Flag + traceId
// ============================================================================

export function isImageEnhanceDebugEnabled(): boolean {
  if (process.env.AI_IMAGE_ENHANCE_DEBUG === "1") return true;
  if (process.env.AI_IMAGE_ENHANCE_DEBUG === "true") return true;
  return process.env.NODE_ENV === "development";
}

export function newImageEnhanceTraceId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `image_enhance_${ts}_${rand}`;
}

/** Returns the URL in dev, a redacted form in production. */
export function redactUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (isImageEnhanceDebugEnabled() && process.env.NODE_ENV === "development") {
    return url;
  }
  try {
    const parsed = new URL(url);
    const host = parsed.host;
    const lastPathChunk = parsed.pathname.split("/").filter(Boolean).pop() ?? "";
    const tail = lastPathChunk.slice(-8);
    return `${parsed.protocol}//${host}/.../${tail}`;
  } catch {
    return `[non-url ${url.length} chars]`;
  }
}

// ============================================================================
// Prompt-stages summarizer
// ============================================================================

const VIDEO_WORD_PATTERNS: Array<readonly [string, RegExp]> = [
  ["reels", /\breels\b/i],
  ["video", /\bvideo\b/i],
  ["seconds", /\bseconds?\b/i],
  ["fps", /\bfps\b/i],
  ["animate", /\banimate(?:d|s)?\b/i],
  ["animation", /\banimation\b/i],
  ["camera_movement", /\bcamera (?:movement|pans?|zooms?|push[- ]?in|pull[- ]?out|dolly|tracking)\b/i],
  ["slow_push_in", /\bslow push[- ]?in\b/i],
  ["motion", /\bmotion(?!\s*blur)\b/i],
];

const SENSITIVE_WORD_PATTERNS: Array<readonly [string, RegExp]> = [
  ["bra", /\bbra\b/i],
  ["briefs", /\bbriefs\b/i],
  ["cleavage", /\bcleavage\b/i],
  ["breast", /\bbreasts?\b/i],
  ["nipple", /\bnipples?\b/i],
  ["cups", /\bcups?\b/i],
  ["lingerie", /\blingerie\b/i],
  ["adult_model", /\badult model\b/i],
  ["model_identity", /\bmodel identity\b/i],
  ["visible_pores", /\bvisible pores\b/i],
  ["body_proportions", /\bbody proportions?\b/i],
  ["fabric_skin_contact", /\bfabric[\s-]to[\s-]skin|fabric contact with skin\b/i],
  ["high_cut_leg", /\bhigh-cut leg openings?\b/i],
];

const DUPLICATE_WORD_PATTERNS: Array<readonly [string, RegExp]> = [
  ["two-piece two-piece", /\btwo-piece\s+two-piece\b/i],
  ["garment garment", /\bgarment\s+garment\b/i],
  ["bottom bottom", /\bbottom\s+bottom\b/i],
  ["top top", /\btop\s+top\b/i],
  ["the the", /\bthe\s+the\b/i],
  ["double-dot", /\.{2,}/],
  ["empty-do-not", /\b\.\s+Do not\s+\.\b/i],
];

function detectMatches(
  text: string,
  patterns: Array<readonly [string, RegExp]>
): string[] {
  const out: string[] = [];
  for (const [label, re] of patterns) {
    if (re.test(text)) out.push(label);
  }
  return out;
}

export function summarizePromptStages(input: {
  userPrompt: string;
  normalizedUserIntent: string;
  enhancedPrompt: string | null;
  productPreservationBlock: string | null;
  /** Pre-sanitize prompt — exactly what the builder returned. */
  finalPromptBeforeFalSanitize: string;
  /** Post-sanitize prompt — exactly what we hand to Fal. */
  finalPromptSentToFal: string;
  removedSensitiveWords: string[];
  removedDuplicatePatterns: string[];
}): PromptDebugSummary {
  const finalSent = input.finalPromptSentToFal;
  return {
    userPrompt: input.userPrompt,
    normalizedUserIntent: input.normalizedUserIntent,
    enhancedPrompt: input.enhancedPrompt,
    productPreservationBlock: input.productPreservationBlock,
    finalPrompt: finalSent,
    finalPromptBeforeFalSanitize: input.finalPromptBeforeFalSanitize,
    finalPromptSentToFal: finalSent,
    userPromptLength: input.userPrompt.length,
    normalizedUserIntentLength: input.normalizedUserIntent.length,
    enhancedPromptLength: (input.enhancedPrompt ?? "").length,
    productPreservationBlockLength: (input.productPreservationBlock ?? "").length,
    finalPromptLength: finalSent.length,
    finalPromptLengthBefore: input.finalPromptBeforeFalSanitize.length,
    finalPromptLengthAfter: finalSent.length,
    containsVideoWords: detectMatches(finalSent, VIDEO_WORD_PATTERNS),
    containsSensitiveWords: detectMatches(finalSent, SENSITIVE_WORD_PATTERNS),
    containsBrokenDuplicates: detectMatches(finalSent, DUPLICATE_WORD_PATTERNS),
    removedSensitiveWords: input.removedSensitiveWords,
    removedDuplicatePatterns: input.removedDuplicatePatterns,
  };
}

// ============================================================================
// Image probes (HEAD + Range-GET)
// ============================================================================

const PROBE_TIMEOUT_MS = 10_000;
/** Maximum bytes we ever read for the heuristic format/dimensions sniff. */
const PROBE_MAX_BYTES = 64 * 1024;

async function timedFetch(
  url: string,
  init: RequestInit
): Promise<Response | { error: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
}

function readContentLength(res: Response): number | null {
  const raw = res.headers.get("content-length");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function probeSourceImage(url: string): Promise<SourceImageCheck> {
  if (!url || typeof url !== "string") {
    return {
      ok: false,
      status: null,
      contentType: null,
      contentLength: null,
      fetchedVia: "none",
      error: "empty url",
    };
  }
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    return {
      ok: true,
      status: 200,
      contentType: url.startsWith("data:image/")
        ? url.slice(5, url.indexOf(";"))
        : "application/octet-stream",
      contentLength: url.length,
      fetchedVia: "none",
      error: null,
    };
  }

  const head = await timedFetch(url, { method: "HEAD" });
  if ("error" in head) {
    return {
      ok: false,
      status: null,
      contentType: null,
      contentLength: null,
      fetchedVia: "head",
      error: head.error,
    };
  }
  if (head.ok || head.status === 405) {
    if (head.ok) {
      return {
        ok: true,
        status: head.status,
        contentType: head.headers.get("content-type"),
        contentLength: readContentLength(head),
        fetchedVia: "head",
        error: null,
      };
    }
    // HEAD not allowed — fall back to a tiny Range GET
    const got = await timedFetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
    });
    if ("error" in got) {
      return {
        ok: false,
        status: null,
        contentType: null,
        contentLength: null,
        fetchedVia: "range-get",
        error: got.error,
      };
    }
    return {
      ok: got.ok || got.status === 206,
      status: got.status,
      contentType: got.headers.get("content-type"),
      contentLength: readContentLength(got),
      fetchedVia: "range-get",
      error: got.ok || got.status === 206 ? null : `HTTP ${got.status}`,
    };
  }
  return {
    ok: false,
    status: head.status,
    contentType: head.headers.get("content-type"),
    contentLength: readContentLength(head),
    fetchedVia: "head",
    error: `HTTP ${head.status}`,
  };
}

function sniffFormat(bytes: Uint8Array): OutputImageCheck["sniffedFormat"] {
  if (bytes.length < 8) return "unknown";
  // PNG
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png";
  }
  // JPEG
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }
  // GIF
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return "gif";
  }
  // WEBP: "RIFF....WEBP"
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }
  return "unknown";
}

function parsePngDimensions(
  bytes: Uint8Array
): { width: number; height: number } | null {
  if (bytes.length < 24) return null;
  // IHDR is the first chunk after the 8-byte signature.
  // Layout: 4 bytes length, 4 bytes type ("IHDR"), 4 bytes width, 4 bytes height
  if (
    bytes[12] !== 0x49 ||
    bytes[13] !== 0x48 ||
    bytes[14] !== 0x44 ||
    bytes[15] !== 0x52
  ) {
    return null;
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16, false);
  const height = view.getUint32(20, false);
  if (!width || !height) return null;
  return { width, height };
}

function parseJpegDimensions(
  bytes: Uint8Array
): { width: number; height: number } | null {
  // Scan SOF0/SOF2 markers for size. Best-effort, bounded by PROBE_MAX_BYTES.
  let i = 2; // skip SOI (FFD8)
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = bytes[i + 1];
    // Skip standalone markers
    if (marker === 0xd8 || marker === 0xd9) {
      i += 2;
      continue;
    }
    const segLen = (bytes[i + 2] << 8) | bytes[i + 3];
    // SOF0 (0xC0) … SOF3 (0xC3), skip restart and DHT/DQT/etc; SOFn except 0xC4 (DHT) and 0xC8/0xCC.
    if (
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3
    ) {
      const height = (bytes[i + 5] << 8) | bytes[i + 6];
      const width = (bytes[i + 7] << 8) | bytes[i + 8];
      if (width && height) return { width, height };
      return null;
    }
    if (segLen <= 0) return null;
    i += 2 + segLen;
  }
  return null;
}

/** Threshold for "uniform/black" heuristic in bytes-per-pixel.
 *  Real photos with photographic content land well above 0.05 BPP for PNG
 *  and above 0.10 BPP for JPEG; a solid-color frame compresses to nearly 0.
 *
 *  PNG bumped 0.005 → 0.020 after the Fal safety-placeholder audit: the
 *  observed placeholder (1024×768 solid black) sat at exactly 0.0132 BPP and
 *  slipped under the old threshold. 0.020 catches it without triggering on
 *  photographic dark scenes (1.46-MB real photo → BPP ~0.78). */
const UNIFORM_BPP_PNG = 0.02;
const UNIFORM_BPP_JPEG = 0.01;
/** Absolute threshold: any 1024+ px image under ~2 KB is suspicious. */
const UNIFORM_ABS_BYTES = 2 * 1024;

/**
 * Visually-dark thresholds on the 0..255 luminance scale.
 *
 * Derived from manual review of FLUX Kontext outputs the user flagged as
 * "black" in the UI: those land in mean ≈ 6..10, P50 ≈ 4..8. Truly dim but
 * acceptable evening photos sit at mean ≈ 18..30, P50 ≈ 14..25 — so a 12/10
 * cut comfortably separates the two.
 */
const LIKELY_DARK_MEAN = 12;
const LIKELY_DARK_P50 = 10;

/**
 * Fal safety placeholder thresholds (audit-confirmed, single-source dataset).
 *
 * Branch A:  rgbPercentZero >= 95              → uniform RGB(0,0,0) frame.
 * Branch B:  mean < 5 && bpp < 0.02 &&
 *            width <= 1024 && height <= 1024   → near-empty PNG that also
 *                                                 ignored the requested
 *                                                 aspect ratio.
 *
 * Either branch promotes the response to FAL_SAFETY_PLACEHOLDER. The two
 * branches are deliberately overlapping — branch A is the strongest signal,
 * branch B is the fallback in case Fal ever changes the exact value pattern.
 */
const PLACEHOLDER_RGB_ZERO_PCT = 95;
const PLACEHOLDER_MEAN_LUMINANCE = 5;
const PLACEHOLDER_BPP = 0.02;
const PLACEHOLDER_MAX_DIM = 1024;

/** Hard cap on bytes we will pull to decode a luminance histogram. */
const LUMINANCE_FETCH_MAX_BYTES = 8 * 1024 * 1024;
/** Down-sample target — small enough to be ~50 ms on a 2K image. */
const LUMINANCE_SAMPLE_EDGE = 64;

// ----------------------------------------------------------------------------
// Luminance decoder (sharp, lazy-required)
// ----------------------------------------------------------------------------

/**
 * `sharp` ships as a dependency of Next.js 16, so it is always present on
 * the server runtime; we still lazy-require + try/catch to keep the route
 * usable if the runtime ever loses it.
 */
type SharpRawWithInfo = {
  data: Buffer;
  info: { width: number; height: number; channels: number };
};

type SharpFactory = (input: Buffer | Uint8Array) => {
  resize: (w: number, h: number, opts?: Record<string, unknown>) => {
    grayscale: () => { raw: () => { toBuffer: () => Promise<Buffer> } };
    removeAlpha: () => {
      raw: () => {
        toBuffer: (opts?: {
          resolveWithObject: true;
        }) => Promise<SharpRawWithInfo>;
      };
    };
  };
};

let sharpLoadAttempted = false;
let sharpInstance: SharpFactory | null = null;

function loadSharp(): SharpFactory | null {
  if (sharpLoadAttempted) return sharpInstance;
  sharpLoadAttempted = true;
  try {
    // require() so a missing dep doesn't break the route at import-time.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("sharp") as SharpFactory | { default: SharpFactory };
    sharpInstance =
      typeof mod === "function"
        ? mod
        : (mod as { default: SharpFactory }).default ?? null;
  } catch {
    sharpInstance = null;
  }
  return sharpInstance;
}

type LuminanceMetrics = {
  meanLuminance: number | null;
  luminanceP5: number | null;
  luminanceP50: number | null;
  luminanceP95: number | null;
  likelyDarkOutput: boolean | null;
  rgbPercentZero: number | null;
  luminanceError: string | null;
};

const EMPTY_LUMINANCE: LuminanceMetrics = {
  meanLuminance: null,
  luminanceP5: null,
  luminanceP50: null,
  luminanceP95: null,
  likelyDarkOutput: null,
  rgbPercentZero: null,
  luminanceError: null,
};

function percentile(sorted: Uint8Array, p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.floor((p / 100) * (sorted.length - 1)))
  );
  return sorted[idx]!;
}

async function fetchFullImageBytes(
  url: string
): Promise<{ bytes: Uint8Array | null; error: string | null }> {
  const res = await timedFetch(url, { method: "GET" });
  if ("error" in res) return { bytes: null, error: res.error };
  if (!res.ok) return { bytes: null, error: `HTTP ${res.status}` };
  const len = readContentLength(res);
  if (len !== null && len > LUMINANCE_FETCH_MAX_BYTES) {
    return { bytes: null, error: `file too large: ${len}B` };
  }
  try {
    const buf = new Uint8Array(await res.arrayBuffer());
    return { bytes: buf, error: null };
  } catch (error) {
    return {
      bytes: null,
      error: error instanceof Error ? error.message : "decode read failed",
    };
  }
}

/**
 * Compute luminance metrics for an image URL. ALWAYS-SAFE: returns
 * EMPTY_LUMINANCE + an `luminanceError` if decoding cannot proceed (sharp
 * missing, fetch failed, etc.). Never throws.
 */
export async function computeOutputLuminance(
  url: string
): Promise<LuminanceMetrics> {
  if (!url) {
    return { ...EMPTY_LUMINANCE, luminanceError: "empty url" };
  }
  const sharp = loadSharp();
  if (!sharp) {
    return {
      ...EMPTY_LUMINANCE,
      luminanceError: "sharp not available",
    };
  }
  const { bytes, error } = await fetchFullImageBytes(url);
  if (!bytes) {
    return { ...EMPTY_LUMINANCE, luminanceError: error ?? "fetch failed" };
  }
  try {
    // Down-sample + drop alpha → one RGB raw pass gives us both:
    //   1. luminance histogram (BT.601: 0.299 R + 0.587 G + 0.114 B)
    //   2. rgbPercentZero, the placeholder-detection signal.
    const { data, info } = await sharp(bytes)
      .resize(LUMINANCE_SAMPLE_EDGE, LUMINANCE_SAMPLE_EDGE, {
        fit: "inside",
        withoutEnlargement: false,
      })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const channels = info.channels;
    const pixelCount = info.width * info.height;
    if (data.length === 0 || pixelCount === 0 || channels < 3) {
      return {
        ...EMPTY_LUMINANCE,
        luminanceError: "empty decode buffer",
      };
    }
    const luma = new Uint8Array(pixelCount);
    let rgbZeroCount = 0;
    let lumaSum = 0;
    for (let p = 0, i = 0; p < pixelCount; p++, i += channels) {
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      // BT.601 luma; rounded to nearest integer for percentile work below.
      const y = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      luma[p] = y;
      lumaSum += y;
      if (r === 0 && g === 0 && b === 0) rgbZeroCount++;
    }
    const mean = lumaSum / pixelCount;
    const sorted = new Uint8Array(luma).sort();
    const p5 = percentile(sorted, 5);
    const p50 = percentile(sorted, 50);
    const p95 = percentile(sorted, 95);
    const likelyDarkOutput = mean < LIKELY_DARK_MEAN || p50 < LIKELY_DARK_P50;
    const rgbPercentZero =
      Math.round((rgbZeroCount * 100 * 100) / pixelCount) / 100;
    return {
      meanLuminance: Math.round(mean * 100) / 100,
      luminanceP5: p5,
      luminanceP50: p50,
      luminanceP95: p95,
      likelyDarkOutput,
      rgbPercentZero,
      luminanceError: null,
    };
  } catch (error) {
    return {
      ...EMPTY_LUMINANCE,
      luminanceError: error instanceof Error ? error.message : "decode failed",
    };
  }
}

/**
 * Apply the audit-derived rule for the silent Fal safety placeholder.
 *
 * Pure function — input is the metrics we already collected, output is
 * a single boolean. Kept separate so the rule is exhaustively unit-testable
 * and easy to tweak in one place without touching the decoder.
 */
function computeIsFalSafetyPlaceholder(input: {
  rgbPercentZero: number | null;
  meanLuminance: number | null;
  bytesPerPixel: number | null;
  width: number | null;
  height: number | null;
}): boolean | null {
  // Nothing decoded → cannot decide.
  if (input.rgbPercentZero === null && input.meanLuminance === null) {
    return null;
  }
  // Branch A — virtually every pixel is solid black.
  if (
    typeof input.rgbPercentZero === "number" &&
    input.rgbPercentZero >= PLACEHOLDER_RGB_ZERO_PCT
  ) {
    return true;
  }
  // Branch B — small, near-empty PNG that looks generic-placeholder-sized.
  if (
    typeof input.meanLuminance === "number" &&
    input.meanLuminance < PLACEHOLDER_MEAN_LUMINANCE &&
    typeof input.bytesPerPixel === "number" &&
    input.bytesPerPixel < PLACEHOLDER_BPP &&
    typeof input.width === "number" &&
    input.width <= PLACEHOLDER_MAX_DIM &&
    typeof input.height === "number" &&
    input.height <= PLACEHOLDER_MAX_DIM
  ) {
    return true;
  }
  return false;
}

/**
 * Build an `OutputImageCheck` for an error path, with `null` everywhere the
 * decoder didn't reach. Centralised so every short-circuit branch stays
 * consistent with the type's required fields.
 */
function emptyOutputImageCheck(
  partial: Partial<OutputImageCheck> & {
    ok: boolean;
    fetchedVia: OutputImageCheck["fetchedVia"];
    error: string | null;
  }
): OutputImageCheck {
  const base = {
    status: null,
    contentType: null,
    contentLength: null,
    width: null,
    height: null,
    sniffedFormat: null,
    bytesPerPixel: null,
    isProbablyUniform: null,
    isProbablyBlack: null,
    isFalSafetyPlaceholder: null,
  };
  return {
    ...base,
    ...EMPTY_LUMINANCE,
    ...partial,
  };
}

export async function probeOutputImage(
  url: string
): Promise<OutputImageCheck> {
  if (!url || typeof url !== "string") {
    return emptyOutputImageCheck({
      ok: false,
      fetchedVia: "none",
      error: "empty url",
    });
  }
  // Pull a small chunk so we can do magic-byte + dimension sniff.
  const got = await timedFetch(url, {
    method: "GET",
    headers: { Range: `bytes=0-${PROBE_MAX_BYTES - 1}` },
  });
  if ("error" in got) {
    return emptyOutputImageCheck({
      ok: false,
      fetchedVia: "range-get",
      error: got.error,
    });
  }
  if (!got.ok && got.status !== 206) {
    return emptyOutputImageCheck({
      ok: false,
      status: got.status,
      contentType: got.headers.get("content-type"),
      contentLength: readContentLength(got),
      fetchedVia: "range-get",
      error: `HTTP ${got.status}`,
    });
  }

  // content-length on a 206 reflects ONLY the requested range. Try to read
  // the original size from `content-range: bytes 0-N/total`.
  let totalContentLength = readContentLength(got);
  const rangeHeader = got.headers.get("content-range");
  if (rangeHeader) {
    const total = rangeHeader.split("/").pop();
    if (total && total !== "*") {
      const n = Number(total);
      if (Number.isFinite(n)) totalContentLength = n;
    }
  }

  const buf = new Uint8Array(await got.arrayBuffer());
  const sniffedFormat = sniffFormat(buf);
  const dims =
    sniffedFormat === "png"
      ? parsePngDimensions(buf)
      : sniffedFormat === "jpeg"
        ? parseJpegDimensions(buf)
        : null;

  let bytesPerPixel: number | null = null;
  let isProbablyUniform: boolean | null = null;
  if (dims && totalContentLength !== null) {
    bytesPerPixel = totalContentLength / (dims.width * dims.height);
    const threshold =
      sniffedFormat === "png" ? UNIFORM_BPP_PNG : UNIFORM_BPP_JPEG;
    isProbablyUniform = bytesPerPixel < threshold;
  } else if (totalContentLength !== null && totalContentLength < UNIFORM_ABS_BYTES) {
    isProbablyUniform = true;
  }

  // Pixel-decoded luminance — the only metric that catches "dark but
  // detailed" outputs (the audit's hypothesis 1) and the uniform-RGB-zero
  // Fal safety placeholder (the audit's confirmed root cause).
  const luminance = await computeOutputLuminance(url);

  const isFalSafetyPlaceholder = computeIsFalSafetyPlaceholder({
    rgbPercentZero: luminance.rgbPercentZero,
    meanLuminance: luminance.meanLuminance,
    bytesPerPixel,
    width: dims?.width ?? null,
    height: dims?.height ?? null,
  });

  return {
    ok: true,
    status: got.status,
    contentType: got.headers.get("content-type"),
    contentLength: totalContentLength,
    width: dims?.width ?? null,
    height: dims?.height ?? null,
    sniffedFormat,
    bytesPerPixel,
    isProbablyUniform,
    // We can't tell colour from compression alone — treat "uniform" as the
    // most likely candidate for the *solid* black PNG case. Visually-dark
    // outputs are caught by `likelyDarkOutput`; safety placeholders by
    // `isFalSafetyPlaceholder`.
    isProbablyBlack: isProbablyUniform,
    meanLuminance: luminance.meanLuminance,
    luminanceP5: luminance.luminanceP5,
    luminanceP50: luminance.luminanceP50,
    luminanceP95: luminance.luminanceP95,
    likelyDarkOutput: luminance.likelyDarkOutput,
    rgbPercentZero: luminance.rgbPercentZero,
    isFalSafetyPlaceholder,
    luminanceError: luminance.luminanceError,
    fetchedVia: "range-get",
    error: null,
  };
}

// ============================================================================
// Fal response/error summarizers
// ============================================================================

export function summarizeFalSuccess(input: {
  rawData: unknown;
  requestId: string | null;
  resolvedImageUrl: string | null;
}): FalResponseSummary {
  const rawKeys =
    typeof input.rawData === "object" && input.rawData !== null
      ? Object.keys(input.rawData as Record<string, unknown>)
      : [];
  const images =
    typeof input.rawData === "object" && input.rawData !== null
      ? ((input.rawData as Record<string, unknown>).images as
          | unknown[]
          | undefined)
      : undefined;
  const imageCount = Array.isArray(images) ? images.length : 0;
  const shape =
    imageCount > 0
      ? `{ images: [${imageCount}] }`
      : rawKeys.length > 0
        ? `{ ${rawKeys.slice(0, 6).join(", ")} }`
        : "unknown";
  return {
    providerRequestId: input.requestId,
    rawKeys,
    imageUrl: input.resolvedImageUrl,
    imageCount,
    hasImageUrl: !!input.resolvedImageUrl,
    responseShape: shape,
  };
}

export function summarizeFalError(error: unknown): FalErrorSummary {
  const rec =
    typeof error === "object" && error !== null
      ? (error as Record<string, unknown>)
      : null;
  const status = rec
    ? ((rec.status as number | string | undefined) ??
      (rec.statusCode as number | string | undefined) ??
      null)
    : null;
  const code = rec
    ? typeof rec.code === "string"
      ? rec.code
      : null
    : null;
  const rawName = error instanceof Error ? error.name : null;
  const rawMessage = error instanceof Error ? error.message : null;
  const rawBody = rec?.body ?? null;
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "unknown";
  return {
    status: status ?? null,
    code,
    message,
    providerError: message,
    rawErrorName: rawName,
    rawErrorMessage: rawMessage,
    rawErrorBody: rawBody,
  };
}

// ============================================================================
// Console logging
// ============================================================================

/** Compact JSON-ish line. Avoids enormous payloads in the server log. */
export function logTraceStage(
  traceId: string,
  stage: string,
  data: Record<string, unknown>
): void {
  if (!isImageEnhanceDebugEnabled()) return;
  try {
    // Hard cap to ~4KB per line to avoid log flooding.
    const json = JSON.stringify(data, null, 0);
    const safe = json.length > 4096 ? `${json.slice(0, 4096)}…` : json;
    console.log(`[image-enhance] ${traceId} ${stage} ${safe}`);
  } catch (error) {
    console.log(
      `[image-enhance] ${traceId} ${stage} <unserializable: ${error instanceof Error ? error.message : String(error)}>`
    );
  }
}
