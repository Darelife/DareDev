"use client";

import React, { useEffect, useState } from "react";
import Navbar from '../../components/navbar';
import ResourcesClient from '../../components/ResourcesClient';
import { getResources } from '../../lib/api-client';

const inter = "var(--font-inter), Inter, sans-serif";
const mono = "'Ubuntu Mono', monospace";

function ResourcesLoading() {
  return (
    <div className="resources-loading" role="status" aria-label="Loading resources">
      <div className="resources-loading-status">
        <span className="resources-loading-orbit" aria-hidden="true"><span /></span>
        <span>syncing knowledge base</span>
        <span className="resources-loading-dots" aria-hidden="true">...</span>
      </div>
      {[0, 1, 2].map((section) => (
        <div key={section} className="resources-loading-section" aria-hidden="true">
          <div className="resources-loading-heading" />
          <div className="resources-loading-row" />
          <div className="resources-loading-row resources-loading-row-short" />
          <div className="resources-loading-row resources-loading-row-medium" />
        </div>
      ))}
    </div>
  );
}

const Resources = () => {
  const [resourcesData, setResourcesData] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    getResources()
      .then((data) => {
        setResourcesData(data);
        setHasError(Object.keys(data).length === 0);
      })
      .catch((error) => {
        console.error("Failed to load resources:", error);
        setHasError(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="bg-[var(--appearance-canvas,#000)] min-h-screen text-[color:var(--appearance-ink,#fff)]" style={{ fontFamily: inter }}>
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-32 pb-16 px-4 sm:px-8 text-center">
        {/* Ghost text */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
          aria-hidden="true"
        >
          <span
            className="font-black text-[color:var(--appearance-ink,#fff)] leading-none whitespace-nowrap"
            style={{ fontSize: 'clamp(5rem, 20vw, 16rem)', fontFamily: inter, letterSpacing: '-0.04em', opacity: 0.04 }}
          >
            LEARN
          </span>
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-[var(--appearance-highlight,color-mix(in_oklab,oklch(63.7%_0.237_25.331)_50%,transparent))]" />
            <span className="text-[10px] tracking-[0.35em] uppercase text-[color:var(--appearance-accent,color-mix(in_oklab,oklch(63.7%_0.237_25.331)_60%,transparent))]" style={{ fontFamily: mono }}>
              knowledge base
            </span>
            <div className="h-px w-8 bg-[var(--appearance-highlight,color-mix(in_oklab,oklch(63.7%_0.237_25.331)_50%,transparent))]" />
          </div>
          <h1
            className="font-black text-[color:var(--appearance-ink,#fff)] mb-4 leading-tight"
            style={{ fontFamily: inter, fontSize: 'clamp(2.5rem, 7vw, 5rem)', letterSpacing: '-0.03em', filter: 'var(--appearance-shadow, drop-shadow(0 4px 16px rgba(220,38,38,0.25)))' }}
          >
            Learning Resources
          </h1>
          <p className="text-[color:var(--appearance-muted,color-mix(in_oklab,#fff_35%,transparent))] text-sm tracking-widest uppercase" style={{ fontFamily: mono }}>
            My personal learning pocket
          </p>
        </div>
      </div>

      {/* ── Resource categories ── */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-8 pb-24 min-h-[780px]" aria-busy={isLoading}>
        {isLoading ? <ResourcesLoading /> : null}
        {!isLoading && !hasError ? <ResourcesClient data={resourcesData} /> : null}
        {!isLoading && hasError ? (
          <div className="py-20 text-center text-[color:var(--appearance-muted,color-mix(in_oklab,#fff_35%,transparent))]" style={{ fontFamily: mono }}>
            Unable to load resources right now.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Resources;
