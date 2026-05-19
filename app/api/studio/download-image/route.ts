import { NextResponse } from "next/server";
import { isDownloadableImageUrl } from "@/lib/studio/isDownloadableImageUrl";

export const runtime = "nodejs";

function sanitizeFilename(filename: string): string {
  const base = filename.replace(/[^\w.\-()]+/g, "_").slice(0, 120);
  return base || "image.png";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const filename = sanitizeFilename(searchParams.get("filename") ?? "image.png");

  if (!url || !isDownloadableImageUrl(url)) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, { redirect: "follow" });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "image/png";
  const buffer = await upstream.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
