import { NextResponse } from "next/server";
import { buildLlmsTxt } from "@/lib/seo/llmsContent";

export function GET() {
  const text = buildLlmsTxt();

  return new NextResponse(text, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
