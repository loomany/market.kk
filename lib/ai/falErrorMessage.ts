function formatFalDetail(detail: unknown): string | null {
  if (typeof detail === "string" && detail.trim()) return detail.trim();
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "object" && item !== null) {
          const msg = (item as Record<string, unknown>).msg;
          if (typeof msg === "string") return msg;
        }
        return null;
      })
      .filter(Boolean);
    if (parts.length > 0) return parts.join(" ");
  }
  return null;
}

function formatStatusPrefix(status: unknown): string {
  if (status === 422 || status === "422") return "422";
  if (typeof status === "number") return String(status);
  return "";
}

export function falErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;
    const status = record.status ?? record.statusCode;
    const statusPrefix = formatStatusPrefix(status);
    const body = record.body;
    if (typeof body === "object" && body !== null) {
      const bodyRecord = body as Record<string, unknown>;
      const detail = formatFalDetail(bodyRecord.detail);
      if (detail) {
        return statusPrefix ? `${statusPrefix}: ${detail}` : detail;
      }
      const message = bodyRecord.message;
      if (typeof message === "string" && message.trim()) {
        return statusPrefix
          ? `${statusPrefix}: ${message.trim()}`
          : message.trim();
      }
    }
    const message = record.message;
    if (typeof message === "string" && message.trim()) {
      const generic =
        message.trim().toLowerCase() === "unprocessable entity" ||
        message.trim().toLowerCase() === "internal server error";
      if (!generic) {
        return statusPrefix
          ? `${statusPrefix}: ${message.trim()}`
          : message.trim();
      }
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  return "Unknown error";
}

export function isFalContentOrValidationError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("422") ||
    m.includes("unprocessable entity") ||
    m.includes("no_media_generated") ||
    m.includes("validating the input") ||
    m.includes("did not generate the expected output") ||
    m.includes("unsafe content") ||
    m.includes("content policy") ||
    m.includes("safety") ||
    m.includes("moderation")
  );
}

export function isFalTimeoutError(message: string): boolean {
  return message.toLowerCase().includes("timed out after");
}

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
