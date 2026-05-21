import { NextResponse } from "next/server";
import {
  analyzeProductAngleFiles,
  mockProductAnglesFromCount,
} from "@/lib/ai/analyzeProductAngle";
import { validateImageFile } from "@/lib/ai/imageConstraints";
import {
  isPaidAiGuardError,
  paidAiGuardResponse,
} from "@/lib/ai/paidAiGuard";
import { MAX_CLOTHING_PRODUCT_SET } from "@/lib/studio/productPhotos";
import { wrapAiPost } from "@/lib/tokens/wrapAiPost";

export const runtime = "nodejs";

const ROUTE_ID = "/api/ai/analyze-product-angles";

export async function POST(request: Request) {
  return wrapAiPost(request, "angles-analyze", ROUTE_ID, handleAnalyzeProductAnglesPost);
}

async function handleAnalyzeProductAnglesPost(request: Request) {
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
        message: "Загрузите хотя бы одно фото товара.",
      },
      { status: 400 }
    );
  }

  if (files.length > MAX_CLOTHING_PRODUCT_SET) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: `Можно загрузить до ${MAX_CLOTHING_PRODUCT_SET} фото за раз.`,
      },
      { status: 400 }
    );
  }

  try {
    const { angles, usedPresetFallback } = await analyzeProductAngleFiles(files);
    return NextResponse.json({
      ok: true,
      angles,
      usedPresetFallback,
      message: usedPresetFallback
        ? "Ракурсы подставлены по каталогу (vision недоступен). Можно продолжать генерацию."
        : undefined,
    });
  } catch (error) {
    if (isPaidAiGuardError(error)) {
      return NextResponse.json(paidAiGuardResponse(error), {
        status: error.status,
      });
    }

    const message =
      error instanceof Error ? error.message : "Failed to analyze product angles";
    console.error(`[${ROUTE_ID}]`, message);

    return NextResponse.json({
      ok: true,
      angles: mockProductAnglesFromCount(files.length),
      usedPresetFallback: true,
      message:
        "Не удалось разобрать фото через vision — подставлены стандартные ракурсы. Можно продолжать.",
    });
  }
}
