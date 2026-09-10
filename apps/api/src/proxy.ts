import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { csrfTokensMatch } from "@/lib/csrf";

const SESSION_COOKIE = "session";
const CSRF_COOKIE = "csrf-token";

function getAllowedOrigin(): string {
  const origin = process.env.FRONTEND_ORIGIN;
  if (!origin) {
    throw new Error("Missing required environment variable: FRONTEND_ORIGIN");
  }
  return origin;
}

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Content-Security-Policy", "default-src 'none'");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");
  const allowedOrigin = getAllowedOrigin();

  // Reject any cross-origin request from a browser that isn't the known
  // frontend. Requests with no Origin header (curl, server-to-server,
  // same-origin navigation) are not a CORS concern and pass through here —
  // route handlers still enforce their own auth regardless.
  if (origin && origin !== allowedOrigin) {
    return withSecurityHeaders(NextResponse.json({ error: "Forbidden origin" }, { status: 403 }));
  }

  if (request.method === "OPTIONS") {
    const preflight = new NextResponse(null, { status: 204 });
    if (origin) {
      preflight.headers.set("Access-Control-Allow-Origin", origin);
      preflight.headers.set("Access-Control-Allow-Credentials", "true");
      preflight.headers.set("Vary", "Origin");
    }
    preflight.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    preflight.headers.set("Access-Control-Allow-Headers", "Content-Type, x-csrf-token");
    return withSecurityHeaders(preflight);
  }

  // Fast pre-check: private endpoints require a session cookie before
  // reaching route logic. Full JWT verification still happens there.
  const requiresSession = pathname.startsWith("/api/admin") || pathname.startsWith("/api/canvas");
  if (requiresSession) {
    const session = request.cookies.get(SESSION_COOKIE);
    if (!session?.value) {
      return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
  }

  // CSRF double-submit check on every mutating request except login (no
  // session/csrf cookie exists yet at that point in the flow).
  const isMutating = request.method !== "GET" && request.method !== "HEAD";
  const isLogin = pathname === "/api/auth/login";
  if (isMutating && !isLogin) {
    const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
    const headerToken = request.headers.get("x-csrf-token");
    if (!csrfTokensMatch(cookieToken, headerToken)) {
      return withSecurityHeaders(NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 }));
    }
  }

  const response = NextResponse.next();
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Vary", "Origin");
  }
  return withSecurityHeaders(response);
}

export const config = {
  matcher: ["/api/:path*"],
};
