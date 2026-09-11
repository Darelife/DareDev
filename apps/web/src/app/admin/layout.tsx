"use client";

import React from "react";
import Link from "next/link";
import { checkAuth, login as apiLogin, logout as apiLogout, AuthUser } from "@/lib/api-client";

const adminLinks = [
  { name: "Dashboard", href: "/admin" },
  { name: "Projects", href: "/admin/projects" },
  { name: "Resources", href: "/admin/resources" },
  { name: "Blog", href: "/admin/blog" },
  { name: "Canvas", href: "/admin/canvas" },
  { name: "Users", href: "/admin/users" },
];

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--appearance-canvas, #000)",
  color: "var(--appearance-success, #00ff00)",
  border: "1px solid var(--appearance-rule, #00ff00)",
  fontFamily: "monospace",
  fontSize: "16px",
  padding: "6px",
  display: "block",
  width: "100%",
};

const buttonStyle: React.CSSProperties = {
  marginTop: "10px",
  padding: "5px 10px",
  backgroundColor: "var(--appearance-highlight, #00ff00)",
  color: "var(--appearance-ink, #000)",
  border: "none",
  fontFamily: "monospace",
  cursor: "pointer",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    checkAuth().then((res) => {
      setIsAuthenticated(res.authenticated);
      setUser(res.user ?? null);
      setIsLoading(false);
    });
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (!username || !password) {
        setError("Username and password are required");
        return;
      }
      const result = await apiLogin(username, password);
      setIsAuthenticated(true);
      setUser(result.user ?? null);
      setUsername("");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
      setPassword("");
    }
  };

  const handleLogout = async () => {
    await apiLogout();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "var(--appearance-canvas, #000)",
          color: "var(--appearance-success, #00ff00)",
          fontFamily: "monospace",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "var(--appearance-canvas, #000)",
          color: "var(--appearance-success, #00ff00)",
          fontFamily: "monospace",
          fontSize: "16px",
        }}
      >
        <form className="admin-login" onSubmit={handleLoginSubmit}>
          <div style={{ marginBottom: "10px" }}>Admin Login</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "280px" }}>
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              autoComplete="username"
              style={inputStyle}
              autoFocus
            />
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>
          <button type="submit" style={buttonStyle}>
            Login
          </button>
          {error && <div style={{ color: "var(--appearance-danger, #ff0000)", marginTop: "10px" }}>{error}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="admin-shell" style={{ minHeight: "100vh", backgroundColor: "var(--appearance-canvas, #000)", color: "var(--appearance-ink, #e3e3e3)" }}>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 20px",
          borderBottom: "1px solid var(--appearance-rule, #222)",
          fontFamily: "'Ubuntu Mono', monospace",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
          {adminLinks.map((l) => (
            <Link key={l.href} href={l.href} style={{ color: "var(--appearance-ink, #e3e3e3)", textDecoration: "none", fontSize: "13px" }}>
              {l.name}
            </Link>
          ))}
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "13px" }}>
          <span style={{ color: "var(--appearance-muted, #888)" }}>{user?.username}</span>
          <button
            onClick={() => void handleLogout()}
            style={{
              padding: "4px 10px",
              background: "var(--appearance-highlight, #ff0000)",
              color: "var(--appearance-ink, #fff)",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Logout
          </button>
        </div>
      </nav>
      <main style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>{children}</main>
    </div>
  );
}
