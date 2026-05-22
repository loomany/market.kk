import type { NextResponse } from "next/server";
import { withGenerationBilling } from "@/lib/tokens/generationBilling";
import type { GenerationOperationType } from "@/lib/tokens/tokenLedger";

export type WrapAiPostOptions = {
  resolveCost?: (request: Request) => number | Promise<number>;
};

/** Wraps an AI POST handler with token billing, guest watermark, and spend-after-success. */
export function wrapAiPost(
  request: Request,
  operationType: GenerationOperationType,
  route: string,
  handler: (request: Request) => Promise<NextResponse>,
  options?: WrapAiPostOptions
): Promise<NextResponse> {
  return withGenerationBilling({
    request,
    operationType,
    route,
    resolveCost: options?.resolveCost,
    run: () => handler(request),
  });
}
