'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const mono = "'Ubuntu Mono', monospace";
const inter = "var(--font-inter), Inter, sans-serif";

function StatusDot({ status }: { status: number }) {
  const cfg: Record<number, { color: string; label: string }> = {
    2: { color: 'var(--appearance-success, rgba(34,197,94,0.85))', label: 'done' },
    1: { color: 'var(--appearance-ink, rgba(234,179,8,0.85))', label: 'in progress' },
    0: { color: 'var(--appearance-accent, rgba(220,38,38,0.5))', label: 'queued' },
  };
  const { color, label } = cfg[status] ?? cfg[0];
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 5px ${color}` }}
      />
      <span className="text-[10px] tracking-widest uppercase text-[color:var(--appearance-muted,color-mix(in_oklab,#fff_25%,transparent))]" style={{ fontFamily: mono }}>
        {label}
      </span>
    </div>
  );
}

function ExternalIcon() {
  return (
    <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z" />
    </svg>
  );
}

interface Resource {
  title: string;
  description?: string;
  url: string;
  status: number;
}

function CategorySection({ category, resources }: { category: string; resources: Resource[] }) {
  const [expanded, setExpanded] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const INITIAL_COUNT = 3;
  const visible = expanded ? resources : resources.slice(0, INITIAL_COUNT);
  const hasMore = resources.length > INITIAL_COUNT;
  const completed = resources.filter(r => r.status === 2).length;
  const pct = resources.length ? Math.round((completed / resources.length) * 100) : 0;

  return (
    <section className="resource-category" id={`category-${encodeURIComponent(category)}`}>
      {/* Category header */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2
            className="font-bold text-[color:var(--appearance-ink,color-mix(in_oklab,#fff_80%,transparent))] leading-tight"
            style={{ fontFamily: inter, fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', letterSpacing: '-0.01em' }}
          >
            {category}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] text-[color:var(--appearance-muted,color-mix(in_oklab,#fff_22%,transparent))]" style={{ fontFamily: mono }}>{resources.length} resources</span>
            <span className="text-[color:var(--appearance-muted,color-mix(in_oklab,#fff_10%,transparent))]">·</span>
            <span className="text-[11px] text-[color:var(--appearance-muted,color-mix(in_oklab,#fff_22%,transparent))]" style={{ fontFamily: mono }}>{completed} done</span>
          </div>
        </div>
        {pct > 0 && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-sm border border-[var(--appearance-rule,color-mix(in_oklab,oklch(72.3%_0.219_149.579)_20%,transparent))] text-[color:var(--appearance-success,color-mix(in_oklab,oklch(79.2%_0.209_151.711)_45%,transparent))] flex-shrink-0"
            style={{ fontFamily: mono }}
          >
            {pct}%
          </span>
        )}
      </div>

      {/* Thin progress bar */}
      <div className="h-px w-full bg-[var(--appearance-wash,color-mix(in_oklab,#fff_5%,transparent))] mb-0 relative">
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--appearance-highlight, rgba(220,38,38,0.55)), var(--appearance-highlight, rgba(34,197,94,0.55)))',
          }}
        />
      </div>

      {/* Resource rows */}
      <div className="flex flex-col divide-y divide-[var(--appearance-rule,color-mix(in_oklab,#fff_5%,transparent))]">
        {visible.map((resource, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={index}
              className="group relative py-5 pl-5 sm:pl-8 pr-3 sm:pr-4 transition-all duration-300 cursor-default"
              style={{
                background: isHovered
                  ? 'linear-gradient(90deg, var(--appearance-wash, rgba(220,38,38,0.045)) 0%, transparent 80%)'
                  : 'transparent',
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Left glow bar */}
              <div
                className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full transition-all duration-300"
                style={{
                  background: isHovered ? 'var(--appearance-highlight, rgba(220,38,38,0.8))' : 'var(--appearance-wash, rgba(255,255,255,0.04))',
                  boxShadow: isHovered ? 'var(--appearance-shadow, 0 0 8px rgba(220,38,38,0.4))' : 'none',
                }}
              />

              <div className="flex gap-4 sm:gap-6 items-start">
                {/* Index */}
                <div
                  className="flex-shrink-0 w-7 text-right pt-0.5 tabular-nums transition-colors duration-300"
                  style={{
                    color: isHovered ? 'var(--appearance-accent, rgba(220,38,38,0.8))' : 'var(--appearance-muted, rgba(255,255,255,0.2))',
                    fontSize: '0.7rem',
                    fontFamily: mono,
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium leading-snug transition-colors duration-200 hover:underline underline-offset-2 decoration-[var(--appearance-rule,color-mix(in_oklab,oklch(63.7%_0.237_25.331)_35%,transparent))]"
                      style={{
                        fontFamily: inter,
                        fontSize: 'clamp(0.875rem, 1.4vw, 0.975rem)',
                        color: isHovered ? 'var(--appearance-ink, #fff)' : 'var(--appearance-ink, rgba(255,255,255,0.75))',
                      }}
                    >
                      {resource.title}
                    </a>
                    <StatusDot status={resource.status} />
                  </div>
                  {resource.description && (
                    <p
                      className="text-xs leading-relaxed transition-colors duration-300"
                      style={{
                        fontFamily: inter,
                        color: isHovered ? 'var(--appearance-muted, rgba(255,255,255,0.42))' : 'var(--appearance-muted, rgba(255,255,255,0.28))',
                        maxWidth: '62ch',
                      }}
                    >
                      {resource.description}
                    </p>
                  )}
                </div>

                {/* External link icon */}
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 self-center transition-colors duration-300"
                  style={{ color: isHovered ? 'var(--appearance-accent, rgba(220,38,38,0.6))' : 'var(--appearance-muted, rgba(255,255,255,0.08))' }}
                  aria-label={`Open ${resource.title}`}
                >
                  <ExternalIcon />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand / Collapse toggle */}
      {hasMore && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-1 w-full py-3 flex items-center justify-center gap-2 border-t border-[var(--appearance-rule,color-mix(in_oklab,#fff_5%,transparent))] transition-all duration-300 group/btn"
          style={{ color: 'var(--appearance-muted, rgba(255,255,255,0.22))', fontFamily: mono, fontSize: '0.7rem', letterSpacing: '0.12em' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--appearance-accent, rgba(220,38,38,0.65))')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--appearance-muted, rgba(255,255,255,0.22))')}
        >
          <span className="uppercase tracking-widest">
            {expanded ? `show less` : `show ${resources.length - INITIAL_COUNT} more`}
          </span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="currentColor"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
          >
            <path d="M5 7L1 3h8z" />
          </svg>
        </button>
      )}
    </section>
  );
}

export default function ResourcesClient({ data }: { data: Record<string, Resource[]> }) {
  return (
    <div className="resource-collection flex flex-col gap-14">
      <nav className="sketch-only resource-tabs" aria-label="Resource categories">
        {Object.keys(data).map(category => <a key={category} href={`#${encodeURIComponent(`category-${encodeURIComponent(category)}`)}`}>{category}</a>)}
      </nav>
      {Object.entries(data).map(([category, resources]) => (
        <CategorySection key={category} category={category} resources={resources} />
      ))}
    </div>
  );
}
