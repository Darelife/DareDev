import React from "react";
import fs from 'fs';
import path from 'path';
import Navbar from '../../components/navbar';
import ResourcesClient from '../../components/ResourcesClient';

const inter = "var(--font-inter), Inter, sans-serif";
const mono = "'Ubuntu Mono', monospace";

const Resources = () => {
  const resourcesFilePath = path.join(process.cwd(), 'public', 'resources.json');
  const resourcesData = JSON.parse(fs.readFileSync(resourcesFilePath, 'utf8'));

  return (
    <div className="bg-black min-h-screen text-white" style={{ fontFamily: inter }}>
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-32 pb-16 px-4 sm:px-8 text-center">
        {/* Ghost text */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
          aria-hidden="true"
        >
          <span
            className="font-black text-white leading-none whitespace-nowrap"
            style={{ fontSize: 'clamp(5rem, 20vw, 16rem)', fontFamily: inter, letterSpacing: '-0.04em', opacity: 0.04 }}
          >
            LEARN
          </span>
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-red-500/50" />
            <span className="text-[10px] tracking-[0.35em] uppercase text-red-500/60" style={{ fontFamily: mono }}>
              knowledge base
            </span>
            <div className="h-px w-8 bg-red-500/50" />
          </div>
          <h1
            className="font-black text-white mb-4 leading-tight"
            style={{ fontFamily: inter, fontSize: 'clamp(2.5rem, 7vw, 5rem)', letterSpacing: '-0.03em', filter: 'drop-shadow(0 4px 16px rgba(220,38,38,0.25))' }}
          >
            Learning Resources
          </h1>
          <p className="text-white/35 text-sm tracking-widest uppercase" style={{ fontFamily: mono }}>
            My personal learning pocket
          </p>
        </div>
      </div>

      {/* ── Resource categories ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pb-24">
        <ResourcesClient data={resourcesData} />
      </div>
    </div>
  );
};

export default Resources;
