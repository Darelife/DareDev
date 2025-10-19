"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@supabase/supabase-js";
import "@excalidraw/excalidraw/index.css";

// Dynamically import Excalidraw to avoid SSR issues
// const Excalidraw: any = dynamic(
//   async () => (await import("@excalidraw/excalidraw")).Excalidraw,
//   { ssr: false }
// );
const Excalidraw = dynamic(
    async () => (await import("@excalidraw/excalidraw")).Excalidraw,
    {
        ssr: false,
    },
);
// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DRAWING_ID = "default-canvas";

export default function Page() {
  const [initialData, setInitialData] = useState<any>(null);
  const saveTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // Load the drawing from Supabase
  useEffect(() => {
    async function loadDrawing() {
      try {
        const { restore } = await import("@excalidraw/excalidraw");
        const { data, error } = await supabase
          .from("drawings")
          .select("data")
          .eq("id", DRAWING_ID)
          .maybeSingle();

        if (error) {
          console.warn("No saved drawing yet:", error.message);
          setInitialData({
            elements: [],
            appState: { collaborators: new Map() },
          });
          return;
        }

        if (data?.data) {
          // Use restore() to normalize elements and appState
          let restored = restore(data.data, null, null);

          // Ensure collaborators is always a Map
          if (!(restored.appState.collaborators instanceof Map)) {
            restored.appState.collaborators = new Map();
          }

          setInitialData(restored);
          console.log("✅ Loaded drawing from Supabase");
        } else {
          setInitialData({
            elements: [],
            appState: { collaborators: new Map() },
          });
          console.log("No saved drawing found, starting fresh.");
        }
      } catch (err) {
        console.error("Failed to load drawing:", err);
      }
    }

    loadDrawing();
  }, []);

  // Handle changes and save
  const handleChange = useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      if (!elements) return;

      if (saveTimeout.current) clearTimeout(saveTimeout.current);

      saveTimeout.current = setTimeout(async () => {
        try {
          const scene = { elements, appState, files };

          // IST timestamp
          const istTime = new Date(
            new Date().getTime() + 5.5 * 60 * 60 * 1000
          ).toISOString();

          const { error } = await supabase.from("drawings").upsert(
            {
              id: DRAWING_ID,
              data: scene,
              updated_at: istTime,
            },
            { onConflict: "id" }
          );

          if (error) console.error("❌ Save failed:", error.message);
          else console.log("💾 Drawing saved to Supabase at", istTime);
        } catch (err: any) {
          console.error("❌ Save failed:", err.message);
        }
      }, 1500); // 1.5s debounce
    },
    []
  );

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
      }}
    >
      <div style={{ flex: 1 }}>
        {/* Only render when initialData is ready */}
        {initialData ? (
          <Excalidraw
            initialData={initialData}
            onChange={handleChange}
          />
        ) : (
          <div>Loading Canvas...</div>
        )}
      </div>
    </main>
  );
}
