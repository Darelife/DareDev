'use client';
import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/navbar';

/* ─── Animated heading (mirrors ProjectsHeading) ─────────────────────── */
function BlogHeading() {
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

  const letters = 'BLOG'.split('');

  return (
    <div ref={ref} className="relative flex flex-col items-center gap-5 py-4">
      {/* Top line */}
      <div
        className="w-full flex justify-center transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-16px)', transitionDelay: '0ms' }}
      >
        <div
          className="h-px w-full"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(220,38,38,0.6) 30%, rgba(220,38,38,0.6) 70%, transparent 100%)' }}
        />
      </div>

      {/* Letter-by-letter title */}
      <div className="flex items-end gap-0.5 sm:gap-1 pb-2" aria-label="Blog">
        {letters.map((letter, i) => (
          <span
            key={i}
            className="inline-block font-black leading-none select-none"
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 7rem)',
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
        thoughts &amp; tutorials
      </p>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export default function Blog() {
  const [blogs, setBlogs] = React.useState<any[]>([]);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetch('/blogs.json')
      .then(res => res.json())
      .then((data: any[]) => {
        const sorted = [...data].sort((a, b) => {
          if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
          return 0;
        });
        setBlogs(sorted);
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <Navbar />
      <div
        className="min-h-screen bg-black text-white px-4 sm:px-8 py-8"
        style={{ fontFamily: "'Ubuntu Mono', monospace" }}
      >
        <div className="max-w-5xl mx-auto">

          {/* ── Heading ── */}
          <BlogHeading />

          {/* ── Gap ── */}
          <div className="mt-16 sm:mt-20" />

          {/* ── Blog List ── */}
          <div className="flex flex-col divide-y divide-white/5">
            {blogs.map((blog, index) => {
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

                  {/* Row: index + content */}
                  <div className="flex gap-4 sm:gap-8 items-start">
                    {/* Index number */}
                    <div
                      className="flex-shrink-0 w-7 text-right pt-0.5 tabular-nums transition-colors duration-300"
                      style={{
                        color: isHovered ? 'rgba(220,38,38,0.85)' : 'rgba(255,255,255,0.13)',
                        fontSize: '0.75rem',
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <Link href={`/blog/${blog.slug}`} className="block">
                        <h2
                          className="font-semibold leading-snug mb-2.5 transition-colors duration-300 hover:underline"
                          style={{
                            fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
                            color: isHovered ? '#fff' : 'rgba(255,255,255,0.82)',
                            fontFamily: 'Inter, sans-serif',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {blog.title}
                        </h2>
                      </Link>

                      {/* Description */}
                      <p
                        className="text-sm leading-relaxed mb-4 transition-colors duration-300"
                        style={{
                          color: isHovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.38)',
                          fontFamily: 'Inter, sans-serif',
                          maxWidth: '62ch',
                        }}
                      >
                        {blog.description}
                      </p>

                      {/* Meta + tags + link row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        {/* Date */}
                        {blog.date && (
                          <span
                            className="text-[11px] transition-colors duration-300"
                            style={{ color: isHovered ? 'rgba(220,38,38,0.7)' : 'rgba(255,255,255,0.22)' }}
                          >
                            {new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        )}

                        {/* Read time */}
                        {blog.readTime && (
                          <span
                            className="text-[11px] transition-colors duration-300"
                            style={{ color: isHovered ? 'rgba(220,38,38,0.7)' : 'rgba(255,255,255,0.22)' }}
                          >
                            {blog.readTime} min read
                          </span>
                        )}

                        {/* Tags as mono pills */}
                        {blog.tags?.slice(0, 3).map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded-sm border transition-all duration-300"
                            style={{
                              borderColor: isHovered ? 'rgba(220,38,38,0.45)' : 'rgba(255,255,255,0.1)',
                              color: isHovered ? 'rgba(220,38,38,0.85)' : 'rgba(255,255,255,0.32)',
                              letterSpacing: '0.04em',
                            }}
                          >
                            #{tag}
                          </span>
                        ))}

                        {/* Push link right */}
                        <div className="flex-1 hidden sm:block" />

                        {/* Read link */}
                        <Link
                          href={`/blog/${blog.slug}`}
                          className="flex items-center gap-1.5 text-[11px] transition-all duration-200"
                          style={{
                            color: isHovered ? 'rgba(220,38,38,0.85)' : 'rgba(255,255,255,0.28)',
                            textDecoration: 'none',
                            letterSpacing: '0.04em',
                          }}
                        >
                          <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z" />
                          </svg>
                          <span>Read</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}