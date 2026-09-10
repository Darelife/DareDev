import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

export async function GET(request: NextRequest) {
  try {
    const rate = checkRateLimit(`public:projects:${getClientIp(request.headers)}`, 120, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const sql = getSql();
    const rows = await sql`
      select id, title, description as desc, tech_stack as techstack, links, order_index, created_at, updated_at
      from projects
      order by order_index asc, created_at asc
    `;

    const projects = rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      desc: row.desc,
      techstack: row.techstack,
      links: row.links,
      orderIndex: row.order_index,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json(
      { success: true, projects },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Public projects GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
