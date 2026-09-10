import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getSql } from "@/lib/db";
import { getFirestoreDb } from "@/lib/firestore";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { BlogPostInputSchema } from "@/lib/validation";

function mapMetaRow(row: any) {
  return {
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
  };
}

export async function GET(request: NextRequest) {
  try {
    const rate = checkRateLimit(`admin:blog:get:${getClientIp(request.headers)}`, 60, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = getSql();
    const rows = await sql`select * from blog_posts order by order_index asc, date desc nulls last`;

    return NextResponse.json({ success: true, posts: rows.map(mapMetaRow) });
  } catch (error) {
    console.error("Admin blog GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rate = checkRateLimit(`admin:blog:post:${getClientIp(request.headers)}`, 20, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = BlogPostInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const { slug, title, description, date, author, tags, readTime, featured, published, body: markdownBody } =
      parsed.data;

    const sql = getSql();
    const existing = await sql`select id from blog_posts where slug = ${slug} limit 1`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const rows = await sql`
      insert into blog_posts (slug, title, description, date, author, tags, read_time, featured, published)
      values (${slug}, ${title}, ${description}, ${date ?? null}, ${author ?? null}, ${tags}, ${readTime ?? null}, ${featured}, ${published})
      returning *
    `;
    const created = rows[0] as any;

    try {
      const db = getFirestoreDb();
      await db.doc(`blogPosts/${slug}`).set({
        body: markdownBody,
        format: "markdown",
        updatedAt: new Date().toISOString(),
      });
    } catch (firestoreError) {
      console.error("Blog Firestore write failed, rolling back Neon insert:", firestoreError);
      await sql`delete from blog_posts where id = ${created.id}`;
      return NextResponse.json({ error: "Failed to save post body" }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, post: { ...mapMetaRow(created), body: markdownBody } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin blog POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
