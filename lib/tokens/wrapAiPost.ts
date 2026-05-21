import type { NextResponse } from "next/server";
import { withGenerationBilling } from "@/lib/tokens/generationBilling";
import type { GenerationOperationType } from "@/lib/tokens/tokenLedger";

/** Wraps an AI POST handler with token billing, guest watermark, and spend-after-success. */
export function wrapAiPost(
  request: Request,
  operationType: GenerationOperationType,
  route: string,
  handler: (request: Request) => Promise<NextResponse>
): Promise<NextResponse> {
  return withGenerationBilling({
    request,
    operationType,
    route,
    run: () => handler(request),
  });
}
