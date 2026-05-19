import { NextResponse } from "next/server";
import { analyzeProductDescriptionFile } from "@/lib/ai/analyzeProductDescription";
import {
  isConfidentProductAnalysis,
  PRODUCT_ANALYSIS_CONFIDENCE_THRESHOLD,
} from "@/lib/ai/productDescriptionAnalysisSchemas";
import { validateImageFile } from "@/lib/ai/imageConstraints";
import {
  isPaidAiGuardError,
  paidAiGuardResponse,
} from "@/lib/ai/paidAiGuard";
import { MAX_PRODUCT_PHOTOS } from "@/lib/studio/productPhotos";

export const runtime = "nodejs";

const ROUTE_ID = "/api/ai/analyze-product-description";

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, errorCode: "VALIDATION_ERROR", message: "Invalid form data" },
      { status: 400 }
    );
  }

  const files: File[] = [];
  for (const entry of formData.getAll("productImageFile")) {
    if (!(entry instanceof File) || entry.size === 0) continue;
    try {
      validateImageFile(entry, "Product image");
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: "VALIDATION_ERROR",
          message:
            error instanceof Error ? error.message : "Invalid product image",
        },
        { status: 400 }
      );
    }
    files.push(entry);
  }

  if (files.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Загрузите фото товара.",
      },
      { status: 400 }
    );
  }

  if (files.length > MAX_PRODUCT_PHOTOS) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Загрузите одно фото товара за раз.",
      },
      { status: 400 }
    );
  }

  const categoryContextHint =
    formData.get("categoryContext")?.toString().trim() || undefined;
  const previousUserDescription =
    formData.get("previousUserDescription")?.toString().trim() || undefined;

  try {
    const { analysis, usedVision, debug } = await analyzeProductDescriptionFile({
      file: files[0]!,
      categoryContextHint,
      previousUserDescription,
    });
    const appliedSettingsRecommended = isConfidentProductAnalysis(
      analysis.confidence
    );

    if (debug.correctedBySafetyRule) {
      console.info(`[${ROUTE_ID}] safety rule applied`, debug);
    }

    return NextResponse.json({
      ok: true,
      analysis,
      productAnalysisJson: analysis,
      usedVision,
      debug,
      appliedSettingsRecommended,
      message: !usedVision
        ? "Демо-режим или vision недоступен — проверьте параметры вручную."
        : !appliedSettingsRecommended
          ? `Уверенность ниже ${Math.round(PRODUCT_ANALYSIS_CONFIDENCE_THRESHOLD * 100)}% — проверьте сценарий и тип товара.`
          : undefined,
    });
  } catch (error) {
    if (isPaidAiGuardError(error)) {
      return NextResponse.json(paidAiGuardResponse(error), {
        status: error.status,
      });
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to analyze product description";
    console.error(`[${ROUTE_ID}]`, message);

    return NextResponse.json(
      {
        ok: false,
        errorCode: "PRODUCT_ANALYSIS_FAILED",
        message: "Не удалось проанализировать фото товара. Попробуйте ещё раз.",
      },
      { status: 500 }
    );
  }
}
