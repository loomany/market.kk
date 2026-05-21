import { type NextRequest } from "next/server";
import {
  YANDEX_VERIFICATION_FILE_PATH,
  yandexVerificationFileResponse,
} from "@/lib/seo/yandexVerificationFile";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const match = request.nextUrl.pathname.match(YANDEX_VERIFICATION_FILE_PATH);
  if (match) {
    return yandexVerificationFileResponse(match[1]);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
