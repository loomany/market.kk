import { NextResponse } from "next/server";
import { buildLlmsFullTxt } from "@/lib/seo/llmsContent";

export function GET() {
  const text = buildLlmsFullTxt();

  return new NextResponse(text, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
