"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import {
  AuthUser,
  checkAuth,
  createDrawing,
  DrawingSummary,
  listDrawings,
  loadCanvas,
  login,
  logout,
  saveCanvas,
} from "@/lib/api-client";

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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [drawings, setDrawings] = useState<DrawingSummary[]>([]);
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);
  const [newDrawingTitle, setNewDrawingTitle] = useState("");
  const [isCreatingDrawing, setIsCreatingDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string>("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [error, setError] = useState("");
  const sceneRef = React.useRef<{ elements: any[]; appState: any; files: any } | null>(null);
  const lastSaveClickRef = React.useRef(0);

  useEffect(() => {
    async function checkAuthentication() {
      const auth = await checkAuth();
      setIsAuthenticated(auth.authenticated);
      setUser(auth.user ?? null);
      setIsLoading(false);
    }

    checkAuthentication();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    async function loadCanvasData(targetDrawingId?: string | null) {
      try {
        const availableDrawings = await listDrawings();
        setDrawings(availableDrawings);

        const urlDrawingId = new URLSearchParams(window.location.search).get("id");
        const currentDrawingId = targetDrawingId || urlDrawingId || availableDrawings[0]?.id || null;

        if (!currentDrawingId) {
          setSelectedDrawingId(null);
          setInitialData({
            elements: [],
            appState: { collaborators: new Map() },
          });
          return;
        }

        setSelectedDrawingId(currentDrawingId);
        const params = new URLSearchParams(window.location.search);
        params.set("id", currentDrawingId);
        window.history.replaceState(null, "", `/canvas?${params.toString()}`);

        const { restore } = await import("@excalidraw/excalidraw");
        const drawing = await loadCanvas(currentDrawingId);

        let restored = restore(drawing.data || drawing, null, null);

        if (!(restored.appState.collaborators instanceof Map)) {
          restored.appState.collaborators = new Map();
        }

        setInitialData(restored);
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

  const openDrawing = async (drawingId: string) => {
    try {
      setError("");
      setSelectedDrawingId(drawingId);

      const { restore } = await import("@excalidraw/excalidraw");
      const drawing = await loadCanvas(drawingId);
      const restored = restore(drawing.data || drawing, null, null);

      if (!(restored.appState.collaborators instanceof Map)) {
        restored.appState.collaborators = new Map();
      }

      const params = new URLSearchParams(window.location.search);
      params.set("id", drawingId);
      window.history.replaceState(null, "", `/canvas?${params.toString()}`);
      setInitialData(restored);
    } catch (err: any) {
      setError(err?.message || "Failed to open drawing");
    }
  };

  const handleCreateDrawing = async () => {
    if (user?.role !== "admin") return;

    try {
      setIsCreatingDrawing(true);
      setError("");
      const created = await createDrawing(newDrawingTitle);
      setNewDrawingTitle("");

      const updated = await listDrawings();
      setDrawings(updated);
      await openDrawing(created.id);
    } catch (err: any) {
      setError(err?.message || "Failed to create drawing");
    } finally {
      setIsCreatingDrawing(false);
    }
  };

  const handleChange = useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      if (!elements) return;

      sceneRef.current = {
        elements: elements as any[],
        appState,
        files,
      };
    },
    []
  );

  const handleManualSave = async () => {
    if (!selectedDrawingId) {
      setError("No drawing selected");
      return;
    }

    if (!sceneRef.current) {
      setError("Nothing to save yet");
      return;
    }

    const now = Date.now();
    const elapsedMs = now - lastSaveClickRef.current;
    const minGapMs = 10_000;

    if (elapsedMs < minGapMs) {
      const waitSeconds = Math.ceil((minGapMs - elapsedMs) / 1000);
      setCooldownSeconds(waitSeconds);
      setError(`Wait ${waitSeconds}s before saving again`);
      return;
    }

    try {
      setError("");
      setIsSaving(true);
      lastSaveClickRef.current = now;
      setCooldownSeconds(10);

      const { elements, appState, files } = sceneRef.current;
      await saveCanvas(selectedDrawingId, elements, appState, files);
      setLastSavedAt(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err?.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (!username || !password) {
        setError("Username and password are required");
        return;
      }

      const result = await login(username, password);
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
    await logout();
    setIsAuthenticated(false);
    setUser(null);
    setSelectedDrawingId(null);
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
        <form onSubmit={handleLoginSubmit}>
          <div style={{ marginBottom: "10px" }}>Canvas Login</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "280px" }}>
            <label htmlFor="canvas-username">Username</label>
            <input
              id="canvas-username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              autoComplete="username"
              style={{
                backgroundColor: "#000",
                color: "#00ff00",
                border: "1px solid #00ff00",
                fontFamily: "monospace",
                fontSize: "16px",
                padding: "6px",
                display: "block",
                width: "100%",
              }}
              autoFocus
            />
            <label htmlFor="canvas-password">Password</label>
            <input
              id="canvas-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              autoComplete="current-password"
              style={{
                backgroundColor: "#000",
                color: "#00ff00",
                border: "1px solid #00ff00",
                fontFamily: "monospace",
                fontSize: "16px",
                padding: "6px",
                display: "block",
                width: "100%",
              }}
            />
          </div>
          <button
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
          </button>
          {error && (
            <div style={{ color: "#ff0000", marginTop: "10px" }}>
              {error}
            </div>
          )}
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
      <div style={{ padding: "10px", backgroundColor: "#1a1a1a", color: "#00ff00", fontFamily: "monospace", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>
          Canvas {selectedDrawingId ? `(${selectedDrawingId})` : ""}
          {user ? ` | ${user.username} [${user.role}]` : ""}
          </span>
          <select
            value={selectedDrawingId ?? ""}
            onChange={(e) => {
              if (e.target.value) {
                void openDrawing(e.target.value);
              }
            }}
            style={{
              backgroundColor: "#000",
              color: "#00ff00",
              border: "1px solid #00ff00",
              fontFamily: "monospace",
              padding: "4px",
            }}
          >
            {drawings.length === 0 ? (
              <option value="">No drawings</option>
            ) : (
              drawings.map((drawing) => (
                <option key={drawing.id} value={drawing.id}>
                  {drawing.title || drawing.id}
                </option>
              ))
            )}
          </select>
          {user?.role === "admin" && (
            <>
              <input
                type="text"
                value={newDrawingTitle}
                onChange={(e) => setNewDrawingTitle(e.target.value)}
                placeholder="new drawing title"
                style={{
                  backgroundColor: "#000",
                  color: "#00ff00",
                  border: "1px solid #00ff00",
                  fontFamily: "monospace",
                  padding: "4px",
                }}
              />
              <button
                onClick={() => void handleCreateDrawing()}
                disabled={isCreatingDrawing}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#00ff00",
                  color: "#000",
                  border: "none",
                  fontFamily: "monospace",
                  cursor: "pointer",
                  opacity: isCreatingDrawing ? 0.7 : 1,
                }}
              >
                {isCreatingDrawing ? "Creating..." : "New Drawing"}
              </button>
            </>
          )}
          <button
            onClick={() => void handleManualSave()}
            disabled={isSaving || cooldownSeconds > 0 || !selectedDrawingId}
            style={{
              padding: "5px 10px",
              backgroundColor: "#0088ff",
              color: "#fff",
              border: "none",
              fontFamily: "monospace",
              cursor: "pointer",
              opacity: isSaving || cooldownSeconds > 0 || !selectedDrawingId ? 0.7 : 1,
            }}
          >
            {isSaving
              ? "Saving..."
              : cooldownSeconds > 0
                ? `Save (${cooldownSeconds}s)`
                : "Save"}
          </button>
          {lastSavedAt && <span style={{ fontSize: "12px" }}>Saved at {lastSavedAt}</span>}
        </div>
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
      </div>
      <div style={{ flex: 1 }}>
        {error && (
          <div style={{ padding: "8px 16px", color: "#ff0000", fontFamily: "monospace" }}>
            {error}
          </div>
        )}
        {selectedDrawingId && initialData ? (
          <Excalidraw initialData={initialData} onChange={handleChange} validateEmbeddable={() => true} />
        ) : (
          <div style={{ padding: "16px", fontFamily: "monospace" }}>
            No drawing assigned yet. Ask an admin to create a drawing and grant access.
          </div>
        )}
      </div>
    </main>
  );
}
