import "server-only";
import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "vitrina_session";

function sessionSecret() {
  return (
    process.env.APP_SESSION_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "local-dev-session-secret"
  );
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export type AppSession = {
  userId: string;
  phone: string;
  createdAt: string;
};

export function createSessionToken(session: AppSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string): AppSession | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AppSession;
  } catch {
    return null;
  }
}

export async function setSessionCookie(session: AppSession) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createSessionToken(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

export function createMockUserId(phone: string) {
  return `mock-${createHmac("sha256", sessionSecret()).update(phone).digest("hex").slice(0, 24)}`;
}

export function randomSessionNonce() {
  return randomBytes(16).toString("hex");
}
