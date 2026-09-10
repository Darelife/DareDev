import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getSql } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { ResourceInputSchema } from "@/lib/validation";

function mapRow(row: any) {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description ?? undefined,
    url: row.url,
    status: row.status,
    orderIndex: row.order_index,
  };
}

export async function GET(request: NextRequest) {
  try {
    const rate = checkRateLimit(`admin:resources:get:${getClientIp(request.headers)}`, 60, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = getSql();
    const rows = await sql`select * from resources order by category asc, order_index asc, created_at asc`;

    return NextResponse.json({ success: true, resources: rows.map(mapRow) });
  } catch (error) {
    console.error("Admin resources GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rate = checkRateLimit(`admin:resources:post:${getClientIp(request.headers)}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = ResourceInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const { category, title, description, url, status, orderIndex } = parsed.data;

    const sql = getSql();
    const rows = await sql`
      insert into resources (category, title, description, url, status, order_index)
      values (${category}, ${title}, ${description ?? null}, ${url}, ${status}, ${orderIndex})
      returning *
    `;

    return NextResponse.json({ success: true, resource: mapRow(rows[0]) }, { status: 201 });
  } catch (error) {
    console.error("Admin resources POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
