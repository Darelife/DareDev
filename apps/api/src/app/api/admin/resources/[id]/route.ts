import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getSql } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { ResourceUpdateSchema } from "@/lib/validation";

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

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const sql = getSql();
    const rows = await sql`select * from resources where id = ${id} limit 1`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, resource: mapRow(rows[0]) });
  } catch (error) {
    console.error("Admin resource GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const rate = checkRateLimit(`admin:resources:patch:${getClientIp(request.headers)}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = ResourceUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const sql = getSql();
    const existing = await sql`select * from resources where id = ${id} limit 1`;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }
    const current = existing[0] as any;
    const next = parsed.data;

    const rows = await sql`
      update resources set
        category = ${next.category ?? current.category},
        title = ${next.title ?? current.title},
        description = ${next.description ?? current.description},
        url = ${next.url ?? current.url},
        status = ${next.status ?? current.status},
        order_index = ${next.orderIndex ?? current.order_index}
      where id = ${id}
      returning *
    `;

    return NextResponse.json({ success: true, resource: mapRow(rows[0]) });
  } catch (error) {
    console.error("Admin resource PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const rate = checkRateLimit(`admin:resources:delete:${getClientIp(request.headers)}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const sql = getSql();
    const rows = await sql`delete from resources where id = ${id} returning id`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin resource DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
