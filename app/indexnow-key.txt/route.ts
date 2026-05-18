import { NextResponse } from "next/server";
import { getIndexNowKey } from "@/lib/seo/indexNow";

export function GET() {
  return new NextResponse(getIndexNowKey() || "INDEXNOW_KEY_NOT_SET", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
