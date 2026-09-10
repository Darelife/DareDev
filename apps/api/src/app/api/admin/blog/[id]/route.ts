import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getSql } from "@/lib/db";
import { getFirestoreDb } from "@/lib/firestore";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { BlogPostUpdateSchema } from "@/lib/validation";

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

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const sql = getSql();
    const rows = await sql`select * from blog_posts where id = ${id} limit 1`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const meta = mapMetaRow(rows[0]);

    const db = getFirestoreDb();
    const snap = await db.doc(`blogPosts/${meta.slug}`).get();
    const body = snap.exists ? (snap.data()?.body as string) ?? "" : "";

    return NextResponse.json({ success: true, post: { ...meta, body } });
  } catch (error) {
    console.error("Admin blog post GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const rate = checkRateLimit(`admin:blog:patch:${getClientIp(request.headers)}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = BlogPostUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const sql = getSql();
    const existingRows = await sql`select * from blog_posts where id = ${id} limit 1`;
    if (existingRows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const previous = existingRows[0] as any;
    const next = parsed.data;
    const newSlug = next.slug ?? previous.slug;

    if (newSlug !== previous.slug) {
      const clash = await sql`select id from blog_posts where slug = ${newSlug} and id != ${id} limit 1`;
      if (clash.length > 0) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
      }
    }

    const updatedRows = await sql`
      update blog_posts set
        slug = ${newSlug},
        title = ${next.title ?? previous.title},
        description = ${next.description ?? previous.description},
        date = ${next.date ?? previous.date},
        author = ${next.author ?? previous.author},
        tags = ${next.tags ?? previous.tags},
        read_time = ${next.readTime ?? previous.read_time},
        featured = ${next.featured ?? previous.featured},
        published = ${next.published ?? previous.published}
      where id = ${id}
      returning *
    `;
    const updated = updatedRows[0] as any;

    const db = getFirestoreDb();
    const hasNewBody = typeof next.body === "string";
    try {
      if (newSlug !== previous.slug) {
        const oldSnap = await db.doc(`blogPosts/${previous.slug}`).get();
        const bodyToWrite = hasNewBody ? next.body! : (oldSnap.data()?.body as string) ?? "";
        await db.doc(`blogPosts/${newSlug}`).set({
          body: bodyToWrite,
          format: "markdown",
          updatedAt: new Date().toISOString(),
        });
        if (oldSnap.exists) {
          await db.doc(`blogPosts/${previous.slug}`).delete();
        }
      } else if (hasNewBody) {
        await db.doc(`blogPosts/${newSlug}`).set({
          body: next.body,
          format: "markdown",
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (firestoreError) {
      console.error("Blog Firestore update failed, rolling back Neon update:", firestoreError);
      await sql`
        update blog_posts set
          slug = ${previous.slug}, title = ${previous.title}, description = ${previous.description},
          date = ${previous.date}, author = ${previous.author}, tags = ${previous.tags},
          read_time = ${previous.read_time}, featured = ${previous.featured}, published = ${previous.published}
        where id = ${id}
      `;
      return NextResponse.json({ error: "Failed to save post body" }, { status: 500 });
    }

    const db2 = getFirestoreDb();
    const finalSnap = await db2.doc(`blogPosts/${newSlug}`).get();
    const finalBody = finalSnap.exists ? (finalSnap.data()?.body as string) ?? "" : "";

    return NextResponse.json({ success: true, post: { ...mapMetaRow(updated), body: finalBody } });
  } catch (error) {
    console.error("Admin blog post PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const rate = checkRateLimit(`admin:blog:delete:${getClientIp(request.headers)}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const sql = getSql();
    const rows = await sql`delete from blog_posts where id = ${id} returning slug`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    try {
      const db = getFirestoreDb();
      await db.doc(`blogPosts/${rows[0].slug}`).delete();
    } catch (firestoreError) {
      console.error("Blog Firestore delete failed (Neon row already removed):", firestoreError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin blog post DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
