import { NextResponse } from "next/server";

/** Yandex HTML-file verification; served as text/plain so Cloudflare Web Analytics does not inject beacon.js. */
export function yandexVerificationFileResponse(code: string): NextResponse {
  const body = `<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    <body>Verification: ${code}</body>
</html>
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}

export const YANDEX_VERIFICATION_FILE_PATH = /^\/yandex_([a-f0-9]+)\.html$/;
