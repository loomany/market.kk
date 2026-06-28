import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { assertPaidAiAllowed } from "@/lib/ai/paidAiGuard";
import { sendEvolutionTextMessage, isEvolutionConfigured } from "@/lib/auth/evolution-api";
import {
  getWhatsAppProvider,
  isWhatsAppSendConfigured,
  type WhatsAppProvider,
} from "@/lib/auth/whatsapp-provider";
import { maskPhoneForLog } from "@/lib/auth/whatsapp-phone";

export { getWhatsAppProvider, isWhatsAppSendConfigured, type WhatsAppProvider };

export type StoredAuthCode = {
  phone: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
  consumedAt?: number;
  createdAt: number;
};

const memoryCodes = new Map<string, StoredAuthCode>();
const sendBuckets = new Map<string, { count: number; resetAt: number; lastSentAt: number }>();

export function normalizePhone(phone: string) {
  const trimmed = phone.trim().replace(/[^\d+]/g, "");
  if (!trimmed) return "";

  if (trimmed.startsWith("+")) return trimmed;

  if (trimmed.startsWith("8") && trimmed.length === 11) {
    return `+7${trimmed.slice(1)}`;
  }

  if (trimmed.startsWith("7") && trimmed.length === 11) {
    return `+${trimmed}`;
  }

  return `+${trimmed.replace(/^\+/, "")}`;
}

export function createSixDigitCode() {
  if (process.env.AI_MOCK_MODE !== "0") return "111111";
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashCode(phone: string, code: string) {
  return createHash("sha256")
    .update(`${phone}:${code}:${process.env.SUPABASE_SERVICE_ROLE_KEY ?? "local"}`)
    .digest("hex");
}

export function verifyCodeHash(phone: string, code: string, codeHash: string) {
  const expected = Buffer.from(hashCode(phone, code));
  const actual = Buffer.from(codeHash);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function authCodeTtlMs() {
  const minutes = Number(process.env.WHATSAPP_AUTH_CODE_TTL_MINUTES ?? "10");
  return (Number.isFinite(minutes) ? minutes : 10) * 60 * 1000;
}

export function saveMemoryCode(phone: string, code: string) {
  const now = Date.now();
  const stored: StoredAuthCode = {
    phone,
    codeHash: hashCode(phone, code),
    expiresAt: now + authCodeTtlMs(),
    attempts: 0,
    createdAt: now,
  };
  memoryCodes.set(phone, stored);
  return stored;
}

export function checkCodeSendRateLimit(phone: string, ip: string) {
  const now = Date.now();
  const key = `${phone}:${ip}`;
  const current = sendBuckets.get(key);

  if (current && current.lastSentAt + 60_000 > now) {
    return {
      ok: false as const,
      retryAfterSeconds: Math.ceil((current.lastSentAt + 60_000 - now) / 1000),
    };
  }

  if (current && current.resetAt > now && current.count >= 5) {
    return {
      ok: false as const,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  sendBuckets.set(key, {
    count: current && current.resetAt > now ? current.count + 1 : 1,
    resetAt: current && current.resetAt > now ? current.resetAt : now + 60 * 60 * 1000,
    lastSentAt: now,
  });

  return { ok: true as const };
}

export function getMemoryCode(phone: string) {
  return memoryCodes.get(phone);
}

export function consumeMemoryCode(phone: string, code: string) {
  const stored = memoryCodes.get(phone);
  if (!stored) return { ok: false as const, error: "code_missing" };
  if (stored.consumedAt) return { ok: false as const, error: "code_consumed" };
  if (stored.expiresAt < Date.now()) return { ok: false as const, error: "code_expired" };
  if (stored.attempts >= 5) return { ok: false as const, error: "too_many_attempts" };
  stored.attempts += 1;
  if (!verifyCodeHash(phone, code, stored.codeHash)) {
    return { ok: false as const, error: "invalid_code" };
  }
  stored.consumedAt = Date.now();
  return { ok: true as const };
}


/** Green API host for this instance (e.g. https://7107.api.greenapi.com). */
export function getGreenApiBaseUrl(instanceId: string) {
  const fromEnv = process.env.GREEN_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, "");
  }

  const prefix = instanceId.slice(0, 4);
  if (/^\d{4}$/.test(prefix)) {
    return `https://${prefix}.api.greenapi.com`;
  }

  return "https://api.green-api.com";
}

export async function sendWhatsAppCode(phone: string, code: string) {
  if (process.env.AI_MOCK_MODE !== "0") {
    return { ok: true, delivery: "mock" as const };
  }

  let provider: WhatsAppProvider;
  try {
    provider = getWhatsAppProvider();
  } catch {
    throw new Error("WHATSAPP_PROVIDER_INVALID");
  }

  if (provider === "green") {
    const instanceId = process.env.GREEN_API_INSTANCE_ID;
    const token = process.env.GREEN_API_TOKEN;
    if (!instanceId || !token) {
      return { ok: true, delivery: "mock" as const };
    }

    assertPaidAiAllowed({
      provider: "green-api",
      route: "/api/auth/whatsapp/send-code",
    });

    const baseUrl = getGreenApiBaseUrl(instanceId);
    const chatId = `${phone.replace(/\D/g, "")}@c.us`;
    const message = `Vitrina AI: код входа ${code}. Он действует 10 минут.`;
    const res = await fetch(
      `${baseUrl}/waInstance${instanceId}/sendMessage/${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, message }),
      }
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[green-api] sendMessage failed", {
        provider: "green",
        phone_masked: maskPhoneForLog(phone),
        status: "fail",
        http_status: res.status,
        detail: detail.slice(0, 200),
      });
      return { ok: false, delivery: "green-api" as const };
    }

    console.info("[green-api] sendMessage ok", {
      provider: "green",
      phone_masked: maskPhoneForLog(phone),
      status: "success",
    });
    return { ok: true, delivery: "green-api" as const };
  }

  if (!isEvolutionConfigured()) {
    throw new Error("EVOLUTION_NOT_CONFIGURED");
  }

  assertPaidAiAllowed({
    provider: "green-api",
    route: "/api/auth/whatsapp/send-code",
  });

  const message = `Vitrina AI: код входа ${code}. Он действует 10 минут.`;
  const result = await sendEvolutionTextMessage(phone, message);
  if (!result.ok) {
    return { ok: false, delivery: "evolution" as const };
  }

  return { ok: true, delivery: "evolution" as const };
}
