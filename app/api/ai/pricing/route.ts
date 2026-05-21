import { NextResponse } from "next/server";
import { z } from "zod";
import { estimateSceneCostUsd, estimateVideoOrThrow } from "@/lib/ai/pricing";

export const runtime = "nodejs";

const pricingRequestSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("video"),
    variantId: z.enum([
      "kling-v3-standard",
      "kling-v3-pro",
      "kling-v2.6-pro",
      "kling-v1.5-pro",
      "kling-v2.6-motion-control",
      "kling-v2.6-motion-pro",
      "kling-v3-motion-standard",
      "minimax-hailuo-02",
      "veo-3.1",
      "veo-3.1-fast",
      "veo-3-fast",
    ]),
    durationSeconds: z.number().int().min(3).max(15),
  }),
  z.object({
    type: z.literal("scene"),
    mode: z.enum(["exact-background", "creative-scene"]),
  }),
]);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errorCode: "VALIDATION_ERROR", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = pricingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Invalid pricing request",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const estimatedCost =
    data.type === "video"
      ? estimateVideoOrThrow(data.variantId, data.durationSeconds)
      : estimateSceneCostUsd(data.mode);

  return NextResponse.json({
    ok: true,
    estimatedCost,
    currency: "USD",
    source: "local-estimate",
  });
}
