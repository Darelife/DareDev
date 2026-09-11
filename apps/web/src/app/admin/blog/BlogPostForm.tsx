"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export type BlogFormState = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string;
  readTime: string;
  featured: boolean;
  published: boolean;
  body: string;
};

export const emptyBlogForm: BlogFormState = {
  slug: "",
  title: "",
  description: "",
  date: "",
  author: "",
  tags: "",
  readTime: "",
  featured: false,
  published: true,
  body: "",
};

export function toBlogInput(form: BlogFormState) {
  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    description: form.description.trim(),
    date: form.date || undefined,
    author: form.author.trim() || undefined,
    tags: form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    readTime: form.readTime ? Number.parseInt(form.readTime, 10) : undefined,
    featured: form.featured,
    published: form.published,
    body: form.body,
  };
}

const fieldStyle: React.CSSProperties = {
  backgroundColor: "var(--appearance-surface, #0a0a0a)",
  color: "var(--appearance-ink, #e3e3e3)",
  border: "1px solid var(--appearance-rule, #333)",
  padding: "8px",
  fontFamily: "inherit",
  fontSize: "13px",
  width: "100%",
};

export default function BlogPostForm({
  initial,
  submitLabel,
  onSubmit,
  onDelete,
}: {
  initial: BlogFormState;
  submitLabel: string;
  onSubmit: (input: ReturnType<typeof toBlogInput>) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [form, setForm] = React.useState(initial);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit(toBlogInput(form));
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-blog-form" onSubmit={handleSubmit} style={{ fontFamily: "'Ubuntu Mono', monospace" }}>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
        <div style={{ flex: "1", minWidth: "200px" }}>
          <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Title</label>
          <input style={fieldStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div style={{ flex: "1", minWidth: "200px" }}>
          <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Slug</label>
          <input style={fieldStyle} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        </div>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Description</label>
        <textarea
          style={{ ...fieldStyle, minHeight: "50px" }}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
        <div style={{ minWidth: "160px" }}>
          <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Date</label>
          <input type="date" style={fieldStyle} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div style={{ minWidth: "160px" }}>
          <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Author</label>
          <input style={fieldStyle} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        </div>
        <div style={{ minWidth: "120px" }}>
          <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Read time (min)</label>
          <input
            type="number"
            style={fieldStyle}
            value={form.readTime}
            onChange={(e) => setForm({ ...form, readTime: e.target.value })}
          />
        </div>
        <div style={{ flex: "1", minWidth: "200px" }}>
          <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Tags (comma-separated)</label>
          <input style={fieldStyle} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "18px", marginBottom: "14px", fontSize: "13px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          Featured
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Published
        </label>
      </div>

      <div className="admin-editor-columns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
        <div>
          <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Body (Markdown, raw HTML allowed)</label>
          <textarea
            style={{ ...fieldStyle, minHeight: "420px", fontFamily: "monospace" }}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
        </div>
        <div>
          <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Preview</label>
          <div
            className="admin-markdown-preview prose prose-invert"
            style={{ border: "1px solid var(--appearance-rule, #333)", padding: "12px", minHeight: "420px", maxWidth: "none", overflow: "auto" }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {form.body || "*nothing yet*"}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {error && <div style={{ color: "var(--appearance-danger, #ff6b6b)", marginBottom: "10px" }}>{error}</div>}

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="submit"
          disabled={saving}
          style={{ padding: "8px 16px", background: "var(--appearance-highlight, #e11d48)", color: "var(--appearance-ink, #fff)", border: "none", cursor: "pointer" }}
        >
          {saving ? "Saving…" : submitLabel}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            style={{ padding: "8px 16px", background: "transparent", color: "var(--appearance-danger, #ff6b6b)", border: "1px solid var(--appearance-rule, #3a1a1a)", cursor: "pointer" }}
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
