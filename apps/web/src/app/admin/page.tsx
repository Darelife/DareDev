"use client";

import Link from "next/link";

const sections = [
  { name: "Projects", href: "/admin/projects", desc: "Edit the projects shown on the homepage" },
  { name: "Resources", href: "/admin/resources", desc: "Edit the learning resources list" },
  { name: "Blog", href: "/admin/blog", desc: "Write and edit blog posts" },
  { name: "Canvas", href: "/admin/canvas", desc: "Your private Excalidraw board" },
  { name: "Users", href: "/admin/users", desc: "Manage owner accounts" },
];

export default function AdminDashboard() {
  return (
    <div style={{ fontFamily: "'Ubuntu Mono', monospace" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "24px" }}>Admin</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" }}>
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            style={{
              display: "block",
              padding: "16px",
              border: "1px solid #222",
              borderRadius: "6px",
              textDecoration: "none",
              color: "#e3e3e3",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "6px" }}>{s.name}</div>
            <div style={{ fontSize: "12px", color: "#888" }}>{s.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
