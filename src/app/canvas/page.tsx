"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@supabase/supabase-js";
import "@excalidraw/excalidraw/index.css";

let restore: any;

// Dynamically import Excalidraw + restore to avoid SSR issues
const Excalidraw: any = dynamic(
  async () => {
    const module = await import("@excalidraw/excalidraw");
    restore = module.restore; // assign restore only in browser
    return module.Excalidraw;
  },
  { ssr: false }
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

  useEffect(() => {
    async function loadDrawing() {
      try {
        const { data, error } = await supabase
          .from("drawings")
          .select("data")
          .eq("id", DRAWING_ID)
          .maybeSingle();

        if (error) {
          console.warn("No saved drawing yet:", error.message);
          return;
        }

        if (data?.data && restore) {
          let restored = restore(data.data, null, null);

          // Ensure collaborators is always an array
          if (!Array.isArray(restored.appState.collaborators)) {
            restored.appState.collaborators = [];
          }

          setInitialData(restored);
          console.log("✅ Loaded drawing");
        }
      } catch (err) {
        console.error("Failed to load drawing:", err);
      }
    }

    loadDrawing();
  }, []);

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
          else console.log("💾 Drawing saved at", istTime);
        } catch (err: any) {
          console.error("❌ Save failed:", err.message);
        }
      }, 1500);
    },
    []
  );

  return (
    <main style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ flex: 1 }}>
        {/* Only render after restore is loaded and initialData exists */}
        {initialData && <Excalidraw initialData={initialData} onChange={handleChange} />}
      </div>
    </main>
  );
}
