import "server-only";

export type PaidAiProvider = "fal" | "openai" | "green-api";

export type PaidAiGuardInput = {
  provider: PaidAiProvider;
  route: string;
  estimatedCostUsd?: number;
};

export type AiSafetyState = {
  mockMode: boolean;
  paidAiRunsAllowed: boolean;
  maxAiTestSpendUsd: number | null;
  openAiConfigured: boolean;
  falConfigured: boolean;
  greenApiConfigured: boolean;
};

export class PaidAiGuardError extends Error {
  errorCode: "PAID_AI_RUNS_DISABLED" | "BUDGET_EXCEEDED";
  status: number;
  provider: PaidAiProvider;
  route: string;
  estimatedCostUsd?: number;
  maxAiTestSpendUsd?: number;

  constructor(
    errorCode: PaidAiGuardError["errorCode"],
    input: PaidAiGuardInput,
    message: string,
    options?: { status?: number; maxAiTestSpendUsd?: number }
  ) {
    super(message);
    this.name = "PaidAiGuardError";
    this.errorCode = errorCode;
    this.status = options?.status ?? 402;
    this.provider = input.provider;
    this.route = input.route;
    this.estimatedCostUsd = input.estimatedCostUsd;
    this.maxAiTestSpendUsd = options?.maxAiTestSpendUsd;
  }
}

export function isMockMode() {
  return process.env.AI_MOCK_MODE !== "0";
}

export function paidAiRunsAllowed() {
  return process.env.ALLOW_PAID_AI_RUNS === "true";
}

export function maxAiTestSpendUsd() {
  const raw = process.env.MAX_AI_TEST_SPEND_USD;
  if (!raw) return null;

  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function getAiSafetyState(): AiSafetyState {
  return {
    mockMode: isMockMode(),
    paidAiRunsAllowed: paidAiRunsAllowed(),
    maxAiTestSpendUsd: maxAiTestSpendUsd(),
    openAiConfigured: Boolean(process.env.OPENAI_API_KEY),
    falConfigured: Boolean(process.env.FAL_KEY),
    greenApiConfigured: Boolean(
      process.env.GREEN_API_INSTANCE_ID && process.env.GREEN_API_TOKEN
    ),
  };
}

export function assertPaidAiAllowed(input: PaidAiGuardInput) {
  if (isMockMode() || !paidAiRunsAllowed()) {
    throw new PaidAiGuardError(
      "PAID_AI_RUNS_DISABLED",
      input,
      "Платные AI-запросы отключены. Включите ALLOW_PAID_AI_RUNS=true только после утверждения бюджета."
    );
  }

  const max = maxAiTestSpendUsd();
  if (
    typeof input.estimatedCostUsd === "number" &&
    max !== null &&
    input.estimatedCostUsd > max
  ) {
    throw new PaidAiGuardError(
      "BUDGET_EXCEEDED",
      input,
      "Оценочная стоимость выше разрешённого бюджета. Увеличьте MAX_AI_TEST_SPEND_USD только после approval.",
      { maxAiTestSpendUsd: max }
    );
  }
}

export function isPaidAiGuardError(error: unknown): error is PaidAiGuardError {
  return error instanceof PaidAiGuardError;
}

export function paidAiGuardResponse(error: PaidAiGuardError) {
  return {
    ok: false,
    errorCode: error.errorCode,
    message: error.message,
    provider: error.provider,
    route: error.route,
    estimatedCostUsd: error.estimatedCostUsd,
    maxAiTestSpendUsd: error.maxAiTestSpendUsd,
  };
}
