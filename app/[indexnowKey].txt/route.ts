import { NextResponse } from "next/server";
import { getIndexNowKey } from "@/lib/seo/indexNow";

export function GET(request: Request) {
  const indexnowKey = new URL(request.url).pathname
    .split("/")
    .pop()
    ?.replace(/\.txt$/, "");
  const configuredKey = getIndexNowKey();

  if (!configuredKey || indexnowKey !== configuredKey) {
    return new NextResponse("IndexNow key is not configured.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return new NextResponse(configuredKey, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
