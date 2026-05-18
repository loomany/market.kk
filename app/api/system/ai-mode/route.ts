import { NextResponse } from "next/server";
import { getAiSafetyState } from "@/lib/ai/paidAiGuard";

export const runtime = "nodejs";

export async function GET() {
  const state = getAiSafetyState();

  return NextResponse.json({
    mockMode: state.mockMode,
    paidAiRunsAllowed: state.paidAiRunsAllowed,
    openAiConfigured: state.openAiConfigured,
    falConfigured: state.falConfigured,
    greenApiConfigured: state.greenApiConfigured,
  });
}
