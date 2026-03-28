'use client';
import React from "react";
import { load } from 'js-yaml';

/* ─── Icons ─────────────────────────────────────────────────────────── */
const GitHubIcon = () => (
  <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
  </svg>
);
const YouTubeIcon = () => (
  <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
    <path d="M21.582 7.15a2.513 2.513 0 0 0-1.768-1.768C18.254 5 12 5 12 5s-6.254 0-7.814.382a2.513 2.513 0 0 0-1.768 1.768C2.036 8.71 2.036 12 2.036 12s0 3.29.382 4.85a2.513 2.513 0 0 0 1.768 1.768C5.746 19 12 19 12 19s6.254 0 7.814-.382a2.513 2.513 0 0 0 1.768-1.768C22 15.29 22 12 22 12s0-3.29-.418-4.85zM9.955 15.182V8.818L15.5 12l-5.545 3.182z" />
  </svg>
);
const ExternalIcon = () => (
  <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
    <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z" />
  </svg>
);

function getLinkIcon(url: string) {
  if (url.includes('github.com')) return <GitHubIcon />;
  if (url.includes('youtube.com')) return <YouTubeIcon />;
  return <ExternalIcon />;
}
function getLinkLabel(url: string, text?: string): string {
  if (text) return text;
  if (url.includes('github.com')) return 'GitHub';
  if (url.includes('youtube.com')) return 'YouTube';
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return 'Link'; }
}

/* ─── Animated heading ───────────────────────────────────────────────── */
function ProjectsHeading() {
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const letters = 'PROJECTS'.split('');

  return (
    <div ref={ref} className="relative flex flex-col items-center gap-5 py-4">

      {/* Ghost background text */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <span
          className="font-black leading-none whitespace-nowrap"
          style={{
            fontSize: 'clamp(3.5rem, 18vw, 18rem)',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            letterSpacing: '-0.04em',
            color: '#fff',
            opacity: visible ? 0.04 : 0,
            transition: 'opacity 1.5s ease',
            transitionDelay: '200ms',
          }}
        >
          PROJECTS
        </span>
      </div>

      {/* Top line */}
      <div
        className="w-full flex justify-center transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-16px)',
          transitionDelay: '0ms',
        }}
      >
        <div
          className="h-px w-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(220,38,38,0.6) 30%, rgba(220,38,38,0.6) 70%, transparent 100%)',
          }}
        />
      </div>

      {/* Big letter-by-letter title */}
      <div className="flex items-end gap-0.5 sm:gap-1 pb-2" aria-label="Projects">
        {letters.map((letter, i) => (

          <span
            key={i}
            className="inline-block font-black leading-none select-none"
            style={{
              fontSize: 'clamp(2.2rem, 10vw, 7rem)',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              color: visible ? '#fff' : 'transparent',
              textShadow: visible ? '0 0 40px rgba(220,38,38,0.25)' : 'none',
              transform: visible ? 'translateY(0) skewX(-4deg)' : 'translateY(60px) skewX(-4deg)',
              opacity: visible ? 1 : 0,
              transition: `transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.55s ease, color 0.4s ease`,
              transitionDelay: `${150 + i * 55}ms`,
              letterSpacing: '-0.03em',
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      {/* Underline bar */}
      <div className="relative w-full flex justify-center">
        <div
          className="h-px transition-all duration-700"
          style={{
            width: visible ? '100%' : '0%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(220,38,38,0.6) 30%, rgba(220,38,38,0.6) 70%, transparent 100%)',
            transitionDelay: '700ms',
          }}
        />
        {/* Center dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-500"
          style={{
            background: 'rgba(220,38,38,0.9)',
            boxShadow: '0 0 8px 2px rgba(220,38,38,0.5)',
            opacity: visible ? 1 : 0,
            transitionDelay: '900ms',
          }}
        />
      </div>

      {/* Subtitle */}
      <p
        className="text-xs sm:text-sm tracking-widest uppercase transition-all duration-700"
        style={{
          color: 'rgba(255,255,255,0.3)',
          fontFamily: "'Ubuntu Mono', monospace",
          letterSpacing: '0.25em',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transitionDelay: '800ms',
        }}
      >
        things i&apos;ve built &amp; shipped
      </p>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export default function Projects() {
  const [projects, setProjects] = React.useState<any[]>([]);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetch('/projects.yaml')
      .then(res => res.text())
      .then(yaml => {
        try {
          const data = load(yaml) as any;
          setProjects(data.projects || []);
        } catch (e) {
          console.error('YAML parse error:', e);
        }
      });
  }, []);

  return (
    <div className="bg-black text-white px-4 sm:px-8 py-8" style={{ fontFamily: "'Ubuntu Mono', monospace" }}>
      <div className="max-w-5xl mx-auto">

        {/* ── Heading ── */}
        <ProjectsHeading />

        {/* ── Gap ── */}
        <div className="mt-16 sm:mt-20" />

        {/* ── Project List ── */}
        <div className="flex flex-col divide-y divide-white/5">
          {projects.map((project, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <div
                key={index}
                className="group relative py-7 sm:py-8 pl-5 sm:pl-8 pr-3 sm:pr-6 transition-all duration-300 cursor-default"
                style={{
                  background: isHovered
                    ? 'linear-gradient(90deg, rgba(220,38,38,0.06) 0%, transparent 80%)'
                    : 'transparent',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Left glow bar */}
                <div
                  className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full transition-all duration-300"
                  style={{
                    background: isHovered ? 'rgba(220,38,38,0.85)' : 'rgba(255,255,255,0.05)',
                    boxShadow: isHovered ? '0 0 10px 2px rgba(220,38,38,0.45)' : 'none',
                  }}
                />

                {/* Row layout: index + content */}
                <div className="flex gap-4 sm:gap-8 items-start">
                  {/* Index number */}
                  <div
                    className="flex-shrink-0 w-7 text-right pt-0.5 tabular-nums transition-colors duration-300"
                    style={{
                      color: isHovered ? 'rgba(220,38,38,0.85)' : 'rgba(255,255,255,0.2)',
                      fontSize: '0.75rem',
                      fontFamily: "'Ubuntu Mono', monospace",
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3
                      className="font-semibold leading-snug mb-2.5 transition-colors duration-300"
                      style={{
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
                        color: isHovered ? '#fff' : 'rgba(255,255,255,0.82)',
                        fontFamily: 'Inter, sans-serif',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-sm leading-relaxed mb-5 transition-colors duration-300"
                      style={{
                        color: isHovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.38)',
                        fontFamily: 'Inter, sans-serif',
                        maxWidth: '62ch',
                      }}
                    >
                      {project.desc}
                    </p>

                    {/* Tech pills + links — wraps on mobile */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      {/* Tech pills */}
                      {project.techstack?.map((tech: string, i: number) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded-sm border transition-all duration-300"
                          style={{
                            borderColor: isHovered ? 'rgba(220,38,38,0.45)' : 'rgba(255,255,255,0.1)',
                            color: isHovered ? 'rgba(220,38,38,0.85)' : 'rgba(255,255,255,0.32)',
                            fontFamily: "'Ubuntu Mono', monospace",
                            letterSpacing: '0.04em',
                          }}
                        >
                          {tech}
                        </span>
                      ))}

                      {/* Push links right on wider screens */}
                      <div className="flex-1 hidden sm:block" />

                      {/* Links */}
                      {project.links?.map((linkObj: any, i: number) => {
                        const url = typeof linkObj === 'string' ? linkObj : linkObj.url;
                        const text = typeof linkObj === 'string' ? '' : linkObj.text;
                        const label = getLinkLabel(url, text);
                        return (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[11px] transition-all duration-200"
                            style={{
                              color: isHovered ? 'rgba(220,38,38,0.85)' : 'rgba(255,255,255,0.28)',
                              textDecoration: 'none',
                              fontFamily: "'Ubuntu Mono', monospace",
                              letterSpacing: '0.04em',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.color = '#fff';
                              (e.currentTarget as HTMLElement).style.filter = 'drop-shadow(0 0 5px rgba(220,38,38,0.6))';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.color = isHovered ? 'rgba(220,38,38,0.85)' : 'rgba(255,255,255,0.28)';
                              (e.currentTarget as HTMLElement).style.filter = 'none';
                            }}
                          >
                            {getLinkIcon(url)}
                            <span>{label}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}