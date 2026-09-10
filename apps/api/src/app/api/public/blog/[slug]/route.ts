import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getFirestoreDb } from "@/lib/firestore";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const rate = checkRateLimit(`public:blog:slug:${getClientIp(request.headers)}`, 120, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { slug } = await params;
    const sql = getSql();
    const rows = await sql`
      select id, slug, title, description, date, author, tags, read_time, featured, published, order_index, created_at, updated_at
      from blog_posts
      where slug = ${slug} and published = true
      limit 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const row = rows[0] as any;
    const db = getFirestoreDb();
    const snap = await db.doc(`blogPosts/${slug}`).get();
    const body = snap.exists ? (snap.data()?.body as string) ?? "" : "";

    const post = {
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
      body,
      format: "markdown" as const,
    };

    return NextResponse.json(
      { success: true, post },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Public blog post GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
