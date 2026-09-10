"use client";

import React from "react";
import Link from "next/link";
import { adminListBlogPosts, adminDeleteBlogPost } from "@/lib/api-client";
import type { BlogPostMeta } from "@daredev/shared";

export default function AdminBlogListPage() {
  const [posts, setPosts] = React.useState<BlogPostMeta[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const refresh = React.useCallback(() => {
    setLoading(true);
    adminListBlogPosts()
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div style={{ fontFamily: "'Ubuntu Mono', monospace" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "1.5rem" }}>Blog</h1>
        <Link
          href="/admin/blog/new"
          style={{ padding: "8px 16px", background: "#e11d48", color: "#fff", textDecoration: "none" }}
        >
          + New post
        </Link>
      </div>

      {error && <div style={{ color: "#ff6b6b", marginBottom: "16px" }}>{error}</div>}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {posts.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #222",
                padding: "16px",
                borderRadius: "6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{p.title}</div>
                <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
                  /{p.slug} {p.date ? `· ${p.date}` : ""} · {p.published ? "published" : "draft"}
                  {p.featured ? " · featured" : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <Link
                  href={`/admin/blog/${p.id}`}
                  style={{ padding: "4px 10px", color: "#e3e3e3", border: "1px solid #333", textDecoration: "none" }}
                >
                  Edit
                </Link>
                <button
                  onClick={async () => {
                    if (!confirm(`Delete "${p.title}"?`)) return;
                    await adminDeleteBlogPost(p.id);
                    refresh();
                  }}
                  style={{ padding: "4px 10px", background: "transparent", color: "#ff6b6b", border: "1px solid #3a1a1a", cursor: "pointer" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <div style={{ color: "#666" }}>No posts yet.</div>}
        </div>
      )}
    </div>
  );
}
