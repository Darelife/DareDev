import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getSql } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { ProjectInputSchema } from "@/lib/validation";

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

export async function GET(request: NextRequest) {
  try {
    const rate = checkRateLimit(`admin:projects:get:${getClientIp(request.headers)}`, 60, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = getSql();
    const rows = await sql`select * from projects order by order_index asc, created_at asc`;

    return NextResponse.json({ success: true, projects: rows.map(mapRow) });
  } catch (error) {
    console.error("Admin projects GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rate = checkRateLimit(`admin:projects:post:${getClientIp(request.headers)}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = ProjectInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const { title, description, techStack, links, orderIndex } = parsed.data;

    const sql = getSql();
    const rows = await sql`
      insert into projects (title, description, tech_stack, links, order_index)
      values (${title}, ${description}, ${techStack}, ${JSON.stringify(links)}, ${orderIndex})
      returning *
    `;

    return NextResponse.json({ success: true, project: mapRow(rows[0]) }, { status: 201 });
  } catch (error) {
    console.error("Admin projects POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
