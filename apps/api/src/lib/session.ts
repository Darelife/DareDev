import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { SessionUser, signSessionToken, verifySessionToken } from "./auth";

export const SESSION_COOKIE = "session";
export const CSRF_COOKIE = "csrf-token";

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

export async function setSessionCookies(user: SessionUser): Promise<void> {
  const token = signSessionToken(user);
  const csrfToken = randomBytes(24).toString("hex");
  const cookieStore = await cookies();
  const sameSite = isProd() ? ("none" as const) : ("lax" as const);

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd(),
    sameSite,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  cookieStore.set(CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    secure: isProd(),
    sameSite,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(CSRF_COOKIE);
}
