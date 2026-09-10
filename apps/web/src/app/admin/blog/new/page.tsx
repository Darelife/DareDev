"use client";

import { useRouter } from "next/navigation";
import { adminCreateBlogPost } from "@/lib/api-client";
import BlogPostForm, { emptyBlogForm } from "../BlogPostForm";

export default function NewBlogPostPage() {
  const router = useRouter();

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "20px", fontFamily: "'Ubuntu Mono', monospace" }}>New post</h1>
      <BlogPostForm
        initial={emptyBlogForm}
        submitLabel="Create"
        onSubmit={async (input) => {
          await adminCreateBlogPost(input);
          router.push("/admin/blog");
        }}
      />
    </div>
  );
}
