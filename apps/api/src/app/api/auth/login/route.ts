import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { comparePassword } from "@/lib/auth";
import { setSessionCookies } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { LoginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rate = checkRateLimit(`login:${ip}`, 10, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again shortly." },
        {
          status: 429,
          headers: rate.retryAfterSeconds ? { "Retry-After": String(rate.retryAfterSeconds) } : undefined,
        }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }
    const { username, password } = parsed.data;

    const sql = getSql();
    const rows = await sql`
      select id, username, password_hash from users where username = ${username} limit 1
    `;
    const user = rows[0] as { id: string; username: string; password_hash: string } | undefined;

    const isValid = !!user && (await comparePassword(password, user.password_hash));
    if (!isValid || !user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const sessionUser = { id: user.id, username: user.username };
    await setSessionCookies(sessionUser);

    return NextResponse.json({ success: true, user: sessionUser });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
