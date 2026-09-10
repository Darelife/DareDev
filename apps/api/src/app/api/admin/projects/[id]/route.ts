import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getSql } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { ProjectUpdateSchema } from "@/lib/validation";

function mapRow(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    techStack: row.tech_stack,
    links: row.links,
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
    const rows = await sql`select * from projects where id = ${id} limit 1`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, project: mapRow(rows[0]) });
  } catch (error) {
    console.error("Admin project GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const rate = checkRateLimit(`admin:projects:patch:${getClientIp(request.headers)}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = ProjectUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const sql = getSql();
    const existing = await sql`select * from projects where id = ${id} limit 1`;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const current = existing[0] as any;
    const next = { ...parsed.data };

    const rows = await sql`
      update projects set
        title = ${next.title ?? current.title},
        description = ${next.description ?? current.description},
        tech_stack = ${next.techStack ?? current.tech_stack},
        links = ${JSON.stringify(next.links ?? current.links)},
        order_index = ${next.orderIndex ?? current.order_index}
      where id = ${id}
      returning *
    `;

    return NextResponse.json({ success: true, project: mapRow(rows[0]) });
  } catch (error) {
    console.error("Admin project PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const rate = checkRateLimit(`admin:projects:delete:${getClientIp(request.headers)}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const sql = getSql();
    const rows = await sql`delete from projects where id = ${id} returning id`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin project DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
