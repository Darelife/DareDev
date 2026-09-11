"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { useTheme } from "@/components/themes/ThemeProvider";
import { loadCanvas, saveCanvas } from "@/lib/api-client";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

export default function AdminCanvasPage() {
  const { theme } = useTheme();
  const [initialData, setInitialData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string>("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [error, setError] = useState("");
  const sceneRef = React.useRef<{ elements: any[]; appState: any; files: any } | null>(null);
  const lastSaveClickRef = React.useRef(0);

  useEffect(() => {
    async function load() {
      try {
        const { restore } = await import("@excalidraw/excalidraw");
        const scene = await loadCanvas();
        const restored = restore(
          { elements: scene.elements, appState: scene.appState, files: scene.files } as any,
          null,
          null
        );
        if (!(restored.appState.collaborators instanceof Map)) {
          restored.appState.collaborators = new Map();
        }
        setInitialData(restored);
      } catch (err) {
        console.error("Failed to load canvas:", err);
        setInitialData({ elements: [], appState: { collaborators: new Map() } });
      }
    }
    load();
  }, []);

  const handleChange = useCallback((elements: readonly any[], appState: any, files: any) => {
    if (!elements) return;
    sceneRef.current = { elements: elements as any[], appState, files };
  }, []);

  const handleManualSave = async () => {
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
      await saveCanvas(elements, appState, files);
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 53px)", margin: "-24px" }}>
      <div
        style={{
          padding: "10px",
          backgroundColor: "var(--appearance-surface, #1a1a1a)",
          color: "var(--appearance-success, #00ff00)",
          fontFamily: "monospace",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span>Canvas</span>
        <button
          onClick={() => void handleManualSave()}
          disabled={isSaving || cooldownSeconds > 0}
          style={{
            padding: "5px 10px",
            backgroundColor: "var(--appearance-highlight, #0088ff)",
            color: "var(--appearance-ink, #fff)",
            border: "none",
            fontFamily: "monospace",
            cursor: "pointer",
            opacity: isSaving || cooldownSeconds > 0 ? 0.7 : 1,
          }}
        >
          {isSaving ? "Saving..." : cooldownSeconds > 0 ? `Save (${cooldownSeconds}s)` : "Save"}
        </button>
        {lastSavedAt && <span style={{ fontSize: "12px" }}>Saved at {lastSavedAt}</span>}
        {error && <span style={{ color: "var(--appearance-danger, #ff0000)" }}>{error}</span>}
      </div>
      <div style={{ flex: 1 }}>
        {initialData ? (
          <Excalidraw theme={theme === "sketchbook" ? "light" : (initialData.appState?.theme ?? "light")} initialData={initialData} onChange={handleChange} validateEmbeddable={() => true} />
        ) : (
          <div style={{ padding: "16px", fontFamily: "monospace", color: "var(--appearance-ink, #e3e3e3)" }}>Loading…</div>
        )}
      </div>
    </div>
  );
}
