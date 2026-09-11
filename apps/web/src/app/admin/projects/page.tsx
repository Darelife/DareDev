"use client";

import React from "react";
import {
  adminListProjects,
  adminCreateProject,
  adminUpdateProject,
  adminDeleteProject,
  AdminProject,
} from "@/lib/api-client";

type FormState = {
  title: string;
  description: string;
  techStack: string;
  links: string;
  orderIndex: string;
};

const emptyForm: FormState = { title: "", description: "", techStack: "", links: "", orderIndex: "0" };

const fieldStyle: React.CSSProperties = {
  backgroundColor: "var(--appearance-surface, #0a0a0a)",
  color: "var(--appearance-ink, #e3e3e3)",
  border: "1px solid var(--appearance-rule, #333)",
  padding: "8px",
  fontFamily: "inherit",
  fontSize: "13px",
  width: "100%",
};

function parseLinks(text: string): { url: string; text?: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [url, label] = line.split("|").map((s) => s.trim());
      return label ? { url, text: label } : { url };
    });
}

function serializeLinks(links: { url: string; text?: string }[]): string {
  return links.map((l) => (l.text ? `${l.url} | ${l.text}` : l.url)).join("\n");
}

function formFromProject(p: AdminProject): FormState {
  return {
    title: p.title,
    description: p.description,
    techStack: p.techStack.join(", "),
    links: serializeLinks(p.links),
    orderIndex: String(p.orderIndex),
  };
}

function toInput(form: FormState) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    techStack: form.techStack
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    links: parseLinks(form.links),
    orderIndex: Number.parseInt(form.orderIndex, 10) || 0,
  };
}

function ProjectForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: FormState;
  onSubmit: (input: ReturnType<typeof toInput>) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = React.useState(initial);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit(toInput(form));
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div>
        <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Title</label>
        <input
          style={fieldStyle}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>
      <div>
        <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Description</label>
        <textarea
          style={{ ...fieldStyle, minHeight: "70px" }}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div>
        <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Tech stack (comma-separated)</label>
        <input
          style={fieldStyle}
          value={form.techStack}
          onChange={(e) => setForm({ ...form, techStack: e.target.value })}
          placeholder="Next.js, TypeScript, Postgres"
        />
      </div>
      <div>
        <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Links (one per line: url | label)</label>
        <textarea
          style={{ ...fieldStyle, minHeight: "60px" }}
          value={form.links}
          onChange={(e) => setForm({ ...form, links: e.target.value })}
          placeholder="https://github.com/... | GitHub"
        />
      </div>
      <div style={{ maxWidth: "120px" }}>
        <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Order</label>
        <input
          type="number"
          style={fieldStyle}
          value={form.orderIndex}
          onChange={(e) => setForm({ ...form, orderIndex: e.target.value })}
        />
      </div>
      {error && <div style={{ color: "var(--appearance-danger, #ff6b6b)" }}>{error}</div>}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="submit"
          disabled={saving}
          style={{ padding: "8px 16px", background: "var(--appearance-highlight, #e11d48)", color: "var(--appearance-ink, #fff)", border: "none", cursor: "pointer" }}
        >
          {saving ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: "8px 16px", background: "transparent", color: "var(--appearance-muted, #888)", border: "1px solid var(--appearance-rule, #333)", cursor: "pointer" }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = React.useState<AdminProject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);

  const refresh = React.useCallback(() => {
    setLoading(true);
    adminListProjects()
      .then(setProjects)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div style={{ fontFamily: "'Ubuntu Mono', monospace" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "1.5rem" }}>Projects</h1>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            style={{ padding: "8px 16px", background: "var(--appearance-highlight, #e11d48)", color: "var(--appearance-ink, #fff)", border: "none", cursor: "pointer" }}
          >
            + New project
          </button>
        )}
      </div>

      {creating && (
        <div style={{ border: "1px solid var(--appearance-rule, #222)", padding: "16px", borderRadius: "6px", marginBottom: "20px" }}>
          <ProjectForm
            initial={emptyForm}
            submitLabel="Create"
            onCancel={() => setCreating(false)}
            onSubmit={async (input) => {
              await adminCreateProject(input);
              setCreating(false);
              refresh();
            }}
          />
        </div>
      )}

      {error && <div style={{ color: "var(--appearance-danger, #ff6b6b)", marginBottom: "16px" }}>{error}</div>}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {projects.map((p) => (
            <div key={p.id} style={{ border: "1px solid var(--appearance-rule, #222)", padding: "16px", borderRadius: "6px" }}>
              {editingId === p.id ? (
                <ProjectForm
                  initial={formFromProject(p)}
                  submitLabel="Save"
                  onCancel={() => setEditingId(null)}
                  onSubmit={async (input) => {
                    await adminUpdateProject(p.id, input);
                    setEditingId(null);
                    refresh();
                  }}
                />
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.title}</div>
                      <div style={{ fontSize: "12px", color: "var(--appearance-muted, #888)", marginTop: "4px", maxWidth: "60ch" }}>
                        {p.description}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                      <button
                        onClick={() => setEditingId(p.id)}
                        style={{ padding: "4px 10px", background: "transparent", color: "var(--appearance-ink, #e3e3e3)", border: "1px solid var(--appearance-rule, #333)", cursor: "pointer" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete "${p.title}"?`)) return;
                          await adminDeleteProject(p.id);
                          refresh();
                        }}
                        style={{ padding: "4px 10px", background: "transparent", color: "var(--appearance-danger, #ff6b6b)", border: "1px solid var(--appearance-rule, #3a1a1a)", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {p.techStack.length > 0 && (
                    <div style={{ marginTop: "8px", fontSize: "11px", color: "var(--appearance-muted, #666)" }}>{p.techStack.join(" · ")}</div>
                  )}
                </div>
              )}
            </div>
          ))}
          {projects.length === 0 && <div style={{ color: "var(--appearance-muted, #666)" }}>No projects yet.</div>}
        </div>
      )}
    </div>
  );
}
