"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { adminGetBlogPost, adminUpdateBlogPost, adminDeleteBlogPost } from "@/lib/api-client";
import BlogPostForm, { BlogFormState } from "../BlogPostForm";

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = React.useState<BlogFormState | null>(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    adminGetBlogPost(params.id)
      .then((post) =>
        setInitial({
          slug: post.slug,
          title: post.title,
          description: post.description,
          date: (post.date || "").slice(0, 10),
          author: post.author || "",
          tags: (post.tags || []).join(", "),
          readTime: post.readTime ? String(post.readTime) : "",
          featured: post.featured,
          published: post.published,
          body: post.body,
        })
      )
      .catch((e) => setError(e.message));
  }, [params.id]);

  if (error) {
    return <div style={{ color: "#ff6b6b", fontFamily: "'Ubuntu Mono', monospace" }}>{error}</div>;
  }

  if (!initial) {
    return <div style={{ fontFamily: "'Ubuntu Mono', monospace" }}>Loading…</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "20px", fontFamily: "'Ubuntu Mono', monospace" }}>Edit post</h1>
      <BlogPostForm
        initial={initial}
        submitLabel="Save"
        onSubmit={async (input) => {
          await adminUpdateBlogPost(params.id, input);
          router.push("/admin/blog");
        }}
        onDelete={async () => {
          if (!confirm("Delete this post?")) return;
          await adminDeleteBlogPost(params.id);
          router.push("/admin/blog");
        }}
      />
    </div>
  );
}
