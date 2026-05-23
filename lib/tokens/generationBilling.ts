import "server-only";
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { isMockMode } from "@/lib/ai/paidAiGuard";
import { watermarkGenerationPayload } from "@/lib/images/watermarkGenerationPayload";
import {
  getGenerationCost,
  spendUserTokens,
  type GenerationOperationType,
} from "@/lib/tokens/tokenLedger";
import {
  getGuestGenerationState,
  guestGenerationRemaining,
  markGuestGenerationUsed,
} from "@/lib/tokens/guestGeneration";
import { guestFreeGenerationLimit, isValidUserUuid } from "@/lib/tokens/config";
import { getUserTokenBalance } from "@/lib/tokens/tokenLedger";
import type { IndexableLocale } from "@/lib/i18n/localeConfig";
import { assertLocale, indexableLocales } from "@/lib/i18n/localeConfig";
import { formatTokenChargeNumber } from "@/lib/tokens/formatTokens";
import { normalizeTokenAmount } from "@/lib/tokens/tokenAmount";
import { isClothingPhotoPipelineRequest } from "@/lib/tokens/clothingPipelineBilling";
import { patchGenerationJobRequestPayload } from "@/lib/studio/generationJobDb";
import {
  extractClientAssetIdFromRequest,
  persistGenerationJobOutcome,
} from "@/lib/studio/persistGenerationJobOutcome";

export type GenerationBillingMode =
  | "skip"
  | "guest_free"
  | "paid_token"
  /** Balance checked; spend happens on the final pipeline step (e.g. try-on). */
  | "pipeline_deferred";

export type GenerationBillingContext = {
  mode: GenerationBillingMode;
  userId?: string;
  operationType: GenerationOperationType;
  route: string;
  costTokens: number;
  locale: IndexableLocale;
  spendCommitted: boolean;
};

const ERROR_COPY = {
  ru: {
    insufficientTitle: "Недостаточно токенов",
    insufficientBody:
      "Для этой AI-операции нужно {required} токена. Пополните баланс, чтобы продолжить.",
    topUp: "Пополнить баланс",
    guestUsedTitle: "Нужна регистрация",
    guestUsedBody:
      "Займёт около 10 секунд через WhatsApp. После входа сохранятся все загруженные фото и настройки.",
    login: "Войти",
    buyTokens: "Купить токены",
  },
  en: {
    insufficientTitle: "Not enough tokens",
    insufficientBody:
      "This AI operation requires {required} tokens. Top up your balance to continue.",
    topUp: "Top up balance",
    guestUsedTitle: "Sign in required",
    guestUsedBody:
      "WhatsApp sign-in takes about 10 seconds. Your uploads and settings will stay as they are.",
    login: "Sign in",
    buyTokens: "Buy tokens",
  },
  kk: {
    insufficientTitle: "Токен жеткіліксіз",
    insufficientBody:
      "Бұл AI операциясына {required} токен керек. Жалғастыру үшін балансты толтырыңыз.",
    topUp: "Балансты толтыру",
    guestUsedTitle: "Тіркелу қажет",
    guestUsedBody:
      "WhatsApp арқылы ~10 секунд. Жүктелген фото мен баптаулар сақталады.",
    login: "Кіру",
    buyTokens: "Токен сатып алу",
  },
} as const;

function resolveLocale(request: Request): IndexableLocale {
  const header = request.headers.get("x-vitrina-locale");
  const fromHeader = header ? assertLocale(header) : null;
  if (fromHeader && indexableLocales.includes(fromHeader as IndexableLocale)) {
    return fromHeader as IndexableLocale;
  }
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const path = new URL(referer).pathname;
      const segment = path.split("/").filter(Boolean)[0];
      const fromPath = segment ? assertLocale(segment) : null;
      if (fromPath && indexableLocales.includes(fromPath as IndexableLocale)) {
        return fromPath as IndexableLocale;
      }
    } catch {
      /* ignore */
    }
  }
  return "ru";
}

function billingCopy(locale: IndexableLocale) {
  return ERROR_COPY[locale];
}

function insufficientMessage(locale: IndexableLocale, requiredTokens: number): string {
  const required = formatTokenChargeNumber(requiredTokens);
  return billingCopy(locale).insufficientBody.replace("{required}", required);
}

function insufficientResponse(
  locale: IndexableLocale,
  balance: number,
  costTokens: number
): NextResponse {
  const copy = billingCopy(locale);
  return NextResponse.json(
    {
      ok: false,
      errorCode: "INSUFFICIENT_TOKENS",
      title: copy.insufficientTitle,
      message: insufficientMessage(locale, costTokens),
      cta: { label: copy.topUp, href: `/${locale}/tokens` },
      balanceTokens: balance,
      requiredTokens: costTokens,
    },
    { status: 402 }
  );
}

async function resolveOperationCostTokens(
  request: Request,
  operationType: GenerationOperationType,
  resolveCost?: (request: Request) => number | Promise<number>
): Promise<number> {
  if (resolveCost) {
    const raw = await resolveCost(request);
    const normalized = normalizeTokenAmount(raw);
    if (normalized > 0) return normalized;
  }
  return normalizeTokenAmount(getGenerationCost(operationType));
}

function shouldDeferPipelineSpend(request: Request): boolean {
  return isClothingPhotoPipelineRequest(request);
}

export async function beginGenerationBilling(params: {
  request: Request;
  operationType: GenerationOperationType;
  route: string;
  resolveCost?: (request: Request) => number | Promise<number>;
}): Promise<
  | { ok: true; ctx: GenerationBillingContext }
  | { ok: false; response: NextResponse }
> {
  const locale = resolveLocale(params.request);
  const copy = billingCopy(locale);
  const costTokens = await resolveOperationCostTokens(
    params.request,
    params.operationType,
    params.resolveCost
  );
  const deferSpend = shouldDeferPipelineSpend(params.request);

  if (isMockMode()) {
    return {
      ok: true,
      ctx: {
        mode: "skip",
        operationType: params.operationType,
        route: params.route,
        costTokens,
        locale,
        spendCommitted: false,
      },
    };
  }

  const session = await getCurrentSession();

  if (session?.userId && isValidUserUuid(session.userId)) {
    const balance = await getUserTokenBalance(session.userId);
    if (costTokens > 0 && balance + 1e-6 < costTokens) {
      return { ok: false, response: insufficientResponse(locale, balance, costTokens) };
    }

    const mode: GenerationBillingMode = deferSpend
      ? "pipeline_deferred"
      : "paid_token";

    return {
      ok: true,
      ctx: {
        mode,
        userId: session.userId,
        operationType: params.operationType,
        route: params.route,
        costTokens,
        locale,
        spendCommitted: false,
      },
    };
  }

  const guestLimit = guestFreeGenerationLimit();
  if (guestLimit > 0) {
    const guest = await getGuestGenerationState();
    if (guestGenerationRemaining(guest) <= 0) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            ok: false,
            errorCode: "GUEST_GENERATION_LIMIT",
            title: copy.guestUsedTitle,
            message: copy.guestUsedBody,
            cta: [{ label: copy.login, action: "login" as const }],
          },
          { status: 402 }
        ),
      };
    }

    return {
      ok: true,
      ctx: {
        mode: "guest_free",
        operationType: params.operationType,
        route: params.route,
        costTokens,
        locale,
        spendCommitted: false,
      },
    };
  }

  return {
    ok: false,
    response: NextResponse.json(
      {
        ok: false,
        errorCode: "GUEST_LOGIN_REQUIRED",
        title: copy.guestUsedTitle,
        message: copy.guestUsedBody,
        cta: [{ label: copy.login, action: "login" as const }],
      },
      { status: 402 }
    ),
  };
}

export async function finalizeGenerationBilling(
  ctx: GenerationBillingContext,
  responseBody: Record<string, unknown> & { ok?: boolean }
): Promise<Record<string, unknown>> {
  if (responseBody._skipBilling === true) {
    const { _skipBilling: _, ...rest } = responseBody;
    return rest;
  }

  if (
    ctx.mode === "skip" ||
    ctx.mode === "pipeline_deferred" ||
    !responseBody.ok
  ) {
    return responseBody;
  }

  if (ctx.mode === "guest_free") {
    const watermarked = await watermarkGenerationPayload(responseBody);
    await markGuestGenerationUsed();
    return watermarked;
  }

  if (ctx.mode === "paid_token" && ctx.userId && !ctx.spendCommitted) {
    if (ctx.costTokens <= 0) {
      return responseBody;
    }
    const result = await spendUserTokens({
      userId: ctx.userId,
      tokens: ctx.costTokens,
      metadata: { route: ctx.route, operation: ctx.operationType },
    });
    if (!result.spent) {
      return {
        ok: false,
        errorCode: "INSUFFICIENT_TOKENS",
        message: insufficientMessage(ctx.locale, ctx.costTokens),
        cta: { label: billingCopy(ctx.locale).topUp, href: `/${ctx.locale}/tokens` },
        requiredTokens: ctx.costTokens,
      };
    }
    ctx.spendCommitted = true;
  }

  return responseBody;
}

export async function withGenerationBilling(params: {
  request: Request;
  operationType: GenerationOperationType;
  route: string;
  run: () => Promise<NextResponse>;
  resolveCost?: (request: Request) => number | Promise<number>;
}): Promise<NextResponse> {
  const access = await beginGenerationBilling(params);
  if (!access.ok) return access.response;

  const clientAssetId = await extractClientAssetIdFromRequest(params.request);
  if (
    clientAssetId &&
    access.ctx.userId &&
    access.ctx.mode === "guest_free"
  ) {
    await patchGenerationJobRequestPayload(access.ctx.userId, clientAssetId, {
      applyWatermark: true,
    });
  }

  const response = await params.run();
  let body: Record<string, unknown>;
  try {
    body = (await response.json()) as Record<string, unknown>;
  } catch {
    return response;
  }

  const finalized = await finalizeGenerationBilling(access.ctx, body);

  if (
    clientAssetId &&
    access.ctx.userId &&
    access.ctx.spendCommitted &&
    finalized.ok === true
  ) {
    await patchGenerationJobRequestPayload(access.ctx.userId, clientAssetId, {
      billingSpent: true,
    });
  }

  if (clientAssetId) {
    await persistGenerationJobOutcome(clientAssetId, finalized);
  }

  return NextResponse.json(finalized, { status: response.status });
}
