"use client";
import React from "react";
import { useTheme } from "./themes/ThemeProvider";

const navLinks = [
  { name: "Home", href: "/#home" },
  { name: "Projects", href: "/#projects" },
  { name: "Blog", href: "/blog" },
  { name: "Resources", href: "/resources"},
  { name: "About", href: "/#about" },
];

export default function Navbar() {
  const { openThemes } = useTheme();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <nav
        style={{
          color: "var(--appearance-ink, #e3e3e3)",
          padding: "0.75rem 1.5rem",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "var(--appearance-canvas, rgba(0, 0, 0, 0.9))",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div style={{ fontWeight: 500, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "16px" }}>
            <span>Darelife</span>
            <button type="button" className="nav-theme-switch" onClick={openThemes} aria-haspopup="dialog" aria-keyshortcuts="Alt+T" title="Change theme (Alt+T)">Change theme</button>
          </div>
          <ul 
            style={{ 
              display: "flex", 
              gap: "2rem", 
              listStyle: "none", 
              margin: 0, 
              padding: 0 
            }}
          >
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  style={{
                    color: "var(--appearance-ink, #e3e3e3)",
                    textDecoration: "none",
                    fontWeight: 500,
                    transition: "color 0.2s",
                    padding: "0.5rem",
                    display: "block",
                  }}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    );
  }

  return (
    <nav
      style={{
        color: "var(--appearance-ink, #e3e3e3)",
        padding: "0.75rem 1.5rem",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "var(--appearance-canvas, rgba(0, 0, 0, 0.9))",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div style={{ fontWeight: 500, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "16px" }}>
          <span>Darelife</span>
          <button type="button" className="nav-theme-switch" onClick={openThemes} aria-haspopup="dialog" aria-keyshortcuts="Alt+T" title="Change theme (Alt+T)">Change theme</button>
        </div>
        <button
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "var(--appearance-ink, #e3e3e3)",
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: "0.5rem",
            zIndex: 102,
          }}
          className="navbar-burger"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
        <ul 
          className="navbar-links" 
          style={{ 
            display: "flex", 
            gap: "2rem", 
            listStyle: "none", 
            margin: 0, 
            padding: 0 
          }}
        >
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                style={{
                  color: "var(--appearance-ink, #e3e3e3)",
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "color 0.2s",
                  padding: "0.5rem",
                  display: "block",
                }}
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .navbar-links {
            display: ${menuOpen ? "flex" : "none"} !important;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 2rem;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100vh;
            background-color: var(--appearance-canvas, rgba(0, 0, 0, 0.98));
            backdrop-filter: blur(20px);
            z-index: 101;
            padding: 0;
          }
          .navbar-links li {
            width: auto;
          }
          .navbar-links a {
            padding: 1.5rem 2rem !important;
            font-size: 1.5rem;
            border: none !important;
            border-radius: 8px;
            transition: all 0.3s ease;
          }
          .navbar-links a:hover {
            background-color: var(--appearance-wash, rgba(255, 255, 255, 0.1));
            transform: scale(1.05);
          }
          .navbar-burger {
            display: block !important;
            position: relative;
          }
        }
      `}</style>
    </nav>
  );
}