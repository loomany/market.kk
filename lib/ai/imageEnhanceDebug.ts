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
 *  and above 0.10 BPP for JPEG; a solid-color frame compresses to nearly 0. */
const UNIFORM_BPP_PNG = 0.005;
const UNIFORM_BPP_JPEG = 0.01;
/** Absolute threshold: any 1024+ px image under ~2 KB is suspicious. */
const UNIFORM_ABS_BYTES = 2 * 1024;

export async function probeOutputImage(
  url: string
): Promise<OutputImageCheck> {
  if (!url || typeof url !== "string") {
    return {
      ok: false,
      status: null,
      contentType: null,
      contentLength: null,
      width: null,
      height: null,
      sniffedFormat: null,
      bytesPerPixel: null,
      isProbablyUniform: null,
      isProbablyBlack: null,
      fetchedVia: "none",
      error: "empty url",
    };
  }
  // Pull a small chunk so we can do magic-byte + dimension sniff.
  const got = await timedFetch(url, {
    method: "GET",
    headers: { Range: `bytes=0-${PROBE_MAX_BYTES - 1}` },
  });
  if ("error" in got) {
    return {
      ok: false,
      status: null,
      contentType: null,
      contentLength: null,
      width: null,
      height: null,
      sniffedFormat: null,
      bytesPerPixel: null,
      isProbablyUniform: null,
      isProbablyBlack: null,
      fetchedVia: "range-get",
      error: got.error,
    };
  }
  if (!got.ok && got.status !== 206) {
    return {
      ok: false,
      status: got.status,
      contentType: got.headers.get("content-type"),
      contentLength: readContentLength(got),
      width: null,
      height: null,
      sniffedFormat: null,
      bytesPerPixel: null,
      isProbablyUniform: null,
      isProbablyBlack: null,
      fetchedVia: "range-get",
      error: `HTTP ${got.status}`,
    };
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
    // We can't tell colour without a decoder — treat "uniform" as the most
    // likely candidate for the user-visible "black screen" symptom.
    isProbablyBlack: isProbablyUniform,
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
