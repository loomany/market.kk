import {
  buildFashnEditRunBody,
  type FashnEditGenerationMode,
  type FashnEditInput,
  type FashnEditResolution,
  type FashnEditResult,
} from "@/lib/ai/fashnEditSchemas";

const FASHN_API_BASE = "https://api.fashn.ai/v1";
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 90;

function getFashnApiKeyOrThrow(): string {
  const key = process.env.FASHN_API_KEY?.trim();
  if (!key) {
    throw new Error("FASHN_API_KEY is not configured");
  }
  return key;
}

type FashnRunResponse = { id?: string; error?: unknown };
type FashnStatusResponse = {
  id?: string;
  status?: string;
  output?: string[];
  error?: { name?: string; message?: string } | string | null;
};

async function fashnFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const key = getFashnApiKeyOrThrow();
  const res = await fetch(`${FASHN_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const message =
      typeof json === "object" &&
      json !== null &&
      "message" in json &&
      typeof (json as { message: unknown }).message === "string"
        ? (json as { message: string }).message
        : `FASHN API HTTP ${res.status}`;
    throw new Error(message);
  }

  return json as T;
}

export async function runFashnEdit(input: FashnEditInput): Promise<FashnEditResult> {
  if (process.env.AI_MOCK_MODE !== "0") {
    return {
      ok: true,
      imageUrl: input.imageUrl,
      requestId: "mock-fashn-edit",
      rawStatus: "completed",
    };
  }

  try {
    const run = await fashnFetch<FashnRunResponse>("/run", {
      method: "POST",
      body: JSON.stringify(buildFashnEditRunBody(input)),
    });

    const requestId = run.id;
    if (!requestId) {
      return {
        ok: false,
        errorCode: "FASHN_EDIT_NO_REQUEST_ID",
        errorMessage: "FASHN Edit /run returned no prediction id",
      };
    }

    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      const status = await fashnFetch<FashnStatusResponse>(
        `/status/${encodeURIComponent(requestId)}`
      );

      if (status.status === "completed") {
        const imageUrl = status.output?.[0];
        if (!imageUrl) {
          return {
            ok: false,
            requestId,
            errorCode: "FASHN_EDIT_NO_OUTPUT",
            errorMessage: "FASHN Edit completed but returned no output URL",
            rawStatus: status.status,
          };
        }
        return {
          ok: true,
          imageUrl,
          requestId,
          rawStatus: "completed",
        };
      }

      if (status.status === "failed") {
        const err =
          typeof status.error === "object" && status.error !== null
            ? `${status.error.name ?? "Error"}: ${status.error.message ?? "unknown"}`
            : String(status.error ?? "FASHN Edit failed");
        return {
          ok: false,
          requestId,
          errorCode: "FASHN_EDIT_FAILED",
          errorMessage: err,
          rawStatus: status.status,
        };
      }
    }

    return {
      ok: false,
      requestId,
      errorCode: "FASHN_EDIT_TIMEOUT",
      errorMessage: `FASHN Edit timed out after ${(MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS) / 1000}s`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown FASHN Edit error";
    if (message.includes("FASHN_API_KEY")) {
      return {
        ok: false,
        errorCode: "FASHN_API_KEY_MISSING",
        errorMessage: message,
      };
    }
    return {
      ok: false,
      errorCode: "FASHN_EDIT_FAILED",
      errorMessage: message,
    };
  }
}

export function defaultPremiumEditOptions(): {
  resolution: FashnEditResolution;
  generationMode: FashnEditGenerationMode;
} {
  return { resolution: "2k", generationMode: "balanced" };
}
