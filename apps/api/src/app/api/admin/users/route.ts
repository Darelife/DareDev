import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getSql } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { CreateUserSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const rate = checkRateLimit(`admin:users:get:${getClientIp(request.headers)}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = getSql();
    const users = await sql`select id, username, created_at from users order by created_at desc`;

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rate = checkRateLimit(`admin:users:post:${getClientIp(request.headers)}`, 15, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = CreateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const { username, password } = parsed.data;

    const sql = getSql();
    const existing = await sql`select id from users where username = ${username} limit 1`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const rows = await sql`
      insert into users (username, password_hash)
      values (${username}, ${passwordHash})
      returning id, username, created_at
    `;

    return NextResponse.json({ success: true, user: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Admin users POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
