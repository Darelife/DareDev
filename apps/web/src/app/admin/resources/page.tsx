"use client";

import React from "react";
import {
  adminListResources,
  adminCreateResource,
  adminUpdateResource,
  adminDeleteResource,
  AdminResource,
} from "@/lib/api-client";

type FormState = {
  category: string;
  title: string;
  description: string;
  url: string;
  status: "0" | "1" | "2";
  orderIndex: string;
};

const emptyForm: FormState = { category: "", title: "", description: "", url: "", status: "0", orderIndex: "0" };

const fieldStyle: React.CSSProperties = {
  backgroundColor: "var(--appearance-surface, #0a0a0a)",
  color: "var(--appearance-ink, #e3e3e3)",
  border: "1px solid var(--appearance-rule, #333)",
  padding: "8px",
  fontFamily: "inherit",
  fontSize: "13px",
  width: "100%",
};

const statusLabel: Record<number, string> = { 0: "queued", 1: "in progress", 2: "done" };

function formFromResource(r: AdminResource): FormState {
  return {
    category: r.category,
    title: r.title,
    description: r.description ?? "",
    url: r.url,
    status: String(r.status) as FormState["status"],
    orderIndex: String(r.orderIndex),
  };
}

function toInput(form: FormState) {
  return {
    category: form.category.trim(),
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    url: form.url.trim(),
    status: Number.parseInt(form.status, 10) as 0 | 1 | 2,
    orderIndex: Number.parseInt(form.orderIndex, 10) || 0,
  };
}

function ResourceForm({
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
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ flex: "1", minWidth: "160px" }}>
          <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Category</label>
          <input
            style={fieldStyle}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          />
        </div>
        <div style={{ maxWidth: "140px" }}>
          <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Status</label>
          <select
            style={fieldStyle}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as FormState["status"] })}
          >
            <option value="0">queued</option>
            <option value="1">in progress</option>
            <option value="2">done</option>
          </select>
        </div>
      </div>
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
        <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>URL</label>
        <input
          style={fieldStyle}
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          required
          type="url"
        />
      </div>
      <div>
        <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Description</label>
        <textarea
          style={{ ...fieldStyle, minHeight: "60px" }}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
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

export default function AdminResourcesPage() {
  const [resources, setResources] = React.useState<AdminResource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);

  const refresh = React.useCallback(() => {
    setLoading(true);
    adminListResources()
      .then(setResources)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div style={{ fontFamily: "'Ubuntu Mono', monospace" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "1.5rem" }}>Resources</h1>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            style={{ padding: "8px 16px", background: "var(--appearance-highlight, #e11d48)", color: "var(--appearance-ink, #fff)", border: "none", cursor: "pointer" }}
          >
            + New resource
          </button>
        )}
      </div>

      {creating && (
        <div style={{ border: "1px solid var(--appearance-rule, #222)", padding: "16px", borderRadius: "6px", marginBottom: "20px" }}>
          <ResourceForm
            initial={emptyForm}
            submitLabel="Create"
            onCancel={() => setCreating(false)}
            onSubmit={async (input) => {
              await adminCreateResource(input);
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
          {resources.map((r) => (
            <div key={r.id} style={{ border: "1px solid var(--appearance-rule, #222)", padding: "16px", borderRadius: "6px" }}>
              {editingId === r.id ? (
                <ResourceForm
                  initial={formFromResource(r)}
                  submitLabel="Save"
                  onCancel={() => setEditingId(null)}
                  onSubmit={async (input) => {
                    await adminUpdateResource(r.id, input);
                    setEditingId(null);
                    refresh();
                  }}
                />
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "var(--appearance-muted, #666)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {r.category} · {statusLabel[r.status]}
                    </div>
                    <div style={{ fontWeight: 600, marginTop: "2px" }}>{r.title}</div>
                    {r.description && (
                      <div style={{ fontSize: "12px", color: "var(--appearance-muted, #888)", marginTop: "4px", maxWidth: "60ch" }}>
                        {r.description}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button
                      onClick={() => setEditingId(r.id)}
                      style={{ padding: "4px 10px", background: "transparent", color: "var(--appearance-ink, #e3e3e3)", border: "1px solid var(--appearance-rule, #333)", cursor: "pointer" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete "${r.title}"?`)) return;
                        await adminDeleteResource(r.id);
                        refresh();
                      }}
                      style={{ padding: "4px 10px", background: "transparent", color: "var(--appearance-danger, #ff6b6b)", border: "1px solid var(--appearance-rule, #3a1a1a)", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {resources.length === 0 && <div style={{ color: "var(--appearance-muted, #666)" }}>No resources yet.</div>}
        </div>
      )}
    </div>
  );
}
