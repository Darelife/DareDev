"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { checkAuth, login, logout, loadCanvas, saveCanvas } from "@/lib/api-client";

// Dynamically import Excalidraw to avoid SSR issues
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  },
);

export default function Page() {
  const [initialData, setInitialData] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const saveTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // Check authentication on mount
  useEffect(() => {
    async function checkAuthentication() {
      const authenticated = await checkAuth();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    }
    checkAuthentication();
  }, []);

  // Load canvas when authenticated
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    async function loadCanvasData() {
      try {
        const { restore } = await import("@excalidraw/excalidraw");
        const drawing = await loadCanvas();

        let restored = restore(drawing.data || drawing, null, null);

        // Ensure collaborators is always a Map
        if (!(restored.appState.collaborators instanceof Map)) {
          restored.appState.collaborators = new Map();
        }

        setInitialData(restored);
        console.log("✅ Loaded drawing from backend");
      } catch (err) {
        console.error("Failed to load canvas:", err);
        setInitialData({
          elements: [],
          appState: { collaborators: new Map() },
        });
      }
    }

    loadCanvasData();
  }, [isAuthenticated, isLoading]);

  // Handle changes and save
  const handleChange = useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      if (!elements) return;

      if (saveTimeout.current) clearTimeout(saveTimeout.current);

      saveTimeout.current = setTimeout(async () => {
        try {
          await saveCanvas(elements as any[], appState, files);
          console.log("💾 Drawing saved via backend");
        } catch (err: any) {
          console.error("❌ Save failed:", err.message);
        }
      }, 20000); // 20s debounce
    },
    []
  );

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(password);
      setIsAuthenticated(true);
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Invalid password");
      setPassword("");
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setInitialData(null);
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#000",
          color: "#00ff00",
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
          backgroundColor: "#000",
          color: "#00ff00",
          fontFamily: "monospace",
          fontSize: "16px",
        }}
      >
        <form onSubmit={handlePasswordSubmit}>
          <div>Enter password:</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              backgroundColor: "#000",
              color: "#00ff00",
              border: "1px solid #00ff00",
              fontFamily: "monospace",
              fontSize: "16px",
              marginTop: "10px",
              padding: "5px",
            }}
            autoFocus
          />
          {error && (
            <div style={{ color: "#ff0000", marginTop: "10px" }}>
              {error}
            </div>
          )}
          {/* <button
            type="submit"
            style={{
              marginTop: "10px",
              padding: "5px 10px",
              backgroundColor: "#00ff00",
              color: "#000",
              border: "none",
              fontFamily: "monospace",
              cursor: "pointer",
            }}
          >
            Login
          </button> */}
        </form>
      </div>
    );
  }

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
      }}
    >
      {/* <div style={{ padding: "10px", backgroundColor: "#1a1a1a", color: "#00ff00", fontFamily: "monospace", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Canvas</span>
        <button
          onClick={handleLogout}
          style={{
            padding: "5px 10px",
            backgroundColor: "#ff0000",
            color: "#fff",
            border: "none",
            fontFamily: "monospace",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div> */}
      <div style={{ flex: 1 }}>
        {/* Only render when initialData is ready */}
        {initialData ? (
          <Excalidraw initialData={initialData} onChange={handleChange} />
        ) : (
          <div>Loading Canvas...</div>
        )}
      </div>
    </main>
  );
}
