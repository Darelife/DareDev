import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

export async function GET(request: NextRequest) {
  try {
    const rate = checkRateLimit(`public:blog:${getClientIp(request.headers)}`, 120, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const sql = getSql();
    const rows = await sql`
      select id, slug, title, description, date, author, tags, read_time, featured, published, order_index, created_at, updated_at
      from blog_posts
      where published = true
      order by date desc nulls last
    `;

    const posts = rows.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      date: row.date,
      author: row.author,
      tags: row.tags,
      readTime: row.read_time,
      featured: row.featured,
      published: row.published,
      orderIndex: row.order_index,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json(
      { success: true, posts },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Public blog GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
