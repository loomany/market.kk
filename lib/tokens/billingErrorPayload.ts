export type TokenBillingCtaHref = {
  label: string;
  href: string;
};

export type TokenBillingCtaLogin = {
  label: string;
  action: "login";
};

export type TokenBillingCta = TokenBillingCtaHref | TokenBillingCtaLogin;

export type TokenBillingErrorCode =
  | "INSUFFICIENT_TOKENS"
  | "GUEST_GENERATION_LIMIT";

export type TokenBillingErrorPayload = {
  errorCode: TokenBillingErrorCode;
  title: string;
  message: string;
  cta?: TokenBillingCta | TokenBillingCta[];
  balanceTokens?: number;
  requiredTokens?: number;
};

const BILLING_CODES: ReadonlySet<string> = new Set([
  "INSUFFICIENT_TOKENS",
  "GUEST_GENERATION_LIMIT",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseCta(raw: unknown): TokenBillingCta | TokenBillingCta[] | undefined {
  if (!raw) return undefined;
  const list = Array.isArray(raw) ? raw : [raw];
  const parsed: TokenBillingCta[] = [];
  for (const item of list) {
    if (!isRecord(item) || typeof item.label !== "string") continue;
    if (item.action === "login") {
      parsed.push({ label: item.label, action: "login" });
      continue;
    }
    if (typeof item.href === "string") {
      parsed.push({ label: item.label, href: item.href });
    }
  }
  return parsed.length === 0 ? undefined : parsed.length === 1 ? parsed[0]! : parsed;
}

export function parseTokenBillingError(
  data: unknown
): TokenBillingErrorPayload | null {
  if (!isRecord(data) || data.ok !== false) return null;
  const errorCode = data.errorCode;
  if (typeof errorCode !== "string" || !BILLING_CODES.has(errorCode)) {
    return null;
  }
  const title = typeof data.title === "string" ? data.title : "";
  const message = typeof data.message === "string" ? data.message : "";
  if (!title && !message) return null;

  return {
    errorCode: errorCode as TokenBillingErrorCode,
    title: title || message,
    message: message || title,
    cta: parseCta(data.cta),
    balanceTokens:
      typeof data.balanceTokens === "number" ? data.balanceTokens : undefined,
    requiredTokens:
      typeof data.requiredTokens === "number" ? data.requiredTokens : undefined,
  };
}

export function tryApplyTokenBillingError(
  data: unknown,
  onBilling: (payload: TokenBillingErrorPayload) => void
): boolean {
  const payload = parseTokenBillingError(data);
  if (!payload) return false;
  onBilling(payload);
  return true;
}

export class TokenBillingBlockedError extends Error {
  readonly payload: TokenBillingErrorPayload;

  constructor(payload: TokenBillingErrorPayload) {
    super(payload.message);
    this.name = "TokenBillingBlockedError";
    this.payload = payload;
  }
}

export function throwIfTokenBillingError(data: unknown): void {
  const payload = parseTokenBillingError(data);
  if (payload) throw new TokenBillingBlockedError(payload);
}

export function openVitrinaLoginModal(): void {
  window.dispatchEvent(new Event("vitrina-open-login"));
}
