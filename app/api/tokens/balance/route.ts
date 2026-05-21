import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { tokenUsdRate } from "@/lib/tokens/config";
import { formatTokenBalanceDisplay } from "@/lib/tokens/formatTokens";
import { getGenerationCost, getUserTokenBalance } from "@/lib/tokens/tokenLedger";
import { isValidUserUuid } from "@/lib/tokens/config";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session?.userId) {
    return NextResponse.json(
      { ok: false, errorCode: "UNAUTHORIZED", message: "Not signed in" },
      { status: 401 }
    );
  }

  const localeHeader = request.headers.get("x-vitrina-locale");
  const locale =
    localeHeader === "en" || localeHeader === "kk" || localeHeader === "ru"
      ? localeHeader
      : "ru";

  const balanceTokens = isValidUserUuid(session.userId)
    ? await getUserTokenBalance(session.userId)
    : 0;

  const generationCostTokens = getGenerationCost("default");

  return NextResponse.json({
    ok: true,
    balanceTokens,
    usdRate: tokenUsdRate(),
    generationCostTokens,
    display: formatTokenBalanceDisplay(balanceTokens, locale),
  });
}
