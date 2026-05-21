import "server-only";
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { isMockMode } from "@/lib/ai/paidAiGuard";
import { applyVitrinaWatermarkToUrl } from "@/lib/images/applyVitrinaWatermark";
import { getFalClientOrThrow } from "@/lib/ai/falClient";
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

export type GenerationBillingMode = "skip" | "guest_free" | "paid_token";

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
      "Для этой AI-операции нужен 1 токен. Пополните баланс, чтобы продолжить.",
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
      "This AI operation requires 1 token. Top up your balance to continue.",
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
      "Бұл AI операциясына 1 токен керек. Жалғастыру үшін балансты толтырыңыз.",
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

export async function beginGenerationBilling(params: {
  request: Request;
  operationType: GenerationOperationType;
  route: string;
}): Promise<
  | { ok: true; ctx: GenerationBillingContext }
  | { ok: false; response: NextResponse }
> {
  const locale = resolveLocale(params.request);
  const copy = billingCopy(locale);
  const costTokens = getGenerationCost(params.operationType);

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
    if (balance < costTokens) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            ok: false,
            errorCode: "INSUFFICIENT_TOKENS",
            title: copy.insufficientTitle,
            message: copy.insufficientBody,
            cta: { label: copy.topUp, href: `/${locale}/tokens` },
            balanceTokens: balance,
            requiredTokens: costTokens,
          },
          { status: 402 }
        ),
      };
    }

    return {
      ok: true,
      ctx: {
        mode: "paid_token",
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

async function watermarkPayloadUrls(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const clone = structuredClone(body);

  if (typeof clone.image === "object" && clone.image && "url" in (clone.image as object)) {
    const image = clone.image as { url: string };
    image.url = await watermarkAndUpload(image.url);
  }

  if (typeof clone.imageUrl === "string" && clone.imageUrl) {
    clone.imageUrl = await watermarkAndUpload(clone.imageUrl);
  }

  if (Array.isArray(clone.images)) {
    clone.images = await Promise.all(
      (clone.images as { url?: string }[]).map(async (item) => {
        if (!item?.url) return item;
        return { ...item, url: await watermarkAndUpload(item.url) };
      })
    );
  }

  if (typeof clone.imageUrl === "string" && clone.imageUrl) {
    clone.imageUrl = await watermarkAndUpload(clone.imageUrl);
  }

  return clone;
}

async function watermarkAndUpload(url: string): Promise<string> {
  const buffer = await applyVitrinaWatermarkToUrl(url);
  const fal = getFalClientOrThrow({
    provider: "fal",
    route: "/tokens/watermark",
  });
  const blob = new Blob([new Uint8Array(buffer)], { type: "image/jpeg" });
  const file = new File([blob], "vitrina-watermarked.jpg", { type: "image/jpeg" });
  return fal.storage.upload(file);
}

export async function finalizeGenerationBilling(
  ctx: GenerationBillingContext,
  responseBody: Record<string, unknown> & { ok?: boolean }
): Promise<Record<string, unknown>> {
  if (responseBody._skipBilling === true) {
    const { _skipBilling: _, ...rest } = responseBody;
    return rest;
  }

  if (ctx.mode === "skip" || !responseBody.ok) {
    return responseBody;
  }

  if (ctx.mode === "guest_free") {
    const watermarked = await watermarkPayloadUrls(responseBody);
    await markGuestGenerationUsed();
    return watermarked;
  }

  if (ctx.mode === "paid_token" && ctx.userId && !ctx.spendCommitted) {
    const result = await spendUserTokens({
      userId: ctx.userId,
      tokens: ctx.costTokens,
      metadata: { route: ctx.route, operation: ctx.operationType },
    });
    if (!result.spent) {
      return {
        ok: false,
        errorCode: "INSUFFICIENT_TOKENS",
        message: billingCopy(ctx.locale).insufficientBody,
        cta: { label: billingCopy(ctx.locale).topUp, href: `/${ctx.locale}/tokens` },
      };
    }
    ctx.spendCommitted = true;
  }

  return responseBody;
}

export async function withGenerationBilling(
  params: {
    request: Request;
    operationType: GenerationOperationType;
    route: string;
    run: () => Promise<NextResponse>;
  }
): Promise<NextResponse> {
  const access = await beginGenerationBilling(params);
  if (!access.ok) return access.response;

  const response = await params.run();
  let body: Record<string, unknown>;
  try {
    body = (await response.json()) as Record<string, unknown>;
  } catch {
    return response;
  }

  const finalized = await finalizeGenerationBilling(access.ctx, body);
  return NextResponse.json(finalized, { status: response.status });
}
