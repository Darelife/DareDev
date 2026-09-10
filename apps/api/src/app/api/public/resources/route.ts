import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

export async function GET(request: NextRequest) {
  try {
    const rate = checkRateLimit(`public:resources:${getClientIp(request.headers)}`, 120, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const sql = getSql();
    const rows = await sql`
      select id, category, title, description, url, status, order_index, created_at, updated_at
      from resources
      order by category asc, order_index asc, created_at asc
    `;

    const grouped: Record<string, unknown[]> = {};
    for (const row of rows as any[]) {
      const resource = {
        id: row.id,
        category: row.category,
        title: row.title,
        description: row.description ?? undefined,
        url: row.url,
        status: row.status,
        orderIndex: row.order_index,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      if (!grouped[row.category]) {
        grouped[row.category] = [];
      }
      grouped[row.category].push(resource);
    }

    return NextResponse.json(
      { success: true, resources: grouped },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Public resources GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
