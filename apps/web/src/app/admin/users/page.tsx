"use client";

import React from "react";
import { listUsers, createUser } from "@/lib/api-client";

type UserRow = { id: string; username: string; created_at: string };

const fieldStyle: React.CSSProperties = {
  backgroundColor: "var(--appearance-surface, #0a0a0a)",
  color: "var(--appearance-ink, #e3e3e3)",
  border: "1px solid var(--appearance-rule, #333)",
  padding: "8px",
  fontFamily: "inherit",
  fontSize: "13px",
  width: "100%",
};

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const refresh = React.useCallback(() => {
    setLoading(true);
    listUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await createUser(username, password);
      setUsername("");
      setPassword("");
      refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Ubuntu Mono', monospace" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "20px" }}>Users</h1>

      <form
        onSubmit={handleCreate}
        style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px", alignItems: "flex-end" }}
      >
        <div style={{ flex: "1", minWidth: "160px" }}>
          <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Username</label>
          <input style={fieldStyle} value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div style={{ flex: "1", minWidth: "160px" }}>
          <label style={{ fontSize: "11px", color: "var(--appearance-muted, #888)" }}>Password</label>
          <input
            type="password"
            style={fieldStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          style={{ padding: "8px 16px", background: "var(--appearance-highlight, #e11d48)", color: "var(--appearance-ink, #fff)", border: "none", cursor: "pointer" }}
        >
          {saving ? "Creating…" : "Add owner"}
        </button>
      </form>

      {error && <div style={{ color: "var(--appearance-danger, #ff6b6b)", marginBottom: "16px" }}>{error}</div>}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {users.map((u) => (
            <div
              key={u.id}
              style={{ border: "1px solid var(--appearance-rule, #222)", padding: "10px", borderRadius: "4px", fontSize: "13px" }}
            >
              <span style={{ color: "var(--appearance-ink, #e3e3e3)" }}>{u.username}</span>{" "}
              <span style={{ color: "var(--appearance-muted, #666)" }}>· since {new Date(u.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
